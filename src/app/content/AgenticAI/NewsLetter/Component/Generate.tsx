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
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2, FileText, History } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Newsletter {
  id: string;
  newsletter_agent_id: string;
  segment: string | null;
  topic: string;
  content: string;
  created_at: string;
}

interface GeneratePageProps {
  segment: string;
  onNext: (newsletter: Newsletter, fromGenerate?: boolean) => void;
  onBack: () => void;
}

const API_BASE_URL = "https://karan-01-hpgooglecalendar.hf.space/api/newsletter";
const newsletter_agent_id = "11111111-1111-1111-1111-111111111111";

export default function GeneratePage({ segment, onNext, onBack }: GeneratePageProps) {
  const router = useRouter();
  const [agentId, setAgentId] = useState(newsletter_agent_id);
  const [topic, setTopic] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [generatedNewsletter, setGeneratedNewsletter] = useState<Newsletter | null>(null);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/generate/${agentId}`);
      if (res.ok) {
        const data = await res.json();
        setNewsletters(data.data || data || []);
      }
    } catch (e) { console.error(e); }
  };

  const handleGenerate = async () => {
    if (!agentId.trim()) { setErrorMessage("Please enter an Agent ID"); return; }
    if (!topic.trim()) { setErrorMessage("Please enter a topic"); return; }
    setErrorMessage(""); setSuccessMessage(""); setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agentId, topic: topic }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMessage("Newsletter generated!");
        if (data.data) {
          setGeneratedNewsletter(data.data);
          fetchNewsletters();
        }
        setTopic("");
      } else {
        setErrorMessage("Failed to generate");
      }
    } catch (e: any) { setErrorMessage(e.message); }
    setIsProcessing(false);
  };

  const handleSelectNewsletter = (newsletter: Newsletter) => {
    setGeneratedNewsletter(newsletter);
    setSuccessMessage("Newsletter selected!");
  };

  const handleContinue = () => {
    if (generatedNewsletter) {
      onNext(generatedNewsletter, true);
    }
  };

  const handleBackWithGenerate = () => {
    if (generatedNewsletter) {
      onNext(generatedNewsletter, false);
    } else {
      onBack();
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
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
            <Sparkles className="h-5 w-5" /> Generate Newsletter
          </h1>
          <p className="text-slate-500 text-sm">Create AI-powered newsletter content</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 p-3 bg-slate-50 rounded-lg flex items-center gap-4 text-sm">
        <span className="text-green-600 font-medium">Step 1 of 3</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600">Segment: <span className="font-medium">{segment}</span></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generate Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Create New Newsletter</CardTitle>
            <CardDescription>Enter a topic for AI to generate content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Agent ID *</Label>
              <Input
                placeholder="Enter Agent ID"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Topic *</Label>
              <Input
                placeholder="e.g., Email Marketing Trends"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isProcessing || !agentId.trim() || !topic.trim()}
              className="w-full"
            >
              {isProcessing ? "Generating..." : "Generate Newsletter"}
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

        {/* Previous Newsletters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Previous Newsletters</CardTitle>
              <CardDescription>Select a saved newsletter</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchNewsletters}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {newsletters.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No newsletters yet</p>
              ) : (
                newsletters.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNewsletter(n)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      generatedNewsletter?.id === n.id
                        ? "border-slate-400 bg-slate-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{n.topic}</h3>
                      {generatedNewsletter?.id === n.id && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(n.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      {generatedNewsletter && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base font-medium">Selected Newsletter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-slate-50">
              <h3 className="font-medium mb-2">{generatedNewsletter.topic}</h3>
              <pre className="whitespace-pre-wrap text-sm text-slate-600 max-h-40 overflow-y-auto">
                {generatedNewsletter.content}
              </pre>
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
          disabled={!generatedNewsletter}
        >
          Continue <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
