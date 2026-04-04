"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, History, Eye, Trash2, Sparkles, Calendar, Mail, FileText, Send, BarChart3, Layout, RefreshCw, Users, Target, TrendingUp, MousePointer, MousePointerClick } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Newsletter {
  id: string;
  agent_id: string;
  segment: string | null;
  topic: string;
  content: string;
  created_at: string;
}

interface NewsletterTemplate {
  id: string;
  agent_id: string;
  template_name: string;
  subject: string;
  body: string;
  cta_text: string;
  cta_link: string;
  segment: string;
  created_at: string;
}

interface SendRecord {
  id: string;
  agent_id: string;
  segment: string;
  subject_override: string | null;
  send_immediately: boolean;
  scheduled_time: string | null;
  test_mode: boolean;
  status: string;
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

const API_BASE_URL = "https://karan-01-hpgooglecalendar.hf.space/api/newsletter";
const DEFAULT_AGENT_ID = "11111111-1111-1111-1111-111111111111";

export default function NewsLetter() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("before");
  
  // Generate Form
  const [generateForm, setGenerateForm] = useState({ newsletter_agent_id: DEFAULT_AGENT_ID, topic: "" });
  
  // Template Form
  const [templateForm, setTemplateForm] = useState({
    newsletter_agent_id: DEFAULT_AGENT_ID,
    templateName: "Default Template",
    subject: "",
    body: "",
    ctaText: "Learn More",
    ctaLink: "",
    segment: "general",
  });
  
  // Send Form
  const [sendForm, setSendForm] = useState({
    newsletter_agent_id: DEFAULT_AGENT_ID,
    segment: "general",
    subjectOverride: "",
    sendImmediately: true,
    scheduledTime: "",
    testMode: false,
    testEmails: "",
  });
  
