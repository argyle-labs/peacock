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
//! the frontend is either served by orca (prod, from embedded `ui/dist`) or by
//! Vite in dev.

mod render;

use std::process::Child;

use anyhow::Result;
use plugin_toolkit::serve::{PluginSpec, serve};

/// Vite dev-server origin peacock's `npm run dev` binds. orca proxies its `/`
/// route here when the daemon is in dev mode. `ui/` is an npm workspace root,
/// so `npm run dev` there delegates to `@peacock/app`, which binds this port.
/// 12004 is a convention; orca proxies to whatever `dev_upstream` the route
/// registers.
const DEV_UPSTREAM: &str = "http://127.0.0.1:12004";

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

    let mut spec = PluginSpec::default();
    spec.name = "peacock".to_string();
    spec.version = env!("CARGO_PKG_VERSION").to_string();
    spec.prefixes = vec!["peacock.".to_string()];
    spec.backends_json = backends_json();
    spec.schema_json = r#"{"namespace":"","tables":[]}"#.to_string();
    serve(spec)
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
    let csp: String = csp_hashes::CSP_SCRIPT_HASHES
        .iter()
        .map(|h| format!(r#","csp_script_hash={h}""#))
        .chain(
            csp_hashes::CSP_STYLE_HASHES
                .iter()
                .map(|h| format!(r#","csp_style_hash={h}""#)),
        )
        .chain(
            csp_hashes::CSP_STYLE_ATTR_HASHES
                .iter()
                .map(|h| format!(r#","csp_style_attr_hash={h}""#)),
        )
        .collect();
    format!(
        r#"[{{"domain":"web","name":"peacock","endpoint":"/","capabilities":["spa_fallback","dev_upstream={DEV_UPSTREAM}"{csp}],"invoke_prefix":"peacock"}}]"#
    )
}

#[cfg(test)]
mod csp_scan;

mod csp_hashes {
    include!(concat!(env!("OUT_DIR"), "/csp_hashes.rs"));
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn backends_json_declares_root_web_route() {
        let v: serde_json::Value = serde_json::from_str(&backends_json()).unwrap();
        let backends = v.as_array().unwrap();
        assert_eq!(backends.len(), 1);
        let b = &backends[0];
        assert_eq!(b["domain"], "web");
        assert_eq!(b["name"], "peacock");
        assert_eq!(b["endpoint"], "/");
        assert_eq!(b["invoke_prefix"], "peacock");
        let caps: Vec<&str> = b["capabilities"]
            .as_array()
            .unwrap()
            .iter()
            .map(|c| c.as_str().unwrap())
            .collect();
        assert_eq!(
            caps[..2],
            ["spa_fallback", "dev_upstream=http://127.0.0.1:12004"]
        );
        let caps_for = |prefix: &str| -> Vec<&str> {
            caps.iter().filter_map(|c| c.strip_prefix(prefix)).collect()
        };
        assert_eq!(caps_for("csp_script_hash="), csp_hashes::CSP_SCRIPT_HASHES);
        assert_eq!(caps_for("csp_style_hash="), csp_hashes::CSP_STYLE_HASHES);
        assert_eq!(
            caps_for("csp_style_attr_hash="),
            csp_hashes::CSP_STYLE_ATTR_HASHES
        );
        for h in caps
            .iter()
            .filter_map(|c| c.split_once("_hash=").map(|(_, h)| h))
        {
            assert!(
                h.starts_with("'sha256-") && h.ends_with('\'') && h.len() == 53,
                "{h}"
            );
        }
    }

    #[test]
    fn declared_hashes_match_shipped_html() {
        let html =
            std::fs::read_to_string(concat!(env!("CARGO_MANIFEST_DIR"), "/ui/dist/index.html"))
                .unwrap();
        let found = csp_scan::inline_hashes(&html);
        assert_eq!(found.scripts, csp_hashes::CSP_SCRIPT_HASHES);
        assert_eq!(found.styles, csp_hashes::CSP_STYLE_HASHES);
        assert_eq!(found.style_attrs, csp_hashes::CSP_STYLE_ATTR_HASHES);
    }

    #[test]
    fn scan_hashes_executable_scripts_styles_and_attrs_only() {
        let found = csp_scan::inline_hashes(
            r#"<html><head><style>a{}</style><script>x()</script><script type="module">y()</script><script type="application/json">{}</script><script type="importmap">{}</script><script type="application/ld+json">{}</script><script src="/a.js"></script></head><body><div style="color: red"></div></body></html>"#,
        );
        assert_eq!(found.executable_scripts, 2);
        assert_eq!(found.scripts.len(), 2);
        assert_eq!(found.styles.len(), 1);
        assert_eq!(found.style_attrs.len(), 1);
        assert!(
            found
                .scripts
                .contains(&"'sha256-D6IGS8VMvCoyaR/l0h9tERrBTATY01CoPS7l6xDv0kI='".to_string())
        );
    }
}
