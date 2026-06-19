export async function leavePatternSummary(result: any): Promise<string> {
  if (!result) {
    return "Unable to generate leave pattern summary.";
  }

  const metrics = result.metrics || {};
  const findings = Array.isArray(result.findings) ? result.findings : [];

  let text = "Leave Pattern Risk Analysis\n\n";

  if (result.employee_id) {
    const employeeName = result.employee_name || `Employee ID: ${result.employee_id}`;
    text += `Employee: ${employeeName}\n\n`;
  }

  text += "Analysis Period:\n";
  text += `${result.analysis_period?.from || "N/A"} to ${result.analysis_period?.to || "N/A"}\n\n`;

  text += "Findings:\n";
  if (metrics.friday_leaves !== undefined) {
    text += `• Friday Leaves: ${metrics.friday_leaves}\n`;
  }
  if (metrics.monday_leaves !== undefined) {
    text += `• Monday Leaves: ${metrics.monday_leaves}\n`;
  }
  if (metrics.long_weekend_patterns !== undefined) {
    text += `• Long Weekend Patterns: ${metrics.long_weekend_patterns}\n`;
  }
  if (metrics.unplanned_leaves !== undefined) {
    text += `• Unplanned Leaves: ${metrics.unplanned_leaves}\n`;
  }
  if (metrics.leave_clusters !== undefined) {
    text += `• Leave Clusters: ${metrics.leave_clusters}\n`;
  }

  text += "\n";
  text += `Risk Score: ${result.risk_score ?? "N/A"}/100\n`;
  text += `Risk Level: ${result.risk_level ?? "N/A"}\n\n`;

  if (findings.length > 0) {
    const uniqueFindings = [...new Set(findings)].slice(0, 4);
    text += `${uniqueFindings.join(". ")}. `;
    text += " Review may be required to determine whether the pattern is operationally significant.\n";
  }

  return text;
}
