import {
  UIBlock,
  TextBlock,
  TableBlock,
  CardsBlock,
  ChartBlock,
  TimelineBlock,
  StepsBlock,
  ListBlock,
  StructuredResponse,
  UIBlockType,
  CardItem,
  TimelineItem,
  StepItem,
  ListItem
} from '@/types/flow-output';

export function createTextBlock(content: string, options?: { title?: string; description?: string }): TextBlock {
  return {
    type: 'text',
    content,
    ...options
  };
}

export function createTableBlock(
  columns: Array<{ key: string; label: string; sortable?: boolean }>,
  rows: any[],
  options?: { title?: string; description?: string }
): TableBlock {
  return {
    type: 'table',
    data: { columns, rows },
    ...options
  };
}

export function createCardsBlock(
  cards: CardItem[],
  options?: { title?: string; description?: string }
): CardsBlock {
  return {
    type: 'cards',
    data: cards,
    ...options
  };
}

export function createChartBlock(
  config: {
    chartType: 'bar' | 'line' | 'pie' | 'donut' | 'radar' | 'area';
    xKey: string;
    yKey?: string;
    dataKey?: string;
    colors?: string[];
  },
  data: any[],
  options?: { title?: string; description?: string }
): ChartBlock {
  return {
    type: 'chart',
    config: {
      chartType: config.chartType === 'area' ? 'line' : config.chartType,
      xKey: config.xKey,
      yKey: config.yKey,
      dataKey: config.dataKey,
      colors: config.colors
    },
    data,
    ...options
  };
}

export function createTimelineBlock(
  items: TimelineItem[],
  options?: { title?: string; description?: string }
): TimelineBlock {
  return {
    type: 'timeline',
    data: items,
    ...options
  };
}

export function createStepsBlock(
  steps: StepItem[],
  options?: { title?: string; description?: string }
): StepsBlock {
  return {
    type: 'steps',
    data: steps,
    ...options
  };
}

export function createListBlock(
  items: ListItem[],
  options?: { title?: string; description?: string }
): ListBlock {
  return {
    type: 'list',
    data: items,
    ...options
  };
}

export function createStructuredResponse(
  blocks: UIBlock[],
  options?: {
    intent?: string;
    nextAction?: StructuredResponse['nextAction'];
    sql?: string;
    tables_used?: string[];
    answer?: string;
  }
): StructuredResponse {
  return {
    blocks: blocks.filter(Boolean),
    intent: blocks.length > 0 ? guessIntent(blocks) : 'unknown',
    ...options
  };
}

function guessIntent(blocks: UIBlock[]): string {
  if (blocks.length === 0) return 'unknown';
  const firstBlock = blocks[0];
  
  switch (firstBlock.type) {
    case 'table':
      return 'data_retrieval';
    case 'cards':
      return 'list_items';
    case 'chart':
      return 'data_visualization';
    case 'timeline':
      return 'timeline_view';
    case 'steps':
      return 'process_view';
    case 'list':
      return 'list_items';
    case 'text':
    default:
      return 'text_response';
  }
}

export function createMarkdownTable(
  headers: string[],
  rows: any[][],
  title?: string
): TextBlock {
  let md = '';
  
  if (title) {
    md += `### ${title}\n\n`;
  }
  
  md += '| ' + headers.join(' | ') + ' |\n';
  md += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
  
  rows.forEach(row => {
    md += '| ' + row.join(' | ') + ' |\n';
  });
  
  return createTextBlock(md);
}

export function createSimpleCards(
  items: Array<{ name: string; description?: string; tag?: string; [key: string]: any }>,
  title?: string
): CardsBlock {
  const cards: CardItem[] = items.map((item, index) => ({
    id: index,
    title: item.name,
    description: item.description,
    tag: item.tag,
    metadata: Object.fromEntries(
      Object.entries(item).filter(([key]) => !['name', 'description', 'tag'].includes(key))
    )
  }));
  
  return createCardsBlock(cards, { title });
}

export function createSimpleChart(
  items: Array<{ name: string; value: number }>,
  chartType: 'bar' | 'line' | 'pie' | 'radar',
  title?: string
): ChartBlock {
  return createChartBlock(
    {
      chartType,
      xKey: 'name',
      dataKey: 'value'
    },
    items,
    { title }
  );
}

export function createDepartmentQueryResponse(departments: any[]): StructuredResponse {
  const summaryText = `The query successfully retrieved all departments from the database, returning a total of ${departments.length} rows.`;

  const listBlock = createListBlock(
    departments.map(dept => ({
      label: dept.department || dept.name || dept.departmentName,
      value: dept.status || 'Active'
    })),
    {
      title: 'All Departments',
      description: `Showing ${departments.length} departments with their details`
    }
  );

  return createStructuredResponse([
    createTextBlock(summaryText),
    listBlock
  ], {
    intent: 'data_retrieval'
  });
}

