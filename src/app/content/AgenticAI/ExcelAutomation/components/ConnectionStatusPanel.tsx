"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Table2,
  Clock,
  ExternalLink,
  RefreshCcw,
  LayoutGrid,
  Signal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HeaderMismatchTable from "./HeaderMismatchTable";

interface GoogleCredential { id: number; google_sheet_id: string; is_active: boolean; created_at?: string; updated_at?: string; }
interface Template { id: number; name: string; columns: string[]; updated_at?: string; }
interface ConnectionStatusPanelProps { credential: GoogleCredential | null; template: Template | null; orgType?: string; appUrl: string; token: string; }
interface TestResult { status: boolean; message: string; sheet_title?: string; expected_headers?: string[]; received_headers?: string[]; }

const ease = [0.22, 1, 0.36, 1];

export default function ConnectionStatusPanel({ credential, template, orgType, appUrl, token }: ConnectionStatusPanelProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleTestConnection = async () => {
    setTesting(true); setTestResult(null);
    try {
      const fd = new FormData(); fd.append("token", token);
      const res = await fetch(`${appUrl}/api/excel-agent/test-connection`, { method: "POST", body: fd });
      setTestResult(await res.json());
    } catch { setTestResult({ status: false, message: "Failed to reach server." }); }
    finally { setTesting(false); }
  };

  const sheetUrl = credential?.google_sheet_id ? `https://docs.google.com/spreadsheets/d/${credential.google_sheet_id}` : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(30,64,175,0.08)] transition-shadow duration-500 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100/50">
              <Signal className="w-4 h-4 text-[#1E40AF]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
            </span>
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-gray-900">Agent Status</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Google Sheet connected</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      </div>

      <div className="p-5 md:p-6">

        {/* ── Info Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {orgType && (
            <div className="px-4 py-3.5 rounded-xl bg-gray-50/80 border border-gray-100/80 hover:bg-gray-50 transition-colors duration-200">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.08em] mb-1">Organization</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{orgType}</p>
            </div>
          )}

          {credential?.google_sheet_id && (
            <div className="px-4 py-3.5 rounded-xl bg-gray-50/80 border border-gray-100/80 hover:bg-gray-50 transition-colors duration-200">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.08em] mb-1">Google Sheet</p>
              <div className="flex items-center gap-2">
                <code className="text-[11px] bg-white border border-gray-200/80 px-2 py-0.5 rounded-md font-mono text-gray-600 truncate flex-1">
                  {credential.google_sheet_id}
                </code>
                {sheetUrl && (
                  <a href={sheetUrl} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-[#1E40AF]/5 hover:bg-[#1E40AF]/10 inline-flex items-center justify-center text-[#1E40AF] transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {credential?.updated_at && (
            <div className="px-4 py-3.5 rounded-xl bg-gray-50/80 border border-gray-100/80 hover:bg-gray-50 transition-colors duration-200">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.08em] mb-1">Last Synced</p>
              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium">{new Date(credential.updated_at).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Template Columns ── */}
        {template && (
          <div className="rounded-xl bg-[#F8FAFF] border border-blue-100/50 p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-[#1E40AF]/50" />
              <span className="text-xs font-bold text-gray-700">{template.name}</span>
              <span className="ml-auto text-[10px] font-semibold text-gray-400">{template.columns.length} columns</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {template.columns.map((col, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.3, ease }}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white text-[#1E40AF]/80 text-xs font-medium border border-blue-100/60 shadow-[0_1px_2px_rgba(30,64,175,0.04)] hover:shadow-[0_2px_8px_rgba(30,64,175,0.08)] hover:border-blue-200/80 transition-all duration-300 cursor-default"
                >
                  {col}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* ── Test Connection ── */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
          <Button
            onClick={handleTestConnection}
            disabled={testing}
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-gray-200 text-gray-700 hover:text-[#1E40AF] hover:border-[#1E40AF]/20 hover:bg-blue-50/50 transition-all duration-300"
          >
            {testing ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Testing…</>
            ) : (
              <><RefreshCcw className="w-3.5 h-3.5" /> Test Connection</>
            )}
          </Button>
          <span className="text-[11px] text-gray-400 hidden sm:inline">Verify your Google Sheet is reachable</span>
        </div>

        {/* ── Test Result ── */}
        <AnimatePresence>
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease }}
              className="mt-4"
            >
              <div className={`rounded-xl border p-4 ${
                testResult.status
                  ? "bg-emerald-50/60 border-emerald-200/60"
                  : "bg-red-50/60 border-red-200/60"
              }`}>
                <div className="flex items-center gap-2.5">
                  {testResult.status ? (
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-emerald-600" /></div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center"><XCircle className="w-4 h-4 text-red-600" /></div>
                  )}
                  <div>
                    <span className={`font-semibold text-sm ${testResult.status ? "text-emerald-800" : "text-red-800"}`}>
                      {testResult.message}
                    </span>
                    {testResult.sheet_title && (
                      <p className="text-xs text-gray-500 mt-0.5">Sheet: <span className="font-medium text-gray-700">{testResult.sheet_title}</span></p>
                    )}
                  </div>
                </div>
                {testResult.expected_headers && testResult.received_headers && (
                  <div className="mt-3"><HeaderMismatchTable expectedHeaders={testResult.expected_headers} receivedHeaders={testResult.received_headers} /></div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
