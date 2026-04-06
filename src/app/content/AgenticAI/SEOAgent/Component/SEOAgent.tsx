"use client";
import { useState, useRef } from "react";
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
import {
  ArrowLeft, 
  Search, 
  Globe, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Download,
  Sparkles,
  RefreshCw,
  ExternalLink,
  BarChart3,
  Lightbulb,
  Wrench,
  Zap,
  Activity,
  Code
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// API Base URL
const API_BASE_URL = "https://harshit20991999-seo-agent-2.hf.space";

// Analysis Types
type AnalysisMode = 'audit' | 'score' | 'crawl' | 'issues' | 'recommend' | 'full-report';
type AnalysisModeType = 'basic' | 'advanced';

interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  impact: string;
  fix: string;
}

interface PriorityAction {
  priority: string;
  action: string;
  impact: string;
  effort: string;
  time_estimate: string;
  issue: string;
}

interface TechnicalDetails {
  https_enabled: boolean;
  has_robots_txt: boolean;
  has_sitemap_xml: boolean;
  response_time_ms: number;
  status_code: number;
  viewport: boolean;
  charset: string;
  indexable: boolean;
  x_robots_tag: string | null;
  pagespeed_score: number | null;
}

interface OnPageDetails {
  title: string;
  title_length: number;
  title_valid: boolean;
  meta_description: string;
  meta_description_length: number;
  meta_description_valid: boolean;
  h1_count: number;
  h1_tags: string[];
  h2_count: number;
  image_count: number;
  images_with_alt: number;
  alt_coverage_percent: number;
  word_count: number;
}

interface SEOAuditResponse {
  url: string;
  mode: string;
  seo_score: number;
  grade: string;
  issues: SEOIssue[];
  summary: string;
  strengths: string[];
  technical_details: TechnicalDetails;
  onpage_details: OnPageDetails;
  content_analysis: {
    word_count: number;
  };
  priority_actions: PriorityAction[];
  ai_insights: string | null;
}

interface SEOScoreResponse {
  url: string;
  seo_score: number;
  grade: string;
  checks: {
    https_enabled: boolean;
    has_title: boolean;
    has_meta_description: boolean;
    has_h1: boolean;
    response_time_ms: number;
  };
}

interface SEOCrawlResponse {
  url: string;
  mode: string;
  crawled_pages: number;
  data: any;
}

interface SEOIssuesResponse {
  url: string;
  mode: string;
  issues: SEOIssue[];
}

interface SEORecommendResponse {
  url: string;
  mode: string;
  recommendations: string[] | { summary: string; recommendations: string[] };
}

interface SEOFullReportResponse extends SEOAuditResponse {}

interface AnalysisRecord {
  id: string;
  url: string;
  mode: AnalysisModeType;
  analysisType: AnalysisMode;
  data: SEOAuditResponse | SEOScoreResponse | SEOCrawlResponse | SEOIssuesResponse | SEORecommendResponse | SEOFullReportResponse;
  createdAt: string;
}

const analysisModes: { id: AnalysisMode; name: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: 'audit',
    name: 'Full Audit',
    description: 'Comprehensive SEO analysis with score, issues, and AI recommendations',
    icon: Search,
  },
  {
    id: 'score',
    name: 'Quick Score',
    description: 'Get a quick SEO score (0-100) and grade without full analysis',
    icon: Activity,
  },
  {
    id: 'crawl',
    name: 'Website Crawl',
    description: 'Get raw crawl data without any analysis',
    icon: Globe,
  },
  {
    id: 'issues',
    name: 'Issues List',
    description: 'Get only the SEO issues list without full analysis',
    icon: AlertTriangle,
  },
  {
    id: 'recommend',
    name: 'AI Recommendations',
    description: 'Get AI-powered recommendations without full analysis',
    icon: Lightbulb,
  },
  {
    id: 'full-report',
    name: 'Complete Report',
    description: 'Get everything: score, issues, recommendations, AI insights, technical details',
    icon: FileText,
  },
];

