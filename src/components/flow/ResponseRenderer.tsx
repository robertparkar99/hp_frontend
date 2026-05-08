"use client";

import React, { useState } from 'react';

type MarkdownComponents = {
  h1?: React.ComponentType<{ children?: React.ReactNode }>;
  h2?: React.ComponentType<{ children?: React.ReactNode }>;
  h3?: React.ComponentType<{ children?: React.ReactNode }>;
  p?: React.ComponentType<{ children?: React.ReactNode }>;
  ul?: React.ComponentType<{ children?: React.ReactNode }>;
  ol?: React.ComponentType<{ children?: React.ReactNode }>;
  li?: React.ComponentType<{ children?: React.ReactNode }>;
  code?: React.ComponentType<{ children?: React.ReactNode }>;
  pre?: React.ComponentType<{ children?: React.ReactNode }>;
  strong?: React.ComponentType<{ children?: React.ReactNode }>;
  em?: React.ComponentType<{ children?: React.ReactNode }>;
  a?: React.ComponentType<{ href?: string; children?: React.ReactNode }>;
};

// Lightweight markdown fallback used when `react-markdown` is not installed.
// It supports the component overrides used below for common markdown blocks.
const ReactMarkdown = ({
  children,
  components = {},
}: {
  children: string;
  components?: MarkdownComponents;
}) => {
  if (!children) {
    return <div className="text-gray-500 text-sm">No content</div>;
  }

  const {
    h1: H1 = ({ children }) => <h1>{children}</h1>,
    h2: H2 = ({ children }) => <h2>{children}</h2>,
    h3: H3 = ({ children }) => <h3>{children}</h3>,
    p: P = ({ children }) => <p>{children}</p>,
    ul: UL = ({ children }) => <ul>{children}</ul>,
    ol: OL = ({ children }) => <ol>{children}</ol>,
    li: LI = ({ children }) => <li>{children}</li>,
    code: Code = ({ children }) => <code>{children}</code>,
    pre: Pre = ({ children }) => <pre>{children}</pre>,
    strong: Strong = ({ children }) => <strong>{children}</strong>,
    em: Em = ({ children }) => <em>{children}</em>,
    a: A = ({ href, children }) => <a href={href}>{children}</a>,
  } = components;

  const lines = children.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let listItems: string[] = [];
  let orderedListItems: string[] = [];
  let codeBuffer: string[] = [];
  let inCodeBlock = false;

  const renderInline = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g).filter(Boolean);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Strong key={index}>{part.slice(2, -2)}</Strong>;
      }
      if (
        part.startsWith('*') &&
        part.endsWith('*') &&
        !part.startsWith('**') &&
        !part.endsWith('**')
      ) {
        return <Em key={index}>{part.slice(1, -1)}</Em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <Code key={index}>{part.slice(1, -1)}</Code>;
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <A key={index} href={linkMatch[2]}>
            {linkMatch[1]}
          </A>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    elements.push(<P key={`p-${elements.length}`}>{renderInline(paragraphBuffer.join(' '))}</P>);
    paragraphBuffer = [];
  };

  const flushUnorderedList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <UL key={`ul-${elements.length}`}>
        {listItems.map((item, index) => (
          <LI key={index}>{renderInline(item)}</LI>
        ))}
      </UL>
    );
    listItems = [];
  };

  const flushOrderedList = () => {
    if (orderedListItems.length === 0) return;
    elements.push(
      <OL key={`ol-${elements.length}`}>
        {orderedListItems.map((item, index) => (
          <LI key={index}>{renderInline(item)}</LI>
        ))}
      </OL>
    );
    orderedListItems = [];
  };

  const flushCodeBlock = () => {
    if (codeBuffer.length === 0) return;
    elements.push(
      <Pre key={`pre-${elements.length}`}>
        <Code>{codeBuffer.join('\n')}</Code>
      </Pre>
    );
    codeBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      elements.push(<H3 key={`h3-${elements.length}`}>{renderInline(trimmed.slice(4))}</H3>);
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      elements.push(<H2 key={`h2-${elements.length}`}>{renderInline(trimmed.slice(3))}</H2>);
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      elements.push(<H1 key={`h1-${elements.length}`}>{renderInline(trimmed.slice(2))}</H1>);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      flushOrderedList();
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      flushUnorderedList();
      orderedListItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  flushUnorderedList();
  flushOrderedList();
  flushCodeBlock();

  return <>{elements}</>;
};
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from 'recharts';
import {
  LayoutGrid, List, BarChart3, Table2, Zap, FileText, ChevronRight,
  CheckCircle, Circle, AlertCircle, Clock, ArrowRight, Target,
  GripVertical, Sparkles
} from 'lucide-react';
import {
  UIBlock,
  TextBlock,
  TableBlock,
  CardsBlock,
  ChartBlock,
  TimelineBlock,
  StepsBlock,
  ListBlock,
  QuerySuggestionsBlock,
  UIBlockType,
  StructuredResponse
} from '@/types/flow-output';

