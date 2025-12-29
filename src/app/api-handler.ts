
import { classifyIntent, shouldRouteToAction, shouldUseFallback } from "@/lib1/intent-classifier";
import { sanitizeQuery, validateQuerySafety } from "@/lib1/sanitizer";
import { parseError, formatErrorResponse, shouldRetry } from "@/lib1/error-handler";
import { getRoleContext, canAccessData, getDataAccessFilter } from "@/lib1/role-context";
import { logEvent, logQuery, logLLMCall, formatDebugTrace } from "@/lib1/observability";
import {
  createConversation,
  getConversationBySessionId,
  saveMessage,
  getConversationHistory,
  updateConversationStatus
} from "@/lib1/conversation-persistence";
import { createEscalation } from "@/lib1/escalation-service";
import { v4 as uuidv4 } from 'uuid';

interface ChatRequest {
  query: string;
  sessionId: string;
  userId?: string;
  role?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  debugMode?: boolean;
}

interface ChatResponse {
  answer: string;
  conversationId?: string;
  intent?: string;
  sql?: string;
  tables_used?: string[];
  insights?: string;
  error?: string;
  recoverable?: boolean;
  suggestion?: string;
  canEscalate?: boolean;
  id?: string;
}

interface JobDescription {
  job_title: string;
  department: string;
  experience_level: string;
  key_responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  education: string;
  employment_type: string;
  location: string;
}

interface ActionResponse {
  type: 'ACTION_RESPONSE';
  module: string;
  action: string;
  data: JobDescription;
}

interface CreateJobDescriptionAction {
  type: 'CREATE_JOB_DESCRIPTION';
  payload: {
    industry: string;
    jobRole: string;
    department: string;
    description: string;
  };
}

let debugModeEnabled = false;

function enableDebugMode() {
  debugModeEnabled = true;
}

async function generateSQL(query: string, context: Array<{ role: string; content: string }>): Promise<string> {
  const contextPrompt = context.length > 0
    ? `Previous conversation:\n${context.map(c => `${c.role}: ${c.content}`).join('\n')}\n\n`
    : '';

  const prompt = `${contextPrompt}Convert the following natural language query to MySQL SQL:
Query: "${query}"

Database Schema (example - replace with your actual schema):
- users (id, name, email, created_at)
- projects (id, user_id, title, status, updated_at)
- tasks (id, project_id, title, completed, due_date)

Return only the SQL query without explanations.`;

  const startTime = Date.now();
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a SQL expert. Generate only valid MySQL queries.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("SQL GENERATION ERROR:", data);
    throw new Error('Failed to generate SQL');
  }

  const responseTime = Date.now() - startTime;

  if (debugModeEnabled) {
    await logLLMCall('', 'deepseek/deepseek-chat', responseTime, true);
  }

  return data.choices[0].message.content.trim().replace(/```sql\n?|\n?```/g, '');
}

// -----------------------------------------
// REPLACE THE OLD executeSQLQuery FUNCTION
// async function executeSQLQuery(sql: string): Promise<any[]> {
//   const response = await fetch(process.env.DATABASE_API_URL || 'http://localhost:3001/api/query', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${process.env.DATABASE_API_KEY}`
//     },
//     body: JSON.stringify({ query: sql })
//   });

//   if (!response.ok) {
//     throw new Error('Database query failed');
//   }

//   const data = await response.json();
//   return data.results || [];
// }
// -----------------------------------------

// ---------------------------
// BEGIN REPLACEMENT: API LAYER
// ---------------------------

/**
 * Helper: table alias map (common English -> actual DB table)
 * Extend this map as you discover more shorthand words used in NL prompts.
 */
const tableAliasMap: Record<string, string> = {
  // menus
  "menu": "tblmenumaster",
  "menus": "tblmenumaster",

  // lms
  "course": "lms_course_master",
  "courses": "lms_course_master",
  "module": "chapter_master",
  "modules": "chapter_master",
  "content": "content_master",
  "questionpaper": "question_paper",
  "question_paper": "question_paper",

  // hrms / users
  "user": "tbluser",
  "users": "tbluser",
  "staff": "tbluser",
  "employee": "tbluser",
  "profile": "tbluserprofilemaster",
  "department": "hrms_departments",
  "departments": "hrms_departments",

  // standard/common tables found in doc
  "standard": "standard",
  "section": "academic_section",
  "subject": "subject_master",
  "question": "question_master",

  // payroll / salary
  "salary": "employee_salary_structure",
  "payroll": "monthly_payroll",

  // skills / jobrole
  "skill": "skill_library",
  "skills": "skill_library",
  "skill_category": "skill_category",
  "jobrole": "jobroleOccupation",
  "jobroles": "jobroleOccupation",
  "task": "jobroleTask",
  "tasks": "jobroleTask",

  // neo4j / graph
  "industry": "s_industries",
  "industries": "s_industries",

  // fallback short forms
  "menu_master": "tblmenumaster",
  "chapter": "chapter_master",

  // add more as you discover shorthand words used by users...
};
/**
 * HP API registry (module-wise). These are taken from your HP APIs.docx
 * - Key: logical endpoint / table name
 * - Value: { method, urlTemplate, defaultParams }.
 *
 * NOTE: The doc shows both local (127.0.0.1:8000) and production (hp.triz.co.in / erp.triz.co.in).
 * We will prefer production (hp.triz.co.in) when available; local is kept for dev fallback.
 *
 * Add more endpoints from the doc into this map as you require.
 *
 * (Cited from HP APIs.docx examples / modules). 
 */
