"use client";

import { useState, useEffect } from "react";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BulkContentGenerate from "./BulkContentGenerate";
import { useRouter } from 'next/navigation';

interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string;
  org_type?: string;
  user_id?: string;
}

export default function ContentAutomation() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData>({});

  const tabs: { id: "bulk"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "bulk", label: "Bulk Content Generate", icon: FileSpreadsheet },
  ];

  // Fetch session data from localStorage
  // ---------- Load session ----------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type, user_id } =
          JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, org_type, user_id });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background rounded-xl w-full h-full">
      <div className="w-full">
        <main className="p-4 md:p-6">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.push("/content/AgenticAI/AgentLibrary")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>

              <h1 className="text-xl md:text-2xl font-bold text-foreground">Content Automation System</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Generate AI-powered educational content for your organization.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-card border border-border rounded-lg mb-6">
            <div className="flex space-x-0 border-b border-border">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    id="tab-bulk"
                    className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-micro border-b-2 border-blue-400 text-blue-400 bg-primary/5`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-base">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* ================= BULK UPLOAD ================= */}

              <BulkContentGenerate sessionData={sessionData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
