import { tables } from "../resources/tables";

export const tableRegistry = {
  ...tables,

  hrms_emp_leaves: {
    primaryKey: "id",
    datasource: "hr",
    columns: [
      "id",
      "user_id",
      "leave_type_id",
      "status",
      "created_at",
      "from_date",
      "to_date",
      "day_type",
      "department_id"
    ]
  },

  hrms_leave_types: {
    primaryKey: "id",
    datasource: "hr",
    columns: ["id", "leave_type", "description", "paid"]
  },

  hrms_departments: {
    primaryKey: "id",
    datasource: "hr",
    columns: ["id", "department"]
  },

  hrms_leave_allocation: {
    primaryKey: "id",
    datasource: "hr",
    columns: ["id", "employee_id", "leave_type_id", "value", "year"]
  },

  tbluser: {
    primaryKey: "id",
    datasource: "hr",
    columns: ["id", "first_name", "department"]
  },

  hrms_attendance: {
    primaryKey: "id"
  },

  // employees: {
  //   primaryKey: "employee_id"
  // }
};