import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type LeaveAnalysisType =
  | 'total_leave_risk'
  | 'monday_leave_pattern'
  | 'friday_leave_pattern'
  | 'unplanned_leave_pattern'
  | 'leave_clustering';

export interface LeavePatternResult {
  intent: string;
  analysisType?: string;
  answer?: string;
  summary?: string | Record<string, unknown>;
  records?: any[];
  rows?: any[];
  columns?: string[];
  riskScores?: any[];
  data?: any;
  monthStart?: string;
  monthEnd?: string;
}

export interface ResultRendererProps {
  result: LeavePatternResult;
  analysisType: string;
  summary?: {
    analysisLabel?: string;
    riskAssessment?: string;
    message?: string;
    totalEmployees?: number;
    highRisk?: number;
    mediumRisk?: number;
    lowRisk?: number;
    highRiskEmployees?: number;
    highRiskEmployeeDetails?: Array<{
      userId?: number | null;
      riskScore: number;
      riskLevel?: string;
      findings?: string[];
    }>;
    recommendation?: string;
  };
  monthStart?: string;
  monthEnd?: string;
}

type TableColumn = {
  key: string;
  label: string;
  render?: (row: Record<string, any>) => React.ReactNode;
};

const TABLE_CONFIGS: Record<
  LeaveAnalysisType,
  {
    title: string;
    columns: TableColumn[];
  }
> = {
  total_leave_risk: {
    title: 'Employees with Highest Leave Risk',
    columns: [
      { key: 'employee_name', label: 'Employee' },
      { key: 'department', label: 'Department' },
      { key: 'total_applications', label: 'Total Applications' },
      { key: 'total_leave_days', label: 'Total Leave Days' },
      { key: 'risk_score', label: 'Risk Score' },
      { key: 'risk_level', label: 'Risk Level' },
    ],
  },
  monday_leave_pattern: {
    title: 'Repeated Monday Leave Patterns',
    columns: [
      { key: 'employee_name', label: 'Employee' },
      { key: 'department', label: 'Department' },
      { key: 'monday_leave_count', label: 'Monday Leave Count' },
      { key: 'leave_dates', label: 'Dates' },
      { key: 'risk_level', label: 'Risk Level' },
    ],
  },
  friday_leave_pattern: {
    title: 'Repeated Friday Leave Patterns',
    columns: [
      { key: 'employee_name', label: 'Employee' },
      { key: 'department', label: 'Department' },
      { key: 'friday_leave_count', label: 'Friday Leave Count' },
      { key: 'leave_dates', label: 'Dates' },
      { key: 'risk_level', label: 'Risk Level' },
    ],
  },
  unplanned_leave_pattern: {
    title: 'High Unplanned Leave Behaviour',
    columns: [
      { key: 'employee_name', label: 'Employee' },
      { key: 'department', label: 'Department' },
      { key: 'unplanned_leave_count', label: 'Unplanned Leave Count' },
      { key: 'pending_leave_count', label: 'Pending Count' },
      { key: 'risk_level', label: 'Risk Level' },
    ],
  },
  leave_clustering: {
    title: 'Leave Clustering Behaviour',
    columns: [
      { key: 'employee_name', label: 'Employee' },
      { key: 'department', label: 'Department' },
      { key: 'cluster_count', label: 'Cluster Count' },
      { key: 'consecutive_leave_days', label: 'Consecutive Leave Days' },
      { key: 'risk_level', label: 'Risk Level' },
    ],
  },
};

const ANALYSIS_LABELS: Record<LeaveAnalysisType, string> = {
  total_leave_risk: 'Leave Pattern Anomaly Analysis',
  monday_leave_pattern: 'Leave Pattern Anomaly Analysis',
  friday_leave_pattern: 'Leave Pattern Anomaly Analysis',
  unplanned_leave_pattern: 'Leave Pattern Anomaly Analysis',
  leave_clustering: 'Leave Pattern Anomaly Analysis',
};

function toArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function toNumber(value: unknown): number {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function toText(value: unknown, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function humanizeRiskLevel(value: unknown) {
  const text = String(value || 'Low').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function riskBadgeClass(value: unknown) {
  switch (String(value || 'Low').toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
}

function summaryBadgeClass(value: unknown) {
  switch (String(value || 'Low').toLowerCase()) {
    case 'high':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'medium':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
}

function resolveSourceRows(result: LeavePatternResult) {
  return (
    toArray(result.rows).length > 0
      ? result.rows
      : toArray(result.data?.rows).length > 0
        ? result.data.rows
        : toArray(result.records)
  );
}

function resolveSourceRiskScores(result: LeavePatternResult) {
  return toArray(result.riskScores).length > 0
    ? result.riskScores
    : toArray(result.data?.riskScores);
}

function resolveRiskLevel(row: Record<string, any>, riskScore?: Record<string, any>) {
  return (
    row.risk_level ||
    row.riskLevel ||
    riskScore?.riskLevel ||
    riskScore?.risk_level ||
    row.risk_bucket ||
    'Low'
  );
}

function resolveDepartment(row: Record<string, any>) {
  return (
    row.department ||
    row.department_name ||
    row.departmentName ||
    row.dept ||
    'Unassigned'
  );
}

function resolveDates(row: Record<string, any>) {
  return (
    row.leave_dates ||
    row.leaveDates ||
    row.dates ||
    row.date_list ||
    row.leave_date_range ||
    '-'
  );
}

function buildDisplayRow(
  analysisType: LeaveAnalysisType,
  row: Record<string, any>,
  riskScore?: Record<string, any>
) {
  const department = resolveDepartment(row);
  const riskLevel = resolveRiskLevel(row, riskScore);

  switch (analysisType) {
    case 'total_leave_risk':
      return {
        employee_name: row.employee_name || row.name || `User ${row.user_id ?? row.employee_id ?? 'N/A'}`,
        department,
        total_applications: toNumber(row.total_count ?? row.total_leave_count ?? row.total_applications ?? row.total_leave_applications),
        total_leave_days: toNumber(row.total_days ?? row.used_leave_days ?? row.total_leave_days),
        risk_score: toNumber(riskScore?.riskScore ?? riskScore?.risk_score ?? row.anomaly_risk_score ?? row.risk_score),
        risk_level: humanizeRiskLevel(riskLevel),
      };

    case 'monday_leave_pattern':
      return {
        employee_name: row.employee_name || row.name || `User ${row.user_id ?? row.employee_id ?? 'N/A'}`,
        department,
        monday_leave_count: toNumber(row.total_count ?? row.monday_leave_count),
        leave_dates: resolveDates(row),
        risk_level: humanizeRiskLevel(riskLevel),
      };

    case 'friday_leave_pattern':
      return {
        employee_name: row.employee_name || row.name || `User ${row.user_id ?? row.employee_id ?? 'N/A'}`,
        department,
        friday_leave_count: toNumber(row.total_count ?? row.friday_leave_count),
        leave_dates: resolveDates(row),
        risk_level: humanizeRiskLevel(riskLevel),
      };

    case 'unplanned_leave_pattern':
      return {
        employee_name: row.employee_name || row.name || `User ${row.user_id ?? row.employee_id ?? 'N/A'}`,
        department,
        unplanned_leave_count: toNumber(row.total_count ?? row.unplanned_leave_count ?? row.unplanned_count),
        pending_leave_count: toNumber(row.pending_leave_count ?? row.pending_count),
        risk_level: humanizeRiskLevel(riskLevel),
      };

    case 'leave_clustering':
      return {
        employee_name: row.employee_name || row.name || `User ${row.user_id ?? row.employee_id ?? 'N/A'}`,
        department,
        cluster_count: toNumber(row.total_count ?? row.cluster_count ?? row.leave_cluster_count),
        consecutive_leave_days: toNumber(row.total_days ?? row.consecutive_leave_days ?? row.consecutive_days),
        risk_level: humanizeRiskLevel(riskLevel),
      };
  }
}

function getSummaryCounts(rows: Record<string, any>[], riskScores: Record<string, any>[]) {
  const normalized = rows.length > 0 ? rows : riskScores;

  const totalEmployees = rows.length;
  const highRisk = normalized.filter((item) => {
    const level = String(item.riskLevel || item.risk_level || item.risk_level_label || item.risk_bucket || '').toLowerCase();
    return level === 'high' || level === 'risk';
  }).length;
  const mediumRisk = normalized.filter((item) => {
    const level = String(item.riskLevel || item.risk_level || item.risk_level_label || item.risk_bucket || '').toLowerCase();
    return level === 'medium' || level === 'watch';
  }).length;
  const lowRisk = Math.max(totalEmployees - highRisk - mediumRisk, 0);

  return {
    totalEmployees,
    highRisk,
    mediumRisk,
    lowRisk,
  };
}

function SummaryStat({
  label,
  value,
  tone = 'slate',
}: {
  label: string;
  value: number;
  tone?: 'slate' | 'red' | 'orange' | 'emerald';
}) {
  const toneClass =
    tone === 'red'
      ? 'border-red-200 bg-red-50 text-red-700'
      : tone === 'orange'
        ? 'border-orange-200 bg-orange-50 text-orange-700'
        : tone === 'emerald'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-slate-50 text-slate-700';

  return (
    <Card className={`border ${toneClass}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold text-slate-900">
        {value}
      </CardContent>
    </Card>
  );
}

export const ResultRenderer: React.FC<ResultRendererProps> = ({
  result,
  analysisType,
  summary,
  monthStart,
  monthEnd,
}) => {
  const normalizedAnalysisType = (analysisType || result.analysisType || 'total_leave_risk') as LeaveAnalysisType;
  const config = TABLE_CONFIGS[normalizedAnalysisType] || TABLE_CONFIGS.total_leave_risk;
  const sourceRows = resolveSourceRows(result);
  const sourceRiskScores = resolveSourceRiskScores(result);

  const normalizedSummary =
    summary ||
    (typeof result.summary === 'object' && result.summary !== null
      ? (result.summary as NonNullable<ResultRendererProps['summary']>)
      : undefined);

  const analysisPeriod = result.data?.summary?.analysisPeriod || result.data?.dateRange;
  const displayRows = sourceRows.map((row, index) =>
    buildDisplayRow(normalizedAnalysisType, row, sourceRiskScores[index]) as Record<string, any>
  );

  const counts = getSummaryCounts(displayRows, sourceRiskScores);
  const totalEmployees = normalizedSummary?.totalEmployees ?? counts.totalEmployees;
  const highRisk = normalizedSummary?.highRisk ?? normalizedSummary?.highRiskEmployees ?? counts.highRisk;
  const mediumRisk = normalizedSummary?.mediumRisk ?? counts.mediumRisk;
  const lowRisk = normalizedSummary?.lowRisk ?? counts.lowRisk;

  const analysisTitle = ANALYSIS_LABELS[normalizedAnalysisType] || 'Leave Pattern Anomaly Analysis';
  const analysisSubTitle = normalizedSummary?.analysisLabel || config.title;
  const riskAssessment =
    normalizedSummary?.riskAssessment ||
    (typeof result.summary === 'string' ? result.summary : '') ||
    'Leave analysis completed.';
  const message = normalizedSummary?.message || '';
  const recommendation = normalizedSummary?.recommendation || '';
  const topRiskScore = sourceRiskScores.reduce((max, item) => {
    const value = Number(item?.riskScore ?? item?.risk_score ?? 0);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);

  const qualityLabel =
    topRiskScore > 60 || highRisk > 0
      ? 'High signal'
      : totalEmployees > 0
        ? 'Validated signal'
        : 'No signal';

  const qualityTone =
    qualityLabel === 'High signal'
      ? 'bg-emerald-100 text-emerald-800'
      : qualityLabel === 'Validated signal'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-slate-100 text-slate-700';

  const visibleColumns = config.columns.filter((column) => {
    if (normalizedAnalysisType === 'total_leave_risk') return true;
    return true;
  });

  const tableDateRange = analysisPeriod
    ? `${analysisPeriod.from || analysisPeriod.start || monthStart || 'Start'} to ${analysisPeriod.to || analysisPeriod.end || monthEnd || 'End'}`
    : monthStart || monthEnd
      ? `${monthStart || 'Start'} to ${monthEnd || 'End'}`
      : '';

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.94))] p-4 shadow-sm">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.35)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                Leave Pattern
              </Badge>
              <Badge className={qualityTone}>{qualityLabel}</Badge>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              {analysisTitle}
            </h2>
            <p className="text-sm text-slate-600">
              {analysisSubTitle}
            </p>
            {tableDateRange && (
              <p className="text-sm text-slate-500">
                {tableDateRange}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={summaryBadgeClass(highRisk)}>
              High Risk: {highRisk}
            </Badge>
            <Badge className={summaryBadgeClass(mediumRisk)}>
              Medium Risk: {mediumRisk}
            </Badge>
            <Badge className={summaryBadgeClass(lowRisk)}>
              Low Risk: {lowRisk}
            </Badge>
          </div>
        </div>

        {(riskAssessment || message) && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Summary
            </div>
            <div className="mt-2 space-y-1 text-sm text-slate-800">
              <div className="font-medium">{riskAssessment}</div>
              {message && <div className="text-slate-600">{message}</div>}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label="Total Employees" value={totalEmployees} />
        <SummaryStat label="High Risk" value={highRisk} tone="red" />
        <SummaryStat label="Medium Risk" value={mediumRisk} tone="orange" />
        <SummaryStat label="Low Risk" value={lowRisk} tone="emerald" />
      </div>

      {recommendation && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-semibold">Recommendation:</span> {recommendation}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              {visibleColumns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.length > 0 ? (
              displayRows.map((row, index) => {
                const riskLevel = row.risk_level ?? row.riskLevel;
                return (
                  <TableRow key={`${row.employee_name || row.department || index}-${index}`}>
                    {visibleColumns.map((column) => (
                      <TableCell key={column.key}>
                        {column.key === 'risk_level' ? (
                          <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${riskBadgeClass(riskLevel)}`}>
                            {humanizeRiskLevel(riskLevel)}
                          </span>
                        ) : (
                          toText(row[column.key])
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="py-8 text-center text-sm text-slate-500">
                  No records found for this analysis range.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
