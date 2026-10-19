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

/// Serve one request from the embedded asset tree. A path that maps to no asset
/// returns a bare 404 (no body) so orca applies SPA fallback (re-render as
/// `/index.html`) for client-side routing.
#[orca_tool(domain = "peacock", verb = "render", cli = skip)]
async fn render(req: WebRequest, _ctx: &contract::ToolCtx) -> anyhow::Result<WebResponse> {
    Ok(respond(&req.path, |rel| {
        Assets::get(rel).map(|a| a.data.into_owned())
    }))
}

/// Map a request path to a response using `lookup` to fetch asset bytes.
fn respond(path: &str, lookup: impl Fn(&str) -> Option<Vec<u8>>) -> WebResponse {
    let rel = path.trim_start_matches('/');
    let rel = if rel.is_empty() { "index.html" } else { rel };

    match lookup(rel) {
        Some(data) => {
            let mime = mime_guess::from_path(rel).first_or_octet_stream();
            WebResponse {
                status: 200,
                headers: vec![("content-type".to_string(), mime.as_ref().to_string())],
                body_b64: B64.encode(data),
            }
        }
        // Bare 404 → orca's SPA fallback re-requests `/index.html`.
        None => WebResponse::not_found(),
    }
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
