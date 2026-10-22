//! The one tool peacock exposes: `peacock.render`.
//!
//! orca's server proxies every unmatched HTTP request that falls under
//! peacock's route (`/`) to this tool as a [`contract::web::WebRequest`], and
//! serves the [`contract::web::WebResponse`] we return. In prod we answer from
//! the frontend's prerendered assets (embedded at build time); in dev, orca
//! proxies straight to our Vite server (`dev_upstream`) and never calls this.
//!
//! Bodies ride as base64 in the typed request/response — no `serde_json::Value`
//! escape hatch in plugin logic.

use base64::Engine as _;
use base64::engine::general_purpose::STANDARD as B64;
use contract::web::{WebRequest, WebResponse};
use derive::orca_tool;
use std::path::{Path, PathBuf};

/// The built frontend (`@peacock/app`) assets, embedded at compile time.
///
/// `ui/dist` is the SvelteKit adapter-static output — `@peacock/app`'s
/// `packages/app/svelte.config.js` aims `pages`/`assets` two levels up at
/// `../../dist` precisely so it lands here. `npm run build` in `ui/` (the npm
/// workspace root, which delegates to that package) regenerates it. `build.rs`
/// writes a placeholder `index.html` when it is absent so a clean checkout
/// compiles.
#[derive(rust_embed::RustEmbed)]
#[folder = "ui/dist/"]
struct Assets;

/// Serve one request. `/storybook` paths come from the separately installed
/// Storybook artifact on disk; everything else from the embedded asset tree.
/// An unmatched app path returns a bare 404 so orca applies SPA fallback.
#[orca_tool(domain = "peacock", verb = "render", cli = skip)]
async fn render(req: WebRequest, _ctx: &contract::ToolCtx) -> anyhow::Result<WebResponse> {
    if is_storybook(&req.path) {
        return Ok(respond_storybook(&req.path, storybook_dir().as_deref()));
    }
    Ok(respond(&req.path, |rel| {
        Assets::get(rel).map(|a| a.data.into_owned())
    }))
}

const STORYBOOK_PREFIX: &str = "storybook";

fn storybook_dir() -> Option<PathBuf> {
    contract::config::state_dir()
        .ok()
        .map(|d| d.join("plugins").join("peacock").join(STORYBOOK_PREFIX))
}

fn is_storybook(path: &str) -> bool {
    let rel = path.trim_start_matches('/');
    rel == STORYBOOK_PREFIX || rel.starts_with("storybook/")
}

fn respond_storybook(path: &str, root: Option<&Path>) -> WebResponse {
    let Some(root) = root.and_then(|r| r.canonicalize().ok()) else {
        return storybook_not_found();
    };
    let resp = respond(path, |rel| {
        let sub = rel.strip_prefix("storybook/")?;
        read_under(&root, sub)
    });
    if resp.status == 404 {
        storybook_not_found()
    } else {
        resp
    }
}

fn read_under(root: &Path, sub: &str) -> Option<Vec<u8>> {
    if sub.contains('\\') {
        return None;
    }
    let file = root.join(sub).canonicalize().ok()?;
    if !file.starts_with(root) || !file.is_file() {
        return None;
    }
    std::fs::read(file).ok()
}

fn storybook_not_found() -> WebResponse {
    WebResponse {
        status: 404,
        headers: vec![("content-type".to_string(), "text/plain".to_string())],
        body_b64: B64.encode("storybook not installed or not found"),
    }
}

fn respond(path: &str, lookup: impl Fn(&str) -> Option<Vec<u8>>) -> WebResponse {
    let rel = path.trim_start_matches('/');
    let rel = if rel.is_empty() || rel.ends_with('/') {
        format!("{rel}index.html")
    } else {
        rel.to_string()
    };
    let rel = rel.as_str();

    match lookup(rel) {
        Some(data) => {
            let mime = mime_guess::from_path(rel).first_or_octet_stream();
            WebResponse {
                status: 200,
                headers: vec![("content-type".to_string(), mime.as_ref().to_string())],
                body_b64: B64.encode(data),
            }
        }
        None => directory_redirect(rel, &lookup).unwrap_or_else(WebResponse::not_found),
    }
}

