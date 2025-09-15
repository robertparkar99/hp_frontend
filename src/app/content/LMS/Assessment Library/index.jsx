'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Popover } from '@headlessui/react';
import AssessmentCard from './components/AssessmentCard';
import FilterPanel from './components/FilterPanel';
import AssessmentPreviewModal from './components/AssessmentPreviewModal';
import SearchBar from './components/SearchBar';
import AssessmentStats from './components/AssessmentStats';
import Icon from '../../../../components/AppIcon';
import { Button } from '../../../../components/ui/button';
import CreateAssessmentModal from './components/CreateAssessmentModal';
import SkillAssessment from '@/components/skill-assessment';

// 🔄 Mapper function to normalize API → UI format
const mapAssessment = (item) => ({
  id: item.id,
  title: item.paper_name,              // ✅ used in cards
  name: item.paper_name,               // ✅ fallback for SkillAssessment
  description: item.paper_desc,
  type: item.exam_type || 'online',
  difficulty: 'medium',                // API doesn't give → default
  subject: item.subject_name,
  questionCount: item.total_ques,
  duration: item.time_allowed,
  maxAttempts: item.attempt_allowed,
  status: item.active_exam === 'yes' ? 'Available' : 'Closed',
  category: item.grade_name || item.standard_name || 'General',
  deadline: item.close_date,
  assignedTo: 0,                       // not provided → placeholder
  completions: 0,                      // not provided → placeholder
  avgScore: 0,                         // not provided → placeholder
  createdAt: item.created_at,
  createdBy: item.created_by,
});