const hpApiMap: Record<string, { method: "GET" | "POST"; url: string }> = {
  // -----------------------
  // Existing / previously included endpoints (keep as-is)
  // -----------------------
  "table_data": { method: "GET", url: "https://hp.triz.co.in/table_data" },

  // LMS module (existing)
  "chapter_master": { method: "GET", url: "https://hp.triz.co.in/lms/chapter_master" },
  "chapter_master_create": { method: "POST", url: "https://hp.triz.co.in/lms/chapter_master" },
  "content_master": { method: "POST", url: "https://hp.triz.co.in/lms/content_master" },
  "create_content_master": { method: "GET", url: "https://hp.triz.co.in/lms/create_content_master" },
  "question_chapter_master": { method: "GET", url: "https://hp.triz.co.in/lms/question_chapter_master" },
  "question_master": { method: "POST", url: "https://hp.triz.co.in/lms/question_master" },

  // AI / Gemini (existing)
  "gemini_chat": { method: "POST", url: "https://hp.triz.co.in/gemini_chat" },
  "AICourseGeneration": { method: "GET", url: "https://hp.triz.co.in/AICourseGeneration" },
  "gammaContent": { method: "GET", url: "http://127.0.0.1:8000/gammaContent" },

  // Dashboard / misc (existing)
  "dashboard": { method: "GET", url: "https://hp.triz.co.in/dashboard" },

  // ERP endpoints (existing)
  "lms_data_erp": { method: "GET", url: "https://erp.triz.co.in/lms_data" },

  // Job / Talent (existing)
  "job_applications": { method: "GET", url: "https://hp.triz.co.in/api/job-applications" },

  // Auth (existing)
  "forget-password": { method: "POST", url: "https://hp.triz.co.in/forget-password" },
  "reset-password": { method: "POST", url: "https://hp.triz.co.in/reset-password" },

  // -----------------------
  // MISSING APIs ADDED (from PDF) — group: HRMS
  // -----------------------
  "hrms_departments": { method: "GET", url: "https://hp.triz.co.in/table_data?table=hrms_departments" },
  "hrms_department_add": { method: "POST", url: "https://hp.triz.co.in/hrms/add_department" },

  "hrms_attendance": { method: "GET", url: "https://hp.triz.co.in/hrms/attendance" },
  "hrms_attendance_update": { method: "POST", url: "https://hp.triz.co.in/hrms/update_user_att" },
  "hrms_punch_out": { method: "POST", url: "https://hp.triz.co.in/hrms-out-time/store" },

  "hrms_leave_type": { method: "GET", url: "https://hp.triz.co.in/leave-type" },
  "hrms_leave_type_add": { method: "POST", url: "https://hp.triz.co.in/leave-type" },
  "hrms_leave_apply": { method: "POST", url: "https://hp.triz.co.in/leave-apply" },
  "hrms_leave_summary_report": { method: "GET", url: "https://hp.triz.co.in/leave-summary-report" },
  "hrms_leave_authorization": { method: "POST", url: "https://hp.triz.co.in/leave-authorisation/store" },

  "hrms_holiday_get": { method: "GET", url: "https://hp.triz.co.in/hrms/holiday" },
  "hrms_holiday_add": { method: "POST", url: "https://hp.triz.co.in/hrms/holiday" },

  // Payroll
  "employee_salary_structure": { method: "GET", url: "https://hp.triz.co.in/employee-salary-structure" },
  "employee_salary_structure_store": { method: "POST", url: "https://hp.triz.co.in/employee-salary-structure/store" },
  "payroll_deduction": { method: "GET", url: "https://hp.triz.co.in/payroll-deduction" },
  "monthly_payroll": { method: "GET", url: "https://hp.triz.co.in/monthly-payroll-report" },
  "monthly_payroll_store": { method: "POST", url: "https://hp.triz.co.in/monthly-payroll-store" },

  // -----------------------
  // Skill Library
  // -----------------------
  "skill_library": { method: "GET", url: "https://erp.triz.co.in/lms/skill_library" },
  "skill_library_create": { method: "POST", url: "https://erp.triz.co.in/lms/skill_library" },
  "skill_category": { method: "GET", url: "https://erp.triz.co.in/lms/skill_library/create" },
  "skill_knowledge_ability": { method: "GET", url: "https://hp.triz.co.in/table_data?table=s_skill_knowledge_ability" },
  "proficiency_levels": { method: "GET", url: "https://hp.triz.co.in/table_data?table=s_skill_knowledge_ability&group_by=proficiency_level" },
  "skill_attribute_taxonomy": { method: "POST", url: "https://hp.triz.co.in/skill_library/attributes_taxonomy" },

  // -----------------------
  // JobRole & Occupation
  // -----------------------
  "jobroleOccupation": { method: "GET", url: "https://erp.triz.co.in/skill/jobroleOccupation" },
  "jobroleOccupation_create": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleOccupation" },
  "jobroleOccupation_update": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleOccupation/{id}" },
  "jobroleOccupation_delete": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleOccupation/{id}/delete" },

  "jobroleSkill": { method: "GET", url: "https://erp.triz.co.in/skill/jobroleSkill" },
  "jobroleSkill_create": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleSkill" },
  "jobroleSkill_update": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleSkill/{id}" },

  "jobroleTask": { method: "GET", url: "https://erp.triz.co.in/skill/jobroleTask" },
  "jobroleTask_create": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleTask" },

  // -----------------------
  // LMS - other / exam / question paper
  // -----------------------
  "course_master": { method: "GET", url: "https://hp.triz.co.in/lms/course_master" },
  "question_paper_search": { method: "GET", url: "https://hp.triz.co.in/question_paper/search_question" },
  "question_paper_store": { method: "POST", url: "https://hp.triz.co.in/lms/question_paper/storeData" },
  "online_exam": { method: "GET", url: "https://hp.triz.co.in/lms/online_exam" },
  "online_exam_submit": { method: "POST", url: "https://hp.triz.co.in/lms/online_exam" },

  // -----------------------
  // Compliance
  // -----------------------
  "compliance_list": { method: "GET", url: "https://erp.triz.co.in/api/compliance/list" },
  "compliance_create": { method: "POST", url: "https://erp.triz.co.in/api/compliance/create" },
  "compliance_update": { method: "POST", url: "https://erp.triz.co.in/api/compliance/update/{id}" },
  "compliance_delete": { method: "POST", url: "https://erp.triz.co.in/api/compliance/delete/{id}" },

  // -----------------------
  // Talent / Job Posting
  // -----------------------
  "job_postings": { method: "GET", url: "https://hp.triz.co.in/api/job-postings" },
  "job_posting_create": { method: "POST", url: "https://hp.triz.co.in/api/job-postings" },
  "job_posting_update": { method: "POST", url: "https://hp.triz.co.in/api/job-postings/{id}" },
  // "job_posting_delete": { method: "DELETE", url: "https://hp.triz.co.in/api/job-postings/{id}" },

  // -----------------------
  // Organization / Department
  // -----------------------
  "s_user_jobrole": { method: "GET", url: "https://hp.triz.co.in/table_data?table=s_user_jobrole" },
  "s_industries": { method: "GET", url: "https://hp.triz.co.in/table_data?table=s_industries" },
  "department_master": { method: "GET", url: "https://hp.triz.co.in/hrms/add_department" },

  // -----------------------
  // Neo4J / Graph
  // -----------------------
  "neo_industries": { method: "GET", url: "https://hp.triz.co.in/api/industries" },
  "neo_industry_departments": { method: "GET", url: "https://hp.triz.co.in/api/industry/{slug}/departments" },
  "neo_jobroles": { method: "GET", url: "https://hp.triz.co.in/api/department/{slug}/jobroles" },
  "neo_skills": { method: "GET", url: "http://127.0.0.1:8000/api/jobrole/{name}/skills" },

  // -----------------------
  // Reports / misc direct endpoints
  // -----------------------
  "task_analysis_report": { method: "GET", url: "https://hp.triz.co.in/task_analysis_report" },
  "employee_report": { method: "GET", url: "https://hp.triz.co.in/user/employee_report" },
  "organization_dashboard": { method: "GET", url: "https://hp.triz.co.in/organization_dashboard" },

  // -----------------------
  // Fallback Generic endpoints (dev local)
  // -----------------------
  "local_table_data": { method: "GET", url: "http://127.0.0.1:8000/table_data" },
  "local_gammaContent": { method: "GET", url: "http://127.0.0.1:8000/gammaContent" }
};

