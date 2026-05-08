"use client";

import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutGrid, List, BarChart3, Table2, Zap, 
  ChevronRight, CheckCircle, Circle, AlertCircle 
} from 'lucide-react';
// Define local type aliases to avoid missing import errors
type FlowOutput = any;
type FlowViewType = 'list' | 'table' | 'cards' | 'chart' | 'overview' | 'radar' | 'steps';
type FlowColumn = { key: string; label: string; render?: (value: any, row: any) => React.ReactNode };
type FlowChartConfig = { type: string; xKey?: string; yKey?: string; dataKey?: string; colors?: string[] };
type FlowCardConfig = { titleKey?: string; descriptionKey?: string; metadataKeys?: string[] };
type FlowStepConfig = { steps: { key: string; label: string; status?: string }[] };

interface FlowOutputRendererProps {
  output: FlowOutput;
  className?: string;
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const FlowOutputRenderer: React.FC<FlowOutputRendererProps> = ({ output, className = '' }) => {
  const [activeView, setActiveView] = useState<FlowViewType>(output.config.viewType || 'list');
  
  if (!output?.data || output.data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <AlertCircle className="h-5 w-5 mr-2" />
        No data available
      </div>
    );
  }

  const renderListView = () => (
    <div className="space-y-2">
      {output.data.map((item: any, index: number) => (
        <div 
          key={index} 
          className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-4 w-4 mr-3 text-gray-400" />
          <span className="text-sm text-gray-700">
            {typeof item === 'object' ? item.name || item.title || JSON.stringify(item) : String(item)}
          </span>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => {
    const columns = output.config.columns || getDefaultColumns(output.data[0]);
    const data = output.data;
    
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col: FlowColumn) => (
                <TableHead key={col.key} className="text-xs font-medium text-gray-600">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row: any, rowIndex: number) => (
              <TableRow key={rowIndex}>
                {columns.map((col: FlowColumn) => (
                  <TableCell key={col.key} className="text-sm">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderCardView = () => {
    const config = output.config.cardConfig || {};
    const titleKey = config.titleKey || 'name';
    const descKey = config.descriptionKey || 'description';
    const metaKeys = config.metadataKeys || [];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {output.data.map((item: any, index: number) => (
          <div
            key={index}
            className="rounded-xl border border-gray-100 bg-gradient-to-br from-white via-gray-50 to-gray-50 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h4 className="font-semibold text-gray-900 mb-2">
              {item[titleKey] || item.title || `Item ${index + 1}`}
            </h4>
            {item[descKey] && (
              <p className="text-sm text-gray-600 mb-3">{item[descKey]}</p>
            )}
            {metaKeys.length > 0 && (
              <div className="space-y-1 text-xs text-gray-500">
                {metaKeys.map((key: string) => (
                  item[key] && (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key}:</span>
                      <span className="font-medium">{item[key]}</span>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderChartView = () => {
    const chartConfig = output.config.chartConfig || getDefaultChartConfig(output.data);
    
    if (chartConfig.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={output.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={chartConfig.xKey} tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip />
            <Bar dataKey={chartConfig.dataKey || chartConfig.yKey || 'value'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    if (chartConfig.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={output.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={chartConfig.xKey} tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey={chartConfig.dataKey || chartConfig.yKey || 'value'} 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    
    if (chartConfig.type === 'pie' || chartConfig.type === 'donut') {
      const colors = chartConfig.colors || DEFAULT_COLORS;
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={output.data}
              dataKey={chartConfig.dataKey || 'value'}
              nameKey={chartConfig.xKey}
              cx="50%"
              cy="50%"
              innerRadius={chartConfig.type === 'donut' ? 60 : 0}
              outerRadius={100}
              label
            >
              {output.data.map((_: any, index: number) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    
    return renderListView();
  };

  const renderRadarView = () => {
    const chartConfig = output.config.chartConfig || {};
    const xKey = chartConfig.xKey || 'category';
    const dataKey = chartConfig.dataKey || 'score';
    const colors = chartConfig.colors || DEFAULT_COLORS;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={output.data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <PolarRadiusAxis tick={{ fontSize: 10 }} />
          <Radar
            name="Current"
            dataKey={dataKey}
            stroke={colors[0]}
            fill={colors[0]}
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  const renderStepsView = () => {
    const stepConfig = output.config.stepConfig || { steps: [] };
    
    return (
      <div className="space-y-3">
        {stepConfig.steps.map((step: any, index: number) => (
          <div
            key={step.key}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              step.status === 'completed' ? 'bg-green-50' :
              step.status === 'in_progress' ? 'bg-blue-50' :
              step.status === 'current' ? 'bg-amber-50' :
              'bg-gray-50'
            }`}
          >
            {step.status === 'completed' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : step.status === 'in_progress' || step.status === 'current' ? (
              <div className="h-5 w-5 rounded-full bg-blue-600 animate-pulse" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
            <span className={`text-sm ${
              step.status === 'completed' ? 'text-green-800' :
              step.status === 'in_progress' ? 'text-blue-800' :
              step.status === 'current' ? 'text-amber-800' :
              'text-gray-600'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderOverviewView = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {output.data.slice(0, 4).map((item: any, index: number) => (
        <div key={index} className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-2xl font-bold text-blue-600">
            {typeof item === 'object' ? item.value || item.count || item.total : item}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {typeof item === 'object' ? item.label || item.name : `Item ${index + 1}`}
          </div>
        </div>
      ))}
    </div>
  );

  const renderViewSelector = () => {
    const views: FlowViewType[] = ['list', 'table', 'cards', 'chart', 'overview', 'radar', 'steps'];
    const viewIcons: Record<FlowViewType, React.ReactNode> = {
      list: <List className="h-4 w-4" />,
      table: <Table2 className="h-4 w-4" />,
      cards: <LayoutGrid className="h-4 w-4" />,
      chart: <BarChart3 className="h-4 w-4" />,
      overview: <Zap className="h-4 w-4" />,
      radar: <div className="h-4 w-4 text-center text-xs">◉</div>,
      steps: <div className="h-4 w-4 text-center text-xs">☰</div>,
    };
    const viewLabels: Record<FlowViewType, string> = {
      list: 'List',
      table: 'Table',
      cards: 'Cards',
      chart: 'Chart',
      overview: 'Overview',
      radar: 'Radar',
      steps: 'Steps'
    };

    return (
      <div className="flex gap-2 mb-4">
        {views.map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
              activeView === view 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {viewIcons[view]}
            {viewLabels[view]}
          </button>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'list':
        return renderListView();
      case 'table':
        return renderTableView();
      case 'cards':
        return renderCardView();
      case 'chart':
        return renderChartView();
      case 'overview':
        return renderOverviewView();
      case 'radar':
        return renderRadarView();
      case 'steps':
        return renderStepsView();
      default:
        return renderListView();
    }
  };

  return (
    <div className={`flow-output-renderer ${className}`}>
      {output.config.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {output.config.title}
        </h3>
      )}
      {output.config.description && (
        <p className="text-sm text-gray-600 mb-4">
          {output.config.description}
        </p>
      )}
      {renderViewSelector()}
      {renderContent()}
    </div>
  );
};

function getDefaultColumns(data: any): FlowColumn[] {
  if (!data || typeof data !== 'object') {
    return [{ key: 'value', label: 'Value' }];
  }
  return Object.keys(data).slice(0, 5).map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
  }));
}

function getDefaultChartConfig(data: any[]): FlowChartConfig {
  return {
    type: 'bar',
    xKey: 'name',
    dataKey: 'value',
    colors: DEFAULT_COLORS
  };
}

export default FlowOutputRenderer;