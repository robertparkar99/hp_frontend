import {
  UIBlock,
  CardsBlock,
  ListBlock,
  TableBlock,
  ChartBlock,
  TextBlock,
  StructuredResponse
} from '@/types/flow-output';

interface LegacyResponse {
  answer: string;
  intent?: string;
  action?: string;
  selectionOptions?: Array<{ id?: number; name: string; expectedProficiency?: number }>;
  stepLabel?: string;
  currentStep?: string;
  nextStep?: string;
  competencyData?: any;
  courseRecommendations?: any[];
  skillGapReportData?: any;
}

export function adaptToStructuredResponse(legacy: LegacyResponse): StructuredResponse {
  const blocks: UIBlock[] = [];

  if (legacy.answer) {
    blocks.push({
      type: 'text',
      content: legacy.answer
    });
  }

  if (legacy.action === 'SHOW_COURSE_RECOMMENDATIONS' && legacy.courseRecommendations) {
    const cards = legacy.courseRecommendations.map((course, index) => ({
      id: course.courseId || index,
      title: course.courseName,
      description: course.courseDescription,
      tag: course.similarUsers?.length ? 'Similar Users' : undefined,
      metadata: {
        createdBy: course.createdBy,
        similarUsers: course.similarUsers
      }
    }));
    blocks.push({
      type: 'cards',
      data: cards
    } as CardsBlock);
  }

  if (legacy.action === 'SHOW_SKILL_GAP_OPTIONS' && legacy.selectionOptions) {
    const items = legacy.selectionOptions.map((opt, index) => ({
      id: opt.id || index,
      label: opt.name,
      value: opt.expectedProficiency
    }));
    blocks.push({
      type: 'list',
      data: items,
      title: legacy.stepLabel
    } as ListBlock);
  }

  if (legacy.action === 'SHOW_SKILL_GAP_REPORT' && legacy.skillGapReportData) {
    const report = legacy.skillGapReportData;
    
    blocks.push({
      type: 'chart',
      config: {
        chartType: 'bar',
        xKey: 'name',
        dataKey: 'gap'
      },
      data: report.topPrioritySkills || []
    } as ChartBlock);

    const stats = [
      { label: 'Overall Skill Index', value: report.overallSkillIndex?.toFixed(1) + '%' },
      { label: 'Skill Gap', value: report.skillGap?.toFixed(1) },
      { label: 'Total Skills', value: report.totalSkills },
      { label: 'Performance', value: report.performanceLabel }
    ];
    blocks.push({
      type: 'cards',
      data: stats.map((s, i) => ({ id: i, title: s.label, description: String(s.value) }))
    } as CardsBlock);

    if (report.topPrioritySkills?.length > 0) {
      blocks.push({
        type: 'table',
        data: {
          columns: [
            { key: 'name', label: 'Skill' },
            { key: 'rated', label: 'Your Rating' },
            { key: 'expected', label: 'Expected' },
            { key: 'gap', label: 'Gap' }
          ],
          rows: report.topPrioritySkills.map((s: any) => ({
            name: s.name,
            rated: s.rated,
            expected: s.expected,
            gap: s.gap.toFixed(1)
          }))
        }
      } as TableBlock);
    }
  }

  if (legacy.competencyData) {
    const comp = legacy.competencyData;
    
    if (comp.skills) {
      blocks.push({
        type: 'chart',
        config: {
          chartType: 'radar',
          xKey: 'title',
          dataKey: 'level'
        },
        data: comp.skills.map((s: any) => ({
          title: s.title,
          level: s.level
        }))
      } as ChartBlock);
    }

    if (comp.cwf_items) {
      const timeline = comp.cwf_items.map((cwf: any, index: number) => ({
        id: index,
        title: cwf.critical_work_function,
        description: cwf.key_tasks?.join(', ')
      }));
      blocks.push({ type: 'timeline', data: timeline });
    }
  }

  if (blocks.length === 0) {
    blocks.push({
      type: 'text',
      content: legacy.answer || 'Operation completed'
    });
  }

  return {
    blocks,
    intent: legacy.intent || 'chat_response'
  };
}

export function createLegacyResponseFromStructured(
  structured: StructuredResponse,
  legacy: Partial<LegacyResponse>
): LegacyResponse {
  const blocks = structured.blocks || [];
  const firstBlock = blocks[0];

  let response: LegacyResponse = {
    answer: legacy.answer || '',
    intent: structured.intent || legacy.intent
  };

  if (firstBlock?.type === 'text') {
    response.answer = (firstBlock as TextBlock).content;
  }

  const cardsBlock = blocks.find(b => b.type === 'cards') as CardsBlock | undefined;
  if (cardsBlock) {
    response.action = 'SHOW_COURSE_RECOMMENDATIONS';
    response.courseRecommendations = cardsBlock.data.map(card => ({
      courseName: card.title,
      courseId: card.id,
      courseDescription: card.description
    }));
  }

  const listBlock = blocks.find(b => b.type === 'list') as ListBlock | undefined;
  if (listBlock) {
    response.action = 'SHOW_SKILL_GAP_OPTIONS';
    response.stepLabel = listBlock.title;
    response.selectionOptions = listBlock.data.map(item => ({
      id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
      name: item.label,
      expectedProficiency: item.value
    }));
  }

  return response;
}