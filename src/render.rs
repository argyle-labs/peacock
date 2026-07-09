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

/// The built frontend (brain-site) assets, embedded at compile time.
///
/// `ui/dist` is the SvelteKit adapter-static output (`svelte.config.js` sets
/// `pages`/`assets` to `dist`). `npm run build` in `ui/` regenerates it. A
/// clean checkout ships a tracked placeholder `ui/dist/index.html` so rust-embed
/// always has a folder to read; the real build overwrites it. rust-embed
/// tolerates an empty folder — the render simply 404s until built.
#[derive(rust_embed::RustEmbed)]
#[folder = "ui/dist/"]
struct Assets;

/// Serve one request from the embedded asset tree. A path that maps to no asset
/// returns a bare 404 (no body) so orca applies SPA fallback (re-render as
/// `/index.html`) for client-side routing.
#[orca_tool(domain = "peacock", verb = "render", cli = skip)]
async fn render(req: WebRequest, _ctx: &contract::ToolCtx) -> anyhow::Result<WebResponse> {
    let rel = req.path.trim_start_matches('/');
    let rel = if rel.is_empty() { "index.html" } else { rel };

    match Assets::get(rel) {
        Some(asset) => {
            let mime = mime_guess::from_path(rel).first_or_octet_stream();
            Ok(WebResponse {
                status: 200,
                headers: vec![("content-type".to_string(), mime.as_ref().to_string())],
                body_b64: B64.encode(asset.data.as_ref()),
            })
        }
        // Bare 404 → orca's SPA fallback re-requests `/index.html`.
        None => Ok(WebResponse::not_found()),
    }
}
