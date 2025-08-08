'use client';
import { React, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Popover } from '@headlessui/react';
import { useMediaQuery } from 'react-responsive';
import AssessmentCard from './components/AssessmentCard';
import FilterPanel from './components/FilterPanel';
import AssessmentPreviewModal from './components/AssessmentPreviewModal';
import SearchBar from './components/SearchBar';
import AssessmentStats from './components/AssessmentStats';
import DeadlineNotification from './components/DeadlineNotification';
import Icon from '../../../../components/AppIcon';
import { Button } from '../../../../components/ui/button';
import CreateAssessmentModal from './components/CreateAssessmentModal';

const AssessmentLibrary = () => {
  const router = useRouter();
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());

  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    status: 'all',
    sortBy: 'deadline',
    showUrgentOnly: false,
    showAvailableOnly: false,
  });

  useEffect(() => {
    console.log("Create Assessment Modal State:", showCreateModal);
  }, [showCreateModal]);

  const mockAssessments = [
    {
      id: 1,
      title: "React Fundamentals Quiz",
      description: "Test your understanding of React components, props, and state management concepts.",
      type: "quiz",
      difficulty: "medium",
      subject: "development",
      questionCount: 25,
      duration: 45,
      maxAttempts: 3,
      status: "Not Attempted",
      category: "Skill",
      deadline: "2025-02-28T23:59:59",
      assignedTo: 12,
      completions: 89,
      avgScore: 78,
      createdAt: "2025-01-15",
      createdBy: "Sarah Johnson"
    },
    {
      id: 2,
      title: "JavaScript Advanced Assessment",
      description: "Comprehensive test covering ES6+, async programming, and modern JavaScript patterns.",
      type: "test",
      difficulty: "hard",
      subject: "development",
      questionCount: 40,
      duration: 90,
      maxAttempts: 2,
      status: "In Progress",
      category: "Skill",
      deadline: "2025-03-15T23:59:59",
      assignedTo: 8,
      completions: 45,
      avgScore: 72,
      createdAt: "2025-01-10",
      createdBy: "Mike Chen"
    },
    {
      id: 3,
      title: "Project Management Survey",
      description: "Feedback collection on project management methodologies and team collaboration.",
      type: "survey",
      difficulty: "easy",
      subject: "management",
      questionCount: 15,
      duration: 20,
      maxAttempts: 1,
      status: "Completed",
      category: "Job Role",
      deadline: "2025-01-31T23:59:59",
      assignedTo: 15,
      completions: 127,
      avgScore: 85,
      createdAt: "2025-01-08",
      createdBy: "Lisa Wang"
    },
    {
      id: 4,
      title: "UI/UX Design Principles Test",
      description: "Evaluate knowledge of design thinking, user research, and interface design principles.",
      type: "test",
      difficulty: "medium",
      subject: "design",
      questionCount: 30,
      duration: 60,
      maxAttempts: 3,
      status: "Failed",
      category: "Job Role",
      deadline: "2025-02-15T23:59:59",
      assignedTo: 0,
      completions: 0,
      avgScore: 0,
      createdAt: "2025-01-20",
      createdBy: "Alex Rodriguez"
    },
    {
      id: 5,
      title: "Data Analysis Assignment",
      description: "Practical assignment involving data cleaning, analysis, and visualization using Python.",
      type: "assignment",
      difficulty: "hard",
      subject: "development",
      questionCount: 5,
      duration: 180,
      maxAttempts: 2,
      status: "Not Attempted",
      category: "Task",
      deadline: "2025-03-01T23:59:59",
      assignedTo: 6,
      completions: 23,
      avgScore: 81,
      createdAt: "2025-01-05",
      createdBy: "David Kim"
    },
    {
      id: 6,
      title: "Marketing Strategy Quiz",
      description: "Quick assessment on digital marketing strategies and campaign optimization.",
      type: "quiz",
      difficulty: "easy",
      subject: "marketing",
      questionCount: 20,
      duration: 30,
      maxAttempts: 3,
      status: "Completed",
      category: "Skill",
      deadline: "2025-02-10T23:59:59",
      assignedTo: 10,
      completions: 156,
      avgScore: 88,
      createdAt: "2025-01-12",
      createdBy: "Emma Thompson"
    }
  ];

  const filteredAssessments = useMemo(() => {
    let filtered = mockAssessments.filter((assessment) => {
      const q = searchQuery.toLowerCase();
      if (searchQuery && !assessment.title.toLowerCase().includes(q)) return false;
      
      // Safely handle category filter
      if (filters.category !== 'all') {
        const assessmentCategory = assessment.category?.toLowerCase() || '';
        if (assessmentCategory !== filters.category) return false;
      }
      
      // Safely handle difficulty filter
      if (filters.difficulty !== 'all') {
        const assessmentDifficulty = assessment.difficulty?.toLowerCase() || '';
        if (assessmentDifficulty !== filters.difficulty) return false;
      }
      
      // Safely handle status filter
      if (filters.status !== 'all') {
        const assessmentStatus = assessment.status?.toLowerCase() || '';
        if (assessmentStatus !== filters.status) return false;
      }
      
      return true;
    });

    filtered.sort((a, b) => {
      if (filters.sortBy === 'deadline') {
        const dateA = a.deadline ? new Date(a.deadline) : new Date(0);
        const dateB = b.deadline ? new Date(b.deadline) : new Date(0);
        return dateA - dateB;
      }
      if (filters.sortBy === 'difficulty') {
        const order = { easy: 1, medium: 2, hard: 3 };
        const aDiff = a.difficulty?.toLowerCase() || 'medium';
        const bDiff = b.difficulty?.toLowerCase() || 'medium';
        return order[aDiff] - order[bDiff];
      }
      return 0;
    });

    return filtered;
  }, [searchQuery, filters]);

  const stats = useMemo(() => ({
    total: mockAssessments.length,
    notAttempted: mockAssessments.filter(a => a.status === 'Not Attempted').length,
    inProgress: mockAssessments.filter(a => a.status === 'In Progress').length,
    completed: mockAssessments.filter(a => a.status === 'Completed').length,
    failed: mockAssessments.filter(a => a.status === 'Failed').length,
  }), []);

  const urgentAssessments = useMemo(() => {
    return mockAssessments.filter((assessment) => {
      if (!assessment.deadline || dismissedNotifications.has(assessment.id)) return false;
      const deadline = new Date(assessment.deadline);
      const now = new Date();
      const daysDiff = (deadline - now) / (1000 * 60 * 60 * 24);
      return daysDiff <= 1 && daysDiff > 0 && assessment.status !== 'Completed';
    });
  }, [dismissedNotifications]);

  const handleStartAssessment = (assessment) => {
    router.push('/quiz-attempt', { state: { assessment } });
  };

  const handleViewDetails = (assessment) => {
    setSelectedAssessment(assessment);
    setIsPreviewModalOpen(true);
  };

  const handleCreateAssessment = (assessmentData) => {
    console.log('Creating assessment:', assessmentData);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background relative">
      {/* Mobile Sidebar Drawer */}
      {!isDesktop && isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-64 bg-white dark:bg-background h-full shadow-lg z-50 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-muted-foreground text-xl">
                ×
              </button>
            </div>
            {/* Sidebar content would go here */}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 min-h-screen pt-10 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Assessment Library</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Access quizzes and evaluations by role, skill, or task.
              </p>
            </div>

            <Button 
              onClick={() => {
                console.log("Opening Create Assessment Modal");
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2"
            >
              <Icon name="Plus" size={16} />
              Create Assessment
            </Button>
          </div>

          <AssessmentStats stats={stats} />

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 my-4 w-full">
            <div className="flex-1 w-full">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onToggleFilters={() => !isDesktop && setIsFilterPanelOpen(true)}
                isMobile={!isDesktop}
              />
            </div>

            {isDesktop && (
              <Popover className="relative flex-shrink-0">
                <Popover.Button className="inline-flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Icon name="Filter" size={16} />
                  Filters
                </Popover.Button>
                <Popover.Panel className="absolute z-50 right-0 mt-2 bg-white dark:bg-background border border-border rounded-md shadow-lg w-80">
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={setFilters}
                    isOpen={true}
                    onClose={() => {}}
                    isMobile={false}
                  />
                </Popover.Panel>
              </Popover>
            )}
          </div>

          {/* Assessments Grid */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">
              {filteredAssessments.length} Assessment{filteredAssessments.length !== 1 && 's'}
            </h2>
          </div>

          {filteredAssessments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAssessments.map((a) => (
                <AssessmentCard
                  key={a.id}
                  assessment={a}
                  onStartAssessment={handleStartAssessment}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Search" size={28} className="text-muted-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">No assessments found</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    category: 'all',
                    difficulty: 'all',
                    status: 'all',
                    sortBy: 'deadline',
                    showUrgentOnly: false,
                    showAvailableOnly: false,
                  });
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Panel */}
      {!isDesktop && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={isFilterPanelOpen}
          onClose={() => setIsFilterPanelOpen(false)}
          isMobile={true}
        />
      )}

      {/* Preview Modal */}
      <AssessmentPreviewModal
        assessment={selectedAssessment}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onStartAssessment={handleStartAssessment}
      />

      {/* Create Assessment Modal */}
      <CreateAssessmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateAssessment}
      />

      {/* Deadline Notifications */}
      <DeadlineNotification
        urgentAssessments={urgentAssessments}
        onDismiss={(id) => setDismissedNotifications(prev => new Set([...prev, id]))}
        onViewAssessment={handleViewDetails}
      />
    </div>
  );
};

export default AssessmentLibrary;