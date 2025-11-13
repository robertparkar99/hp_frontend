

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info, ChevronRight } from "lucide-react";
import { aiInsights, type AIInsight } from "../../data/mockData";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const AIInsightsPanel = () => {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

  const getIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: AIInsight["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-amber-500 text-white";
      case "low":
        return "bg-gray-300 text-gray-700";
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Driven Insights & Recommendations</h3>
          <p className="text-sm text-gray-600">
            Automated analysis with root-cause identification and business-aligned actions
          </p>
        </div>

        <div className="space-y-4">
          {aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedInsight(insight)}
            >
              <div className="flex items-start gap-3">
                {getIcon(insight.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm text-gray-900">{insight.title}</h4>
                    <Badge className={getPriorityColor(insight.priority)} variant="secondary">
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Affects {insight.affectedCount} employees</span>
                    {insight.relatedDepartments && (
                      <>
                        <span>•</span>
                        <span>{insight.relatedDepartments.join(", ")}</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              {selectedInsight && getIcon(selectedInsight.type)}
              {selectedInsight?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600">Detailed analysis and recommendations</DialogDescription>
          </DialogHeader>

          {selectedInsight && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 text-sm text-gray-900">Description</h4>
                <p className="text-sm text-gray-600">{selectedInsight.description}</p>
              </div>

              <div className="p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                  Business Impact
                </h4>
                <p className="text-sm text-gray-600">{selectedInsight.businessImpact}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2 text-sm text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  Recommended Action
                </h4>
                <p className="text-sm text-gray-700">{selectedInsight.recommendation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Priority</p>
                  <Badge className={getPriorityColor(selectedInsight.priority)}>
                    {selectedInsight.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Affected Employees</p>
                  <p className="font-semibold text-gray-900">{selectedInsight.affectedCount}</p>
                </div>
                {selectedInsight.relatedSkills && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-2">Related Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedInsight.relatedSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="border-gray-300 text-gray-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedInsight.relatedDepartments && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-2">Related Departments</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedInsight.relatedDepartments.map((dept) => (
                        <Badge key={dept} variant="secondary" className="bg-gray-200 text-gray-700">
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">Implement Recommendation</Button>
                <Button variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
                  View Related Data
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};