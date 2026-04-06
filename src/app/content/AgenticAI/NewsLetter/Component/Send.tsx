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
import { ArrowLeft, ArrowRight, Send, CheckCircle2, FileText, History } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface SendRecord {
  id: string;
  newsletter_agent_id: string;
  segment: string;
  subject_override: string | null;
  send_immediately: boolean;
  scheduled_time: string | null;
  test_mode: boolean;
  status: string;
  created_at: string;
}

interface NewsletterTemplate {
  id: string;
  template_name: string;
  subject: string;
  body: string;
  cta_text: string;
  cta_link: string;
  segment: string;
  template_id?: string;
}

interface Newsletter {
  id: string;
  segment: string | null;
  topic: string;
  content: string;
}

interface SendPageProps {
  segment: string;
  newsletter: Newsletter;
  template: NewsletterTemplate;
  showFullPage?: boolean;
  onNext: () => void;
  onBack: () => void;
  templateId?: string;
}
interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string;
  org_type?: string;
  user_id?: string;
}

const API_BASE_URL = "https://karan-01-hpgooglecalendar.hf.space/api/newsletter";
// const LOCAL_API_URL = "http://127.0.0.1:8000/api/newsletter";
const newsletter_agent_id = "11111111-1111-1111-1111-111111111111";

