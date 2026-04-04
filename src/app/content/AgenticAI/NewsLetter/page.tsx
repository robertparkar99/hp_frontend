"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/Header";

import GeneratePage from "../NewsLetter/Component/Generate";
import TemplatePage from "../NewsLetter/Component/Templates";
import SendPage from "../NewsLetter/Component/Send";
import AnalyticsPage from "../NewsLetter/Component/Analytics";

import { Sparkles, Layout, Send, BarChart3, Mail, Eye, MousePointer, TrendingUp, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Newsletter {
  id: string;
  newsletter_agent_id: string;
  segment: string | null;
  topic: string;
  content: string;
  created_at: string;
}

interface NewsletterTemplate {
  id: string;
  newsletter_agent_id: string;
  template_name: string;
  subject: string;
  body: string;
  cta_text: string;
  cta_link: string;
  segment: string;
  created_at: string;
}

interface NewsletterAnalytics {
  id: string;
  newsletter_agent_id: string;
  emails_sent: number;
  emails_opened: number;
  link_clicks: number;
  open_rate: number;
  click_rate: number;
  created_at: string;
}

type TabName = "generate" | "template" | "send";

const TABS = [
  { id: "generate" as TabName, label: "Generate", icon: <Sparkles className="h-4 w-4" /> },
  { id: "template" as TabName, label: "Template", icon: <Layout className="h-4 w-4" /> },
  { id: "send" as TabName, label: "Send", icon: <Send className="h-4 w-4" /> },
  // { id: "analytics" as TabName, label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

const FIXED_SEGMENT = "general";
const API_BASE_URL = "https://karan-01-hpgooglecalendar.hf.space/api/newsletter";

export default function NewsLetterFlow() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>("generate");
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [template, setTemplate] = useState<NewsletterTemplate | null>(null);
  const [analyticsData, setAnalyticsData] = useState<NewsletterAnalytics[]>([]);

  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarState = localStorage.getItem("sidebarOpen");
      setIsSidebarOpen(sidebarState === "true");
    };
    checkSidebarState();
    window.addEventListener("sidebarStateChange", checkSidebarState);
    fetchAnalytics();
    return () => window.removeEventListener("sidebarStateChange", checkSidebarState);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/11111111-1111-1111-1111-111111111111`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(Array.isArray(data) ? data : [data]);
      }
    } catch (e) { console.error(e); }
  };

  const totalAnalytics = analyticsData.length > 0 ? {
    emails_sent: analyticsData.reduce((sum, a) => sum + (a.emails_sent || 0), 0),
    emails_opened: analyticsData.reduce((sum, a) => sum + (a.emails_opened || 0), 0),
    link_clicks: analyticsData.reduce((sum, a) => sum + (a.link_clicks || 0), 0),
    open_rate: analyticsData.length > 0 ? Math.round(analyticsData.reduce((sum, a) => sum + (a.open_rate || 0), 0) / analyticsData.length) : 0,
    click_rate: analyticsData.length > 0 ? Math.round(analyticsData.reduce((sum, a) => sum + (a.click_rate || 0), 0) / analyticsData.length) : 0,
  } : null;

  const handleGenerateNext = (generatedNewsletter: Newsletter, fromGenerate?: boolean) => {
    setNewsletter(generatedNewsletter);
    setActiveTab("template");
    // Store the flag to indicate came from Generate step
    if (fromGenerate) {
      localStorage.setItem("nl_fromGenerate", "true");
    }
  };

  const handleTemplateNext = (selectedTemplate: NewsletterTemplate, fromTemplate?: boolean) => {
    setTemplate(selectedTemplate);
    if (fromTemplate) {
      localStorage.setItem("nl_fromTemplate", "true");
    }
    localStorage.removeItem("nl_fromGenerate");
    setActiveTab("send");
  };

  const handleSendNext = () => {
    localStorage.removeItem("nl_fromTemplate");
    setActiveTab("generate");
  };

  const handleStartOver = () => {
    setActiveTab("generate");
    setNewsletter(null);
    setTemplate(null);
    localStorage.removeItem("nl_fromGenerate");
  };

  const goToTab = (tab: TabName) => setActiveTab(tab);

  const renderPage = () => {
    switch (activeTab) {
      case "generate":
        return (
          <GeneratePage
            segment={FIXED_SEGMENT}
            onNext={handleGenerateNext}
            onBack={() => goToTab("generate")}
          />
        );
      case "template": {
        const fromGenerate = localStorage.getItem("nl_fromGenerate") === "true";
        return (
          <TemplatePage
            segment={FIXED_SEGMENT}
            newsletter={newsletter || { id: "", segment: FIXED_SEGMENT, topic: "", content: "" }}
            fromGenerate={fromGenerate}
            onNext={handleTemplateNext}
            onBack={() => goToTab("generate")}
          />
        );
      }
      case "send": {
        const fromTemplate = localStorage.getItem("nl_fromTemplate") === "true";
        return newsletter && template ? (
          <SendPage
            segment={FIXED_SEGMENT}
            newsletter={newsletter}
            template={template}
            showFullPage={fromTemplate}
            onNext={handleSendNext}
            onBack={() => goToTab("template")}
          />
        ) : (
          <div className="text-center py-12 text-slate-500">Complete previous steps first</div>
        );
      }

      default:
        return null;
    }
  };

  const currentStepIndex = TABS.findIndex(t => t.id === activeTab);

  return (
    <div>
      <div className="mb-5">
        <Header />
      </div>
      <div className={`transition-all duration-300 bg-background rounded-2xl ${isSidebarOpen ? "ml-76" : "ml-24"} p-4`}>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-4 bg-slate-100 p-1 rounded-lg">
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => goToTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                ? "bg-white shadow text-slate-800"
                : index <= currentStepIndex
                  ? "text-slate-600 hover:bg-slate-200"
                  : "text-slate-400"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* KPI Cards - Always Visible */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">

          {/* SENT */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalAnalytics?.emails_sent || 0}

                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sent
                </p>
              </div>
            </div>

          </div>

          {/* OPENED */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalAnalytics?.emails_opened || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Opened
                </p>

              </div>
            </div>

          </div>

          {/* CLICKS */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <MousePointer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalAnalytics?.link_clicks || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Clicks
                </p>
              </div>
            </div>

          </div>

          {/* OPEN RATE */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {totalAnalytics ? `${totalAnalytics.open_rate}%` : "0%"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Open Rate
                </p>
              </div>
            </div>
          </div>

          {/* CLICK RATE */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <MousePointerClick className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {totalAnalytics ? `${totalAnalytics.click_rate}%` : "0%"}
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                  Click Rate
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-slate-200">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
