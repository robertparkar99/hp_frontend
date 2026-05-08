type FlowViewType = 'list' | 'table' | 'cards' | 'chart' | 'overview' | 'radar' | 'steps';

type FlowColumn = {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode | string;
};

type FlowChartConfig = {
  type?: string;
  xKey?: string;
  yKey?: string;
  dataKey?: string;
  colors?: string[];
};

type FlowCardConfig = {
  titleKey?: string;
  descriptionKey?: string;
  metadataKeys?: string[];
};

type FlowStepConfig = {
  steps: Array<{
    key: string;
    label: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'current';
  }>;
};

type FlowOutputConfig = {
  viewType: FlowViewType;
  title?: string;
  description?: string;
  columns?: FlowColumn[];
  chartConfig?: FlowChartConfig;
  cardConfig?: FlowCardConfig;
  stepConfig?: FlowStepConfig;
};

type FlowOutput = {
  data: any[];
  config: FlowOutputConfig;
  metadata?: {
    generated: boolean;
  };
};


export function createFlowOutput(
  data: any[],
  config: Partial<FlowOutputConfig>
): FlowOutput {
  return {
    data,
    config: {
      viewType: config.viewType || 'list',
      title: config.title,
      description: config.description,
      columns: config.columns,
      chartConfig: config.chartConfig,
      cardConfig: config.cardConfig,
      stepConfig: config.stepConfig,
    },
    metadata: config.title ? { generated: true } : undefined
  };
}

export function createListOutput(
  data: Array<{ id?: number; name: string; [key: string]: any }>,
  title?: string,
  description?: string
): FlowOutput {
  return createFlowOutput(data, { viewType: 'list', title, description });
}

export function createTableOutput(
  data: any[],
  columns: FlowColumn[],
  title?: string,
  description?: string
): FlowOutput {
  return createFlowOutput(data, { viewType: 'table', title, description, columns });
}

export function createCardsOutput(
  data: any[],
  cardConfig: FlowCardConfig,
  title?: string,
  description?: string
): FlowOutput {
  return createFlowOutput(data, { viewType: 'cards', title, description, cardConfig });
}

export function createChartOutput(
  data: any[],
  chartConfig: FlowChartConfig,
  title?: string,
  description?: string
): FlowOutput {
  return createFlowOutput(data, { viewType: 'chart', title, description, chartConfig });
}

export function createRadarOutput(
  data: any[],
  chartConfig: FlowChartConfig,
  title?: string,
  description?: string
): FlowOutput {
  return createFlowOutput(data, { viewType: 'radar', title, description, chartConfig });
}

export function createStepsOutput(
  steps: FlowStepConfig['steps'],
  currentStep?: string
): FlowOutput {
  const configuredSteps = steps.map((step) => ({
    ...step,
    status: step.key === currentStep ? 'current' : 
           step.status || 'pending' as const
  }));
  
  return createFlowOutput([], { 
    viewType: 'steps', 
    stepConfig: { steps: configuredSteps }
  });
}

export function createOverviewOutput(
  stats: Array<{ label: string; value: number | string }>,
  title?: string
): FlowOutput {
  return createFlowOutput(stats, { viewType: 'overview', title });
}

export function detectViewType(data: any[]): FlowViewType {
  if (!Array.isArray(data) || data.length === 0) return 'list';
  
  const firstItem = data[0];
  
  if (typeof firstItem !== 'object') return 'list';
  
  if (firstItem.tasks || firstItem.steps || firstItem.key_tasks) return 'steps';
  if (firstItem.score || firstItem.level || firstItem.proficiency) return 'chart';
  if (firstItem.courseName || firstItem.title) return 'cards';
  if (data.length > 5) return 'table';
  
  return 'list';
}

export function adaptExistingFlowOutput(
  flowName: string,
  rawData: any,
  options?: {
    title?: string;
    viewType?: FlowViewType;
  }
): FlowOutput {
  let data: any[] = [];
  
  if (flowName === 'skillGapAnalysisFlow') {
    data = rawData?.data || [];
    return createFlowOutput(data, {
      viewType: options?.viewType || detectViewType(data),
      title: options?.title || 'Skill Gap Analysis',
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'expectedProficiency', label: 'Expected', render: (v) => `${v}/5` },
        { key: 'proficiencyLevel', label: 'Level', render: (v) => `${v}/5` }
      ]
    });
  }
  
  if (flowName === 'courseRecommendationFlow') {
    data = rawData || [];
    return createCardsOutput(data, {
      titleKey: 'courseName',
      descriptionKey: 'courseDescription',
      metadataKeys: ['createdBy', 'similarUsers']
    }, options?.title || 'Course Recommendations');
  }
  
  if (flowName === 'jobRoleCompetencyFlow') {
    const competencyData = rawData;
    if (competencyData?.skills) {
      const skillsData = competencyData.skills.map((s: any) => ({
        name: s.title,
        category: s.category,
        score: s.level,
        description: s.description
      }));
      return createRadarOutput(skillsData, {
        xKey: 'name',
        dataKey: 'score'
      }, options?.title || 'Competency Profile');
    }
    return createFlowOutput([], { viewType: 'list', title: options?.title });
  }
  
  data = Array.isArray(rawData) ? rawData : [rawData];
  return createFlowOutput(data, {
    viewType: options?.viewType || detectViewType(data),
    title: options?.title
  });
}