const AssessmentLibrary = () => {
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState(null);

  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    status: 'all',
    sortBy: 'deadline',
    showAvailableOnly: false,
  });

  // Get session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
      });
    }
  }, []);

  // ✅ Fetch from API
  useEffect(() => {
    if (!sessionData.url) return; // Don't fetch until we have the URL

    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const API_URL = `${sessionData.url}/lms/question_paper?type=API&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}&syear=2025`;

        const res = await fetch(API_URL, {
          headers: {
            'Authorization': `Bearer ${sessionData.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (data?.message === 'SUCCESS' && Array.isArray(data.data)) {
          const mapped = data.data.map(mapAssessment);
          setAssessments(mapped);
        } else {
          console.error('Unexpected API format:', data);
          setError('Invalid API format');
        }
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to fetch assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [sessionData]); // Depend on sessionData

  // ✅ Filtering & sorting
  // const filteredAssessments = useMemo(() => {
  //   let filtered = assessments.filter((assessment) => {
  //     const q = searchQuery.toLowerCase();
  //     if (searchQuery && !assessment.title?.toLowerCase().includes(q)) return false;

  //     if (filters.category !== 'all' && assessment.category?.toLowerCase() !== filters.category) return false;
  //     if (filters.difficulty !== 'all' && assessment.difficulty?.toLowerCase() !== filters.difficulty) return false;
  //     if (filters.status !== 'all' && assessment.status?.toLowerCase() !== filters.status) return false;
  //     if (filters.showAvailableOnly && assessment.status !== 'Available') return false;

  //     return true;
  //   });

  //   filtered.sort((a, b) => {
  //     if (filters.sortBy === 'deadline') {
  //       return new Date(a.deadline) - new Date(b.deadline);
  //     }
  //     if (filters.sortBy === 'difficulty') {
  //       const order = { easy: 1, medium: 2, hard: 3 };
  //       return order[a.difficulty?.toLowerCase() || 'medium'] -
  //         order[b.difficulty?.toLowerCase() || 'medium'];
  //     }
  //     return 0;
  //   });

  //   return filtered;
  // }, [assessments, searchQuery, filters]);
  const filteredAssessments = useMemo(() => {
  return assessments.filter((item) => {
    // Search query filter
    if (searchQuery && !item.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Category filter
    if (filters.category !== 'all' && item.category !== filters.category) return false;

    // Difficulty filter
    if (filters.difficulty !== 'all' && item.difficulty !== filters.difficulty) return false;

    // Status filter
    if (filters.status !== 'all' && item.status?.toLowerCase() !== filters.status?.toLowerCase()) return false;

    // Show only available
    if (filters.showAvailableOnly && item.status !== 'Available') return false;

    // Optionally deadline / subject filter if you added dropdowns for them
    if (filters.deadline && item.deadline !== filters.deadline) return false;
    if (filters.subject && item.subject !== filters.subject) return false;

    return true;
  });
}, [assessments, filters, searchQuery]);

  console.log('Filtered Assessments:', filteredAssessments);
  // ✅ Stats
 const stats = useMemo(() => {
  const today = new Date();

  let total = assessments.length;
  let active = assessments.filter(a => a.status === 'Available').length;
  let inactive = assessments.filter(a => a.status === 'Closed').length;
  let recent = assessments.filter(a => a.deadline && new Date(a.deadline) <= today).length;
  let upcoming = assessments.filter(a => a.deadline && new Date(a.deadline) > today).length;

  return {
    total,
    notAttempted: active,
    inProgress: inactive,
    completed: recent,
    failed: upcoming
  };
}, [assessments]);

  // ✅ Handlers for the new buttons
  const handleImportQuestions = () => {
    console.log('Import Questions clicked');
    // Add your import functionality here
  };

  const handleViewCalendar = () => {
    console.log('Assessment Calendar clicked');
    // Add your calendar functionality here
  };

  const handleExportResults = () => {
    console.log('Export Results clicked');
    // Add your export functionality here
  };

  const handleStartAssessment = (assessment) => {
    setActiveAssessment(assessment);
  };

  const handleViewDetails = (assessment) => {
    setSelectedAssessment(assessment);
    setIsPreviewModalOpen(true);
  };

  const handleCreateAssessment = (assessmentData) => {
    console.log('Creating assessment:', assessmentData);
    setShowCreateModal(false);
  };

  // ✅ Show SkillAssessment if active
  if (activeAssessment) {
    return <SkillAssessment assessment={activeAssessment} />;
  }

  // ✅ Main library view
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background relative">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 min-h-screen pt-10 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Assessment Library</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Access quizzes and evaluations by role, skill, or task.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Import Questions Button */}
              {/* <Button
                variant="outline"
                size="sm"
                onClick={handleImportQuestions}
                className="flex items-center gap-2"
              >
                <Icon name="Download" size={16} />
                Import Questions
              </Button> */}

              {/* Assessment Calendar Button */}
              {/* <Button
                variant="outline"
                size="sm"
                onClick={handleViewCalendar}
                className="flex items-center gap-2"
              >
                <Icon name="Calendar" size={16} />
                Assessment Calendar
              </Button> */}

              {/* Export Results Button */}
              {/* <Button
                variant="outline"
                size="sm"
                onClick={handleExportResults}
                className="flex items-center gap-2"
              >
                <Icon name="Upload" size={16} />
                Export Results
              </Button> */}

              {/* Create Assessment Button */}
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Icon name="Plus" size={16} />
                Create Assessment
              </Button>
            </div>
          </div>

          {loading ? (
            <p>Loading assessments...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
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
                          Filter
                        </Popover.Button>
                        <Popover.Panel className="absolute z-50 right-0 mt-2 bg-white dark:bg-background border border-border rounded-md shadow-lg w-80">
                          <FilterPanel
                            filters={filters}
                            onFiltersChange={setFilters}
                            isOpen={true}
                            onClose={() => { }}
                            isMobile={false}
                            assessments={assessments}
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
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setFilters({
                            category: 'all',
                            difficulty: 'all',
                            status: 'all',
                            sortBy: 'deadline',
                            showAvailableOnly: false,
                          });
                          }}
                        >
                          Clear All Filters
                        </Button> */}
                      </div>
                  )}
                </>
          )}
        </main>
      </div>

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
    </div>
  );
};

export default AssessmentLibrary;