export default function SendPage({ segment, newsletter, template, showFullPage = false, onNext, onBack, templateId }: SendPageProps) {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templateId || template?.id || "");
  const [sendImmediately, setSendImmediately] = useState(true);
  const [scheduledTime, setScheduledTime] = useState("");
  const [subjectOverride, setSubjectOverride] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [testEmails, setTestEmails] = useState("");
  const [emails, setEmails] = useState(""); // ✅ NEW
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [sendHistory, setSendHistory] = useState<SendRecord[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<SendRecord | null>(null);
  const [sessionData, setSessionData] = useState<SessionData>({});

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

  const fetchSendHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/send/${newsletter_agent_id}`);
      if (res.ok) {
        const data = await res.json();
        setSendHistory(data.data || data || []);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchSendHistory();
    const id = selectedTemplateId || template?.id || templateId || "";
    console.log("Selected Template ID:", id);
  }, [selectedTemplateId, template?.id, templateId]);

  const handleSend = async () => {
    if (!segment) {
      setErrorMessage("Segment is required");
      return;
    }

    if (!sendImmediately && !scheduledTime) {
      setErrorMessage("Please select a scheduled time");
      return;
    }

    if (testMode && !testEmails.trim()) {
      setErrorMessage("Please enter test emails");
      return;
    }

    // ✅ 🔥 ADD HERE (real emails validation)
    if (!testMode && !emails.trim()) {
      setErrorMessage("Please enter emails");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsProcessing(true);

    try {
      let scheduledTimeISO = null;

      if (!sendImmediately && scheduledTime) {
        scheduledTimeISO = new Date(scheduledTime).toISOString();
      }

      const parsedTestEmails = testEmails
        .split(",")
        .map(e => e.trim())
        .filter(e => e !== "");

      const parsedEmails = emails
        .split(",")
        .map(e => e.trim())
        .filter(e => e !== "");

      const payload = {
        newsletter_agent_id: newsletter_agent_id,
        segment: segment,
        subject_override: subjectOverride || null,
        send_immediately: sendImmediately,
        scheduled_time: scheduledTimeISO,
        test_mode: testMode,
        template_id: selectedTemplateId || template?.id || templateId || "",
        body: template?.body || "",
        cta_text: template?.cta_text || "",
        cta_link: template?.cta_link || "",
        emails: testMode ? [] : parsedEmails,
        test_emails: testMode ? parsedTestEmails : [],
      };

      console.log("SEND PAYLOAD:", payload);

      // // ✅ 1st API (LOCAL API - send email)
      const localRes = await fetch(`${API_BASE_URL}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const localData = await localRes.json();
      console.log("LOCAL API RESPONSE:", localData);

      if (!localRes.ok) {
        setErrorMessage(
          localData?.detail?.[0]?.msg ||
          localData?.message ||
          "Failed to send via local API"
        );
        setIsProcessing(false);
        return;
      }

      // ✅ 2nd API (REMOTE API - store data)
      const res = await fetch(`${sessionData.url}/api/newsletter/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("REMOTE API RESPONSE :", res);

      const data = await res.json();
      console.log("REMOTE API RESPONSE DATA:", data);

      // ✅ SUCCESS CONDITION (local API must succeed, remote API optional)
      if (data.ok) {
        setSuccessMessage(testMode ? "Test sent!" : "Newsletter sent!");
        fetchSendHistory();
      } else {
        setErrorMessage(
          data?.detail?.[0]?.msg ||
          data?.message ||
          "Failed to send"
        );
      }

    } catch (e: any) {
      setErrorMessage(e.message);
    }

    setIsProcessing(false);
  };
  const handleSelectHistory = (record: SendRecord) => {
    setSelectedHistory(record);
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return d; }
  };

  return (
    <div className=" mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Send className="h-5 w-5" /> Send Newsletter
          </h1>
          <p className="text-slate-500 text-sm">Send to your audience</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 p-3 bg-slate-50 rounded-lg flex items-center gap-4 text-sm">
        <span className="text-green-600 font-medium">Step 3 of 3</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600">Segment: <span className="font-medium">{segment}</span></span>
      </div>

      <div className={`grid ${showFullPage ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}>
        {showFullPage && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Send Options</CardTitle>
              <CardDescription>Configure how to send</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Template ID</Label>
                <Input value={selectedTemplateId || template?.id || templateId || ""} disabled className="mt-1 bg-slate-50" />
              </div>
              <div>
                <Label className="text-sm">Segment</Label>
                <Input value={segment} disabled className="mt-1 bg-slate-50" />
              </div>
              <div>
                <Label className="text-sm">Subject (Optional)</Label>
                <Input
                  value={subjectOverride}
                  onChange={(e) => setSubjectOverride(e.target.value)}
                  placeholder={template.subject}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={sendImmediately}
                    onChange={(e) => {
                      setSendImmediately(e.target.checked);
                      if (e.target.checked) setScheduledTime("");
                    }}
                  />
                  Send Now
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={testMode}
                    onChange={(e) => setTestMode(e.target.checked)}
                  />
                  Test Mode
                </label>
              </div>

              {!sendImmediately && (
                <div>
                  <Label className="text-sm">Schedule</Label>
                  <Input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              {testMode ? (
                <div>
                  <Label className="text-sm">Test Emails</Label>
                  <Input
                    placeholder="test1@gmail.com, test2@gmail.com"
                    value={testEmails}
                    onChange={(e) => setTestEmails(e.target.value)}
                    className="mt-1"
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-sm">Emails</Label>
                  <Input
                    placeholder="user1@gmail.com, user2@gmail.com"
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <Button
                onClick={handleSend}
                disabled={isProcessing || (!sendImmediately && !scheduledTime)}
                className="w-full"
              >
                {isProcessing ? "Sending..." : testMode ? "Send Test" : "Send Newsletter"}
              </Button>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Send History</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={fetchSendHistory}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sendHistory.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No history yet</p>
              ) : (
                sendHistory.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectHistory(s)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedHistory?.id === s.id
                        ? "border-slate-400 bg-slate-50"
                        : "border-slate-200 hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{s.segment}</h3>
                      <Badge variant={s.test_mode ? "outline" : "default"} className="text-[10px]">
                        {s.test_mode ? "Test" : "Live"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {s.send_immediately ? "Sent immediately" : formatDate(s.scheduled_time || "")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {(showFullPage || selectedHistory) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base font-medium">Newsletter Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label className="text-slate-500">Topic</Label>
                <p className="font-medium">{selectedHistory?.segment || newsletter.topic}</p>
              </div>
              <div>
                <Label className="text-slate-500">Template</Label>
                <div>
                  <Label className="text-slate-500">Template</Label>
                  <p className="font-medium">
                    {template?.template_name || "-"}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-slate-500">Subject</Label>
                <p className="font-medium">{selectedHistory?.subject_override || subjectOverride || template.subject}</p>
              </div>
              <div>
                <Label className="text-slate-500">Segment</Label>
                <p className="font-medium">{segment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        {/* <Button onClick={onNext}>
          View Analytics <ArrowRight className="h-4 w-4 ml-2" />
        </Button> */}
      </div>
    </div>
  );
}
