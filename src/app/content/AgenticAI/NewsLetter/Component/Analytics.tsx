"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, RefreshCw } from "lucide-react";

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

interface AnalyticsPageProps {
  segment: string;
  onBack: () => void;
  onStartOver: () => void;
}

const API_URL = "https://hp.triz.co.in/api/newsletter/analytics/11111111-1111-1111-1111-111111111111";

export default function AnalyticsPage({ segment, onBack, onStartOver }: AnalyticsPageProps) {
  const [analyticsData, setAnalyticsData] = useState<NewsletterAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(Array.isArray(data) ? data : [data]);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return d; }
  };

  const totalAnalytics = analyticsData.length > 0 ? {
    emails_sent: analyticsData.reduce((sum, a) => sum + (a.emails_sent || 0), 0),
    emails_opened: analyticsData.reduce((sum, a) => sum + (a.emails_opened || 0), 0),
    link_clicks: analyticsData.reduce((sum, a) => sum + (a.link_clicks || 0), 0),
    open_rate: analyticsData.length > 0 ? Math.round(analyticsData.reduce((sum, a) => sum + (a.open_rate || 0), 0) / analyticsData.length) : 0,
    click_rate: analyticsData.length > 0 ? Math.round(analyticsData.reduce((sum, a) => sum + (a.click_rate || 0), 0) / analyticsData.length) : 0,
  } : null;

  return (
    <div className=" mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Analytics Dashboard
          </h1>
          <p className="text-slate-500 text-sm">Track newsletter performance</p>
        </div>
      </div>

      {/* All Analytics Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="text-base font-medium">All Analytics Data</CardTitle><CardDescription>Complete newsletter performance history</CardDescription></div>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-400 text-center py-4">Loading...</p>
          ) : analyticsData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No analytics data found</p>
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
                  <p className="text-xs text-muted-foreground text-right">{formatDate(a.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button onClick={onStartOver} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Start Over
        </Button>
      </div>
    </div>
  );
}