/**
 * Build a URL with query parameters
 */
function buildUrl(baseUrl: string, params?: Record<string, string | number | undefined>) {
  if (!params) return baseUrl;
  const u = new URL(baseUrl);
  // use provided params; skip undefined
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    // If value is an object/array, convert to bracket notation where appropriate
    if (Array.isArray(v)) {
      v.forEach((val, idx) => u.searchParams.append(`${k}[${idx}]`, String(val)));
    } else {
      u.searchParams.append(k, String(v));
    }
  });
  return u.toString();
}

/**
 * Call HP API with appropriate method & headers.
 * Most HP APIs use token as a query param; but we keep Authorization header fallback.
 */


async function callHpApi(method: "GET" | "POST", url: string, params?: Record<string, any>, body?: any) {
  const finalUrl = method === "GET" ? buildUrl(url, params) : buildUrl(url, params);
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      // if you prefer token in header uncomment below and set env var
      // "Authorization": `Bearer ${process.env.HP_API_BEARER}`
    }
  };

  if (method === "POST") {
    // If caller provides params.body, send it
    if (params?.body) {
      fetchOptions.body = JSON.stringify(params.body);
    } else if (body) {
      fetchOptions.body = JSON.stringify(body);
    } else {
      // send empty body if not provided
      fetchOptions.body = JSON.stringify({});
    }
  }


  const res = await fetch(finalUrl, fetchOptions);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HP API call failed ${res.status} ${res.statusText} - ${text}`);
  }
  // Parse JSON (most endpoints return JSON)
  const data = await res.json().catch(async () => {
    // if not json, try text
    const t = await res.text().catch(() => "");
    return { raw: t };
  });
  return data;
}

/**
 * Very small SQL parser helper: extract SELECT fields, FROM table, WHERE clause, ORDER BY, GROUP BY, LIMIT
 * Returns fragments or null
 */
function parseSQLFragments(sql: string) {
  if (!sql || typeof sql !== "string") return null;
  const rSelect = /SELECT\s+(.+?)\s+FROM\s+/i;
  const rFrom = /FROM\s+`?([\w\.]+)`?/i;
  const rWhere = /WHERE\s+(.+?)(?:ORDER\s+BY|GROUP\s+BY|LIMIT|$)/i;
  const rOrder = /ORDER\s+BY\s+([\w\.\s,]+)(?:\s+(ASC|DESC))?/i;
  const rGroup = /GROUP\s+BY\s+([\w\.\s,]+)/i;
  const rLimit = /LIMIT\s+(\d+)/i;

  const selectMatch = sql.match(rSelect);
  const fromMatch = sql.match(rFrom);
  const whereMatch = sql.match(rWhere);
  const orderMatch = sql.match(rOrder);
  const groupMatch = sql.match(rGroup);
  const limitMatch = sql.match(rLimit);

  return {
    select: selectMatch ? selectMatch[1].trim() : undefined,
    table: fromMatch ? fromMatch[1].trim() : undefined,
    where: whereMatch ? whereMatch[1].trim() : undefined,
    order_by: orderMatch ? orderMatch[1].trim() : undefined,
    order_dir: orderMatch && orderMatch[2] ? orderMatch[2].trim().toUpperCase() : undefined,
    group_by: groupMatch ? groupMatch[1].trim() : undefined,
    limit: limitMatch ? Number(limitMatch[1]) : undefined
  };
}

/**
 * Parse simple WHERE expressions like:
 *  parent_id = 0 AND status = 1
 *  parent_id='0' AND status IN (1,2)
 * Returns { filters: Record<string,string|number|Array<string|number>> }
 */
function parseWhereToFilters(whereClause?: string) {
  if (!whereClause) return {};
  // split by AND for now (doc shows simple filters)
  const parts = whereClause.split(/\s+AND\s+/i).map(p => p.trim()).filter(Boolean);
  const filters: Record<string, any> = {};
  for (const part of parts) {
    // handle IN (...) and = and LIKE
    const inMatch = part.match(/(\w+)\s+IN\s*\((.+)\)/i);
    if (inMatch) {
      const key = inMatch[1];
      const vals = inMatch[2].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      filters[key] = vals;
      continue;
    }
    const eqMatch = part.match(/(\w+)\s*=\s*('?[^']+'?|\"?[^\"]+\"?|\d+)/i);
    if (eqMatch) {
      const key = eqMatch[1];
      const raw = eqMatch[2].trim().replace(/^['"]|['"]$/g, '');
      // coerce numeric strings to numbers when appropriate
      const num = Number(raw);
      filters[key] = isNaN(num) ? raw : num;
      continue;
    }
    const likeMatch = part.match(/(\w+)\s+LIKE\s+'(.+)'/i);
    if (likeMatch) {
      filters[likeMatch[1]] = likeMatch[2];
      continue;
    }
    // fallback: try to split by space
    const fallback = part.split(/\s+/);
    if (fallback.length >= 3) {
      const key = fallback[0];
      const val = fallback.slice(2).join(' ').replace(/^['"]|['"]$/g, '');
      filters[key] = val;
    }
  }
  return filters;
}

/**
 * Try to infer a table name from natural language if SQL didn't contain FROM
 */
function inferTableFromNL(nl: string): string | undefined {
  if (!nl) return undefined;
  const text = nl.toLowerCase();
  for (const [alias, table] of Object.entries(tableAliasMap)) {
    const pattern = new RegExp(`\\b${alias}\\b`, "i");
    if (pattern.test(text)) return table;
  }
  return undefined;
}

/**
 * Main executeSQLQuery replacement:
 * - Accepts generated SQL and original NL query (for fallback inference).
 * - Determines the correct HP endpoint for the requested table or intent.
 * - Constructs params and calls the endpoint.
 *
 * Note: This function is intentionally conservative: it avoids executing mutating SQL
 * (DROP/DELETE/etc.) — validateSQL() still runs upstream.
 */
async function executeSQLQuery(sql: string, originalQuery?: string): Promise<any[]> {
  // 1) Try to parse SQL fragments
  const fragments = parseSQLFragments(sql || "");
  let table = fragments?.table;

  // ---- FIX: APPLY alias map IMMEDIATELY ----
  if (table && tableAliasMap[table.toLowerCase()]) {
    table = tableAliasMap[table.toLowerCase()];
  }
  const whereClause = fragments?.where;
  const order_by = fragments?.order_by;
  const order_dir = fragments?.order_dir;
  const group_by = fragments?.group_by;
  const limit = fragments?.limit;

  // 2) If no table found in SQL, try to infer from original natural-language query
  // Additional fallback: Use alias map keys
  if (!table && originalQuery) {
    const words = originalQuery.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (tableAliasMap[w]) {
        table = tableAliasMap[w];
        break;
      }
    }
  }


  // 3) If still no table, but SQL contains only a WHERE (LLM might have returned "WHERE ...")
  if (!table && fragments && fragments.where) {
    // attempt to detect table from WHERE keys by checking common table columns
    // basic heuristic: common column names -> table mapping (expandable)
    const heuristicColumnMap: Record<string, string> = {
      parent_id: "tblmenumaster",
      sub_institute_id: "tblmenumaster",
      sort_order: "tblmenumaster",
      status: "tblmenumaster",
      user_id: "tbluser",
      employee_id: "tbluser",
      subject_id: "chapter_master",
      chapter_id: "chapter_master",
      standard_id: "chapter_master",
      // extend this map as needed
    };
    const keys = Object.keys(parseWhereToFilters(fragments.where));
    for (const k of keys) {
      if (heuristicColumnMap[k]) {
        table = heuristicColumnMap[k];
        break;
      }
    }
  }

  // 4) If still no table, throw a helpful error
  if (!table) {
    throw new Error("Could not determine target table for query. Please mention the table name (for example 'tblmenumaster' or say 'menus').");
  }

  // 5) Normalize table name (strip schema if present)
  table = table.split('.').pop() as string;

  // 6) Build filters from WHERE clause
  const filters = parseWhereToFilters(whereClause);

  // 7) Map table -> API endpoint
  // Default: call /table_data?table=<table>&filters[...] (common pattern in doc)
  // But for some tables or intents, call dedicated endpoints (e.g., chapter_master)
  let apiEntry = undefined;

  // exact matches in registry
  if (hpApiMap[table]) {
    apiEntry = hpApiMap[table];
  }
  // Fallback match: remove "-" and "_" from both sides
  if (!apiEntry) {
    const cleanedTable = table.toLowerCase().replace(/[-_]/g, "");
    apiEntry = Object.entries(hpApiMap).find(([key]) =>
      key.toLowerCase().replace(/[-_]/g, "") === cleanedTable
    )?.[1];
  }


  // known special table -> endpoint mapping
  const specialTableToEntryKey: Record<string, string> = {
    "chapter_master": "chapter_master",
    "content_master": "content_master",
    "question_chapter_master": "question_chapter_master",
    "question_master": "question_master",
    "dashboard": "dashboard",
    // add other direct mappings if present in hpApiMap
  };

  if (!apiEntry && specialTableToEntryKey[table] && hpApiMap[specialTableToEntryKey[table]]) {
    apiEntry = hpApiMap[specialTableToEntryKey[table]];
  }

  // Default fallback: generic table_data endpoint
  if (!apiEntry) {
    apiEntry = hpApiMap["table_data"];
  }

  // 8) Construct API params using doc's expected query params style
  const params: Record<string, any> = {};
  // default required common params (the doc uses token, sub_institute_id etc.)
  // prefer passing env vars if available
  if (process.env.HP_API_TOKEN) params["token"] = process.env.HP_API_TOKEN;
  if (process.env.HP_SUB_INSTITUTE_ID) params["sub_institute_id"] = process.env.HP_SUB_INSTITUTE_ID;
  // incorporate filters from WHERE
  if (Object.keys(filters).length > 0) {
    params["table"] = table; // ensure table param is present for table_data
    for (const [k, v] of Object.entries(filters)) {
      // API expects filters[key]=value
      if (Array.isArray(v)) {
        v.forEach((val, idx) => {
          params[`filters[${k}][${idx}]`] = val;
        });
      } else {
        params[`filters[${k}]`] = v;
      }

    }
  } else {
    // If no filters but SQL had SELECT * FROM table (no where), still pass table
    params["table"] = table;
  }

  // incorporate order_by / group_by / limit if present (many endpoints accept these params)
  if (order_by) {
    params["order_by[column]"] = order_by;
    if (order_dir) params["order_by[direction]"] = order_dir.toLowerCase();
  }
  if (group_by) {
    params["group_by"] = group_by;
  }
  if (typeof limit === "number") {
    params["limit"] = limit;
  }

  // doc examples often include type=API and user context - add if provided in ENV
  params["type"] = params["type"] || "API";
  if (process.env.HP_USER_ID) params["user_id"] = params["user_id"] || process.env.HP_USER_ID;
  if (process.env.HP_SYEAR) params["syear"] = params["syear"] || process.env.HP_SYEAR;
  if (!params["token"] && process.env.HP_API_TOKEN_FALLBACK) params["token"] = process.env.HP_API_TOKEN_FALLBACK;

  // 9) Final call: some hpApiMap entries are POST endpoints expecting query params for create/update
  try {
    // If the API is exactly 'table_data' or similar, call with GET; if special and method POST, call POST
    const method = apiEntry.method;
    // If table_data, use GET with built params as querystring
    if (apiEntry === hpApiMap["table_data"]) {
      // build URL and call
      const data = await callHpApi("GET", apiEntry.url, params);
      // many table_data responses are arrays or {data: ...}; normalize
      if (Array.isArray(data)) return data;
      if (data?.results) return data.results;
      if (data?.data) return data.data;
      return data;
    } else {
      // For special endpoints, we may need to pass specific param names from doc
      // Example: chapter_master expects standard_id, subject_id etc.
      // We'll pass our params and let API handle extras.
      const data = await callHpApi(method, apiEntry.url, params, undefined);
      // Normalize response
      if (Array.isArray(data)) return data;
      if (data?.results) return data.results;
      if (data?.data) return data.data;
      return data;
    }
  } catch (err) {
    // rethrow with additional context so upper layers know which URL failed
    throw new Error(`executeSQLQuery failed for table=${table}: ${(err as Error).message}`);
  }
}

// -------------------------
// END REPLACEMENT: API LAYER
// -------------------------



async function generateInsights(query: string, sql: string, results: any[]): Promise<string> {
  const prompt = `User asked: "${query}"