fn directory_redirect(rel: &str, lookup: &impl Fn(&str) -> Option<Vec<u8>>) -> Option<WebResponse> {
    if rel.is_empty() || rel.ends_with("index.html") || rel.contains('\\') {
        return None;
    }
    lookup(&format!("{rel}/index.html"))?;
    Some(WebResponse {
        status: 308,
        headers: vec![("location".to_string(), format!("/{rel}/"))],
        body_b64: String::new(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture(rel: &str) -> Option<Vec<u8>> {
        match rel {
            "index.html" => Some(b"<html></html>".to_vec()),
            "_app/app.js" => Some(b"export {}".to_vec()),
            "style.css" => Some(b"body{}".to_vec()),
            "blob.unknownext" => Some(vec![0, 1, 2]),
            "storybook/index.html" => Some(b"<html>sb</html>".to_vec()),
            "docs/v1.2/index.html" => Some(b"<html>v12</html>".to_vec()),
            _ => None,
        }
    }

    fn content_type(resp: &WebResponse) -> &str {
        resp.headers
            .iter()
            .find(|(k, _)| k == "content-type")
            .map(|(_, v)| v.as_str())
            .unwrap()
    }

    #[test]
    fn root_serves_index() {
        for path in ["/", ""] {
            let resp = respond(path, fixture);
            assert_eq!(resp.status, 200);
            assert_eq!(content_type(&resp), "text/html");
            assert_eq!(B64.decode(&resp.body_b64).unwrap(), b"<html></html>");
        }
    }

    #[test]
    fn directory_path_serves_its_index() {
        let resp = respond("/storybook/", fixture);
        assert_eq!(resp.status, 200);
        assert_eq!(content_type(&resp), "text/html");
        assert_eq!(B64.decode(&resp.body_b64).unwrap(), b"<html>sb</html>");
    }

    #[test]
    fn directory_without_slash_redirects() {
        for path in ["/storybook", "//storybook"] {
            let resp = respond(path, fixture);
            assert_eq!(resp.status, 308);
            assert_eq!(
                resp.headers,
                vec![("location".to_string(), "/storybook/".to_string())]
            );
        }
    }

    #[test]
    fn redirect_never_leaves_origin() {
        let any_dir = |rel: &str| rel.ends_with("/index.html").then(Vec::new);
        assert_eq!(respond("//evil", any_dir).headers[0].1, "/evil/");
        assert_eq!(respond("/\\evil", any_dir).status, 404);
        assert_eq!(respond("/storybook.js", fixture).status, 404);
    }

    #[test]
    fn dotted_directory_redirects() {
        let resp = respond("/docs/v1.2", fixture);
        assert_eq!(resp.status, 308);
        assert_eq!(resp.headers[0].1, "/docs/v1.2/");
    }

    struct TempDir(PathBuf);

    impl TempDir {
        fn new(name: &str) -> Self {
            let p = std::env::temp_dir().join(format!("peacock-{name}-{}", std::process::id()));
            let _ = std::fs::remove_dir_all(&p);
            std::fs::create_dir_all(&p).unwrap();
            TempDir(p)
        }
    }

    impl Drop for TempDir {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(&self.0);
        }
    }

    fn installed(name: &str) -> (TempDir, PathBuf) {
        let tmp = TempDir::new(name);
        let sb = tmp.0.join("storybook");
        std::fs::create_dir_all(sb.join("assets")).unwrap();
        std::fs::write(sb.join("index.html"), "<html>sb</html>").unwrap();
        std::fs::write(sb.join("assets/app.js"), "export {}").unwrap();
        std::fs::write(tmp.0.join("secret.txt"), "secret").unwrap();
        (tmp, sb)
    }

    #[test]
    fn storybook_paths_are_routed() {
        assert!(is_storybook("/storybook"));
        assert!(is_storybook("/storybook/"));
        assert!(is_storybook("//storybook/assets/a.js"));
        assert!(!is_storybook("/storybook.js"));
        assert!(!is_storybook("/storybooks"));
    }

    #[test]
    fn storybook_not_installed_is_404_without_spa_fallback() {
        let missing = std::env::temp_dir().join("peacock-sb-missing-xyz");
        for root in [None, Some(missing.as_path())] {
            for path in ["/storybook", "/storybook/", "/storybook/index.html"] {
                let resp = respond_storybook(path, root);
                assert_eq!(resp.status, 404);
                assert!(!resp.body_b64.is_empty());
            }
        }
    }

    #[test]
    fn storybook_installed_serves_index_and_assets() {
        let (_tmp, sb) = installed("serve");
        let resp = respond_storybook("/storybook/", Some(&sb));
        assert_eq!(resp.status, 200);
        assert_eq!(content_type(&resp), "text/html");
        assert_eq!(B64.decode(&resp.body_b64).unwrap(), b"<html>sb</html>");
        let resp = respond_storybook("/storybook/assets/app.js", Some(&sb));
        assert_eq!(resp.status, 200);
        assert_eq!(B64.decode(&resp.body_b64).unwrap(), b"export {}");
    }

    #[test]
    fn storybook_installed_redirects_bare_path() {
        let (_tmp, sb) = installed("redirect");
        let resp = respond_storybook("/storybook", Some(&sb));
        assert_eq!(resp.status, 308);
        assert_eq!(resp.headers[0].1, "/storybook/");
    }

    #[test]
    fn storybook_refuses_traversal() {
        let (_tmp, sb) = installed("traversal");
        for path in [
            "/storybook/../secret.txt",
            "/storybook/assets/../../secret.txt",
            "/storybook/..\\secret.txt",
            "/storybook/assets",
        ] {
            assert_eq!(respond_storybook(path, Some(&sb)).status, 404, "{path}");
        }
    }

    #[cfg(unix)]
    #[test]
    fn storybook_refuses_symlink_escape() {
        let (tmp, sb) = installed("symlink");
        std::os::unix::fs::symlink(tmp.0.join("secret.txt"), sb.join("leak.txt")).unwrap();
        std::os::unix::fs::symlink(&tmp.0, sb.join("up")).unwrap();
        assert_eq!(
            respond_storybook("/storybook/leak.txt", Some(&sb)).status,
            404
        );
        assert_eq!(
            respond_storybook("/storybook/up/secret.txt", Some(&sb)).status,
            404
        );
    }

    #[test]
    fn nested_asset_strips_leading_slashes() {
        let resp = respond("//_app/app.js", fixture);
        assert_eq!(resp.status, 200);
        assert_eq!(B64.decode(&resp.body_b64).unwrap(), b"export {}");
    }

    #[test]
    fn content_type_follows_extension() {
        assert_eq!(content_type(&respond("/style.css", fixture)), "text/css");
        assert!(content_type(&respond("/_app/app.js", fixture)).contains("javascript"));
        assert_eq!(
            content_type(&respond("/blob.unknownext", fixture)),
            "application/octet-stream"
        );
    }

    #[test]
    fn unknown_path_is_bare_404_for_spa_fallback() {
        let resp = respond("/systems/abc", fixture);
        let expected = WebResponse::not_found();
        assert_eq!(resp.status, 404);
        assert_eq!(resp.status, expected.status);
        assert_eq!(resp.body_b64, expected.body_b64);
    }

    #[test]
    fn traversal_path_is_404() {
        let embedded = |rel: &str| Assets::get(rel).map(|a| a.data.into_owned());
        assert_eq!(respond("/../Cargo.toml", embedded).status, 404);
        assert_eq!(respond("/../../src/main.rs", embedded).status, 404);
    }

    #[test]
    fn embedded_index_is_present() {
        assert!(Assets::get("index.html").is_some());
    }
}
