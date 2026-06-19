export const metrics = {
  total_leave_count: {
    description: "Total leave records during analysis period",
    aggregation: "COUNT",
    table: "hrms_emp_leaves",
  },

  monday_leave_count: {
    description: "Count leave records overlapping Monday",
    aggregation: "COUNT",
    table: "hrms_emp_leaves",
  },

  friday_leave_count: {
    description: "Count leave records overlapping Friday",
    aggregation: "COUNT",
    table: "hrms_emp_leaves",
  },

  unplanned_leave_count: {
    description: "Count Sick Leave, Medical Leave, and Casual Leave records",
    aggregation: "COUNT",
    table: "hrms_emp_leaves",
  },

  leave_cluster_count: {
    description: "Count clusters of 3+ leave requests within a rolling 30-day window",
    table: "hrms_emp_leaves",
  },

  leave_frequency_score: {
    description: "Frequency score based on employee leave application count",
    table: "hrms_emp_leaves",
  },

  anomaly_risk_score: {
    description: "Weighted employee anomaly risk score from leave patterns",
    table: "hrms_emp_leaves",
  },

  short_leave_frequency: {
    description: "Frequency of short-duration leave usage",
    table: "hrms_emp_leaves",
  },

  allocated_leave_days: {
    description: "Allocated leave days by employee, leave type, and year",
    aggregation: "SUM",
    table: "hrms_leave_allocation",
  },

  used_leave_days: {
    description: "Weighted consumed leave days using day_type",
    aggregation: "SUM",
    table: "hrms_emp_leaves",
  },

  remaining_leave_days: {
    description: "Allocated leave days minus used leave days",
    table: "hrms_leave_allocation",
  },

  leave_consumption_percentage: {
    description: "Used leave days divided by allocated leave days multiplied by 100",
    table: "hrms_leave_allocation",
  },

  department_leave_count: {
    description: "Leave record count grouped by department",
    aggregation: "COUNT",
    table: "hrms_emp_leaves",
  },

  department_leave_days: {
    description: "Weighted leave days grouped by department",
    aggregation: "SUM",
    table: "hrms_emp_leaves",
  },

  department_unplanned_leave_count: {
    description: "Unplanned leave count grouped by department",
    aggregation: "COUNT",
    table: "hrms_emp_leaves",
  },

  department_risk_score: {
    description: "Aggregated employee leave risk grouped by department",
    table: "hrms_emp_leaves",
  },

  leave_balance_risk_score: {
    description: "Risk score based on leave consumption percentage and remaining balance",
    table: "hrms_leave_allocation",
  },
};