// Stub for SvelteKit's `$app/environment`, which only exists inside the Kit
// build. Unit tests run through plain vitest (no Kit plugin), so the alias in
// vitest.config.ts points here. The alias existed before this file did — the
// path was dangling, and resolved only because nothing imported it yet.
export const browser = true;
export const dev = true;
export const building = false;
export const version = 'test';
