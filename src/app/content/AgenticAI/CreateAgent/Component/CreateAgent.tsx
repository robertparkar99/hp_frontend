"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface FormDataType {
  name: string;
  description: string;
  module: string;
  model: string;
  temperature: number;
  maxTokens: number;
  submodule: string;
  role: string;
  systemPrompt: string;
  tools: string[];
}

interface ErrorType {
  name?: string;
  description?: string;
  module?: string;
  maxTokens?: string;
  systemPrompt?: string;
  tools?: string;
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
    if (!data.module.trim()) errors.module = "Module is required";
    if (data.maxTokens < 100 || data.maxTokens > 8000) errors.maxTokens = "Max tokens must be between 100 and 8000";
  }

  if (step === 3) {
    if (!data.systemPrompt.trim()) errors.systemPrompt = "System prompt is required";
  }

  if (step === 4) {
    if (data.tools.length === 0) errors.tools = "At least one tool must be selected";
  }

  return errors;
};

interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string;
  org_type?: string;
  user_profile_id?: string;
}


export default function CreateAgent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = !!editId;

  const [currentStep, setCurrentStep] = useState(1);
  const [sessionData, setSessionData] = useState<SessionData>({});

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    module: "",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    submodule: "gpt-4",
    role: "",
    systemPrompt: "",
    tools: [],
  });

  const [errors, setErrors] = useState<ErrorType>({});
  const [createdAgent, setCreatedAgent] = useState<any>(null);
  const [sentPayload, setSentPayload] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [moduleOptions, setModuleOptions] = useState<{ id: number, menu_name: string }[]>([]);


  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type, user_profile_id } =
          JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, org_type, user_profile_id });
      }
    }
  }, []);
  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      setFormData(prev => ({ ...prev, ...parsedDraft }));
    }
  }, []);

  // Load agent for edit
  useEffect(() => {
    if (editId) {
      const fetchAgent = async () => {
        try {
          const response = await fetch(`https://pariharajit6348-agenticai.hf.space/agents/${editId}`);
          if (response.ok) {
            const agent = await response.json();
            setFormData({
              name: agent.name || '',
              description: agent.description || '',
              module: agent.module || '',
              model: 'gpt-4', // Assuming default, since API might not have it
              temperature: agent.temperature || 0.7,
              maxTokens: agent.max_tokens || 2000,
              submodule: agent.sub_module || '',
              role: 'agent', // Assuming default
              systemPrompt: agent.system_prompt || '',
              tools: [], // Assuming no tools from API
            });
          } else {
            console.error('Failed to fetch agent for edit');
          }
        } catch (error) {
          console.error('Error fetching agent for edit:', error);
        }
      };
      fetchAgent();
    }
  }, [editId]);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }, 800);
    return () => clearTimeout(t);
  }, [formData]);

  // Fetch module options from API
  useEffect(() => {
    if (!sessionData || !sessionData.url) return;
    const fetchModuleOptions = async () => {
      try {
        const response = await fetch(`${sessionData.url}/user/ajax_groupwiserights?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&profile_id=${sessionData.user_profile_id}`);
        if (response.ok) {
          const data = await response.json();
          const filteredModules = (data.level_1 || [])
            .filter((item: any) => item.can_view === 1)
            .slice(0, 5);
          setModuleOptions(filteredModules);
        }
      } catch (error) {
        console.error('Error fetching module options:', error);
      }
    };
    fetchModuleOptions();
  }, [sessionData]);

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
      if (currentStep <= 4) setCurrentStep(currentStep + 1);
    }
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateStep(currentStep, formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setErrorMessage('');
    setCreatedAgent(null);
    setSentPayload(null);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        module: formData.module,
        sub_module: formData.submodule,
        role: formData.role,
        temperature: formData.temperature,
        max_tokens: formData.maxTokens,
        system_prompt: formData.systemPrompt,
        tools: formData.tools,
      };
      setSentPayload(payload);

      const url = isEdit ? `https://pariharajit6348-agenticai.hf.space/agents/${editId}` : 'https://pariharajit6348-agenticai.hf.space/agents';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedAgent(data);
        alert(`${isEdit ? 'Agent updated' : 'Agent created'} successfully`);
        // Keep draft for refresh

        // Store selected tools in localStorage as array
        localStorage.setItem('selected_tools', JSON.stringify(formData.tools));

        // If creating (not editing), send to external API
        if (!isEdit) {
          const payload2 = {
            agent_id: data.id, // Assuming response has 'id' as agent_id
            agent_name: data.name, // Assuming response has 'name' as agent_name
            tools: formData.tools // Send as array
          };

          try {
            const response2 = await fetch('https://karan-01-agentic-tools.hf.space/api/agentic_tools/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload2),
            });
            if (response2.ok) {
              const data2 = await response2.json();
              console.log('Tools sent successfully:', data2);
            } else {
              console.error('Error sending tools:', response2.status, response2.statusText);
            }
          } catch (error) {
            console.error('Error sending tools to API:', error);
          }
        }
      } else {
        const errorText = await response.text();
        setErrorMessage(`Failed to ${isEdit ? 'update' : 'create'} agent: ${response.status} ${response.statusText} - ${errorText}`);
        alert(`Error: ${errorMessage}`);
      }
    } catch (error: any) {
      setErrorMessage(`Error creating agent: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{isEdit ? 'Edit Agent' : 'Create New Agent'}</h1>
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
                  placeholder="Enter agent name"
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
                  placeholder="Describe the agent's purpose and capabilities"
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
                <Label>Module</Label>
                <Select
                  value={formData.module}
                  onValueChange={(v) => updateField("module", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {moduleOptions.map((option) => (
                      <SelectItem key={option.id} value={option.menu_name}>
                        {option.menu_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.module && (
                  <p className="text-red-500 text-sm">{errors.module}</p>
                )}
              </div>
              {/* Submodule */}
              <div>
                <Label>Model</Label>
                <Select
                  value={formData.submodule}
                  onValueChange={(v) => updateField("submodule", v)}
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
              </div>

              {/* Role */}
              <div>
                <Label>Role</Label>
                <Input
                  placeholder="e.g. Interview Assistant"
                  value={formData.role}
                  onChange={(e) => updateField("role", e.target.value)}
                />
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
                placeholder="Define the agent's behavior, instructions, and personality"
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
              <Button type="submit">{isEdit ? 'Update Agent' : 'Create Agent'}</Button>
          )}
        </div>
      </form>

      {/* SUCCESS DISPLAY */}
      {createdAgent && sentPayload && (
        <Alert>
          <AlertTitle>Agent {isEdit ? 'Updated' : 'Created'} Successfully</AlertTitle>
          <AlertDescription>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Sent Payload:</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(sentPayload, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold">Response:</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(createdAgent, null, 2)}
                </pre>
              </div>
              <Button onClick={() => router.push("/")} className="mt-4">
                Go Back to Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* ERROR DISPLAY */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Error Creating Agent</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
