export type UIBlockType = 'text' | 'table' | 'cards' | 'chart' | 'timeline' | 'steps' | 'list' | 'attendance-summary' | 'query-suggestions';

export interface BaseUIBlock {
  type: UIBlockType;
  title?: string;
  description?: string;
}

export interface TextBlock extends BaseUIBlock {
  type: 'text';
  content: string;
}

export interface TableBlock extends BaseUIBlock {
  type: 'table';
  data: {
    columns: Array<{ key: string; label: string; sortable?: boolean; render?: string }>;
    rows: any[];
  };
}

export interface CardItem {
  id?: string | number;
  title: string;
  description?: string;
  imageUrl?: string;
  tag?: string;
  metadata?: Record<string, any>;
  actions?: Array<{ label: string; action: string; value?: any }>;
}

export interface CardsBlock extends BaseUIBlock {
  type: 'cards';
  data: CardItem[];
}

export interface ChartBlock extends BaseUIBlock {
  type: 'chart';
  config: {
    chartType: 'bar' | 'line' | 'pie' | 'donut' | 'radar';
    xKey: string;
    yKey?: string;
    dataKey?: string;
    colors?: string[];
  };
  data: any[];
}

export interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  timestamp?: string;
  status?: 'completed' | 'in_progress' | 'pending' | 'current';
}

export interface TimelineBlock extends BaseUIBlock {
  type: 'timeline';
  data: TimelineItem[];
}

export interface StepItem {
  key: string;
  label: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'current';
}

export interface StepsBlock extends BaseUIBlock {
  type: 'steps';
  data: StepItem[];
}

export interface ListItem {
  id?: string | number;
  label: string;
  value?: any;
  icon?: string;
}

export interface ListBlock extends BaseUIBlock {
  type: 'list';
  data: ListItem[];
}

export interface QuerySuggestionItem {
  text: string;
  description: string;
  intent: string;
}

export interface QuerySuggestionsBlock extends BaseUIBlock {
  type: 'query-suggestions';
  data: QuerySuggestionItem[];
}

export type UIBlock =
  | TextBlock
  | TableBlock
  | CardsBlock
  | ChartBlock
  | TimelineBlock
  | StepsBlock
  | ListBlock
  | QuerySuggestionsBlock;

export interface StructuredResponse {
  blocks: UIBlock[];
  intent: string;
  nextAction?: {
    type: 'continue' | 'form' | 'escalate' | 'none';
    prompt?: string;
    fields?: Array<{ name: string; label: string; type: string; required?: boolean }>;
  };
}

export interface TextBlockProps {
  content: string;
  className?: string;
}

export interface TableBlockProps {
  columns: Array<{ key: string; label: string; sortable?: boolean }>;
  rows: any[];
  className?: string;
}

export interface CardsBlockProps {
  cards: CardItem[];
  columns?: number;
  className?: string;
}

export interface ChartBlockProps {
  config: ChartBlock['config'];
  data: any[];
  className?: string;
}

export interface TimelineBlockProps {
  items: TimelineItem[];
  className?: string;
}

export interface StepsBlockProps {
  steps: StepItem[];
  currentStep?: string;
  className?: string;
}