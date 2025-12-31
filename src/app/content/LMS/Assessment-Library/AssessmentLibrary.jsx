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
const mapAssessment = (item) => {
  const now = new Date();
  const openDate = item.open_date ? new Date(item.open_date) : null;
  const closeDate = item.close_date ? new Date(item.close_date) : null;

  let status = 'Closed';
  if (openDate && closeDate) {
    if (now >= openDate && now <= closeDate) {
      status = 'Active';
    }
  }

  return {
    id: item.id,
    title: item.paper_name || item.name || 'Untitled Assessment',              // ✅ used in cards
    name: item.paper_name || item.name || 'Untitled Assessment',               // ✅ fallback for SkillAssessment
    description: item.paper_desc || item.description || '',
    type: item.exam_type || item.type || 'online',
    difficulty: item.difficulty || 'medium',                // API doesn't give → default
    subject: item.subject_name || item.subject || 'General',
    questionCount: item.total_ques || item.questionCount || 0,
    duration: item.time_allowed || item.duration || 0,
    maxAttempts: item.attempt_allowed || item.maxAttempts || 1,
    status: status,
    category: item.grade_name || item.standard_name || item.category || 'General',
    deadline: item.close_date || item.deadline,
    openDate: item.open_date,
    closeDate: item.close_date,
    assignedTo: item.assignedTo || 0,                       // not provided → placeholder
    completions: item.completions || 0,                      // not provided → placeholder
    avgScore: item.avgScore || 0,                         // not provided → placeholder
    createdAt: item.created_at || item.createdAt,
    createdBy: item.created_by || item.createdBy,
  };
};

const AssessmentLibrary = () => {
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
    user_profile_name: "",
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
      const { APP_URL, token, sub_institute_id, org_type, user_id, user_profile_name } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
        user_profile_name,

      });
    }
  }, []);

  // ✅ Fetch from API
  useEffect(() => {
    if (!sessionData.url) return; // Don't fetch until we have the URL

    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const API_URL = `${sessionData.url}/api/ai-generated-assessment/assessment/index?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}`;

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
        console.log('New API Response:', data);

        let assessmentsArray = [];
        if (Array.isArray(data)) {
          assessmentsArray = data;
        } else if (data?.data && Array.isArray(data.data)) {
          assessmentsArray = data.data;
        } else if (data?.assessments && Array.isArray(data.assessments)) {
          assessmentsArray = data.assessments;
        } else {
          console.error('Unexpected API format:', data);
          setError('Invalid API format');
          return;
        }

        const mapped = assessmentsArray.map(mapAssessment);
        setAssessments(mapped);
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
      if (filters.showAvailableOnly && item.status !== 'Active') return false;

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
    let active = assessments.filter(a => a.status === 'Active').length;
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
    // Refetch assessments after creation
    if (sessionData.url) {
      const fetchAssessments = async () => {
        try {
          setLoading(true);
          const API_URL = `${sessionData.url}/api/ai-generated-assessment/assessment/index?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}`;

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
          console.log('New API Response:', data);

          let assessmentsArray = [];
          if (Array.isArray(data)) {
            assessmentsArray = data;
          } else if (data?.data && Array.isArray(data.data)) {
            assessmentsArray = data.data;
          } else if (data?.assessments && Array.isArray(data.assessments)) {
            assessmentsArray = data.assessments;
          } else {
            console.error('Unexpected API format:', data);
            setError('Invalid API format');
            return;
          }

          const mapped = assessmentsArray.map(mapAssessment);
          console.log('Mapped assessments:', mapped);
          setAssessments(mapped);
        } catch (err) {
          console.error('Failed to fetch:', err);
          setError('Failed to fetch assessments');
        } finally {
          setLoading(false);
        }
      };

      fetchAssessments();
    }
    setShowCreateModal(false);
  };

  // ✅ Show SkillAssessment if active
  if (activeAssessment) {
    return <SkillAssessment assessment={activeAssessment} />;
  }

  // ✅ Main library view
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background rounded-xl relative">
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
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  title="Info / Help"
                >
                  <Icon name="Info" size={16} />
                </Button>

                {["ADMIN", "HR"].includes(sessionData.user_profile_name?.toUpperCase()) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                    title="create Assessment with AI"
                    onClick={() => console.log('AI Build Assessment clicked')}
                  >
                    <Icon name="Sparkles" size={16} />
                  </Button>
                )}
              </div>



              {/* Create Assessment Button */}
              {["ADMIN", "HR"].includes(sessionData.user_profile_name?.toUpperCase()) ? (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
                >
                  <Icon name="Plus" size={16} />
                  Create Assessment
                </Button>
              ) : null}
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
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-1 my-4 w-full">
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