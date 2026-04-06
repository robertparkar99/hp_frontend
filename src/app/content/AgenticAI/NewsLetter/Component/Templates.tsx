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
import { ArrowLeft, ArrowRight, Layout, CheckCircle2, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface NewsletterTemplate {
  id: string;
 newsletter_agent_id : string;
  template_name: string;
  subject: string;
  body: string;
  cta_text: string;
  cta_link: string;
  segment: string;
  created_at: string;
}

interface Newsletter {
  id: string;
  segment: string | null;
  topic: string;
  content: string;
}

interface TemplatePageProps {
  segment: string;
  newsletter: Newsletter;
  fromGenerate?: boolean;
  onNext: (template: NewsletterTemplate, fromTemplate?: boolean) => void;
  onBack: () => void;
}

const API_BASE_URL = "https://karan-01-hpgooglecalendar.hf.space/api/newsletter";
const newsletter_agent_id = "11111111-1111-1111-1111-111111111111";

export default function TemplatePage({ segment, newsletter, fromGenerate = false, onNext, onBack }: TemplatePageProps) {
  const router = useRouter();
  const [templateName, setTemplateName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(newsletter.content);
  const [ctaText, setCtaText] = useState("Learn More");
  const [ctaLink, setCtaLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<NewsletterTemplate | null>(null);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/template/${newsletter_agent_id}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.data || data || []);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

const handleCreateTemplate = async () => {
  if (!templateName.trim() || !subject.trim()) {
    setErrorMessage("Template name and subject are required");
    return;
  }

  if (!newsletter_agent_id) {
    setErrorMessage("Newsletter Agent ID missing");
    return;
  }

  setErrorMessage("");
  setSuccessMessage("");
  setIsProcessing(true);

  try {
    // ✅ Step 1: Create clean payload
    const payload = {
      newsletter_agent_id: String(newsletter_agent_id), // 🔥 force string
      template_name: templateName.trim(),
      subject: subject.trim(),
      body: body || "",
      cta_text: ctaText || "",
      cta_link: ctaLink || "",
      segment: segment || "",
    };

    // ✅ Step 2: Debug log (VERY IMPORTANT)
    console.log("FINAL PAYLOAD:", payload);

    // ✅ Step 3: API call
    const res = await fetch(`${API_BASE_URL}/template`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // ✅ Step 4: Read response always
    const data = await res.json();
    console.log("API RESPONSE:", data);

    if (res.ok) {
      setSuccessMessage("Template created!");
      fetchTemplates();

      if (data?.data) {
        setSelectedTemplate(data.data);
      }
    } else {
      // 🔥 show backend error properly
      setErrorMessage(
        data?.detail?.[0]?.msg ||
        data?.message ||
        "Failed to create template"
      );
    }

  } catch (e: any) {
    setErrorMessage(e.message);
  }

  setIsProcessing(false);
};
  const handleSelectTemplate = (template: NewsletterTemplate) => {
    setSelectedTemplate(template);
    setTemplateName(template.template_name);
    setSubject(template.subject);
    setBody(template.body);
    setCtaText(template.cta_text);
    setCtaLink(template.cta_link);
    setSuccessMessage("Template loaded!");
    console.log("Selected Template ID:", template.id);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      onNext(selectedTemplate, true);
    } else if (templateName.trim() && subject.trim()) {
      const tempTemplate: NewsletterTemplate = {
        id: "temp-" + Date.now(),
        newsletter_agent_id: newsletter_agent_id,
        template_name: templateName,
        subject: subject,
        body: body,
        cta_text: ctaText,
        cta_link: ctaLink,
        segment: segment,
        created_at: new Date().toISOString(),
      };
      onNext(tempTemplate, true);
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch { return d; }
  };

  return (
    <div className="mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layout className="h-5 w-5" /> Create Template
          </h1>
          <p className="text-slate-500 text-sm">Build a reusable template</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 p-3 bg-slate-50 rounded-lg flex items-center gap-4 text-sm">
        <span className="text-green-600 font-medium">Step 2 of 3</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600">Segment: <span className="font-medium">{segment}</span></span>
      </div>

      <div className={`grid ${fromGenerate ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}>
        {fromGenerate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Template Details</CardTitle>
              <CardDescription>Configure your newsletter template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Template Name *</Label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Weekly Newsletter"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Segment</Label>
                  <Input value={segment} disabled className="mt-1 bg-slate-50" />
                </div>
              </div>
              <div>
                <Label className="text-sm">Subject *</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Your Weekly Update"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Body</Label>
                <Textarea
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">CTA Text</Label>
                  <Input
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">CTA Link</Label>
                  <Input
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateTemplate}
                disabled={isProcessing || !templateName.trim() || !subject.trim()}
                className="w-full"
              >
                {isProcessing ? "Creating..." : "Create Template"}
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

        {/* Existing Templates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Existing Templates</CardTitle>
              <CardDescription>Select a template to edit</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchTemplates}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {templates.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No templates yet</p>
              ) : (
                templates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplate?.id === t.id
                        ? "border-slate-400 bg-slate-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{t.template_name}</h3>
                      {selectedTemplate?.id === t.id && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 truncate">{t.subject}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px]">{t.segment}</Badge>
                      <span className="text-[10px] text-slate-400">{formatDate(t.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {fromGenerate && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base font-medium">Template Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-slate-50">
              <div className="mb-2 pb-2 border-b border-slate-200">
                <span className="font-medium">Subject:</span> {subject || "(Not set)"}
              </div>
              <div className="mb-2 pb-2 border-b border-slate-200">
                <span className="font-medium">CTA:</span> {ctaText} {ctaLink && `(${ctaLink})`}
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-600">{body || "(No content)"}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedTemplate && (!templateName.trim() || !subject.trim())}
        >
          Continue <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
