// Tool dispatch: import the specific `sdk.gen` function by name, call it with
// its typed options, and hand the promise to `unwrap()`. Only that function is
// reachable from the caller's chunk, so the rest of the SDK tree-shakes away.
//
//    ```ts
//    import { configGet } from '$lib/client/sdk.gen';
//    import { unwrap, peerHeader } from '$lib/stores/runTool';
//    const r = await unwrap(configGet({ body: { noun, name } }));
//    // peer-dispatch:
//    const probe = await unwrap(systemUpdate({ body: {}, headers: peerHeader(peerId) }));
//    ```
//
// Do not `import * as sdk from '$lib/client/sdk.gen'` here or in any caller of
// `unwrap`: the barrel import defeats tree-shaking.

/** Hey-api's uniform result envelope. */
export type ToolResult<T> = {
  data?: T;
  error?: unknown;
  response?: Response;
};

/**
 * Narrow a hey-api result envelope to its `data` payload. The global
 * client config sets `throwOnError: true`, so by the time we get here a
 * non-2xx has already thrown — this helper is just a typed `.data` pick.
 */
export async function unwrap<T>(promise: Promise<ToolResult<T>>): Promise<T> {
  const res = await promise;
  return res.data as T;
}

/**
 * Build the `X-Orca-Peer` header for mesh-proxied calls. Returns
 * `undefined` for the synthetic "local" peer so loopback calls don't
 * bounce through the mesh. Spread into `headers` at the callsite.
 */
export function peerHeader(peer?: string | null): { 'X-Orca-Peer': string } | undefined {
  return peer && peer !== 'local' ? { 'X-Orca-Peer': peer } : undefined;
}
