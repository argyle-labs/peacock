<p align="center">
  <img src="assets/icon-256.png" width="120" alt="peacock" />
</p>

# peacock

**peacock** is the orca web-UI plugin. It serves orca's frontend — the
[brain-site](https://github.com/argyle-labs/orca) SvelteKit app — at the root
route `/`, as an **out-of-process** plugin rather than assets embedded in the
orca binary. A first-party [orca](https://github.com/argyle-labs/orca) plugin.

The UI no longer ships inside orca core. orca's boot-time scan finds this
executable in its install dir, **spawns it as a subprocess**, and speaks the UDS
wire protocol to it. peacock registers a single `web`-domain backend at route
`/` (with `spa_fallback` on) and answers every request through one tool,
`peacock.render`. In dev mode orca proxies straight to peacock's Vite server,
which this binary owns (`npm run dev` under `ui/`).

Everything here works **two ways, both supported**:

- **With orca** — drop the built `peacock` binary in orca's plugin dir; orca
  spawns it on startup and serves the UI at `/`.
- **Without orca (standalone)** — build and preview the frontend directly with
  Vite; see below.

---

## How it plugs into orca

peacock rides orca's existing `BackendDef` — no ABI change. Its one backend
declares:

| axis | value | meaning |
| --- | --- | --- |
| `domain` | `web` | orca's web-route provider domain |
| `endpoint` | `/` | the **exact** path peacock owns (root SPA) |
| `capabilities` | `spa_fallback`, `dev_upstream=http://127.0.0.1:12001` | SPA catch-all on; dev Vite origin |
| `invoke_prefix` | `peacock` | render calls route to `peacock.render` |

Route ownership is **exact-path**: peacock owns `/`. Because it sets
`spa_fallback`, any request that matches no other registered exact path falls
through to peacock and is resolved by the SvelteKit client router. If a second
UI plugin also claims `/`, orca keeps the incumbent serving (non-fatal),
surfaces the conflict, and lets you pick the owner with the `web` tool
(`orca web update --path / --owner <plugin>`); the choice is persisted.

**Prod:** `peacock.render` answers from the frontend's prerendered assets,
embedded from `ui/build/` at compile time.
**Dev:** orca sees `dev_upstream` and proxies `/` straight to Vite — `render`
is never called. Set `PEACOCK_DEV=1` so peacock spawns `npm run dev` itself.

## Run it without orca

The frontend is a standard SvelteKit app under [`ui/`](ui). Build or preview it
directly:

```sh
cd ui
npm install
npm run dev       # dev server on http://127.0.0.1:12001
# or
npm run build     # static output to ui/build/
npm run preview   # serve the built output
```

Serve the built `ui/build/` directory with any static file server (nginx,
`python -m http.server`, Caddy `file_server`, etc.). It is a client-routed SPA,
so configure the server to fall back to `index.html` for unmatched paths.

## Build the plugin

```sh
cargo build --release        # produces target/release/peacock
```

Requires a checked-out orca repo at `../orca` (the committed
`.cargo/config.toml` patches the orca git deps to the local path). Drop the
resulting `peacock` binary into orca's plugin install dir; orca spawns it on
next startup.

## Layout

- `ui/` — the brain-site SvelteKit frontend (owns `npm run dev` / `npm run build`).
- `src/main.rs` — thin subprocess entrypoint: declares the `web` backend, runs
  the `serve()` loop, spawns Vite in dev.
- `src/render.rs` — the one tool, `peacock.render`: serves embedded `ui/build/`
  assets as typed base64 `WebResponse`s.
- `assets/` — plugin icon.
