/**
 * Domain package boundary.
 *
 * Deterministic scheduling/payroll/workforce rules are intentionally deferred to WP-F05+.
 */
export type DomainPackageBoundary = Readonly<{
  packageName: '@nocscheduler/domain';
}>;
