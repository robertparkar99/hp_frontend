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
import { ArrowLeft, Plus, History, Eye, Trash2, Sparkles, Calendar, Target, Users, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// API Base URL
// const API_BASE_URL = "https://karan-01-hpmarktingagent.hf.space";

// Default agent_id (can be changed or stored in localStorage)
const DEFAULT_AGENT_ID = "a6b36706-3fa3-4146-98c2-ff05321e8123";

interface Strategy {
  id: string;
  agent_id: string;
  business_type: string;
  target_audience: string;
  goal: string;
  strategy: string;
  strategy_type: string;
  focus_area: string;
  created_at: string;
}

// --------------------------------------------------
// STRATEGY CONTENT PARSER
// --------------------------------------------------
interface StrategySection {
  title: string;
  content: string;
}

const parseStrategyContent = (content: string): StrategySection[] => {
  const sections: StrategySection[] = [];

  // Define section patterns to look for
  const patterns = [
    { key: 'Platform Strategy', pattern: /Platform Strategy:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i },
    { key: 'Content Plan', pattern: /Content Plan:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i },
    { key: 'Posting Frequency', pattern: /Posting Frequency:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i },
    { key: 'Lead Generation Tactics', pattern: /Lead Generation Tactics:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i },
    { key: 'Growth Hacks', pattern: /Growth Hacks:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i },
    { key: 'Unique Angle', pattern: /Unique Angle:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i },
  ];

  patterns.forEach(({ key, pattern }) => {
    const match = content.match(pattern);
    if (match && match[1]) {
      sections.push({
        title: key,
        content: match[1].trim()
      });
    }
  });

  return sections;
};

// Strategy Content Display Component
function StrategyContentParser({ content }: { content: string }) {
  const sections = parseStrategyContent(content);

  // If no sections found, show raw content
  if (sections.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
          <h4 className="font-semibold text-primary flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/10">
              {index + 1}
            </Badge>
            {section.title}
          </h4>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap pl-8">
            {section.content}
          </div>
        </div>
      ))}
    </div>
  );
}

interface FormDataType {
  agentId: string;
  businessType: string;
  targetAudience: string;
  goal: string;
}

