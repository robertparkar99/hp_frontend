import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type Framework = "onet" | "skillsfuture" | "esco";

interface FrameworkData {
  name: string;
  version: string;
  percentage: number;
  aligned: number;
  partial: number;
  notAligned: number;
}

const frameworkData: Record<Framework, FrameworkData> = {
  onet: {
    name: "O*NET",
    version: "v28.0",
    percentage: 72,
    aligned: 145,
    partial: 52,
    notAligned: 28,
  },
  skillsfuture: {
    name: "SkillsFuture",
    version: "v2024",
    percentage: 68,
    aligned: 138,
    partial: 58,
    notAligned: 29,
  },
  esco: {
    name: "ESCO",
    version: "v2025",
    percentage: 81,
    aligned: 164,
    partial: 43,
    notAligned: 18,
  },
};

interface BenchmarkGaugeProps {
  percentage: number;
  aligned: number;
  partial: number;
  notAligned: number;
}

const BenchmarkGauge = ({ percentage, aligned, partial, notAligned }: BenchmarkGaugeProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate pointer position (0-100%)
  const pointerPosition = `${percentage}%`;

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Horizontal gauge bar */}
      <div className="relative h-16 w-full rounded-full overflow-hidden bg-muted/30 shadow-inner">
        {/* Color zones */}
        <div className="absolute inset-0 flex">
          {/* Low zone (0-50%) - Red */}
          <div 
            className="h-full bg-red-500/80 transition-all duration-300"
            style={{ width: '50%' }}
          />
          {/* Partial zone (51-75%) - Yellow */}
          <div 
            className="h-full bg-yellow-500/80 transition-all duration-300"
            style={{ width: '25%' }}
          />
          {/* Strong zone (76-100%) - Green */}
          <div 
            className="h-full bg-green-500/80 transition-all duration-300"
            style={{ width: '25%' }}
          />
        </div>

        {/* Zone labels */}
        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
          <span className="text-xs font-medium text-white/90 drop-shadow">Low</span>
          <span className="text-xs font-medium text-white/90 drop-shadow">Partial</span>
          <span className="text-xs font-medium text-white/90 drop-shadow">Strong</span>
        </div>

        {/* Pointer/needle */}
        <div 
          className="absolute top-0 bottom-0 w-1 transition-all duration-700 ease-out"
          style={{ left: pointerPosition, transform: 'translateX(-50%)' }}
        >
          {/* Pointer line */}
          <div className="h-full w-1 bg-foreground shadow-lg" />
          
          {/* Pointer triangle (top) */}
          <div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-foreground drop-shadow-lg"
          />
          
          {/* Pointer triangle (bottom) */}
          <div 
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-foreground drop-shadow-lg"
          />
        </div>
      </div>

      {/* Scale markers */}
      <div className="relative w-full mt-2 px-2">
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Center percentage display */}
      <div className="flex flex-col items-center justify-center mt-6">
        <div className="text-5xl font-bold text-foreground">
          {percentage}%
        </div>
        <div className="text-sm text-muted-foreground font-medium mt-1">
          Aligned
        </div>
      </div>

      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-200 z-10">
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">✅ Aligned:</span>
              <span className="font-semibold text-foreground">{aligned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">🟡 Partial:</span>
              <span className="font-semibold text-foreground">{partial}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">❌ Not aligned:</span>
              <span className="font-semibold text-foreground">{notAligned}</span>
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-popover"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AlignmentWidget = () => {
  const [selectedFramework, setSelectedFramework] = useState<Framework>("onet");
  const currentData = frameworkData[selectedFramework];
  const totalCompetencies = currentData.aligned + currentData.partial + currentData.notAligned;

  const handleViewBreakdown = () => {
    // Removed toast functionality
    console.log("Coverage Breakdown view would open here with detailed heatmap/bar charts");
  };

  return (
    <Card className="w-full max-w-2xl bg-gradient-to-br from-card to-card/50 border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold text-foreground">External Benchmark Alignment</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Compare your competency library against global standards
          </p>
        </div>
        <Select value={selectedFramework} onValueChange={(value) => setSelectedFramework(value as Framework)}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="onet">O*NET</SelectItem>
            <SelectItem value="skillsfuture">SkillsFuture</SelectItem>
            <SelectItem value="esco">ESCO</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gauge Section */}
      <div className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <BenchmarkGauge
            percentage={currentData.percentage}
            aligned={currentData.aligned}
            partial={currentData.partial}
            notAligned={currentData.notAligned}
          />
          
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              Based on{" "}
              <Badge variant="secondary" className="ml-1">
                {currentData.name} {currentData.version}
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground">
              {currentData.aligned + currentData.partial} / {totalCompetencies} competencies matched
            </p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="px-6 pb-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {currentData.aligned}
            </div>
            <div className="text-xs text-muted-foreground mt-1">✅ Aligned</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {currentData.partial}
            </div>
            <div className="text-xs text-muted-foreground mt-1">🟡 Partial</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {currentData.notAligned}
            </div>
            <div className="text-xs text-muted-foreground mt-1">❌ Not Aligned</div>
          </div>
        </div>

        <Button 
          onClick={handleViewBreakdown}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          View Coverage Breakdown
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default AlignmentWidget;