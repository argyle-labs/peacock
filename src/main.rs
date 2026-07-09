//! peacock — orca's web-UI plugin.
//!
//! An out-of-process orca plugin: orca's boot-time scan finds this executable
//! in its install dir, spawns it, and speaks the UDS wire protocol to it. We
//! register a single `web`-domain backend at route `/` and answer requests
//! through the `peacock.render` tool. In dev mode orca proxies straight to our
//! Vite server, which this binary owns (`npm run dev`).
//!
//! Run standalone (without orca): see README — orca sets `$ORCA_PLUGIN_SOCKET`
//! and drives the wire protocol; there is no bare `main` HTTP server, because
//! the frontend is either served by orca (prod, from embedded `ui/build`) or by
//! Vite in dev.

mod render;

use std::process::Child;

use anyhow::Result;
use plugin_toolkit::serve::{PluginSpec, serve};

/// Vite dev-server origin peacock's `npm run dev` binds. orca proxies its `/`
/// route here when the daemon is in dev mode.
const DEV_UPSTREAM: &str = "http://127.0.0.1:12001";

/// Env var orca (or a developer) sets to run peacock's Vite dev server and have
/// orca proxy to it, instead of serving the embedded prod assets.
const DEV_ENV: &str = "PEACOCK_DEV";

fn main() -> Result<()> {
    // In dev mode, own the frontend dev server: spawn `npm run dev` in `ui/`.
    // Held for the process lifetime; dropping the handle on exit lets the OS
    // reap it (orca sends us Shutdown, then closes the socket, then we return).
    let _vite: Option<Child> = if std::env::var_os(DEV_ENV).is_some() {
        spawn_vite()
    } else {
        None
    };

    serve(PluginSpec {
        name: "peacock".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        // Owns the `peacock.` tool namespace (just `peacock.render`).
        prefixes: vec!["peacock.".to_string()],
        backends_json: backends_json(),
        // No plugin-scoped SQL tables.
        schema_json: r#"{"namespace":"","tables":[]}"#.to_string(),
        // Pure tool plugin: no bespoke hybrid backend ops, so every call routes
        // through the `#[orca_tool]` dispatch surface (`peacock.render`).
        backend_dispatch: None,
    })
}

/// The single `web`-domain backend peacock declares. Per orca's "route rides
/// the existing `BackendDef`" decision, the route is carried on the shared axes:
/// `endpoint` = the prefix (`/`), `capabilities` = the feature flags
/// (`spa_fallback`, `dev_upstream=…`). `invoke_prefix` = `peacock`, so orca
/// routes render calls to our `peacock.render` tool.
fn backends_json() -> String {
    // A fixed, single-element `abi::BackendDef` array. Written as a literal
    // (not a `serde_json::Value`) so no opaque-JSON escape hatch appears in
    // plugin logic; orca's loader parses it into its own typed `BackendDef`.
    format!(
        r#"[{{"domain":"web","name":"peacock","endpoint":"/","capabilities":["spa_fallback","dev_upstream={DEV_UPSTREAM}"],"invoke_prefix":"peacock"}}]"#
    )
}

/// Spawn `npm run dev` in the `ui/` project. Best-effort: a failure to spawn
/// only means dev proxying won't reach an upstream (orca returns 502), never a
/// fatal plugin error.
fn spawn_vite() -> Option<Child> {
    let ui_dir = concat!(env!("CARGO_MANIFEST_DIR"), "/ui");
    match std::process::Command::new("npm")
        .args(["run", "dev"])
        .current_dir(ui_dir)
        .spawn()
    {
        Ok(child) => {
            tracing::info!("peacock: started `npm run dev` in {ui_dir}");
            Some(child)
        }
        Err(e) => {
            tracing::warn!("peacock: could not start `npm run dev` in {ui_dir}: {e}");
            None
        }
    }
}