  // Analytics Form
  const [analyticsForm, setAnalyticsForm] = useState({
    newsletter_agent_id: DEFAULT_AGENT_ID,
    emailsSent: 0,
    emailsOpened: 0,
    linkClicks: 0,
    openRate: 0,
    clickRate: 0,
  });

  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [sendHistory, setSendHistory] = useState<SendRecord[]>([]);
  const [analyticsData, setAnalyticsData] = useState<NewsletterAnalytics[]>([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NewsletterTemplate | null>(null);
  const [selectedSendRecord, setSelectedSendRecord] = useState<SendRecord | null>(null);
  const [selectedAnalytics, setSelectedAnalytics] = useState<NewsletterAnalytics | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchNewsletters(), fetchTemplates(), fetchSendHistory(), fetchAnalytics()]);
    setIsLoading(false);
  };

  const fetchNewsletters = async () => {
    try {
      const newsletter_agent_id = generateForm.newsletter_agent_id || DEFAULT_AGENT_ID;
      const res = await fetch(`${API_BASE_URL}/generate/${newsletter_agent_id}`);
      if (res.ok) {
        const data = await res.json();
        setNewsletters(data.data || data || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchTemplates = async () => {
    try {
      const newsletter_agent_id = templateForm.newsletter_agent_id || DEFAULT_AGENT_ID;
      const res = await fetch(`${API_BASE_URL}/template/${newsletter_agent_id}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.data || data || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchSendHistory = async () => {
    try {
      const newsletter_agent_id = sendForm.newsletter_agent_id || DEFAULT_AGENT_ID;
      const res = await fetch(`${API_BASE_URL}/send/${newsletter_agent_id}`);
      if (res.ok) {
        const data = await res.json();
        setSendHistory(data.data || data || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAnalytics = async () => {
    try {
      const newsletter_agent_id = analyticsForm.newsletter_agent_id || DEFAULT_AGENT_ID;
      const res = await fetch(`${API_BASE_URL}/analytics/${newsletter_agent_id}`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data.data || data || []);
      }
    } catch (e) { console.error(e); }
  };

  // Handlers
  const handleGenerate = async () => {
    if (!generateForm.topic.trim()) { setErrorMessage("Topic is required"); return; }
    setErrorMessage(""); setSuccessMessage(""); setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletter_agent_id: generateForm.newsletter_agent_id, topic: generateForm.topic }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMessage("Newsletter generated!");
        fetchNewsletters();
        if (data.data) { setSelectedNewsletter(data.data); setActiveTab("history"); }
        setGenerateForm({ ...generateForm, topic: "" });
      } else { setErrorMessage("Failed to generate"); }
    } catch (e: any) { setErrorMessage(e.message); }
    setIsProcessing(false);
  };
  const totalAnalytics = analyticsData.length > 0 ? {
    emails_sent: analyticsData.reduce((sum, a) => sum + (a.emails_sent || 0), 0),
    emails_opened: analyticsData.reduce((sum, a) => sum + (a.emails_opened || 0), 0),
    link_clicks: analyticsData.reduce((sum, a) => sum + (a.link_clicks || 0), 0),
    open_rate: analyticsData.length > 0 ? Math.round(analyticsData.reduce((sum, a) => sum + (a.open_rate || 0), 0) / analyticsData.length) : 0,
    click_rate: analyticsData.length > 0 ? Math.round(analyticsData.reduce((sum, a) => sum + (a.click_rate || 0), 0) / analyticsData.length) : 0,
  } : null;

  const handleCreateTemplate = async () => {
    if (!templateForm.templateName.trim() || !templateForm.subject.trim()) { setErrorMessage("Template name and subject required"); return; }
    setErrorMessage(""); setSuccessMessage(""); setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/template`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletter_agent_id: templateForm.newsletter_agent_id,
          template_name: templateForm.templateName,
          subject: templateForm.subject,
          body: templateForm.body,
          cta_text: templateForm.ctaText,
          cta_link: templateForm.ctaLink,
          segment: templateForm.segment,
        }),
      });
      if (res.ok) { setSuccessMessage("Template created!"); fetchTemplates(); }
      else { setErrorMessage("Failed to create template"); }
    } catch (e: any) { setErrorMessage(e.message); }
    setIsProcessing(false);
  };

  const handleSend = async () => {
    if (!sendForm.segment.trim()) { setErrorMessage("Segment is required"); return; }
    if (!sendForm.sendImmediately && !sendForm.scheduledTime) { setErrorMessage("Please select a scheduled time or enable send immediately"); return; }
    setErrorMessage(""); setSuccessMessage(""); setIsProcessing(true);
    try {
      // Convert datetime-local to ISO format
      let scheduledTimeISO = null;
      if (!sendForm.sendImmediately && sendForm.scheduledTime) {
        scheduledTimeISO = new Date(sendForm.scheduledTime).toISOString();
      }

      const res = await fetch(`${API_BASE_URL}/send`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletter_agent_id: sendForm.newsletter_agent_id,
          segment: sendForm.segment,
          subject_override: sendForm.subjectOverride,
          send_immediately: sendForm.sendImmediately,
          scheduled_time: scheduledTimeISO,
          test_mode: sendForm.testMode,
          test_emails: sendForm.testMode ? sendForm.testEmails.split(",").map(e => e.trim()) : [],
        }),
      });
      if (res.ok) { setSuccessMessage("Newsletter sent!"); fetchSendHistory(); }
      else { setErrorMessage("Failed to send"); }
    } catch (e: any) { setErrorMessage(e.message); }
    setIsProcessing(false);
  };

  const handleCreateAnalytics = async () => {
    setErrorMessage(""); setSuccessMessage(""); setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/analytics`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletter_agent_id: analyticsForm.newsletter_agent_id,
          emails_sent: analyticsForm.emailsSent,
          emails_opened: analyticsForm.emailsOpened,
          link_clicks: analyticsForm.linkClicks,
          open_rate: analyticsForm.openRate,
          click_rate: analyticsForm.clickRate,
        }),
      });
      if (res.ok) { setSuccessMessage("Analytics recorded!"); fetchAnalytics(); }
      else { setErrorMessage("Failed to record analytics"); }
    } catch (e: any) { setErrorMessage(e.message); }
    setIsProcessing(false);
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return d; } };

  const clearMessages = () => { setErrorMessage(""); setSuccessMessage(""); };

  return (
    <div className="max-w-6xl space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/content/AgenticAI/AgentLibrary")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Mail className="h-8 w-8" /> AI Newsletter Generator
          </h1>
          <p className="text-muted-foreground">Generate, manage and track your newsletters</p>
        </div>
      </div>

      {/* ✅ GLOBAL KPI CARDS */}
      <div className="grid grid-cols-5 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <Mail className="text-blue-600" />
            <div>
              <p className="font-bold">{totalAnalytics?.emails_sent ?? 0}</p>
              <p className="text-xs text-slate-500">Sent</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <Eye className="text-green-600" />
            <div>
              <p className="font-bold">{totalAnalytics?.emails_opened ?? 0}</p>
              <p className="text-xs text-slate-500">Opened</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <MousePointer className="text-purple-600" />
            <div>
              <p className="font-bold">{totalAnalytics?.link_clicks ?? 0}</p>
              <p className="text-xs text-slate-500">Clicks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <TrendingUp className="text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-600">
                {totalAnalytics?.open_rate ?? 0}%
              </p>
              <p className="text-xs text-slate-500">Open Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <MousePointerClick className="text-orange-600" />
            <div>
              <p className="font-bold text-orange-600">
                {totalAnalytics?.click_rate ?? 0}%
              </p>
              <p className="text-xs text-slate-500">Click Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(t) => { setActiveTab(t); clearMessages(); }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="before" className="gap-2"><Plus className="h-4 w-4" /> Before</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
        </TabsList>

        {/* BEFORE TAB - With all forms inline */}
        <TabsContent value="before">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generate Newsletter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-600" /> Generate Newsletter</CardTitle>
                <CardDescription>Create a new AI-powered newsletter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Agent ID</Label><Input value={generateForm.newsletter_agent_id} onChange={(e) => setGenerateForm({ ...generateForm, newsletter_agent_id: e.target.value })} /></div>
                <div><Label>Topic *</Label><Input placeholder="e.g., Email Marketing Trends 2026" value={generateForm.topic} onChange={(e) => setGenerateForm({...generateForm, topic: e.target.value})} /></div>
                <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
                  {isProcessing ? <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Newsletter</>}
                </Button>
              </CardContent>
            </Card>

            {/* Create Template */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5 text-purple-600" /> Create Template</CardTitle><CardDescription>Build a reusable template</CardDescription></div>
                <Button variant="outline" size="sm" onClick={fetchTemplates}><RefreshCw className="h-3 w-3" /></Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Template Name</Label><Input value={templateForm.templateName} onChange={(e) => setTemplateForm({...templateForm, templateName: e.target.value})} /></div>
                  <div><Label className="text-xs">Segment</Label><Input value={templateForm.segment} onChange={(e) => setTemplateForm({...templateForm, segment: e.target.value})} /></div>
                </div>
                <div><Label className="text-xs">Subject</Label><Input value={templateForm.subject} onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})} /></div>
                <div><Label className="text-xs">Body</Label><Textarea rows={2} value={templateForm.body} onChange={(e) => setTemplateForm({...templateForm, body: e.target.value})} /></div>
                <Button onClick={handleCreateTemplate} disabled={isProcessing} variant="secondary" className="w-full"><Layout className="h-4 w-4 mr-2" /> Create Template</Button>
                
                {/* Templates List */}
                <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
                  {templates.map(t => (
                    <div
                      key={t.id}
                      className="p-2 text-xs border rounded bg-muted/30 flex justify-between cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedTemplate(t)}
                    >
                      <span className="font-medium">{t.template_name}</span>
                      <span className="text-muted-foreground">{t.segment}</span>
                    </div>
                  ))}
                </div>

                {/* Selected Template Details */}
                {selectedTemplate && (
                  <div className="mt-4 p-3 border rounded-lg bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm">Template Details</span>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>Close</Button>
                    </div>
                    <div className="text-xs space-y-1">
                      <p><span className="font-medium">Name:</span> {selectedTemplate.template_name}</p>
                      <p><span className="font-medium">Subject:</span> {selectedTemplate.subject}</p>
                      <p><span className="font-medium">Body:</span> {selectedTemplate.body}</p>
                      <p><span className="font-medium">CTA Text:</span> {selectedTemplate.cta_text}</p>
                      <p><span className="font-medium">CTA Link:</span> {selectedTemplate.cta_link}</p>
                      <p><span className="font-medium">Segment:</span> {selectedTemplate.segment}</p>
                      <p><span className="font-medium">Created:</span> {formatDate(selectedTemplate.created_at)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send Newsletter */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-green-600" /> Send Newsletter</CardTitle><CardDescription>Send to your audience</CardDescription></div>
                <Button variant="outline" size="sm" onClick={fetchSendHistory}><RefreshCw className="h-3 w-3" /></Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Agent ID</Label><Input value={sendForm.newsletter_agent_id} onChange={(e) => setSendForm({ ...sendForm, newsletter_agent_id: e.target.value })} /></div>
                  <div><Label className="text-xs">Segment *</Label><Input value={sendForm.segment} onChange={(e) => setSendForm({...sendForm, segment: e.target.value})} /></div>
                </div>
                <div><Label className="text-xs">Subject Override</Label><Input value={sendForm.subjectOverride} onChange={(e) => setSendForm({...sendForm, subjectOverride: e.target.value})} /></div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={sendForm.sendImmediately}
                      onChange={(e) => setSendForm({ ...sendForm, sendImmediately: e.target.checked })}
                    />
                    Send Now
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={sendForm.testMode}
                      onChange={(e) => setSendForm({ ...sendForm, testMode: e.target.checked })}
                    />
                    Test Mode
                  </label>
                </div>
                {!sendForm.sendImmediately && (
                  <div>
                    <Label className="text-xs">Scheduled Time</Label>
                    <Input
                      type="datetime-local"
                      value={sendForm.scheduledTime}
                      onChange={(e) => setSendForm({ ...sendForm, scheduledTime: e.target.value })}
                    />
                  </div>
                )}
                {sendForm.testMode && <div><Label className="text-xs">Test Emails</Label><Input placeholder="email1@example.com, email2@example.com" value={sendForm.testEmails} onChange={(e) => setSendForm({...sendForm, testEmails: e.target.value})} /></div>}
                <Button onClick={handleSend} disabled={isProcessing} variant="secondary" className="w-full"><Send className="h-4 w-4 mr-2" /> Send Newsletter</Button>

                {/* Send History */}
                <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
                  {sendHistory.slice(0, 3).map(s => (
                    <div
                      key={s.id}
                      className="p-2 text-xs border rounded bg-muted/30 cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedSendRecord(s)}
                    >
                      <span className="font-medium">{s.segment}</span>
                      <Badge variant={s.test_mode ? "outline" : "default"} className="ml-2 text-[10px]">{s.test_mode ? "Test" : "Live"}</Badge>
                    </div>
                  ))}
                </div>

                {/* Selected Send Record Details */}
                {selectedSendRecord && (
                  <div className="mt-4 p-3 border rounded-lg bg-green-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm">Send Record Details</span>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedSendRecord(null)}>Close</Button>
                    </div>
                    <div className="text-xs space-y-1">
                      <p><span className="font-medium">Agent ID:</span> {selectedSendRecord.agent_id}</p>
                      <p><span className="font-medium">Segment:</span> {selectedSendRecord.segment}</p>
                      <p><span className="font-medium">Subject Override:</span> {selectedSendRecord.subject_override || "N/A"}</p>
                      <p><span className="font-medium">Send Immediately:</span> {selectedSendRecord.send_immediately ? "Yes" : "No"}</p>
                      <p><span className="font-medium">Scheduled Time:</span> {selectedSendRecord.scheduled_time ? formatDate(selectedSendRecord.scheduled_time) : "N/A"}</p>
                      <p><span className="font-medium">Test Mode:</span> {selectedSendRecord.test_mode ? "Yes" : "No"}</p>
                      <p><span className="font-medium">Status:</span> {selectedSendRecord.status}</p>
                      <p><span className="font-medium">Created:</span> {formatDate(selectedSendRecord.created_at)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analytics - Manual Entry */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-orange-600" /> Analytics</CardTitle><CardDescription>Track newsletter performance</CardDescription></div>
                <Button variant="outline" size="sm" onClick={fetchAnalytics}><RefreshCw className="h-3 w-3" /></Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Emails Sent</Label><Input type="number" value={analyticsForm.emailsSent} onChange={(e) => setAnalyticsForm({...analyticsForm, emailsSent: parseInt(e.target.value) || 0})} /></div>
                  <div><Label className="text-xs">Emails Opened</Label><Input type="number" value={analyticsForm.emailsOpened} onChange={(e) => setAnalyticsForm({...analyticsForm, emailsOpened: parseInt(e.target.value) || 0})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Link Clicks</Label><Input type="number" value={analyticsForm.linkClicks} onChange={(e) => setAnalyticsForm({...analyticsForm, linkClicks: parseInt(e.target.value) || 0})} /></div>
                  <div><Label className="text-xs">Open Rate %</Label><Input type="number" value={analyticsForm.openRate} onChange={(e) => setAnalyticsForm({...analyticsForm, openRate: parseInt(e.target.value) || 0})} /></div>
                </div>
                <div><Label className="text-xs">Click Rate %</Label><Input type="number" value={analyticsForm.clickRate} onChange={(e) => setAnalyticsForm({...analyticsForm, clickRate: parseInt(e.target.value) || 0})} /></div>
                <Button onClick={handleCreateAnalytics} disabled={isProcessing} variant="secondary" className="w-full"><BarChart3 className="h-4 w-4 mr-2" /> Record Analytics</Button>

                {/* Analytics Data List */}
                <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
                  {analyticsData.slice(0, 3).map(a => (
                    <div key={a.id} className="p-2 text-xs border rounded bg-muted/30 flex justify-between cursor-pointer hover:bg-muted/50">
                      <span>Sent: {a.emails_sent} | Open: {a.emails_opened}</span>
                      <span className="text-muted-foreground">{formatDate(a.created_at)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Messages */}
          {errorMessage && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{errorMessage}</AlertDescription></Alert>}
          {successMessage && <Alert className="mt-4"><Sparkles className="h-4 w-4" /><AlertTitle>Success</AlertTitle><AlertDescription>{successMessage}</AlertDescription></Alert>}
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>All Analytics Data</CardTitle><CardDescription>Complete newsletter performance history</CardDescription></div>
              <Button variant="outline" size="sm" onClick={fetchAnalytics}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
              ) : analyticsData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No analytics data yet</p></div>
              ) : (
                <div className="space-y-4">
                  {analyticsData.map((a, index) => (
                    <div key={a.id || index} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="grid grid-cols-5 gap-4 mb-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{a.emails_sent}</p>
                          <p className="text-xs text-slate-500">Sent</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{a.emails_opened}</p>
                          <p className="text-xs text-slate-500">Opened</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{a.link_clicks}</p>
                          <p className="text-xs text-slate-500">Clicks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-emerald-600">{a.open_rate}%</p>
                          <p className="text-xs text-slate-500">Open Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-orange-600">{a.click_rate}%</p>
                          <p className="text-xs text-slate-500">Click Rate</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-right"><Calendar className="h-3 w-3 inline mr-1" />{formatDate(a.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
