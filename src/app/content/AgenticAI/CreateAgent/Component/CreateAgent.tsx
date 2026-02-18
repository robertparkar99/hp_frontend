"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormDataType {
  name: string;
  description: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: string[];
}

interface ErrorType {
  name?: string;
  description?: string;
  model?: string;
  maxTokens?: string;
  systemPrompt?: string;
}


const DRAFT_KEY = "agent-draft";

const availableTools = [
  { id: "knowledge_base", label: "Knowledge Base" },
  { id: "web_search", label: "Web Search" },
  { id: "email", label: "Email" },
  { id: "sql_query", label: "SQL Query" },
  { id: "data_viz", label: "Data Visualization" },
  { id: "file_operations", label: "File Operations" },
];

const steps = [
  { id: 1, name: "Basic Info", description: "Agent identity" },
  { id: 2, name: "Model Config", description: "AI parameters" },
  { id: 3, name: "System Prompt", description: "Behavior definition" },
  { id: 4, name: "Tools", description: "Capabilities" },
];

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------
const validateStep = (step: number, data: FormDataType): ErrorType => {
  const errors: ErrorType = {};

  if (step === 1) {
    if (!data.name.trim()) errors.name = "Agent name is required";
    if (!data.description.trim()) errors.description = "Description is required";
  }

  if (step === 2) {
    if (!data.model) errors.model = "Please select a model";
    if (data.maxTokens < 100 || data.maxTokens > 8000) errors.maxTokens = "Max tokens must be between 100 and 8000";
  }

  if (step === 3) {
    if (!data.systemPrompt.trim()) errors.systemPrompt = "System prompt is required";
  }

  return errors;
};


export default function CreateAgent() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: "",
    tools: [],
  });

  const [errors, setErrors] = useState<ErrorType>({});

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) setFormData(JSON.parse(draft));
  }, []);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }, 800);
    return () => clearTimeout(t);
  }, [formData]);

  // --------------------------------------------------
  // FIELD UPDATE
  // --------------------------------------------------
  const updateField = (key: keyof FormDataType, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // --------------------------------------------------
  // TOOL TOGGLE
  // --------------------------------------------------
  const toggleTool = (toolId: string) => {
  setFormData((prev) => ({
    ...prev,
    tools: prev.tools.includes(toolId)
      ? prev.tools.filter((t) => t !== toolId)
      : [...prev.tools, toolId],
  }));
};


  // --------------------------------------------------
  // NEXT STEP
  // --------------------------------------------------
  const handleNext = () => {
    const validationErrors = validateStep(currentStep, formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
    }
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------
  const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateStep(currentStep, formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // Clear draft
    localStorage.removeItem(DRAFT_KEY);

    // SIMPLE ALERT (REPLACED TOAST)
    alert(`Agent Created Successfully!\n\n${formData.name} is ready to use.`);

    router.push("/");
  };

  return (
    <div className="max-w-4xl space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Agent</h1>
          <p className="text-muted-foreground">
            Configure your AI agent's behavior and capabilities
          </p>
        </div>
      </div>

      {/* PROGRESS STEPS */}
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, i) => (
            <li
              key={step.id}
              className={cn(
                "relative",
                i !== steps.length - 1 ? "pr-8 sm:pr-20 flex-1" : ""
              )}
            >
              <div className="flex items-center">
                <div className="relative flex items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      currentStep > step.id
                        ? "border-primary bg-primary"
                        : currentStep === step.id
                        ? "border-primary"
                        : "border-muted"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5 text-primary-foreground" />
                    ) : (
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          currentStep === step.id
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.id}
                      </span>
                    )}
                  </div>

                  {i !== steps.length - 1 && (
                    <div
                      className={cn(
                        "absolute left-10 top-5 h-0.5 w-full",
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      )}
                      style={{ width: "calc(100% + 2rem)" }}
                    />
                  )}
                </div>

                <div className="ml-4">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      currentStep === step.id ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {step.description}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1 */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Agent Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Model</Label>
                <Select
                  value={formData.model}
                  onValueChange={(v) => updateField("model", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                  </SelectContent>
                </Select>
                {errors.model && (
                  <p className="text-red-500 text-sm">{errors.model}</p>
                )}
              </div>

              <div>
                <Label>Temperature: {formData.temperature.toFixed(1)}</Label>
                <Slider
                  value={[formData.temperature]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([v]) => updateField("temperature", v)}
                />
              </div>

              <div>
                <Label>Max Tokens</Label>
                <Input
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) =>
                    updateField("maxTokens", Number(e.target.value))
                  }
                />
                {errors.maxTokens && (
                  <p className="text-red-500 text-sm">{errors.maxTokens}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={6}
                value={formData.systemPrompt}
                onChange={(e) => updateField("systemPrompt", e.target.value)}
              />
              {errors.systemPrompt && (
                <p className="text-red-500 text-sm">{errors.systemPrompt}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Tools</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {availableTools.map((t) => (
                <label key={t.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.tools.includes(t.id)}
                    onCheckedChange={() => toggleTool(t.id)}
                  />
                  {t.label}
                </label>
              ))}
            </CardContent>
          </Card>
        )}

        {/* BUTTONS */}
        <div className="flex justify-between">
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>

            {currentStep > 1 && (
              <Button
                variant="outline"
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
          </div>

          {currentStep < 4 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit">Create Agent</Button>
          )}
        </div>
      </form>
    </div>
  );
}
