// jest-dom's custom matchers (toBeDisabled, toHaveTextContent, …) for the
// design system's unit tests. The `/vitest` entrypoint both registers the
// matchers and augments vitest's `Assertion` type, which is what makes them
// typecheck under svelte-check.
import '@testing-library/jest-dom/vitest';
