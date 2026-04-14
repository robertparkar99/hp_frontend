"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
  Link2,
  ShieldCheck,
  Fingerprint,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CredentialSetupFormProps {
  appUrl: string;
  token: string;
  hasExistingCredentials: boolean;
  onSaved: () => void;
}

const ease = [0.22, 1, 0.36, 1];

export default function CredentialSetupForm({ appUrl, token, hasExistingCredentials, onSaved }: CredentialSetupFormProps) {
  const [sheetUrl, setSheetUrl] = useState("");
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ status: boolean; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) { setResult({ status: false, message: "Please enter a Google Sheet URL or ID." }); return; }
    if (!jsonFile) { setResult({ status: false, message: "Please select the Service Account JSON key file." }); return; }
    setSaving(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append("token", token);
      fd.append("google_sheet_url", sheetUrl.trim());
      fd.append("service_account_key_file", jsonFile);
      fd.append("test_connection", "1");
      const res = await fetch(`${appUrl}/api/excel-agent/credentials`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.status) {
        setResult({ status: true, message: data.message || "Credentials saved and verified!" });
        onSaved(); setSheetUrl(""); setJsonFile(null);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setResult({ status: false, message: data.message || data.error || "Failed to save credentials." });
      }
    } catch { setResult({ status: false, message: "Network error. Could not reach the server." }); }
    finally { setSaving(false); }
  };

  const step1 = sheetUrl.trim().length > 0;
  const step2 = jsonFile !== null;

  return (
    <div className={`bg-white overflow-hidden ${hasExistingCredentials ? "" : "rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"}`}>

      {/* Header — standalone only */}
      {!hasExistingCredentials && (
        <div className="flex items-center gap-3 px-5 md:px-6 py-4 border-b border-gray-50 bg-gray-50/30">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100/50">
            <KeyRound className="w-4 h-4 text-[#1E40AF]" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-gray-900">Connect Google Sheet</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Link your organization's content plan spreadsheet</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">

        {/* Step progress */}
        <div className="flex items-center gap-1.5">
          {[
            { done: step1, label: "Sheet URL" },
            { done: step2, label: "Key File" },
            { done: false, label: "Connect" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && <div className={`w-6 h-[1.5px] rounded-full transition-colors duration-500 ${
                i === 1 && step1 ? "bg-[#1E40AF]/30" : i === 2 && step2 ? "bg-[#1E40AF]/30" : "bg-gray-200"
              }`} />}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-500 ${
                s.done
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-gray-50 text-gray-400 border border-gray-200/60"
              }`}>
                {s.done ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-gray-200/80 flex items-center justify-center text-[9px] font-bold text-gray-400">{i + 1}</span>
                )}
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Sheet URL */}
        <div>
          <label htmlFor="google-sheet-url" className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2">
            <Link2 className="w-3.5 h-3.5 text-gray-400" />
            Google Sheet URL or ID
          </label>
          <input
            id="google-sheet-url"
            type="text"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/... or sheet ID"
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/15 focus:border-[#1E40AF]/30 focus:bg-white transition-all duration-300"
          />
        </div>

        {/* JSON Key File */}
        <div>
          <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2">
            <Fingerprint className="w-3.5 h-3.5 text-gray-400" />
            Service Account Key File
          </label>

          <div
            onClick={() => fileRef.current?.click()}
            className={`group relative flex items-center gap-4 w-full rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition-all duration-300 ${
              jsonFile
                ? "border-emerald-200 bg-emerald-50/30"
                : "border-gray-200 hover:border-[#1E40AF]/25 hover:bg-blue-50/20"
            }`}
          >
            {jsonFile ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{jsonFile.name}</p>
                  <p className="text-[11px] text-gray-500">{(jsonFile.size / 1024).toFixed(1)} KB — Ready</p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:border-blue-200/50 transition-all duration-300">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#1E40AF]/70 transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-200">Click to select JSON key file</p>
                  <p className="text-[11px] text-gray-400">.json — Service Account credentials</p>
                </div>
              </>
            )}
            <input ref={fileRef} type="file" accept=".json" className="hidden"
              onChange={(e) => setJsonFile(e.target.files?.[0] ?? null)} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
            🔒 File contents are encrypted and never displayed.
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={saving || !step1 || !step2}
          className="w-full gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-40"
          style={{
            background: step1 && step2 ? "linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)" : undefined,
            boxShadow: step1 && step2 ? "0 4px 14px rgba(30,64,175,0.25)" : undefined,
          }}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving & Testing…</>
          ) : (
            <><ShieldCheck className="w-4 h-4" /> Save & Test Connection</>
          )}
        </Button>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease }}
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                result.status
                  ? "bg-emerald-50/50 border-emerald-200/50 text-emerald-800"
                  : "bg-red-50/50 border-red-200/50 text-red-800"
              }`}
            >
              {result.status ? (
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /></div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5"><XCircle className="w-3.5 h-3.5 text-red-600" /></div>
              )}
              <span className="text-sm font-medium leading-relaxed">{result.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