interface ResponseRendererProps {
  response: StructuredResponse;
  className?: string;
  onAction?: (action: string, value?: any) => void;
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ response, className = '', onAction }) => {
  const [activeBlock, setActiveBlock] = useState<number>(0);

  if (!response?.blocks || response.blocks.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-500">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">No content to display</span>
      </div>
    );
  }

  // Separate SQL query blocks from regular blocks
  const sqlQueryBlocks = response.blocks.filter(block => block.title === 'View SQL Query');
  const regularBlocks = response.blocks.filter(block => block.title !== 'View SQL Query');

  if (regularBlocks.length === 1) {
    return (
      <div className={className}>
        {renderBlockTitle(regularBlocks[0])}
        {renderBlock(regularBlocks[0], onAction)}
        {sqlQueryBlocks.map((block, index) => (
          <div key={`sql-${index}`} className="mt-4">
            {renderBlockTitle(block)}
            {renderBlock(block, onAction)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs value={String(activeBlock)} onValueChange={(v) => setActiveBlock(Number(v))}>
        <TabsList className="mb-4 flex flex-wrap justify-start h-auto gap-1 bg-transparent">
          {regularBlocks.map((block, index) => (
            <TabsTrigger
              key={index}
              value={String(index)}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              {block.title || getBlockTypeLabel(block.type)}
            </TabsTrigger>
          ))}
        </TabsList>
        {regularBlocks.map((block, index) => (
          <TabsContent key={index} value={String(index)}>
            {renderBlockTitle(block)}
            {renderBlock(block, onAction)}
          </TabsContent>
        ))}
      </Tabs>
      {sqlQueryBlocks.map((block, index) => (
        <div key={`sql-${index}`} className="mt-4">
          {renderBlockTitle(block)}
          {renderBlock(block, onAction)}
        </div>
      ))}
    </div>
  );
};

function renderBlockTitle(block: UIBlock) {
  if (block.title) {
    return (
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {block.title}
      </h3>
    );
  }
  return null;
}

function getBlockTypeLabel(type: UIBlockType): string {
  const labels: Record<UIBlockType | string, string> = {
    text: 'Text',
    table: 'Table',
    cards: 'Cards',
    chart: 'Chart',
    timeline: 'Timeline',
    steps: 'Steps',
    list: 'List',
    'attendance-summary': 'Attendance Summary',
    'query-suggestions': 'Suggested Queries'
  };
  return labels[type] || type;
}

function renderBlock(block: UIBlock, onAction?: (action: string, value?: any) => void): React.ReactNode {
  switch (block.type) {
    case 'text':
      return <TextBlockRenderer content={(block as TextBlock).content} />;
    case 'table':
      return <TableBlockRenderer {...(block as TableBlock).data} />;
    case 'cards':
      return <CardsBlockRenderer cards={(block as CardsBlock).data} onAction={onAction} />;
    case 'chart':
      return <ChartBlockRenderer config={(block as ChartBlock).config} data={(block as ChartBlock).data} />;
    case 'timeline':
      return <TimelineBlockRenderer items={(block as TimelineBlock).data} />;
    case 'steps':
      return <StepsBlockRenderer steps={(block as StepsBlock).data} />;
    case 'list':
      return <ListBlockRenderer items={(block as ListBlock).data} />;
    case 'attendance-summary' as UIBlockType:
      return <AttendanceSummaryBlockRenderer data={(block as any).data} />;
    case 'query-suggestions':
      return <QuerySuggestionsBlockRenderer suggestions={(block as QuerySuggestionsBlock).data} onAction={onAction} />;
    default:
      return <div className="text-gray-500 text-sm">Unsupported format</div>;
  }
}

function TextBlockRenderer({ content, className = '' }: { content: string; className?: string }) {
  if (!content) {
    return <div className="text-gray-500 text-sm p-4">No content available</div>;
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-800 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-gray-800 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-gray-700 mb-2 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-gray-700">{children}</li>,
          code: ({ children }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
          pre: ({ children }) => <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto mb-3 text-xs">{children}</pre>,
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline">{children}</a>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function TableBlockRenderer({
  columns,
  rows,
  className = ''
}: {
  columns: Array<{ key: string; label: string }>;
  rows: any[];
  className?: string;
}) {
  if (!rows || rows.length === 0) {
    return <div className="text-gray-500 text-sm p-4">No data available</div>;
  }

  return (
    <div className={`rounded-lg border overflow-hidden ${className}`}>
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((col) => (
                <TableHead key={col.key} className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => {
                  // Only show data for defined columns, ignore other properties
                  const cellValue = row.hasOwnProperty(col.key) ? row[col.key] : '-';
                  return (
                    <TableCell key={col.key} className="text-sm text-gray-700">
                      {cellValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CardsBlockRenderer({
  cards,
  columns = 2,
  onAction
}: {
  cards: Array<{
    id?: string | number;
    title: string;
    description?: string;
    imageUrl?: string;
    tag?: string;
    metadata?: Record<string, any>;
    actions?: Array<{ label: string; action: string; value?: any }>;
  }>;
  columns?: number;
  onAction?: (action: string, value?: any) => void;
}) {
  if (!cards || cards.length === 0) {
    return <div className="text-gray-500 text-sm p-4">No cards available</div>;
  }

  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  }[columns] || 'grid-cols-1 md:grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {cards.map((card, index) => (
        <Card 
          key={card.id || index} 
          className="hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-blue-300"
        >
          {card.imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
            </div>
          )}
          <CardHeader className="pb-2">
            {card.tag && (
              <Badge variant="secondary" className="w-fit mb-2">
                {card.tag}
              </Badge>
            )}
            <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {card.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{card.description}</p>
            )}
            {card.metadata && Object.keys(card.metadata).length > 0 && (
              <div className="space-y-1.5 mb-3 text-xs">
                {Object.entries(card.metadata).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500 capitalize">{key}:</span>
                    <span className="font-medium text-gray-700 truncate ml-2">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
            {card.actions && card.actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {card.actions.map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    variant={actionIndex === 0 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onAction?.(action.action, action.value)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartBlockRenderer({
  config,
  data,
  className = ''
}: {
  config: {
    chartType: 'bar' | 'line' | 'pie' | 'donut' | 'radar' | 'area';
    xKey: string;
    yKey?: string;
    dataKey?: string;
    colors?: string[];
  };
  data: any[];
  className?: string;
}) {
  const colors = config.colors || DEFAULT_COLORS;

  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-sm p-4">No data available for chart</div>;
  }

  // Validate data structure
  if (!data.every(item => item[config.xKey] !== undefined && item[config.dataKey || config.yKey || 'value'] !== undefined)) {
    return <div className="text-gray-500 text-sm p-4">Invalid chart data format</div>;
  }

  const renderChart = () => {
    switch (config.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={config.xKey} tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip />
              <Bar 
                dataKey={config.dataKey || config.yKey || 'value'} 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={config.xKey} tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={config.dataKey || config.yKey || 'value'} 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={config.xKey} tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={config.dataKey || config.yKey || 'value'} 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey={config.dataKey || 'value'}
                nameKey={config.xKey}
                cx="50%"
                cy="50%"
                innerRadius={config.chartType === 'donut' ? 60 : 0}
                outerRadius={100}
                label
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey={config.xKey} tick={{ fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              <Radar
                name="Value"
                dataKey={config.dataKey || 'value'}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-gray-500">Unknown chart type</div>;
    }
  };

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      {renderChart()}
    </div>
  );
}

function TimelineBlockRenderer({
  items,
  className = ''
}: {
  items: Array<{
    id: string | number;
    title: string;
    description?: string;
    timestamp?: string;
    status?: 'completed' | 'in_progress' | 'pending' | 'current';
  }>;
  className?: string;
}) {
  if (!items || items.length === 0) {
    return <div className="text-gray-500 text-sm p-4">No timeline items</div>;
  }

  return (
    <div className={`space-y-0 ${className}`}>
      {items.map((item, index) => (
        <div key={item.id || index} className="relative flex gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full z-10 ${
              item.status === 'completed' ? 'bg-green-500' :
              item.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
              item.status === 'current' ? 'bg-amber-500' :
              'bg-gray-300'
            }`} />
            {index < items.length - 1 && (
              <div className={`w-0.5 h-full -mt-1 ${
                item.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
          <div className={`flex-1 pb-2 ${
            item.status === 'completed' ? 'opacity-60' : ''
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  item.status === 'completed' ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                )}
              </div>
              {item.timestamp && (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {item.timestamp}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepsBlockRenderer({
  steps,
  currentStep,
  className = ''
}: {
  steps: Array<{
    key: string;
    label: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'current';
  }>;
  currentStep?: string;
  className?: string;
}) {
  if (!steps || steps.length === 0) {
    return <div className="text-gray-500 text-sm p-4">No steps</div>;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {steps.map((step, index) => {
        const status = step.key === currentStep ? 'current' : step.status;
        return (
          <div
            key={step.key}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              status === 'completed' ? 'bg-green-50' :
              status === 'in_progress' || status === 'current' ? 'bg-blue-50' :
              'bg-gray-50'
            }`}
          >
            <div className="flex-shrink-0">
              {status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : status === 'in_progress' || status === 'current' ? (
                <div className="h-5 w-5 rounded-full bg-blue-600 animate-pulse" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <span className={`text-sm ${
              status === 'completed' ? 'text-green-800' :
              status === 'in_progress' || status === 'current' ? 'text-blue-800' :
              'text-gray-600'
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ListBlockRenderer({
  items,
  className = ''
}: {
  items: Array<{
    id?: string | number;
    label: string;
    value?: any;
    icon?: string;
  }>;
  className?: string;
}) {
  if (!items || items.length === 0) {
    return <div className="text-gray-500 text-sm p-4">No items</div>;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {items.map((item, index) => (
        <div 
          key={item.id || index}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700">{item.label}</span>
          {item.value !== undefined && (
            <span className="ml-auto text-xs text-gray-500">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function AttendanceSummaryBlockRenderer({
  data,
  className = ''
}: {
  data: {
    totalRecords: number;
    presentDays: number;
    absentDays: number;
    attendancePercentage: string;
  };
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <Card className="text-center">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{data.totalRecords}</div>
        </CardContent>
      </Card>

      <Card className="text-center">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Present Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{data.presentDays}</div>
        </CardContent>
      </Card>

      <Card className="text-center">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Absent Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{data.absentDays}</div>
        </CardContent>
      </Card>

      <Card className="text-center">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{data.attendancePercentage}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuerySuggestionsBlockRenderer({
  suggestions,
  onAction,
  className = ''
}: {
  suggestions: string[];
  onAction?: (action: string, value?: any) => void;
  className?: string;
}) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4">
        No query suggestions available
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm text-gray-600 mb-2">
        💡 Try asking these related questions:
      </div>
      <div className="grid gap-2">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group"
            onClick={() => onAction?.('query_suggestion', suggestion)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {suggestion}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderSqlSection() {
  if (!sql) return null;

  return (
    <div className="mt-4">
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <button
            onClick={() => {/* TODO: implement show/hide SQL logic */}}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors w-full text-left"
          >
            <FileText className="h-4 w-4 text-blue-600" />
            View SQL Query
            <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${false ? 'rotate-90' : ''}`} />
          </button>
        </CardHeader>
        {false && (
          <CardContent className="pt-0">
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{sql || ''}</pre>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function renderFeedbackButtons() {
  if (!onFeedback) return null;

  return (
    <div className="mt-4">
      <Card className="border-gray-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Was this helpful?</span>
            <div className="flex gap-2">
              <button
                onClick={() => onFeedback(1)}
                className={`p-2 rounded-full transition-colors ${
                  feedbackRating === 1
                    ? 'bg-green-100 text-green-600 border border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
              </button>
              <button
                onClick={() => onFeedback(-1)}
                className={`p-2 rounded-full transition-colors ${
                  feedbackRating === -1
                    ? 'bg-red-100 text-red-600 border border-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <ThumbsDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResponseRenderer;
export { TextBlockRenderer, TableBlockRenderer, CardsBlockRenderer, ChartBlockRenderer, TimelineBlockRenderer, StepsBlockRenderer, ListBlockRenderer, QuerySuggestionsBlockRenderer };