SQL Query executed:
${sql}

Results (${results.length} rows):
${JSON.stringify(results.slice(0, 5), null, 2)}${results.length > 5 ? '\n...(more rows)' : ''}

Based on these results, provide a clear, conversational answer to the user's question.
Be concise but informative. If the results are empty, explain that no data was found.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful data assistant. Provide clear, conversational insights.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate insights');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function extractTablesFromSQL(sql: string): string[] {
  const tableRegex = /FROM\s+`?(\w+)`?|JOIN\s+`?(\w+)`?/gi;
  const tables = new Set<string>();
  let match;

  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1] || match[2];
    if (tableName) {
      tables.add(tableName);
    }
  }

  return Array.from(tables);
}

function validateSQL(sql: string): boolean {
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
  const upperSQL = sql.toUpperCase();

  for (const keyword of dangerousKeywords) {
    if (upperSQL.includes(keyword)) {
      return false;
    }
  }

  return true;
}

export async function handleChatRequest(request: ChatRequest): Promise<ChatResponse> {
  if (request.debugMode) {
    enableDebugMode();
  }

  const conversationId = await ensureConversation(request);
  const intent = classifyIntent(request.query);
  let attempt = 0;
  const maxAttempts = 2;

  try {
    if (!request.role) {
      request.role = 'user';
    }

    const anonymousId = request.userId || uuidv4();
    const roleContext = await getRoleContext(anonymousId);

    await saveMessage(conversationId, 'user', request.query, intent.intent);

    const sanitized = sanitizeQuery(request.query);
    if (!sanitized.isClean) {
      const securityError = {
        answer: `Security check flagged concerns: ${sanitized.threats.join(', ')}. Please rephrase your question.`,
        conversationId,
        intent: intent.intent,
        error: 'Security validation failed',
        recoverable: false,
        canEscalate: true
      };
      await saveMessage(conversationId, 'bot', securityError.answer, intent.intent, undefined, undefined, true, 'Security validation failed');
      return securityError;
    }

    const safetyCheck = validateQuerySafety(request.query, request.role);
    if (!safetyCheck.safe) {
      const accessError = {
        answer: safetyCheck.reason || 'You do not have permission to access this data.',
        conversationId,
        intent: intent.intent,
        error: 'Access denied',
        recoverable: false,
        canEscalate: true
      };
      await saveMessage(conversationId, 'bot', accessError.answer, intent.intent, undefined, undefined, true, 'Access denied');
      return accessError;
    }

    if (intent.intent === 'CREATE_JOB_DESCRIPTION') {
      return handleCreateJobDescriptionAction(request, { userId: anonymousId, role: request.role }, conversationId);
    }

    if (shouldRouteToAction(intent.intent)) {
      const actionResponse = {
        answer: `I detected this might be a ${intent.intent} request. For actions and support requests, please contact a support representative or escalate this conversation.`,
        conversationId,
        intent: intent.intent,
        error: 'Action routing required',
        recoverable: true,
        suggestion: 'Would you like me to escalate this to a human agent?',
        canEscalate: true
      };
      await saveMessage(conversationId, 'bot', actionResponse.answer, intent.intent);
      return actionResponse;
    }

    const history = request.conversationHistory || [];
    let sql = '';
    let results: any[] = [];
    let answer = '';

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const startTime = Date.now();
        sql = await generateSQL(request.query, history);
        const genTime = Date.now() - startTime;

        if (!validateSQL(sql)) {
          throw new Error('SQL validation failed - contains dangerous keywords');
        }

        results = await executeSQLQuery(sql, request.query);
        const execTime = Date.now() - startTime;

        await logQuery(conversationId, 'data_retrieval', sql, execTime, true);

        answer = await generateInsights(request.query, sql, results);

        const tables = extractTablesFromSQL(sql);

        await saveMessage(
          conversationId,
          'bot',
          answer,
          intent.intent,
          sql,
          tables,
          false
        );

        if (debugModeEnabled) {
          const trace = formatDebugTrace(intent.intent, sql, execTime, results);
          console.log(trace);
        }

        return {
          answer,
          conversationId,
          intent: intent.intent,
          sql,
          tables_used: tables,
          insights: `Found ${results.length} result(s)`,
          canEscalate: true
        };
      } catch (error) {
        console.error("🔥 RAW ERROR:", error);
        const errorCtx = parseError(error);
        const retryable = shouldRetry(errorCtx);

        if (!retryable || attempt >= maxAttempts) {
          throw error;
        }

        await logEvent({
          conversationId,
          logLevel: 'warning',
          logType: 'query_retry',
          message: `Retrying query (attempt ${attempt}/${maxAttempts}): ${errorCtx.message}`,
          metadata: { error: errorCtx }
        });
      }
    }

    throw new Error('Max retry attempts exceeded');
  } catch (error) {
    console.error("🔥 RAW ERROR:", error);
    const errorCtx = parseError(error);
    const errorMessage = formatErrorResponse(errorCtx, attempt);

    await logEvent({
      conversationId,
      logLevel: 'error',
      logType: 'request_failure',
      message: errorMessage,
      metadata: { error: errorCtx, intent: intent.intent }
    });

    await saveMessage(
      conversationId,
      'bot',
      errorMessage,
      intent.intent,
      undefined,
      undefined,
      true,
      errorCtx.message
    );
    if (!shouldUseFallback(intent.intent)) {
      const errorDetails = `Intent: ${intent.intent}, Confidence: ${intent.confidence}, Reasoning: ${intent.reasoning}`;
      const errorMessage = `An unexpected error occurred. Details: ${errorDetails}`;

      await saveMessage(
        conversationId,
        'bot',
        errorMessage,
        intent.intent,
        undefined,
        undefined,
        true,
        errorDetails
      );

      return {
        answer: errorMessage,
        conversationId,
        intent: intent.intent,
        error: 'UNKNOWN',
        recoverable: false,
        suggestion: 'Please contact support with the above details.',
        canEscalate: true
      };
    }
    if (shouldUseFallback(intent.intent)) {
      try {
        const fallbackMessages = request.conversationHistory ? [...request.conversationHistory] : [];
        fallbackMessages.push({ role: 'user', content: request.query });

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LLM_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: [
              { role: 'system', content: 'You are a friendly assistant. Answer normally in plain English. Maintain conversation context.' },
              ...fallbackMessages
            ]
          })
        });

        const data = await response.json();
        const fallbackAnswer = data.choices?.[0]?.message?.content?.trim() || errorMessage;

        const botMessage = await saveMessage(conversationId, 'bot', fallbackAnswer, intent.intent);
        if (!botMessage) {
          throw new Error('Failed to save bot message');
        }
        return {
          answer: fallbackAnswer,
          conversationId,
          id: botMessage.id,
          intent: intent.intent,
          canEscalate: true
        };
      } catch (fallbackError) {
        console.error('Fallback LLM failed:', fallbackError);
      }
    }

    return {
      answer: errorMessage,
      conversationId,
      intent: intent.intent,
      error: errorCtx.code,
      recoverable: errorCtx.recoverable,
      suggestion: errorMessage,
      canEscalate: true
    };
  }
}

