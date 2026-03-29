/**
 * @module health
 * @description Types for ANDS design-system health metrics and reports.
 *
 * Health metrics are computed by plugins and aggregated into a `HealthReport`
 * that the `ands audit` command emits as part of its CliOutput.
 */

export interface HealthMetric {
  id: string;
  name: string;
  description: string;
  compute: (context: HealthContext) => Promise<MetricResult>;
}

export interface MetricResult {
  id: string;
  value: number;
  unit: string;
  threshold?: number;
  status: 'pass' | 'warn' | 'fail';
  details?: string;
}

export interface HealthContext {
  config: unknown;
  rootDir: string;
}

export interface HealthReport {
  timestamp: string;
  metrics: MetricResult[];
  overall: 'pass' | 'warn' | 'fail';
}
