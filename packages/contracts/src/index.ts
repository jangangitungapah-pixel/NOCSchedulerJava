/**
 * Shared data/schema contract boundary.
 *
 * Product contracts and reusable Zod schemas are intentionally deferred to
 * WP-F05. This package is runtime-agnostic and must not depend on Firebase,
 * React, or a server framework.
 */
export type ContractsPackageBoundary = Readonly<{
  packageName: '@nocscheduler/contracts';
}>;
