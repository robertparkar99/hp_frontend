"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface HeaderMismatchTableProps {
  expectedHeaders: string[];
  receivedHeaders: string[];
  mismatches?: { column: string; expected: string; received: string }[];
  title?: string;
}

const ease = [0.22, 1, 0.36, 1];

export default function HeaderMismatchTable({ expectedHeaders, receivedHeaders, mismatches, title = "Header Comparison" }: HeaderMismatchTableProps) {

  // ── Explicit mismatches ──
  if (mismatches && mismatches.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease }}
        className="mt-3 rounded-xl border border-red-200/50 bg-red-50/30 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-red-50/60 border-b border-red-100/50">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-[11px] font-bold text-red-800">Column Mismatches</span>
          </div>
          <span className="text-[10px] font-bold text-red-600 bg-red-100/60 px-2 py-0.5 rounded-full">
            {mismatches.length} issue{mismatches.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="border-b border-red-100/40">
                <th className="px-4 py-2 text-left font-bold text-red-900/60 uppercase tracking-wider text-[10px]">Col</th>
                <th className="px-4 py-2 text-left font-bold text-red-900/60 uppercase tracking-wider text-[10px]">Expected</th>
                <th className="px-4 py-2 text-left font-bold text-red-900/60 uppercase tracking-wider text-[10px]">Received</th>
              </tr>
            </thead>
            <tbody>
              {mismatches.map((m, idx) => (
                <tr key={idx} className="border-b border-red-50 last:border-0 hover:bg-red-50/30 transition-colors duration-150">
                  <td className="px-4 py-2 text-red-700 font-semibold">{m.column}</td>
                  <td className="px-4 py-2 font-mono">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/40 text-[10px]">
                      <CheckCircle className="w-2.5 h-2.5" />{m.expected}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono">
                    {m.received ? (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200/40 text-[10px]">
                        <XCircle className="w-2.5 h-2.5" />{m.received}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-[10px]">— missing —</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  }

  // ── Side-by-side comparison ──
  const maxLen = Math.max(expectedHeaders.length, receivedHeaders.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease }}
      className="mt-3 rounded-xl border border-gray-100 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50/60 border-b border-gray-100/80">
        <span className="text-[11px] font-bold text-gray-600">{title}</span>
        <span className="text-[10px] font-semibold text-gray-400">{maxLen} columns</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-[11px]">
          <thead>
            <tr className="border-b border-gray-100/60 bg-gray-50/30">
              <th className="px-3 py-2 text-left font-bold text-gray-400 text-[10px] uppercase tracking-wider w-8">#</th>
              <th className="px-3 py-2 text-left font-bold text-gray-400 text-[10px] uppercase tracking-wider">Expected</th>
              <th className="px-3 py-2 text-left font-bold text-gray-400 text-[10px] uppercase tracking-wider">Received</th>
              <th className="px-3 py-2 text-center font-bold text-gray-400 text-[10px] uppercase tracking-wider w-14">Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxLen }, (_, i) => {
              const exp = expectedHeaders[i] || "";
              const rcv = receivedHeaders[i] || "";
              const isMatch = exp.toLowerCase().trim() === rcv.toLowerCase().trim() && exp !== "";
              return (
                <tr key={i} className={`border-b border-gray-50 last:border-0 transition-colors duration-150 ${
                  !isMatch && (exp || rcv) ? "bg-red-50/20 hover:bg-red-50/40" : "hover:bg-blue-50/15"
                }`}>
                  <td className="px-3 py-2 text-gray-400 font-semibold">{i + 1}</td>
                  <td className="px-3 py-2 font-mono text-gray-700">{exp || <span className="text-gray-300 italic">—</span>}</td>
                  <td className="px-3 py-2 font-mono text-gray-700">{rcv || <span className="text-gray-300 italic">—</span>}</td>
                  <td className="px-3 py-2 text-center">
                    {exp && rcv ? (
                      isMatch ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200/40">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-red-50 border border-red-200/40">
                          <XCircle className="w-3 h-3 text-red-500" />
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-50 border border-amber-200/40">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
