'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import FilterSidebar from './components/FilterSidebar';
import SearchToolbar from './components/SearchToolbar';
import CourseGrid from './components/CourseGrid';
import RecommendationSidebar from './components/RecommendationSidebar';
import Icon from '@/components/AppIcon';
import {Button} from '../../../components/ui/button';
// If you have a Breadcrumb component, import it here:
import Breadcrumb from '../../../components/ui/BreadcrumbNavigation';

type Course = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  contentType: string;
  category: string;
  difficulty: string;
  duration: string;
  rating: number;
  enrolledCount: number;
  progress: number;
  instructor: string;
  isNew: boolean;
  isMandatory: boolean;
};

type Filters = {
  contentType: string[];
  categories: string[];
  skillLevel: string[];
  duration: string[];
  completionStatus: string[];
};

const LearningCatalog: React.FC = () => {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({
    contentType: [],
    categories: [],
    skillLevel: [],
    duration: [],
    completionStatus: [],
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const mockCourses: Course[] = [
    {
      id: 1,
      title: 'Advanced Leadership Strategies',
      description: 'Master essential leadership skills for today\'s teams.',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      contentType: 'video',
      category: 'leadership',
      difficulty: 'advanced',
      duration: '4h 30m',
      rating: 4.8,
      enrolledCount: 1247,
      progress: 0,
      instructor: 'Sarah Johnson',
      isNew: true,
      isMandatory: false,
    },
    {
      id: 2,
      title: 'Data Privacy and GDPR Compliance',
      description: 'Learn to comply with data protection regulations.',
      thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
      contentType: 'mixed',
      category: 'compliance',
      difficulty: 'intermediate',
      duration: '2h 15m',
      rating: 4.6,
      enrolledCount: 892,
      progress: 45,
      instructor: 'Michael Chen',
      isNew: false,
      isMandatory: true,
    },
    {
      id: 3,
      title: 'Remote Team Communication',
      description: 'Build trust and collaboration in remote teams.',
      thumbnail: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop',
      contentType: 'ppt',
      category: 'soft-skills',
      difficulty: 'beginner',
      duration: '1h 45m',
      rating: 4.7,
      enrolledCount: 654,
      progress: 100,
      instructor: 'Emily Rodriguez',
      isNew: false,
      isMandatory: false,
    },
     {
      id: 4,
      title: "Python for Data Analysis and Visualization",
      description: "Master Python programming for data science applications, including pandas, matplotlib, and advanced statistical analysis techniques.",
      thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
      contentType: "video",
      category: "technical",
      difficulty: "intermediate",
      duration: "6h 20m",
      rating: 4.9,
      enrolledCount: 1456,
      progress: 25,
      instructor: "David Kim",
      isNew: true,
      isMandatory: false
    },
    {
      id: 5,
      title: "Financial Planning and Budget Management",
      description: "Develop essential financial literacy skills for personal and professional budget management, investment planning, and risk assessment.",
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
      contentType: "mixed",
      category: "finance",
      difficulty: "beginner",
      duration: "3h 10m",
      rating: 4.5,
      enrolledCount: 423,
      progress: 0,
      instructor: "Lisa Thompson",
      isNew: false,
      isMandatory: false
    },
    {
      id: 6,
      title: "Digital Marketing Fundamentals",
      description: "Comprehensive introduction to digital marketing strategies, including SEO, social media marketing, content creation, and analytics.",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      contentType: "video",
      category: "sales",
      difficulty: "beginner",
      duration: "4h 50m",
      rating: 4.4,
      enrolledCount: 789,
      progress: 0,
      instructor: "Alex Martinez",
      isNew: false,
      isMandatory: false
    },
    {
      id: 7,
      title: "Cybersecurity Awareness Training",
      description: "Essential cybersecurity knowledge for all employees, covering threat identification, password security, and incident response procedures.",
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop",
      contentType: "ppt",
      category: "compliance",
      difficulty: "beginner",
      duration: "1h 30m",
      rating: 4.3,
      enrolledCount: 2156,
      progress: 0,
      instructor: "Robert Wilson",
      isNew: false,
      isMandatory: true
    },
    {
      id: 8,
      title: "Project Management with Agile Methodologies",
      description: "Learn agile project management principles, scrum framework implementation, and tools for managing complex projects efficiently.",
      thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
      contentType: "mixed",
      category: "leadership",
      difficulty: "advanced",
      duration: "5h 15m",
      rating: 4.7,
      enrolledCount: 934,
      progress: 60,
      instructor: "Jennifer Davis",
      isNew: true,
      isMandatory: false
    },
    {
      id: 9,
      title: "Machine Learning Basics for Business Professionals",
      description: "Non-technical introduction to machine learning concepts, applications in business, and how to leverage AI for competitive advantage.",
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
      contentType: "video",
      category: "technical",
      difficulty: "intermediate",
      duration: "3h 40m",
      rating: 4.8,
      enrolledCount: 567,
      progress: 0,
      instructor: "Dr. Amanda Foster",
      isNew: true,
      isMandatory: false
    }
  ];

  const getDurationMinutes = (duration: string): number => {
    const match = duration.match(/(\d+)h\s*(\d+)m/);
    if (match) return parseInt(match[1]) * 60 + parseInt(match[2]);
    const hourMatch = duration.match(/(\d+)h/);
    if (hourMatch) return parseInt(hourMatch[1]) * 60;
    const minMatch = duration.match(/(\d+)m/);
    if (minMatch) return parseInt(minMatch[1]);
    return 0;
  };

  const getFilteredCourses = (): Course[] => {
    let filtered = [...mockCourses];

    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.contentType.length > 0) {
      filtered = filtered.filter(course =>
        filters.contentType.includes(course.contentType)
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(course =>
        filters.categories.includes(course.category)
      );
    }

    if (filters.skillLevel.length > 0) {
      filtered = filtered.filter(course =>
        filters.skillLevel.includes(course.difficulty)
      );
    }

    if (filters.completionStatus.length > 0) {
      filtered = filtered.filter(course => {
        if (filters.completionStatus.includes('completed') && course.progress === 100) return true;
        if (filters.completionStatus.includes('in-progress') && course.progress > 0 && course.progress < 100) return true;
        if (filters.completionStatus.includes('not-started') && course.progress === 0) return true;
        return false;
      });
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      case 'popular':
        filtered.sort((a, b) => b.enrolledCount - a.enrolledCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'duration-asc':
        filtered.sort((a, b) => getDurationMinutes(a.duration) - getDurationMinutes(b.duration));
        break;
      case 'duration-desc':
        filtered.sort((a, b) => getDurationMinutes(b.duration) - getDurationMinutes(a.duration));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        filtered.sort((a, b) => {
          if (a.isMandatory !== b.isMandatory) return Number(b.isMandatory) - Number(a.isMandatory);
          if (a.isNew !== b.isNew) return Number(b.isNew) - Number(a.isNew);
          return b.rating - a.rating;
        });
    }

    return filtered;
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCourses(getFilteredCourses());
      setLoading(false);
    }, 500);
  }, [searchQuery, sortBy, filters]);

  const handleFilterChange = (key: keyof Filters, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [key]: values,
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      contentType: [],
      categories: [],
      skillLevel: [],
      duration: [],
      completionStatus: [],
    });
    setSearchQuery('');
  };

  const handleEnroll = (courseId: number) => {
    console.log(`Enrolling in course ${courseId}`);
  };

  const handleViewDetails = (courseId: number) => {
    router.push(`/course-details?id=${courseId}`);
  };

  const handleLoadMore = async () => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setHasMore(false);
        resolve();
      }, 1000);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Learning Catalog</h1>
              <p className="text-muted-foreground mt-2">
                Discover and enroll in courses to advance your skills and career
              </p>
            </div>

            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              <Icon name="Filter" size={16} className="mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {isFilterVisible && (
              <div className="lg:col-span-3 hidden lg:block">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearAll={handleClearAllFilters}
                />
              </div>
            )}

            <div className={isFilterVisible ? 'lg:col-span-6' : 'lg:col-span-9'}>
              <SearchToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                // sortBy={sortBy}
                // onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                resultsCount={courses.length}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAllFilters}
                // onToggleFilter={() => setIsFilterVisible(prev => !prev)}
              />

              <CourseGrid
                courses={courses}
                viewMode={viewMode}
                loading={loading}
                onEnroll={handleEnroll}
                onViewDetails={handleViewDetails}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
              />
            </div>

            <div className="lg:col-span-3 hidden lg:block">
              <RecommendationSidebar />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearningCatalog;