export function createUserQueryResponse(users: any[]): StructuredResponse {
  const summaryText = `The query successfully retrieved all users from the database, returning a total of ${users.length} rows.`;

  const tableBlock = createTableBlock(
    [
      { key: 'id', label: 'User ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      // { key: 'created_at', label: 'Created At' }
    ],
    users.map(user => ({
      id: user.id,
      name: user.name || user.user_name,
      email: user.email,
      created_at: user.created_at || user.createdAt
    })),
    {
      title: 'All Users',
      description: `Showing ${users.length} users with their details`
    }
  );

  return createStructuredResponse([
    createTextBlock(summaryText),
    tableBlock
  ], {
    intent: 'data_retrieval'
  });
}

/**
 * Automatically chooses the best UI format based on query analysis
 * This is the "perfect mock query UI" system you requested
 */
export function createIntelligentQueryResponse(
  query: string,
  data: any
): StructuredResponse {
  const query_lower = query.toLowerCase();

  // Analyze query to determine intent and best UI format
  if (query_lower.includes('department') || query_lower.includes('departments')) {
    if (Array.isArray(data) && data.length > 0) {
      return createDepartmentQueryResponse(data);
    }
  }

  if (query_lower.includes('user') || query_lower.includes('users')) {
    if (Array.isArray(data) && data.length > 0) {
      return createUserQueryResponse(data);
    }
  }

  // For employee data (mock queries) - improved detection
  const isEmployeeData = (
    query_lower.includes('employee') ||
    query_lower.includes('show employee data') ||
    (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === 'object' &&
     ('name' in data[0] || 'email' in data[0] || 'role' in data[0] || 'occupation' in data[0]))
  );

  if (isEmployeeData && Array.isArray(data) && data.length > 0) {
    const summaryText = `Found ${data.length} employee records.`;
    const tableBlock = createTableBlock(
      [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'email', label: 'Email' },
        { key: 'occupation', label: 'Occupation' }
      ],
      data,
      {
        title: 'Employee Records',
        description: `Showing ${data.length} employees with their details`
      }
    );

    // Create a text block for summary
    const textBlock = createTextBlock(summaryText, { title: 'Summary' });

    // Create SQL query block
    const sqlBlock = {
      type: 'text' as const,
      title: 'View SQL Query',
      content: `\`\`\`sql\nSELECT name, role, email, occupation FROM employee_data LIMIT ${data.length};\n\`\`\``
    };

    // Create query suggestions block
    const querySuggestionsBlock = {
      type: 'query-suggestions' as const,
      title: 'Related Queries',
      data: [
        { text: 'Show employee data by department', description: 'View employees organized by their departments', intent: 'data_retrieval' },
        { text: 'List all employees', description: 'Get a complete list of all employees', intent: 'data_retrieval' },
        { text: 'Get employee contact information', description: 'Access employee contact details and communication info', intent: 'data_retrieval' }
      ]
    };

    return createStructuredResponse([
      textBlock,
      tableBlock,
      sqlBlock,
      querySuggestionsBlock
    ], {
      intent: 'data_retrieval',
      sql: `SELECT name, role, email, occupation FROM employee_data LIMIT ${data.length};`,
      tables_used: ['employee_data'],
      answer: summaryText
    });
  }

  // For skill-related queries
  if (query_lower.includes('skill') || query_lower.includes('competency')) {
    if (Array.isArray(data)) {
      if (data.length > 10) {
        // Large dataset - use table
        // Check if data has 'level' field, if not, use available fields
        const hasLevel = data.length > 0 && 'level' in data[0];
        const columns = hasLevel ?
          [
            { key: 'name', label: 'Skill Name' },
            { key: 'level', label: 'Level' },
            { key: 'category', label: 'Category' }
          ] :
          [
            { key: 'name', label: 'Skill Name' },
            { key: 'category', label: 'Category' }
          ];
        return createStructuredResponse([
          createTextBlock(`Found ${data.length} skills/competencies.`),
          createTableBlock(columns, data, { title: 'Skills & Competencies' })
        ], { intent: 'data_retrieval' });
      } else {
        // Small dataset - use cards
        return createStructuredResponse([
          createTextBlock(`Found ${data.length} skills/competencies.`),
          createCardsBlock(data.map(skill => ({
            id: skill.id || skill.name,
            title: skill.name,
            description: skill.description || skill.category,
            tag: skill.category,
            metadata: skill
          })), { title: 'Skills & Competencies' })
        ], { intent: 'list_items' });
      }
    }
  }

  // For chart/visualization queries
  if (query_lower.includes('chart') || query_lower.includes('graph') || query_lower.includes('visualize')) {
    if (Array.isArray(data) && data.every(item => typeof item === 'object' && 'value' in item)) {
      return createStructuredResponse([
        createChartBlock({
          chartType: 'bar',
          xKey: 'name',
          dataKey: 'value'
        }, data, { title: 'Data Visualization' })
      ], { intent: 'data_visualization' });
    }
  }

  // For process/step queries
  if (query_lower.includes('process') || query_lower.includes('steps') || query_lower.includes('workflow')) {
    if (Array.isArray(data)) {
      const steps = data.map((item, index) => ({
        key: String(index),
        label: item.title || item.name || item.step,
        status: item.status || 'pending'
      }));
      return createStructuredResponse([
        createStepsBlock(steps, { title: 'Process Steps' })
      ], { intent: 'process_view' });
    }
  }

  // For timeline queries
  if (query_lower.includes('timeline') || query_lower.includes('history') || query_lower.includes('events')) {
    if (Array.isArray(data)) {
      const timelineItems = data.map((item, index) => ({
        id: index,
        title: item.title || item.event,
        description: item.description,
        timestamp: item.date || item.timestamp,
        status: item.status as 'completed' | 'in_progress' | 'pending' | 'current' | undefined
      }));
      return createStructuredResponse([
        createTimelineBlock(timelineItems, { title: 'Timeline' })
      ], { intent: 'timeline_view' });
    }
  }

  // Default fallback - analyze data structure
  return adaptLegacyOutput(data);
}