async function ensureConversation(request: ChatRequest): Promise<string> {
  const existingConv = await getConversationBySessionId(request.sessionId);

  if (existingConv) {
    return existingConv.id;
  }

  const newConv = await createConversation(
    request.sessionId,
    request.userId || uuidv4(),
    request.role || 'user'
  );

  if (!newConv?.id) {
    throw new Error('Failed to create or retrieve a conversation.');
  }

  return newConv.id;
}

async function handleCreateJobDescriptionAction(
  request: ChatRequest,
  userContext: { userId: string; role: string | undefined },
  conversationId: string
): Promise<ChatResponse> {
  // Basic extraction from the query. 
  //This could be replaced with a more sophisticated NLP entity extraction model.
  const rawQuery = request.query;
  const query = rawQuery.toLowerCase();
  const industryMatch = rawQuery.match(/industry\s*[:\-]?\s*([a-zA-Z ]+)/i)?.[1]?.trim();
  const jobRoleMatch = rawQuery.match(/jobrole\s*[:\-]?\s*([a-zA-Z ]+)/i)?.[1]?.trim();
  const departmentMatch = rawQuery.match(/department\s*[:\-]?\s*([a-zA-Z ]+)/i)?.[1]?.trim();
  const descriptionMatch = rawQuery.match(/description\s*[:\-]?\s*(.+)$/i)?.[1]?.trim();

  const industry = industryMatch ?? null;
  const jobRole = jobRoleMatch ?? null;
  const department = departmentMatch ?? null;
  const description = descriptionMatch ?? null;

  // if (!industry || !jobRole || !department || !description) {
  //   throw new Error('Unreachable: validation failed');
  // }
  const missingFields: string[] = [];
  if (!industry) missingFields.push('Industry');
  if (!jobRole) missingFields.push('Jobrole');
  if (!department) missingFields.push('Department');
  if (!description) missingFields.push('Description');

  if (missingFields.length > 0) {
    const answer = `Please provide the following missing information: ${missingFields.join(', ')}.`;
    await saveMessage(conversationId, 'bot', answer, 'CREATE_JOB_DESCRIPTION');
    return {
      answer,
      conversationId,
      intent: 'CREATE_JOB_DESCRIPTION',
      recoverable: true,
      suggestion: 'Please provide the missing details to proceed.',
    };
  }
  const safeIndustry = industry!;
  const safeJobRole = jobRole!;
  const safeDepartment = department!;
  const safeDescription = description!;
  try {
    const jdResponse = await handleCreateJobDescription({
      industry: safeIndustry,
      jobRole: safeJobRole,
      department: safeDepartment,
      description: safeDescription,
      userContext,
      conversationId,
    });

    const answer = `Job Description created:\n\n**${jdResponse.data.job_title}**\n\nDepartment: ${jdResponse.data.department}\nExperience: ${jdResponse.data.experience_level}\n\nResponsibilities:\n${jdResponse.data.key_responsibilities.map((r: string) => `- ${r}`).join('\n')}\n\nRequired Skills:\n${jdResponse.data.required_skills.map((s: string) => `- ${s}`).join('\n')}\n\nPreferred Skills:\n${jdResponse.data.preferred_skills.map((s: string) => `- ${s}`).join('\n')}\n\nEducation: ${jdResponse.data.education}\nEmployment Type: ${jdResponse.data.employment_type}\nLocation: ${jdResponse.data.location}`;

    await saveMessage(conversationId, 'bot', answer, 'CREATE_JOB_DESCRIPTION');

    return {
      answer,
      conversationId,
      intent: 'CREATE_JOB_DESCRIPTION',
      canEscalate: true,
    };
  } catch (error) {
    const errorMessage = `Failed to create job description: ${(error as Error).message}`;
    await saveMessage(conversationId, 'bot', errorMessage, 'CREATE_JOB_DESCRIPTION', undefined, undefined, true, (error as Error).message);
    return {
      answer: errorMessage,
      conversationId,
      intent: 'CREATE_JOB_DESCRIPTION',
      error: 'JD_CREATION_FAILED',
      recoverable: false,
      canEscalate: true,
    };
  }
}