export default function MarketingStrategy() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("create");
  const [formData, setFormData] = useState<FormDataType>({
    agentId: DEFAULT_AGENT_ID,
    businessType: "",
    targetAudience: "",
    goal: "",
  });
  
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Fetch strategies on mount
  useEffect(() => {
    fetchStrategies();
  }, []);

  // --------------------------------------------------
  // FETCH STRATEGIES
  // --------------------------------------------------
  const fetchStrategies = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`https://karan-01-hpgooglecalendar.hf.space/api/marketing/strategy/a6b36706-3fa3-4146-98c2-ff05321
e8123
`);
      
      if (response.ok) {
        const data = await response.json();
        setStrategies(data.data || []);
      } else {
        console.error("Failed to fetch strategies");
        setStrategies([]);
      }
    } catch (error) {
      console.error("Error fetching strategies:", error);
      setStrategies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // FIELD UPDATE
  // --------------------------------------------------
  const updateField = (key: keyof FormDataType, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // --------------------------------------------------
  // GENERATE STRATEGY
  // --------------------------------------------------
  const handleGenerateStrategy = async () => {
    // Validation
    if (!formData.businessType.trim()) {
      setErrorMessage("Business type is required");
      return;
    }
    if (!formData.targetAudience.trim()) {
      setErrorMessage("Target audience is required");
      return;
    }
    if (!formData.goal.trim()) {
      setErrorMessage("Goal is required");
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsGenerating(true);

    try {
      const response = await fetch(`https://karan-01-hpgooglecalendar.hf.space/api/marketing/strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: formData.agentId,
          business_type: formData.businessType,
          target_audience: formData.targetAudience,
          goal: formData.goal,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage("Strategy generated successfully!");
        
        // Refresh strategies list
        fetchStrategies();
        
        // Show the newly created strategy
        if (data.data) {
          setSelectedStrategy(data.data);
          setActiveTab("history");
        }
        
        // Clear form
        setFormData({
          ...formData,
          businessType: "",
          targetAudience: "",
          goal: "",
        });
      } else {
        const errorText = await response.text();
        setErrorMessage(`Failed to generate strategy: ${errorText}`);
      }
    } catch (error: any) {
      setErrorMessage(`Error generating strategy: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --------------------------------------------------
  // VIEW STRATEGY DETAILS
  // --------------------------------------------------
  const viewStrategyDetails = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setActiveTab("view");
  };

  // --------------------------------------------------
  // DELETE STRATEGY (local only - for UI purposes)
  // --------------------------------------------------
  const deleteStrategy = (id: string) => {
    setStrategies((prev) => prev.filter((s) => s.id !== id));
    if (selectedStrategy?.id === id) {
      setSelectedStrategy(null);
    }
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-6xl space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/content/AgenticAI/AgentLibrary")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          
            Marketing Strategy Agent
          </h1>
          <p className="text-muted-foreground">
            Generate AI-powered marketing strategies for your business
          </p>
        </div>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Strategy
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History ({strategies.length})
          </TabsTrigger>
          <TabsTrigger value="view" disabled={!selectedStrategy}>
            <Eye className="h-4 w-4" />
            View Details
          </TabsTrigger>
        </TabsList>

        {/* CREATE TAB */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Marketing Strategy</CardTitle>
              <CardDescription>
                Enter your business details to generate a personalized marketing strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Agent ID */}
              <div>
                <Label>Agent ID</Label>
                <Input
                  placeholder="Enter agent ID"
                  value={formData.agentId}
                  onChange={(e) => updateField("agentId", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default: {DEFAULT_AGENT_ID}
                </p>
              </div>

              {/* Business Type */}
              <div>
                <Label>Business Type *</Label>
                <Input
                  placeholder="e.g., Online Clothing Store, Fitness Gym, Restaurant"
                  value={formData.businessType}
                  onChange={(e) => updateField("businessType", e.target.value)}
                />
              </div>

              {/* Target Audience */}
              <div>
                <Label>Target Audience *</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g., Women aged 18-35 interested in fashion, Working professionals aged 25-40"
                  value={formData.targetAudience}
                  onChange={(e) => updateField("targetAudience", e.target.value)}
                />
              </div>

              {/* Goal */}
              <div>
                <Label>Marketing Goal *</Label>
                <Textarea
                  rows={2}
                  placeholder="e.g., Boost online sales through social media marketing, Increase new gym memberships"
                  value={formData.goal}
                  onChange={(e) => updateField("goal", e.target.value)}
                />
              </div>

              {/* Error/Success Messages */}
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              {/* Generate Button */}
              <Button 
                onClick={handleGenerateStrategy}
                disabled={isGenerating}
                className="w-full gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Strategy...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Marketing Strategy
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Strategy History</CardTitle>
              <CardDescription>
                View all your previously generated marketing strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading strategies...</p>
                </div>
              ) : strategies.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No strategies found. Create your first one!</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab("create")}
                  >
                    Create Strategy
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {strategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 cursor-pointer" onClick={() => viewStrategyDetails(strategy)}>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{strategy.business_type}</h3>
                          {strategy.strategy_type && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full capitalize">
                              {strategy.strategy_type}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <Users className="h-3 w-3 inline mr-1" />
                          {strategy.target_audience}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <Target className="h-3 w-3 inline mr-1" />
                          {strategy.goal}
                        </p>
                        {strategy.focus_area && (
                          <p className="text-sm text-muted-foreground">
                            <TrendingUp className="h-3 w-3 inline mr-1" />
                            Focus: {strategy.focus_area}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDate(strategy.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewStrategyDetails(strategy)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteStrategy(strategy.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
          {selectedStrategy ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("history")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to History
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {formatDate(selectedStrategy.created_at)}
                </p>
              </div>

              {/* Strategy Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{selectedStrategy.business_type}</CardTitle>
                  <CardDescription>Marketing Strategy Details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Strategy Type and Focus Area - Prominent Display */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <Label className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Strategy Type
                      </Label>
                      <p className="mt-1 font-semibold text-lg capitalize">{selectedStrategy.strategy_type?.replace(/-/g, ' ') || 'Standard'}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <Label className="text-green-600 dark:text-green-400 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Focus Area
                      </Label>
                      <p className="mt-1 font-semibold text-lg capitalize">{selectedStrategy.focus_area?.replace(/-/g, ' ') || 'General'}</p>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-muted-foreground">Target Audience</Label>
                      <p className="mt-1 font-medium">{selectedStrategy.target_audience}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-muted-foreground">Goal</Label>
                      <p className="mt-1 font-medium">{selectedStrategy.goal}</p>
                    </div>
                  </div>

                  {/* Parsed Strategy Content */}
                  {selectedStrategy.strategy && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Your Marketing Strategy
                      </h3>
                      
                      {/* Parse and display strategy sections */}
                      <StrategyContentParser content={selectedStrategy.strategy} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Select a strategy to view details</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab("history")}
                >
                  View History
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
