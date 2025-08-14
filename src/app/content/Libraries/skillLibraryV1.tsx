'use client';

import React, { useEffect, useState } from 'react';
// import QuickActionMenu from '../../../components/skillComponent/skillComponentV1/components/';
import { Button } from '../../../components/ui/button';
import SkillCard from '../../../components/skillComponent/skillComponentV1/components/SkillCard';
import SkillFilters from '../../../components/skillComponent/skillComponentV1/components/SkillFilters';
import SkillCategoryTree from '../../../components/skillComponent/skillComponentV1/components/SkillCategoryTree';
import SkillModal from '../../../components/skillComponent/skillComponentV1/components/SkillModal';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  priority: 'high' | 'medium' | 'low';
  currentProficiency: number;
  requiredProficiency: number;
  icon: string;
  jobRoles: string[];
  knowledge: string;
  ability: string;
  application: string;
  proficiencyDistribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
}

interface Filters {
  search?: string;
  priority?: string;
  proficiencyLevel?: string;
}

const SkillsLibrary: React.FC = () => {
  const [sessionData, setSessionData] = useState<any>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'create'>('view');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [proficiencyFilter, setProficiencyFilter] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [averageProficiency, setAverageProficiency] = useState<number>(0);
  const [skillGaps, setSkillGaps] = useState<number>(0);
  const [highPrioritySkills, setHighPrioritySkills] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const {
          APP_URL,
          token,
          org_type,
          sub_institute_id,
          user_id,
          user_profile_name
        } = JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          org_type,
          sub_institute_id,
          user_id,
          user_profile_name
        });
      }
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchData();
    }
  }, [sessionData.url, sessionData.token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${sessionData.url}/skill_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&org_type=${sessionData.org_type}`
      );
      const json = await res.json();
      const allData = json?.allSkillData || {};

      const result: Skill[] = [];
      let totalProficiency = 0;
      let totalSkillGap = 0;
      let highPriorityCount = 0;

      Object.entries(allData).forEach(([cat, subs]) => {
        Object.entries(subs as Record<string, any[]>).forEach(([subcat, skillArr]) => {
          skillArr.forEach((s, index) => {
            const skill: Skill = {
              id: s.id ?? `${cat}-${subcat}-${index}`,
              name: s.title || 'Untitled',
              description: s.description || '',
              category: cat,
              subCategory: subcat,
              priority: (s.priority?.toLowerCase() ?? 'low') as 'high' | 'medium' | 'low',
              currentProficiency: s.currentProficiency ?? Math.floor(Math.random() * 6),
              requiredProficiency: s.requiredProficiency ?? 4,
              icon: 'Code',
              jobRoles: ['frontend-developer'],
              knowledge: 'Knowledge text',
              ability: 'Ability text',
              application: 'Application text',
              proficiencyDistribution: {
                beginner: 5,
                intermediate: 8,
                advanced: 3,
                expert: 1
              }
            };
            totalProficiency += skill.currentProficiency;
            totalSkillGap += Math.max(0, skill.requiredProficiency - skill.currentProficiency);
            if (skill.priority === 'high') highPriorityCount++;
            result.push(skill);
          });
        });
      });

      setSkills(result);
      setFilteredSkills(result);
      setAverageProficiency(Number((totalProficiency / result.length).toFixed(1)));
      setSkillGaps(totalSkillGap);
      setHighPrioritySkills(highPriorityCount);
    } catch (err) {
      console.error('Skill fetch error', err);
      setError('Failed to load skills.');
    } finally {
      setLoading(false);
    }
  };

  const normalize = (str: string) => str?.toLowerCase().replace(/\s+/g, '-');

  const applyFilters = (filters: Filters) => {
    setSearchText(filters.search || '');
    setPriorityFilter(filters.priority || '');
    setProficiencyFilter(filters.proficiencyLevel || '');

    const lowerSearch = (filters.search || '').toLowerCase();

    const sortedSkills = skills.slice().sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aMatch = aName.includes(lowerSearch);
      const bMatch = bName.includes(lowerSearch);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    setFilteredSkills(sortedSkills);
  };

  const filtered = filteredSkills.filter((skill) => {
    const categoryMatch =
      !selectedKey ||
      normalize(skill.category) === selectedKey ||
      normalize(`${skill.category}-${skill.subCategory}`) === selectedKey;
    const priorityMatch = !priorityFilter || skill.priority === priorityFilter.toLowerCase();
    const proficiencyMatch =
      !proficiencyFilter || skill.currentProficiency === parseInt(proficiencyFilter);
    return categoryMatch && priorityMatch && proficiencyMatch;
  });

  const isSubcategorySelected = skills.some(
    (s) => normalize(`${s.category}-${s.subCategory}`) === selectedKey
  );

  const displayedSkills =
    selectedKey === ''
      ? filtered.slice(0, 6)
      : isSubcategorySelected
      ? filtered
      : filtered.slice(0, 1);

  const handleCreateSkill = () => {
    setSelectedSkill(null);
    setModalMode('create');
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Skills Library</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage organizational skills, track proficiency levels, and identify skill gaps
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <Button onClick={handleCreateSkill}>
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add New Skill</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <InfoCard label="Total Skills" value={skills.length} />
          <InfoCard label="High Priority" value={highPrioritySkills} />
          <InfoCard label="Avg. Proficiency" value={averageProficiency} />
          <InfoCard label="Skill Gaps" value={skillGaps} />
        </div>

        <SkillFilters
          onFiltersChange={applyFilters}
          onViewModeChange={setViewMode}
          viewMode={viewMode}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          <div className="lg:col-span-3">
            <SkillCategoryTree selectedCategory={selectedKey} onCategorySelect={setSelectedKey} />
          </div>

          <div className="lg:col-span-9">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">
                Skills ({displayedSkills.length})
              </h3>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : displayedSkills.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No skills found</p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                      : 'space-y-4'
                  }
                >
                  {displayedSkills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onSkillClick={() => {
                        setSelectedSkill(skill);
                        setModalMode('view');
                        setShowModal(true);
                      }}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SkillModal
        skill={selectedSkill ?? undefined}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
      />
      {/* <QuickActionMenu onAddSkill={handleCreateSkill} /> */}
    </div>
  );
};

const InfoCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-card border rounded-lg p-4 text-center">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export default SkillsLibrary;
