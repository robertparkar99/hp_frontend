import { routes } from "../resources/routes";

export const routeRegistry = {
  ...routes,
  leave_pattern_anomaly: {
    tool: "queryBusinessData",
    flow: "leavePatternAnomaly"
  }
};