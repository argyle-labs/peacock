// adapter-static SPA: no server runtime, so nothing here may assume one.
//
// This used to pre-fetch a `pod.instances` roster for child routes. That whole
// concept is gone from orca — the pod verbs dissolved into `system.*` — so the
// layout now loads nothing. When a domain view needs shared data at first
// paint, fetch it here and let children `await parent()` rather than having
// each route re-request it.

export const ssr = false;
export const prerender = false;