export function createProgressSteps(
  items: string[],
  currentIndex?: number
): StepsBlock {
  const steps: StepItem[] = items.map((label, index) => ({
    key: String(index),
    label,
    status: index < (currentIndex || 0) ? 'completed' :
           index === currentIndex ? 'current' : 'pending'
  }));
  
  return createStepsBlock(steps);
}

export function adaptLegacyOutput(
  output: any,
  options?: { defaultType?: UIBlockType }
): StructuredResponse {
  if (!output) {
    return createStructuredResponse([createTextBlock('No data available')]);
  }

  if (typeof output === 'string') {
    return createStructuredResponse([createTextBlock(output)]);
  }

  if (Array.isArray(output)) {
    if (output.length === 0) {
      return createStructuredResponse([createTextBlock('No items found')]);
    }

    const firstItem = output[0];

    if (typeof firstItem === 'string') {
      const items: ListItem[] = output.map((label, index) => ({ id: index, label: String(label) }));
      return createStructuredResponse([createListBlock(items)]);
    }

    if (typeof firstItem === 'object') {
      const keys = Object.keys(firstItem);
      
      if (keys.includes('title') || keys.includes('name')) {
        const cards = output.map((item, index) => ({
          id: item.id || index,
          title: item.title || item.name || 'Untitled',
          description: item.description || item.desc,
          tag: item.tag || item.category,
          metadata: item
        }));
        return createStructuredResponse([createCardsBlock(cards)]);
      }

      const columns = keys.map(key => ({ key, label: formatLabel(key) }));
      return createStructuredResponse([createTableBlock(columns, output)]);
    }

    return createStructuredResponse([createTextBlock(JSON.stringify(output, null, 2))]);
  }

  if (typeof output === 'object') {
    if (output.data && Array.isArray(output.data)) {
      return adaptLegacyOutput(output.data, options);
    }

    if (output.competencyData) {
      const competencyData = output.competencyData;
      const blocks: UIBlock[] = [];

      if (competencyData.skills) {
        const skillData = competencyData.skills.map((s: any) => ({
          name: s.title,
          value: s.level || 0
        }));
        blocks.push(createChartBlock({ chartType: 'radar', xKey: 'name', dataKey: 'value' }, skillData, { title: 'Skills Radar' }));
      }

      if (competencyData.cwf_items) {
        const taskData = competencyData.cwf_items.map((cwf: any, index: number) => ({
          id: index,
          title: cwf.critical_work_function,
          description: cwf.key_tasks?.join(', '),
          status: 'completed' as const
        }));
        blocks.push(createTimelineBlock(taskData, { title: 'Critical Work Functions' }));
      }

      return createStructuredResponse(blocks);
    }

    if (output.selectionOptions || output.nextStep) {
      const options = output.selectionOptions || [];
      const items: ListItem[] = options.map((opt: any, index: number) => ({
        id: opt.id || index,
        label: opt.name || opt.label || String(opt),
        value: opt.expectedProficiency || opt.proficiencyLevel
      }));

      const stepLabel = getStepLabel(output.nextStep);
      return createStructuredResponse([createListBlock(items, { title: stepLabel })]);
    }

    return createStructuredResponse([createTextBlock(JSON.stringify(output, null, 2))]);
  }

  return createStructuredResponse([createTextBlock(String(output))]);
}

function formatLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function getStepLabel(step: string): string {
  const labels: Record<string, string> = {
    industry: 'Select Industry',
    department: 'Select Department',
    jobRole: 'Select Job Role',
    skills: 'Assess Skills',
    tasks: 'View Tasks',
    rating_prompt: 'Rate Your Skills',
    skill_rating: 'Skill Ratings',
    complete: 'Analysis Complete',
    skill_gap_report: 'Skill Gap Report'
  };
  return labels[step] || `Select ${step}`;
}