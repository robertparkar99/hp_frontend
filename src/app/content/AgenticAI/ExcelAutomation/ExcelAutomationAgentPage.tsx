"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  Settings2,
  X,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ConnectionStatusPanel from "./components/ConnectionStatusPanel";
import CredentialSetupForm from "./components/CredentialSetupForm";
import ExcelUploadPanel from "./components/ExcelUploadPanel";

const DEFAULT_TEMPLATE_COLUMNS = [
  "Platform", "Topic", "Full Post Copy", "Image Brief",
  "Post Date", "Status", "Image/Video", "Formate",
];

interface GoogleCredential { id: number; google_sheet_id: string; is_active: boolean; created_at?: string; updated_at?: string; }
interface Template { id: number; name: string; columns: string[]; updated_at?: string; }
interface CredentialStatus { status: boolean; sub_institute_id?: number; has_google_credentials: boolean; google_credential: GoogleCredential | null; template: Template | null; }

const ease = [0.22, 1, 0.36, 1];

export default function ExcelAutomationAgentPage() {
  const router = useRouter();
  const [appUrl, setAppUrl] = useState("");
  const [token, setToken] = useState("");
  const [orgType, setOrgType] = useState("");
  const [noSession, setNoSession] = useState(false);
  const [credStatus, setCredStatus] = useState<CredentialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("userData");
    if (!raw) { setNoSession(true); setLoading(false); return; }
    try {
      const p = JSON.parse(raw);
      if (!p.token || !p.APP_URL) { setNoSession(true); setLoading(false); return; }
      setAppUrl(p.APP_URL); setToken(p.token); setOrgType(p.org_type || "");
    } catch { setNoSession(true); setLoading(false); }
  }, []);

  const fetchCredentials = useCallback(async () => {
    if (!appUrl || !token) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${appUrl}/api/excel-agent/credentials?token=${token}`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      setCredStatus(await res.json());
    } catch (err: any) { setError(err.message || "Failed to load configuration."); }
    finally { setLoading(false); }
  }, [appUrl, token]);

  useEffect(() => { if (appUrl && token) fetchCredentials(); }, [appUrl, token, fetchCredentials]);

  const hasCredentials = credStatus?.has_google_credentials ?? false;
  const templateCols = credStatus?.template?.columns ?? DEFAULT_TEMPLATE_COLUMNS;

  // ─── No Session ───
  if (noSession) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1.5">Session Not Found</h2>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">Please login again to access the Excel Automation Agent.</p>
          <Button variant="outline" onClick={() => router.push("/content/AgenticAI/AgentLibrary")} className="gap-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" /> Back to Agent Library
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background rounded-xl w-full h-full">
      <main className="p-4 md:p-6">

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="relative mb-6 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)" }}
        >
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }} />

          {/* Floating glow orbs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-300/15 rounded-full blur-2xl" />

          <div className="relative flex items-center justify-between px-5 md:px-8 py-5 md:py-6 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/content/AgenticAI/AgentLibrary")}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 border border-white/10"
              >
                <ArrowLeft className="w-4.5 h-4.5 text-white/90" />
              </button>

              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/15">
                <FileSpreadsheet className="w-5.5 h-5.5 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg md:text-xl font-bold text-white tracking-[-0.01em]">Excel Automation Agent</h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/12 text-[10px] font-semibold text-white/80 tracking-wider uppercase border border-white/10">
                    <Sparkles className="w-3 h-3" /> AI
                  </span>
                </div>
                <p className="text-[13px] text-blue-100/80 mt-0.5 font-medium">
                  Upload content-plan Excel files to your organization's master Google Sheet
                </p>
              </div>
            </div>

            {hasCredentials && !loading && (
              <motion.button
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease }}
                onClick={() => setShowSetupModal(true)}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/12 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-white text-sm font-medium transition-all duration-300"
              >
                <Settings2 className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                <span className="hidden sm:inline">Update / Reconnect Sheet</span>
                <span className="sm:hidden">Reconnect</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ── Loading ── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1E40AF]" />
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-blue-100/40 animate-pulse -z-10 blur-sm" />
              </div>
              <p className="text-sm text-gray-500 font-medium">Loading agent configuration…</p>
            </motion.div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-1.5">Failed to Load</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-5 leading-relaxed">{error}</p>
              <Button onClick={fetchCredentials} className="gap-2 rounded-xl bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white">
                Try Again
              </Button>
            </motion.div>
          )}

          {/* ── Content ── */}
          {!loading && !error && (
            <motion.div
              key="content"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.1 } } }}
              className="space-y-5"
            >
              {hasCredentials && credStatus && (
                <>
                  <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}>
                    <ConnectionStatusPanel credential={credStatus.google_credential} template={credStatus.template} orgType={orgType} appUrl={appUrl} token={token} />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}>
                    <ExcelUploadPanel appUrl={appUrl} token={token} templateColumns={templateCols} />
                  </motion.div>
                </>
              )}

              {!hasCredentials && (
                <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}>
                  <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-amber-50/80 border border-amber-200/50">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Setup Required</p>
                      <p className="text-xs text-amber-700/70 mt-0.5">Connect your Google Sheet to start uploading Excel files.</p>
                    </div>
                  </div>
                  <CredentialSetupForm appUrl={appUrl} token={token} hasExistingCredentials={false} onSaved={fetchCredentials} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Modal ── */}
        <AnimatePresence>
          {showSetupModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowSetupModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ type: "spring", damping: 28, stiffness: 350 }}
                className="relative w-full max-w-lg"
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1E40AF]/8 flex items-center justify-center">
                        <Settings2 className="w-4.5 h-4.5 text-[#1E40AF]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Update Connection</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">Replace your Google Sheet credentials</p>
                      </div>
                    </div>
                    <button onClick={() => setShowSetupModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto">
                    <CredentialSetupForm appUrl={appUrl} token={token} hasExistingCredentials={true} onSaved={() => { fetchCredentials(); setShowSetupModal(false); }} />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
