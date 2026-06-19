export const intents = {
  leave_pattern_anomaly: {
    module: "leave_management",
    description:
      "Detect abnormal leave patterns, leave consumption, department burden, leave balance risk, and leave type utilization",
    flow: "leavePatternAnomaly",
    synonyms: [
      "show employees with highest leave risk",
      "who has the highest leave abuse risk",
      "rank employees by leave risk",

      "show repeated monday leave patterns",
      "which employees frequently take leave on mondays",

      "show repeated friday leave patterns",
      "which employees frequently take leave on fridays",

      "show high unplanned leave behaviour",
      "which employees take frequent emergency or sick leaves",

      "show leave clustering behaviour",
      "which employees take multiple leaves close together",

      "who submits leave requests most frequently",
      "which employees applied for the most leaves",

      "who consumed the most leave days",
      "which employees used the highest leave duration",

      "which departments lose the most working days due to leave",
      "which department has the highest leave burden",

      "which leave types are used most",
      "show leave type-wise usage",

      "which employees consumed more than 80% of allocated leave",
      "show leave entitlement utilization",

      "which employees are likely to exhaust leave balance",
      "show employees with low remaining leave balance",

      "which leave types are nearly exhausted",
      "show leave type-wise balance risk",

      "which departments have highest leave risk",
      "rank departments by leave risk",

      "which departments generate most emergency leave",
      "which departments have highest unplanned leave volume",
    ],
  },
};