export default function SEOAgent() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [modeType, setModeType] = useState<AnalysisModeType>('basic');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisMode>('audit');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [activeTab, setActiveTab] = useState('analyze');
  const resultsRef = useRef<HTMLDivElement>(null);

  // URL validation
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  // Get grade color
  const getGradeColor = (grade: string): string => {
    switch (grade.toUpperCase()) {
      case 'A':
        return 'text-green-500';
      case 'B':
        return 'text-lime-500';
      case 'C':
        return 'text-yellow-500';
      case 'D':
        return 'text-orange-500';
      case 'F':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  // Get issue type icon
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Run analysis
  const runAnalysis = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (e.g., https://www.example.com)');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      let endpoint = '';
      switch (selectedAnalysis) {
        case 'audit':
          endpoint = '/api/v1/seo/audit';
          break;
        case 'score':
          endpoint = '/api/v1/seo/score';
          break;
        case 'crawl':
          endpoint = '/api/v1/seo/crawl';
          break;
        case 'issues':
          endpoint = '/api/v1/seo/issues';
          break;
        case 'recommend':
          endpoint = '/api/v1/seo/recommend';
          break;
        case 'full-report':
          endpoint = '/api/v1/seo/full-report';
          break;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          mode: modeType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Analysis failed');
      }

      const data = await response.json();
      
      const newRecord: AnalysisRecord = {
        id: Date.now().toString(),
        url: url,
        mode: modeType,
        analysisType: selectedAnalysis,
        data: data,
        createdAt: new Date().toISOString(),
      };

      setRecords(prev => [newRecord, ...prev]);
      setSelectedRecord(newRecord);
      setSuccess('Analysis completed successfully!');
      setActiveTab('results');
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // Download PDF - using jsPDF directly without html2canvas to avoid lab() color issue
  const downloadPDF = async () => {
    if (!selectedRecord) return;

    try {
      setIsLoading(true);
      setError('');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 295;
      const margin = 15;
      let yPos = margin;
      
      // Helper to add a new page if needed
      const checkNewPage = (height: number) => {
        if (yPos + height > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
      };
      
      // Helper to add text with word wrap
      const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);
        checkNewPage(lines.length * (fontSize * 0.5));
        pdf.text(lines, margin, yPos);
        yPos += lines.length * (fontSize * 0.5) + 3;
      };
      
      const data = selectedRecord.data;
      const analysisName = analysisModes.find(m => m.id === selectedRecord.analysisType)?.name || 'SEO Analysis';
      
      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SEO Analysis Report', margin, yPos);
      yPos += 10;
      
      // Info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`URL: ${selectedRecord.url}`, margin, yPos);
      yPos += 6;
      pdf.text(`Analysis Type: ${analysisName}`, margin, yPos);
      yPos += 6;
      pdf.text(`Date: ${formatDate(selectedRecord.createdAt)}`, margin, yPos);
      yPos += 10;
      
      // Score
      if (hasScore(data)) {
        checkNewPage(30);
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPos, pageWidth - margin * 2, 25, 'F');
        
        pdf.setFontSize(32);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${data.seo_score}`, margin + 10, yPos + 15);
        
        pdf.setFontSize(14);
        pdf.text(`Grade: ${data.grade}`, margin + 60, yPos + 10);
        pdf.setFontSize(10);
        pdf.text('SEO Score', margin + 60, yPos + 18);
        yPos += 30;
      }
      
      // Checks
      const checks = getChecksData(data);
      if (checks) {
        checkNewPage(40);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SEO Checks', margin, yPos);
        yPos += 6;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const checkItems = [
          `HTTPS: ${checks.https_enabled ? 'Enabled' : 'Disabled'}`,
          `Title Tag: ${checks.has_title ? 'Present' : 'Missing'}`,
          `Meta Description: ${checks.has_meta_description ? 'Present' : 'Missing'}`,
          `Response Time: ${checks.response_time_ms}ms`
        ];
        checkItems.forEach(item => {
          pdf.text(`• ${item}`, margin + 5, yPos);
          yPos += 5;
        });
        yPos += 5;
      }
      
      // Issues
      if (hasIssues(data) && data.issues.length > 0) {
        checkNewPage(50);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`SEO Issues (${data.issues.length})`, margin, yPos);
        yPos += 6;
        
        pdf.setFontSize(10);
        data.issues.slice(0, 15).forEach((issue, index) => {
          checkNewPage(15);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${issue.title}`, margin + 5, yPos);
          yPos += 4;
          pdf.setFont('helvetica', 'normal');
          const descLines = pdf.splitTextToSize(issue.description, pageWidth - margin * 2 - 10);
          pdf.text(descLines, margin + 5, yPos);
          yPos += descLines.length * 4 + 4;
        });
      }
      
      // Summary
      const rawData = data as any;
      if ('summary' in rawData && rawData.summary) {
        checkNewPage(30);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Summary', margin, yPos);
        yPos += 6;
        const summaryText = typeof rawData.summary === 'string' ? rawData.summary : rawData.summary?.summary || JSON.stringify(rawData.summary);
        addWrappedText(summaryText, 10);
      }
      
      // Strengths
      const rawData3 = data as any;
      if (hasStrengths(data) && data.strengths.length > 0) {
        checkNewPage(30);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Strengths', margin, yPos);
        yPos += 6;
        
        pdf.setFontSize(10);
        rawData3.strengths.slice(0, 5).forEach((strength: any) => {
          checkNewPage(5);
          const strengthText = typeof strength === 'string' ? strength : strength.title || strength.name || JSON.stringify(strength);
          pdf.text(`• ${strengthText}`, margin + 5, yPos);
          yPos += 5;
        });
      }
      
      // Priority Actions
      if (hasPriorityActions(data) && data.priority_actions.length > 0) {
        checkNewPage(30);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Priority Actions', margin, yPos);
        yPos += 6;
        
        pdf.setFontSize(10);
        data.priority_actions.slice(0, 5).forEach((action, index) => {
          checkNewPage(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${action.action || action.issue}`, margin + 5, yPos);
          yPos += 4;
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Priority: ${action.priority} | Impact: ${action.impact}`, margin + 5, yPos);
          yPos += 5;
        });
      }
      
      // AI Insights
      const rawData2 = data as any;
      if (hasAIInsights(data) && rawData2.ai_insights) {
        checkNewPage(40);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Insights', margin, yPos);
        yPos += 6;
        const aiText = typeof rawData2.ai_insights === 'string' ? rawData2.ai_insights : rawData2.ai_insights?.summary || JSON.stringify(rawData2.ai_insights);
        addWrappedText(aiText, 10);
      }
      
      // Technical Details
      if (hasTechnicalDetails(data)) {
        checkNewPage(40);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Technical Details', margin, yPos);
        yPos += 6;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const techItems = [
          `HTTPS: ${data.technical_details.https_enabled ? 'Enabled' : 'Disabled'}`,
          `Robots.txt: ${data.technical_details.has_robots_txt ? 'Found' : 'Not Found'}`,
          `Sitemap: ${data.technical_details.has_sitemap_xml ? 'Found' : 'Not Found'}`,
          `Indexable: ${data.technical_details.indexable ? 'Yes' : 'No'}`,
          `Mobile Friendly: ${data.technical_details.viewport ? 'Yes' : 'No'}`,
          `Response Time: ${data.technical_details.response_time_ms}ms`
        ];
        techItems.forEach(item => {
          checkNewPage(5);
          pdf.text(`• ${item}`, margin + 5, yPos);
          yPos += 5;
        });
      }
      
      const fileName = `${analysisName}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      setSuccess('PDF downloaded successfully!');
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Error: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Download JSON
  const downloadJSON = () => {
    if (!selectedRecord) return;

    const dataStr = JSON.stringify(selectedRecord.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seo-analysis-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format date
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

  // Check if data has score
  const hasScore = (data: any): data is { seo_score: number; grade: string } => {
    return data && typeof data.seo_score === 'number';
  };

  // Check if data has issues
  const hasIssues = (data: any): data is { issues: SEOIssue[] } => {
    return data && Array.isArray(data.issues) && data.issues.length > 0 && 'title' in (data.issues[0] || {});
  };

  // Check if data has technical details
  const hasTechnicalDetails = (data: any): data is { technical_details: TechnicalDetails } => {
    return data && data.technical_details && typeof data.technical_details === 'object';
  };

  // Check if data has onpage details
  const hasOnPageDetails = (data: any): data is { onpage_details: OnPageDetails } => {
    return data && data.onpage_details && typeof data.onpage_details === 'object';
  };

  // Check if data has AI insights
  const hasAIInsights = (data: any): data is { ai_insights: string } => {
    return data && (typeof data.ai_insights === 'string' || typeof data.ai_insights === 'object');
  };

  // Check if data has strengths
  const hasStrengths = (data: any): data is { strengths: string[] } => {
    return data && Array.isArray(data.strengths) && data.strengths.length > 0 && (typeof data.strengths[0] === 'string' || typeof data.strengths[0] === 'object');
  };

  // Check if data has priority actions
  const hasPriorityActions = (data: any): data is { priority_actions: PriorityAction[] } => {
    return data && Array.isArray(data.priority_actions) && data.priority_actions.length > 0 && typeof data.priority_actions[0] === 'object' && ('action' in data.priority_actions[0] || 'issue' in data.priority_actions[0]);
  };

  // Check if data has checks (score mode)
  const hasChecks = (data: any): data is { checks: { https_enabled: boolean; has_title: boolean; has_meta_description: boolean; has_h1: boolean; response_time_ms: number } } => {
    return data && data.checks && typeof data.checks === 'object';
  };

  // Helper to get checks from data if they exist
  const getChecksData = (data: any) => {
    if (hasChecks(data)) {
      return data.checks;
    }
    return null;
  };

  return (
    <div className="max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/content/AgenticAI/AgentLibrary")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Search className="h-8 w-8" />
            AI-Powered SEO Audit
          </h1>
          <p className="text-muted-foreground">
            Comprehensive website analysis with AI recommendations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyze" className="gap-2">
            <Zap className="h-4 w-4" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <FileText className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            History ({records.length})
          </TabsTrigger>
        </TabsList>

        {/* Analyze Tab */}
        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Website Analysis
              </CardTitle>
              <CardDescription>
                Enter a URL to analyze its SEO performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="url">Website URL <span className="text-red-500">*</span></Label>
                <Input
                  id="url"
                  type="text"
                  placeholder="https://www.example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              {/* Analysis Mode Type */}
              <div className="space-y-2">
                <Label>Analysis Mode</Label>
                <Select value={modeType} onValueChange={(value) => setModeType(value as AnalysisModeType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - Quick Analysis</SelectItem>
                    <SelectItem value="advanced">Advanced - AI Recommendations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Analysis Type Selection */}
              <div className="space-y-2">
                <Label>Analysis Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysisModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => setSelectedAnalysis(mode.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedAnalysis === mode.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'hover:bg-muted/50 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            selectedAnalysis === mode.id ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            <Icon className={`h-5 w-5 ${selectedAnalysis === mode.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{mode.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{mode.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Analyze Button */}
              <Button 
                onClick={runAnalysis}
                disabled={isLoading || !url.trim()}
                className="w-full gap-2"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Run Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          {selectedRecord ? (
            <div className="space-y-6">
              {/* Actions Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('analyze')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    New Analysis
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadJSON}>
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadPDF} disabled={isLoading}>
                    <FileText className="h-4 w-4 mr-2" />
                    {isLoading ? 'Generating...' : 'PDF'}
                  </Button>
                </div>
              </div>

              {/* Results Content */}
              <div ref={resultsRef} className="space-y-6 bg-white p-6 rounded-lg">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Globe className="h-6 w-6" />
                      {selectedRecord.url}
                    </h2>
                    <p className="text-muted-foreground">
                      {analysisModes.find(m => m.id === selectedRecord.analysisType)?.name} - {selectedRecord.mode} mode
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedRecord.createdAt)}
                    </p>
                  </div>
                  {hasScore(selectedRecord.data) && (
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreColor(selectedRecord.data.seo_score)}`}>
                        {selectedRecord.data.seo_score}
                      </div>
                      <div className="text-lg font-semibold">SEO Score</div>
                      <Badge className={`${getGradeColor(selectedRecord.data.grade)} bg-transparent border-2 border-current`}>
                        Grade: {selectedRecord.data.grade}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* SEO Score Display */}
                {hasScore(selectedRecord.data) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        SEO Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Progress value={selectedRecord.data.seo_score} className="h-4" />
                        </div>
                        <div className={`text-3xl font-bold ${getGradeColor(selectedRecord.data.grade)}`}>
                          {selectedRecord.data.grade}
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(() => {
                          const checks = getChecksData(selectedRecord.data);
                          if (!checks) return null;
                          return (
                            <>
                              <div className={`p-3 rounded-lg ${checks.https_enabled ? 'bg-green-100' : 'bg-red-100'}`}>
                                <div className="text-sm text-muted-foreground">HTTPS</div>
                                <div className="font-semibold">{checks.https_enabled ? 'Enabled' : 'Disabled'}</div>
                              </div>
                              <div className={`p-3 rounded-lg ${checks.has_title ? 'bg-green-100' : 'bg-red-100'}`}>
                                <div className="text-sm text-muted-foreground">Title</div>
                                <div className="font-semibold">{checks.has_title ? 'Present' : 'Missing'}</div>
                              </div>
                              <div className={`p-3 rounded-lg ${checks.has_meta_description ? 'bg-green-100' : 'bg-red-100'}`}>
                                <div className="text-sm text-muted-foreground">Meta Desc.</div>
                                <div className="font-semibold">{checks.has_meta_description ? 'Present' : 'Missing'}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-muted">
                                <div className="text-sm text-muted-foreground">Response Time</div>
                                <div className="font-semibold">{checks.response_time_ms}ms</div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Issues */}
                {hasIssues(selectedRecord.data) && selectedRecord.data.issues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        SEO Issues ({selectedRecord.data.issues.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedRecord.data.issues.map((issue, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-start gap-3">
                              {getIssueIcon(issue.type)}
                              <div className="flex-1">
                                <h4 className="font-semibold">{issue.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                                {issue.impact && (
                                  <p className="text-sm text-orange-600 mt-2">Impact: {issue.impact}</p>
                                )}
                                {issue.fix && (
                                  <p className="text-sm text-green-600 mt-2">Fix: {issue.fix}</p>
                                )}
                              </div>
                              <Badge variant={issue.type === 'error' ? 'destructive' : issue.type === 'warning' ? 'secondary' : 'outline'}>
                                {issue.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Strengths */}
                {hasStrengths(selectedRecord.data) && selectedRecord.data.strengths.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedRecord.data.strengths.map((strength, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{typeof strength === 'string' ? strength : JSON.stringify(strength)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Technical Details */}
                {hasTechnicalDetails(selectedRecord.data) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Technical Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className={`p-3 rounded-lg ${selectedRecord.data.technical_details.https_enabled ? 'bg-green-100' : 'bg-red-100'}`}>
                          <div className="text-sm text-muted-foreground">HTTPS</div>
                          <div className="font-semibold">{selectedRecord.data.technical_details.https_enabled ? 'Enabled' : 'Disabled'}</div>
                        </div>
                        <div className={`p-3 rounded-lg ${selectedRecord.data.technical_details.has_robots_txt ? 'bg-green-100' : 'bg-red-100'}`}>
                          <div className="text-sm text-muted-foreground">Robots.txt</div>
                          <div className="font-semibold">{selectedRecord.data.technical_details.has_robots_txt ? 'Found' : 'Not Found'}</div>
                        </div>
                        <div className={`p-3 rounded-lg ${selectedRecord.data.technical_details.has_sitemap_xml ? 'bg-green-100' : 'bg-red-100'}`}>
                          <div className="text-sm text-muted-foreground">Sitemap</div>
                          <div className="font-semibold">{selectedRecord.data.technical_details.has_sitemap_xml ? 'Found' : 'Not Found'}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                          <div className="text-sm text-muted-foreground">Response Time</div>
                          <div className="font-semibold">{selectedRecord.data.technical_details.response_time_ms}ms</div>
                        </div>
                        <div className={`p-3 rounded-lg ${selectedRecord.data.technical_details.indexable ? 'bg-green-100' : 'bg-red-100'}`}>
                          <div className="text-sm text-muted-foreground">Indexable</div>
                          <div className="font-semibold">{selectedRecord.data.technical_details.indexable ? 'Yes' : 'No'}</div>
                        </div>
                        <div className={`p-3 rounded-lg ${selectedRecord.data.technical_details.viewport ? 'bg-green-100' : 'bg-red-100'}`}>
                          <div className="text-sm text-muted-foreground">Mobile Friendly</div>
                          <div className="font-semibold">{selectedRecord.data.technical_details.viewport ? 'Yes' : 'No'}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* On-Page Details */}
                {hasOnPageDetails(selectedRecord.data) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        On-Page SEO
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <Label>Title Tag</Label>
                            <Badge variant={selectedRecord.data.onpage_details.title_valid ? 'default' : 'destructive'}>
                              {selectedRecord.data.onpage_details.title_length} chars
                            </Badge>
                          </div>
                          <p className="mt-1 p-2 bg-muted rounded">{selectedRecord.data.onpage_details.title || 'Not set'}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <Label>Meta Description</Label>
                            <Badge variant={selectedRecord.data.onpage_details.meta_description_valid ? 'default' : 'destructive'}>
                              {selectedRecord.data.onpage_details.meta_description_length} chars
                            </Badge>
                          </div>
                          <p className="mt-1 p-2 bg-muted rounded">{selectedRecord.data.onpage_details.meta_description || 'Not set'}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 rounded-lg bg-muted">
                            <div className="text-sm text-muted-foreground">H1 Count</div>
                            <div className="font-semibold">{selectedRecord.data.onpage_details.h1_count}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted">
                            <div className="text-sm text-muted-foreground">H2 Count</div>
                            <div className="font-semibold">{selectedRecord.data.onpage_details.h2_count}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted">
                            <div className="text-sm text-muted-foreground">Images</div>
                            <div className="font-semibold">{selectedRecord.data.onpage_details.image_count}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted">
                            <div className="text-sm text-muted-foreground">Alt Text Coverage</div>
                            <div className="font-semibold">{selectedRecord.data.onpage_details.alt_coverage_percent}%</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Priority Actions */}
                {hasPriorityActions(selectedRecord.data) && selectedRecord.data.priority_actions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Priority Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedRecord.data.priority_actions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="font-medium">{action.action || action.issue}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                <span className="inline-block px-2 py-0.5 rounded bg-muted text-xs mr-2">
                                  Priority: {action.priority}
                                </span>
                                <span className="inline-block px-2 py-0.5 rounded bg-muted text-xs mr-2">
                                  Impact: {action.impact}
                                </span>
                                {action.effort && (
                                  <span className="inline-block px-2 py-0.5 rounded bg-muted text-xs">
                                    Effort: {action.effort}
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* AI Insights */}
                {hasAIInsights(selectedRecord.data) && selectedRecord.data.ai_insights && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{typeof selectedRecord.data.ai_insights === 'string' ? selectedRecord.data.ai_insights : JSON.stringify(selectedRecord.data.ai_insights)}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Summary */}
                {'summary' in selectedRecord.data && selectedRecord.data.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{typeof selectedRecord.data.summary === 'string' ? selectedRecord.data.summary : JSON.stringify(selectedRecord.data.summary)}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Raw Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Raw Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                      {JSON.stringify(selectedRecord.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No results yet. Run an analysis first!</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('analyze')}
                >
                  Go to Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>
                View all your previous SEO analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No analysis history yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('analyze')}
                  >
                    Run Your First Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => {
                    const Icon = analysisModes.find(m => m.id === record.analysisType)?.icon || Search;
                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedRecord(record);
                          setActiveTab('results');
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold">{analysisModes.find(m => m.id === record.analysisType)?.name}</h3>
                            <Badge variant="outline">{record.mode}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate">{record.url}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(record.createdAt)}
                          </p>
                        </div>
                        {hasScore(record.data) && (
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(record.data.seo_score)}`}>
                              {record.data.seo_score}
                            </div>
                            <Badge className={getGradeColor(record.data.grade)}>
                              {record.data.grade}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
