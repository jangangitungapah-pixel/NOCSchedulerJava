/**
 * Shared API/schema contract boundary.
 *
 * Product contracts and reusable Zod schemas are intentionally deferred to WP-F05.
 */
export type ContractsPackageBoundary = Readonly<{
  packageName: '@nocscheduler/contracts';
}>;
