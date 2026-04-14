"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Download,
  AlertTriangle,
  CloudUpload,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HeaderMismatchTable from "./HeaderMismatchTable";

interface ExcelUploadPanelProps { appUrl: string; token: string; templateColumns: string[]; }
interface UploadResult { status: boolean; message: string; rows_uploaded?: number; written_range?: string; expected_headers?: string[]; received_headers?: string[]; mismatches?: { column: string; expected: string; received: string }[]; }

const ease = [0.22, 1, 0.36, 1];

export default function ExcelUploadPanel({ appUrl, token, templateColumns }: ExcelUploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((f: File) => {
    setFile(f); setResult(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        if (rows.length > 0) { setPreviewHeaders(Object.keys(rows[0])); setPreviewRows(rows.slice(0, 5)); }
      } catch { setPreviewHeaders([]); setPreviewRows([]); }
    };
    reader.readAsArrayBuffer(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && (f.name.endsWith(".xlsx") || f.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) processFile(f);
  }, [processFile]);

  const handleClear = () => { setFile(null); setPreviewHeaders([]); setPreviewRows([]); setResult(null); if (fileRef.current) fileRef.current.value = ""; };

  const handleUpload = async () => {
    if (!file) return; setUploading(true); setResult(null);
    try {
      const fd = new FormData(); fd.append("token", token); fd.append("file", file);
      const res = await fetch(`${appUrl}/api/excel-agent/upload`, { method: "POST", body: fd });
      setResult(await res.json());
    } catch { setResult({ status: false, message: "Network error. Could not reach the server." }); }
    finally { setUploading(false); }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([templateColumns]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "content_plan_template.xlsx");
  };

  const matchCount = previewHeaders.filter(h => templateColumns.map(c => c.toLowerCase().trim()).includes(h.toLowerCase().trim())).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(30,64,175,0.08)] transition-shadow duration-500 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100/50">
            <CloudUpload className="w-4 h-4 text-[#1E40AF]" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-gray-900">Upload Excel File</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Upload .xlsx files matching the content plan template</p>
          </div>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-[#1E40AF]/5 text-gray-600 hover:text-[#1E40AF] text-[11px] font-semibold transition-all duration-200 border border-gray-200/60 hover:border-[#1E40AF]/15"
        >
          <Download className="w-3 h-3" />
          Template
        </button>
      </div>

      <div className="p-5 md:p-6 space-y-5">

        {/* ── Drop Zone ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden ${
            isDragOver
              ? "border-[#1E40AF]/40 bg-blue-50/50 scale-[1.005]"
              : file
              ? "border-emerald-200 bg-emerald-50/20"
              : "border-gray-200 hover:border-[#1E40AF]/25 hover:bg-blue-50/15"
          }`}
        >
          <div className="relative flex flex-col items-center justify-center py-8 px-6">
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{file.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleClear(); }}
                    className="ml-3 w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Drag & drop your Excel file here</p>
                  <p className="text-[11px] text-gray-400 mt-1">or click to browse — <span className="text-[#1E40AF]/60 font-medium">.xlsx only</span></p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
        </div>

        {/* ── Header Preview ── */}
        <AnimatePresence>
          {previewHeaders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease }}
              className="rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600 tracking-tight flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-gray-400" />
                  Detected Headers
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  matchCount === templateColumns.length
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                    : "bg-amber-50 text-amber-700 border border-amber-200/50"
                }`}>
                  {matchCount}/{templateColumns.length} match
                </span>
              </div>

              <div className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {previewHeaders.map((h, i) => {
                    const ok = templateColumns.map(c => c.toLowerCase().trim()).includes(h.toLowerCase().trim());
                    return (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.025, duration: 0.2 }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                          ok ? "bg-emerald-50/60 text-emerald-700 border-emerald-200/50" : "bg-amber-50/60 text-amber-700 border-amber-200/50"
                        }`}
                      >
                        {ok ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {h}
                      </motion.span>
                    );
                  })}
                </div>

                {previewRows.length > 0 && (
                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="min-w-full text-[11px]">
                      <thead>
                        <tr className="bg-gray-50/80">
                          <th className="px-3 py-2 text-left text-gray-400 font-bold">#</th>
                          {previewHeaders.map((h, i) => (
                            <th key={i} className="px-3 py-2 text-left text-gray-400 font-bold truncate max-w-[110px]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, ri) => (
                          <tr key={ri} className="border-t border-gray-50 hover:bg-blue-50/20 transition-colors duration-150">
                            <td className="px-3 py-2 text-gray-400">{ri + 1}</td>
                            {previewHeaders.map((h, ci) => (
                              <td key={ci} className="px-3 py-2 text-gray-600 truncate max-w-[110px]" title={String(row[h] || "")}>
                                {String(row[h] || "").substring(0, 35)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Upload Button ── */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-40"
          style={{
            background: file ? "linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)" : undefined,
            boxShadow: file ? "0 4px 14px rgba(30,64,175,0.25)" : undefined,
          }}
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading to Google Sheet…</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Upload Excel</>
          )}
        </Button>

        {/* ── Result ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease }}
            >
              <div className={`rounded-xl border p-4 ${
                result.status
                  ? "bg-emerald-50/50 border-emerald-200/50"
                  : "bg-red-50/50 border-red-200/50"
              }`}>
                <div className="flex items-center gap-2.5">
                  {result.status ? (
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-4 h-4 text-emerald-600" /></div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0"><XCircle className="w-4 h-4 text-red-600" /></div>
                  )}
                  <div>
                    <span className={`font-semibold text-sm ${result.status ? "text-emerald-800" : "text-red-800"}`}>{result.message}</span>
                    {result.status && result.rows_uploaded !== undefined && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {result.rows_uploaded} rows uploaded
                        {result.written_range && <> · Range: <code className="font-mono text-[11px] bg-emerald-100/60 px-1.5 py-0.5 rounded">{result.written_range}</code></>}
                      </p>
                    )}
                  </div>
                </div>
                {!result.status && result.expected_headers && result.received_headers && (
                  <div className="mt-3"><HeaderMismatchTable expectedHeaders={result.expected_headers} receivedHeaders={result.received_headers} mismatches={result.mismatches} /></div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Template Info ── */}
        <div className="rounded-xl bg-[#F8FAFF] border border-blue-100/50 p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.08em]">Required Format</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2.5">Your Excel file must use these exact column headers:</p>
          <div className="flex flex-wrap gap-1.5">
            {templateColumns.map((col, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white text-gray-600 text-[11px] font-medium border border-gray-200/80 hover:border-gray-300 transition-colors duration-200 cursor-default">
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
