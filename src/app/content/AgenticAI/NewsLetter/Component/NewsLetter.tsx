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
import { ArrowLeft, Plus, History, Eye, Trash2, Sparkles, Calendar, Mail, FileText, Send, BarChart3, Layout, RefreshCw, Users, Target, TrendingUp } from "lucide-react";
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
  agent_id: string;
  emails_sent: number;
  emails_opened: number;
  link_clicks: number;
  open_rate: number;
  click_rate: number;
  created_at: string;
}

const API_BASE_URL = "https://karan-01-hpgooglecalendar.hf.space/api/newsletter";
const DEFAULT_AGENT_ID = "514691af-e7b5-4d66-9754-f0d6addad7a1";

export default function NewsLetter() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("create");
  
  // Generate Form
  const [generateForm, setGenerateForm] = useState({ agentId: DEFAULT_AGENT_ID, topic: "" });
  
  // Template Form
  const [templateForm, setTemplateForm] = useState({
    agentId: DEFAULT_AGENT_ID,
    templateName: "Default Template",
    subject: "",
    body: "",
    ctaText: "Learn More",
    ctaLink: "",
    segment: "general",
  });
  
  // Send Form
  const [sendForm, setSendForm] = useState({
    agentId: DEFAULT_AGENT_ID,
    segment: "general",
    subjectOverride: "",
    sendImmediately: true,
    testMode: false,
    testEmails: "",
  });
  
  // Analytics Form
  const [analyticsForm, setAnalyticsForm] = useState({
    agentId: DEFAULT_AGENT_ID,
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
      const res = await fetch(`${API_BASE_URL}/generate/${DEFAULT_AGENT_ID}`);
      if (res.ok) {
        const data = await res.json();
        setNewsletters(data.data || data || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/template/${DEFAULT_AGENT_ID}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.data || data || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchSendHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/send/${DEFAULT_AGENT_ID}`);
      if (res.ok) {
        const data = await res.json();
        setSendHistory(data.data || data || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/${DEFAULT_AGENT_ID}`);
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
      const res = await fetch(`${API_BASE_URL}/generate/${generateForm.agentId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: generateForm.agentId, topic: generateForm.topic }),
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

  const handleCreateTemplate = async () => {
    if (!templateForm.templateName.trim() || !templateForm.subject.trim()) { setErrorMessage("Template name and subject required"); return; }
    setErrorMessage(""); setSuccessMessage(""); setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/template`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm),
      });
      if (res.ok) { setSuccessMessage("Template created!"); fetchTemplates(); }
      else { setErrorMessage("Failed to create template"); }
    } catch (e: any) { setErrorMessage(e.message); }
    setIsProcessing(false);
  };

  const handleSend = async () => {
    if (!sendForm.segment.trim()) { setErrorMessage("Segment is required"); return; }
    setErrorMessage(""); setSuccessMessage(""); setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/send`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: sendForm.agentId,
          segment: sendForm.segment,
          subject_override: sendForm.subjectOverride,
          send_immediately: sendForm.sendImmediately,
          scheduled_time: null,
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
        body: JSON.stringify({ agent_id: analyticsForm.agentId, ...analyticsForm }),
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

      <Tabs value={activeTab} onValueChange={(t) => { setActiveTab(t); clearMessages(); }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="gap-2"><Plus className="h-4 w-4" /> Create Newsletter</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" /> History ({newsletters.length})</TabsTrigger>
          <TabsTrigger value="view" disabled={!selectedNewsletter} className="gap-2"><Eye className="h-4 w-4" /> View Details</TabsTrigger>
        </TabsList>

        {/* CREATE TAB - With all forms inline */}
        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generate Newsletter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-600" /> Generate Newsletter</CardTitle>
                <CardDescription>Create a new AI-powered newsletter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Agent ID</Label><Input value={generateForm.agentId} onChange={(e) => setGenerateForm({...generateForm, agentId: e.target.value})} /></div>
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
                    <div key={t.id} className="p-2 text-xs border rounded bg-muted/30 flex justify-between">
                      <span className="font-medium">{t.template_name}</span>
                      <span className="text-muted-foreground">{t.segment}</span>
                    </div>
                  ))}
                </div>
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
                  <div><Label className="text-xs">Agent ID</Label><Input value={sendForm.agentId} onChange={(e) => setSendForm({...sendForm, agentId: e.target.value})} /></div>
                  <div><Label className="text-xs">Segment *</Label><Input value={sendForm.segment} onChange={(e) => setSendForm({...sendForm, segment: e.target.value})} /></div>
                </div>
                <div><Label className="text-xs">Subject Override</Label><Input value={sendForm.subjectOverride} onChange={(e) => setSendForm({...sendForm, subjectOverride: e.target.value})} /></div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={sendForm.sendImmediately} onChange={(e) => setSendForm({...sendForm, sendImmediately: e.target.checked})} /> Send Now</label>
                  <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={sendForm.testMode} onChange={(e) => setSendForm({...sendForm, testMode: e.target.checked})} /> Test Mode</label>
                </div>
                {sendForm.testMode && <div><Label className="text-xs">Test Emails</Label><Input placeholder="email1@example.com, email2@example.com" value={sendForm.testEmails} onChange={(e) => setSendForm({...sendForm, testEmails: e.target.value})} /></div>}
                <Button onClick={handleSend} disabled={isProcessing} variant="secondary" className="w-full"><Send className="h-4 w-4 mr-2" /> Send Newsletter</Button>

                {/* Send History */}
                <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
                  {sendHistory.slice(0, 3).map(s => (
                    <div key={s.id} className="p-2 text-xs border rounded bg-muted/30">
                      <span className="font-medium">{s.segment}</span>
                      <Badge variant={s.test_mode ? "outline" : "default"} className="ml-2 text-[10px]">{s.test_mode ? "Test" : "Live"}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-orange-600" /> Analytics</CardTitle><CardDescription>Track performance</CardDescription></div>
                <Button variant="outline" size="sm" onClick={fetchAnalytics}><RefreshCw className="h-3 w-3" /></Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-xs">Sent</Label><Input type="number" value={analyticsForm.emailsSent} onChange={(e) => setAnalyticsForm({...analyticsForm, emailsSent: +e.target.value})} /></div>
                  <div><Label className="text-xs">Opened</Label><Input type="number" value={analyticsForm.emailsOpened} onChange={(e) => setAnalyticsForm({...analyticsForm, emailsOpened: +e.target.value})} /></div>
                  <div><Label className="text-xs">Clicks</Label><Input type="number" value={analyticsForm.linkClicks} onChange={(e) => setAnalyticsForm({...analyticsForm, linkClicks: +e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Open Rate %</Label><Input type="number" value={analyticsForm.openRate} onChange={(e) => setAnalyticsForm({...analyticsForm, openRate: +e.target.value})} /></div>
                  <div><Label className="text-xs">Click Rate %</Label><Input type="number" value={analyticsForm.clickRate} onChange={(e) => setAnalyticsForm({...analyticsForm, clickRate: +e.target.value})} /></div>
                </div>
                <Button onClick={handleCreateAnalytics} disabled={isProcessing} variant="secondary" className="w-full"><BarChart3 className="h-4 w-4 mr-2" /> Record Analytics</Button>

                {/* Analytics Display */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {analyticsData.slice(0, 2).map(a => (
                    <div key={a.id} className="p-2 text-xs border rounded bg-muted/30">
                      <div className="flex justify-between"><span>Open:</span><span className="font-bold text-green-600">{a.open_rate}%</span></div>
                      <div className="flex justify-between"><span>Click:</span><span className="font-bold text-blue-600">{a.click_rate}%</span></div>
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

        {/* HISTORY TAB */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Newsletter History</CardTitle><CardDescription>All generated newsletters</CardDescription></div>
              <Button variant="outline" size="sm" onClick={fetchNewsletters}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
              ) : newsletters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><History className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No newsletters yet</p></div>
              ) : (
                <div className="space-y-3">
                  {newsletters.map((n) => (
                    <div key={n.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1 cursor-pointer" onClick={() => { setSelectedNewsletter(n); setActiveTab("view"); }}>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{n.topic}</h3>
                          {n.segment && <Badge>{n.segment}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{n.content.substring(0, 60)}...</p>
                        <p className="text-xs text-muted-foreground mt-1"><Calendar className="h-3 w-3 inline mr-1" />{formatDate(n.created_at)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedNewsletter(n); setActiveTab("view"); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setNewsletters(prev => prev.filter(x => x.id !== n.id))}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* VIEW TAB */}
        <TabsContent value="view">
          {selectedNewsletter ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setActiveTab("history")}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
                <p className="text-sm text-muted-foreground"><Calendar className="h-3 w-3 inline mr-1" />{formatDate(selectedNewsletter.created_at)}</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{selectedNewsletter.topic}</CardTitle>
                  <CardDescription>Newsletter Details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedNewsletter.segment && <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg"><Label className="text-blue-600">Segment</Label><p className="font-semibold">{selectedNewsletter.segment}</p></div>}
                  <div className="p-4 border rounded-lg bg-muted/30"><pre className="whitespace-pre-wrap text-sm">{selectedNewsletter.content}</pre></div>
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(selectedNewsletter.content)}><FileText className="h-4 w-4 mr-2" /> Copy Content</Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Select a newsletter to view<Button variant="outline" className="mt-4 ml-2" onClick={() => setActiveTab("history")}>Go to History</Button></CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