export async function handleCreateJobDescription({ industry,
  department,
  jobRole,
  description,
  userContext,
  conversationId
}: {
  industry: string;
  department: string;
  jobRole: string;
  description: string;
  userContext: any;
  conversationId: string;
}): Promise<ActionResponse> {
  // Save user message for auditability
  const query = `Create a job description for ${jobRole} in ${department} of ${industry} with the following description: ${description}`;
  await saveMessage(conversationId, 'user', query, 'job_description_generation');

  // Permission check (mandatory)
  if (!canAccessData(userContext, 'TALENT_DEVELOPMENT')) {
    throw new Error('Access denied for JD creation');
  }

  // Build JD prompt
  const prompt = `

You are an HR and Talent Development expert.

Create a professional Job Description.

Industry: ${industry}
Department: ${department}
Job Role: ${jobRole}
Context: ${description}

the output should be in JSON format only, without any additional text.
Return output in JSON with the following structure:

{
  "job_title": "",
  "department": "",
  "experience_level": "",
  "key_responsibilities": [],
  "required_skills": [],
  "preferred_skills": [],
  "education": "",
  "employment_type": "",
  "location": ""
}
`;

  const startTime = Date.now();

  try {
    // Call the LLM
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: 'You are an expert HR assistant. Generate structured job descriptions in JSON format only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate job description');
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    // Log the LLM call if debug mode is enabled
    if (debugModeEnabled) {
      await logLLMCall(conversationId, 'deepseek/deepseek-chat', responseTime, true);
    }

    // Parse the LLM response as JSON
    const rawContent = data.choices[0].message.content.trim();
    const cleanedContent = rawContent.replace(/```json\n?|\n?```/g, '').trim();
    const jdOutput: JobDescription = JSON.parse(cleanedContent);

    // Validate the structure (basic check)
    if (!jdOutput.job_title || !Array.isArray(jdOutput.key_responsibilities) || !Array.isArray(jdOutput.required_skills)) {
      throw new Error('Invalid job description structure returned by LLM');
    }

    // Save the JD result for auditability and conversation history
    await saveMessage(conversationId, 'bot', rawContent, 'job_description_generation');

    // Log for analytics: who is generating JDs, which roles are common
    await logEvent({
      conversationId,
      logLevel: 'info',
      logType: 'JD_CREATED_FROM_CHAT',
      message: 'Job description created from chat',
      metadata: { userId: userContext?.userId, conversationId }
    });

    // Return tagged response for Talent Development module
    return {
      type: 'ACTION_RESPONSE',
      module: 'TALENT_DEVELOPMENT',
      action: 'CREATE_JOB_DESCRIPTION',
      data: jdOutput
    };
  } catch (error) {
    console.error('Error in handleCreateJobDescription:', error);
    // Log the error
    await logEvent({
      conversationId,
      logLevel: 'error',
      logType: 'jd_generation_failure',
      message: `Failed to generate job description: ${(error as Error).message}`,
      metadata: { query, userContext }
    });
    throw error;  // Re-throw for upstream handling
  }
}

export async function handleEscalation(
  conversationId: string,
  userId: string,
  reason: string
): Promise<{ success: boolean; escalationId?: string; message: string }> {
  try {
    const escalation = await createEscalation(conversationId, userId, reason);

    if (!escalation) {
      return {
        success: false,
        message: 'Failed to create escalation. Please try again.'
      };
    }

    await updateConversationStatus(conversationId, 'escalated');

    return {
      success: true,
      escalationId: escalation.id,
      message: 'Your request has been escalated. A support team member will contact you shortly.'
    };
  } catch (err) {
    console.error('Escalation error:', err);
    return {
      success: false,
      message: 'An error occurred during escalation. Please try again.'
    };
  }
}
