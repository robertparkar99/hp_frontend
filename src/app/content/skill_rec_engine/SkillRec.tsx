'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp, ArrowRightLeft, Users, Target, BookOpen, Loader as Loader2, ChevronDown, Check } from 'lucide-react';

const JOB_ROLES = [
  { title: 'Junior Developer', category: 'Engineering', level: 'entry' },
  { title: 'Senior Developer', category: 'Engineering', level: 'senior' },
  { title: 'Technical Lead', category: 'Engineering', level: 'lead' },
  { title: 'Data Scientist', category: 'Data & Analytics', level: 'mid' },
  { title: 'Data Analyst', category: 'Data & Analytics', level: 'entry' },
  { title: 'Product Manager', category: 'Product', level: 'mid' },
  { title: 'Engineering Manager', category: 'Engineering', level: 'lead' },
  { title: 'DevOps Engineer', category: 'Engineering', level: 'mid' },
  { title: 'UX Designer', category: 'Design', level: 'mid' },
  { title: 'UI Developer', category: 'Design', level: 'mid' },
  { title: 'Frontend Developer', category: 'Engineering', level: 'mid' },
  { title: 'Backend Developer', category: 'Engineering', level: 'mid' },
  { title: 'Full Stack Developer', category: 'Engineering', level: 'mid' },
  { title: 'Machine Learning Engineer', category: 'Data & Analytics', level: 'mid' },
  { title: 'Business Analyst', category: 'Business', level: 'mid' },
  { title: 'Cloud Architect', category: 'Engineering', level: 'senior' },
  { title: 'Security Engineer', category: 'Engineering', level: 'mid' },
  { title: 'QA Engineer', category: 'Engineering', level: 'mid' },
  { title: 'Scrum Master', category: 'Management', level: 'mid' },
  { title: 'Project Manager', category: 'Management', level: 'mid' },
  { title: 'Python Developer', category: 'Engineering', level: 'mid' },
  { title: 'Software Engineer', category: 'Engineering', level: 'mid' },
];

interface Skill {
  skill: string;
  score: number;
}

interface SkillGapResult {
  target_role: string;
  current_skills: string[];
  matched_skills: Skill[];
  missing_skills: Skill[];
}

interface RoleGapResult {
  from_role: string;
  to_role: string;
  shared_skills: Skill[];
  missing_skills: Skill[];
}

interface JobRole {
  title: string;
  category: string;
  level: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'skill-gap' | 'role-gap'>('explorer');
  const [loading, setLoading] = useState(false);

  const [explorerRole, setExplorerRole] = useState('');
  const [explorerResults, setExplorerResults] = useState<Skill[] | null>(null);

  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [skillGapResults, setSkillGapResults] = useState<SkillGapResult | null>(null);

  const [fromRole, setFromRole] = useState('');
  const [toRole, setToRole] = useState('');
  const [roleGapResults, setRoleGapResults] = useState<RoleGapResult | null>(null);

  const handleExplorer = async () => {
    if (!explorerRole) return;
    setLoading(true);
    // try {
    //   const response = await fetch('https://AJPR63555-AJ-PROJ.hf.space/recommendation', {
    //     method: 'GET',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       from_role: explorerRole,
    //       top_n: 10,
    //       method: 'hybrid'
    //     })
    //   });
    //   console.log("API URL CONSTRUCTED : ", response.url);
    //   const data = await response.json();
    //   setExplorerResults(data.missing_skills || []);
    // } catch (error) {
    //   console.error('Error:', error);
    //   setExplorerResults([]);
    // }
    // setLoading(false);
    try {
      // Option 2: Use a proper GET request with URL parameters
      const url = new URL('https://AJPR63555-AJ-PROJ.hf.space/recommendations');
      url.searchParams.append('job_role', explorerRole);
      url.searchParams.append('top_n', '10');
      url.searchParams.append('method', 'hybrid');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log("API URL CONSTRUCTED : ", response.url);
      const data = await response.json();
      setExplorerResults(data.recommendations || []);
    } catch (error) {
      console.error('Error:', error);
      setExplorerResults([]);
    }
    setLoading(false);
  };

  const handleSkillGap = async () => {
    if (!targetRole || !currentSkills) return;
    setLoading(true);
    try {
      const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(s => s);
      const response = await fetch('https://AJPR63555-AJ-PROJ.hf.space/skill_gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_role: targetRole,
          current_skills: skillsArray,
          top_n: 10
        })
      });
      const data = await response.json();
      setSkillGapResults(data);
    } catch (error) {
      console.error('Error:', error);
      setSkillGapResults(null);
    }
    setLoading(false);
  };

  const handleRoleGap = async () => {
    if (!fromRole || !toRole) return;
    setLoading(true);
    try {
      const response = await fetch('https://AJPR63555-AJ-PROJ.hf.space/role_gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_role: fromRole,
          to_role: toRole,
          top_n: 10,
          method: 'hybrid'
        })
      });
      const data = await response.json();
      setRoleGapResults(data);
    } catch (error) {
      console.error('Error:', error);
      setRoleGapResults(null);
    }
    setLoading(false);
  };

  return (
    <div className='rounded-xl' style={{
      minHeight: '100vh',
      background: 'background',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            Skill Recommendation Engine
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#64748b',
            fontWeight: '400'
          }}>
            Comprehensive career development and skill gap analysis for corporate teams
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <StatCard icon={<Users size={24} />} title="Total Employees" value="2" subtitle="Active employees in system" />
          <StatCard icon={<Target size={24} />} title="Job Roles" value={JOB_ROLES.length.toString()} subtitle="Available positions" />
          <StatCard icon={<BookOpen size={24} />} title="Skills Database" value="30" subtitle="Skills in our database" />
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #e2e8f0',
          flexWrap: 'wrap'
        }}>
          <TabButton
            active={activeTab === 'explorer'}
            onClick={() => setActiveTab('explorer')}
            icon={<Search size={18} />}
            label="Skill Explorer"
          />
          <TabButton
            active={activeTab === 'skill-gap'}
            onClick={() => setActiveTab('skill-gap')}
            icon={<TrendingUp size={18} />}
            label="Skill Gap"
          />
          <TabButton
            active={activeTab === 'role-gap'}
            onClick={() => setActiveTab('role-gap')}
            icon={<ArrowRightLeft size={18} />}
            label="Role Gap"
          />
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          overflow: 'visible'
        }}>
          {activeTab === 'explorer' && (
            <div style={{ overflow: 'visible' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search size={24} />
                  Skill Explorer
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  Discover the skills required for different job roles in your organization
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 10 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>
                  Select Job Role
                </label>
                <CustomDropdown
                  value={explorerRole}
                  onChange={setExplorerRole}
                  options={JOB_ROLES}
                  placeholder="Choose a job role to explore..."
                />
              </div>

              <button
                onClick={handleExplorer}
                disabled={!explorerRole || loading}
                style={{
                  padding: '0.75rem 2rem',
                  background: explorerRole && !loading ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: explorerRole && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={20} />}
                Explore Skills
              </button>

              {explorerResults && (
                <div style={{ marginTop: '2rem', position: 'relative', zIndex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                    Recommended Skills for {explorerRole}
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {explorerResults.map((skill, idx) => (
                      <SkillCard key={idx} skill={skill.skill} score={skill.score} color="#0ea5e9" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'skill-gap' && (
            <div style={{ overflow: 'visible' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={24} />
                  Skill Gap Analysis
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  Identify missing skills for your target role based on your current skillset
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 10 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>
                  Target Job Role
                </label>
                <CustomDropdown
                  value={targetRole}
                  onChange={setTargetRole}
                  options={JOB_ROLES}
                  placeholder="Choose target role..."
                />
              </div>

              <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>
                  Current Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  placeholder="e.g., python, sql, javascript"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={handleSkillGap}
                disabled={!targetRole || !currentSkills || loading}
                style={{
                  padding: '0.75rem 2rem',
                  background: targetRole && currentSkills && !loading ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: targetRole && currentSkills && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <TrendingUp size={20} />}
                Analyze Gap
              </button>

              {skillGapResults && (
                <div style={{ marginTop: '2rem', position: 'relative', zIndex: 1 }}>
                  {skillGapResults.matched_skills && skillGapResults.matched_skills.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#10b981' }}>
                        Matched Skills ({skillGapResults.matched_skills.length})
                      </h3>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {skillGapResults.matched_skills.map((skill, idx) => (
                          <SkillCard key={idx} skill={skill.skill} score={skill.score} color="#10b981" />
                        ))}
                      </div>
                    </div>
                  )}

                  {skillGapResults.missing_skills && skillGapResults.missing_skills.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#f59e0b' }}>
                        Missing Skills ({skillGapResults.missing_skills.length})
                      </h3>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {skillGapResults.missing_skills.map((skill, idx) => (
                          <SkillCard key={idx} skill={skill.skill} score={skill.score} color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'role-gap' && (
            <div style={{ overflow: 'visible' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowRightLeft size={24} />
                  Role Gap Analysis
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  Compare skills between two roles to identify transition requirements
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 10 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>
                  Current Role
                </label>
                <CustomDropdown
                  value={fromRole}
                  onChange={setFromRole}
                  options={JOB_ROLES}
                  placeholder="Choose current role..."
                />
              </div>

              <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 9 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>
                  Target Role
                </label>
                <CustomDropdown
                  value={toRole}
                  onChange={setToRole}
                  options={JOB_ROLES}
                  placeholder="Choose target role..."
                />
              </div>

              <button
                onClick={handleRoleGap}
                disabled={!fromRole || !toRole || loading}
                style={{
                  padding: '0.75rem 2rem',
                  background: fromRole && toRole && !loading ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: fromRole && toRole && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRightLeft size={20} />}
                Compare Roles
              </button>

              {roleGapResults && (
                <div style={{ marginTop: '2rem', position: 'relative', zIndex: 1 }}>
                  {roleGapResults.shared_skills && roleGapResults.shared_skills.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#10b981' }}>
                        Shared Skills ({roleGapResults.shared_skills.length})
                      </h3>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {roleGapResults.shared_skills.map((skill, idx) => (
                          <SkillCard key={idx} skill={skill.skill} score={skill.score} color="#10b981" />
                        ))}
                      </div>
                    </div>
                  )}

                  {roleGapResults.missing_skills && roleGapResults.missing_skills.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#ef4444' }}>
                        Skills to Acquire ({roleGapResults.missing_skills.length})
                      </h3>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {roleGapResults.missing_skills.map((skill, idx) => (
                          <SkillCard key={idx} skill={skill.skill} score={skill.score} color="#ef4444" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        input:focus {
          border-color: #0ea5e9 !important;
        }

        button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

function CustomDropdown({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (value: string) => void;
  options: JobRole[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedRole = options.find(opt => opt.title === value);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', zIndex: isOpen ? 100 : 10 }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          background: 'white',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          outline: 'none',
          transition: 'border-color 0.2s',
          fontSize: '1rem'
        }}
      >
        <div>
          {value ? (
            <div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>{selectedRole?.title}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>
                {selectedRole?.category} • {selectedRole?.level}
              </div>
            </div>
          ) : (
            <span style={{ color: '#94a3b8' }}>{placeholder}</span>
          )}
        </div>
        <ChevronDown size={20} style={{
          color: '#64748b',
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'relative',
          top: 'calc(100% + 0.5rem)',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          paddingTop: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 1000,
          maxHeight: '320px',
          overflowY: 'auto'
        }}>
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(option.title);
                setIsOpen(false);
              }}
              style={{
                padding: '0.875rem 1rem',
                cursor: 'pointer',
                background: value === option.title ? '#22c55e' : 'transparent',
                color: value === option.title ? 'white' : '#1e293b',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderBottom: idx < options.length - 1 ? '1px solid #f1f5f9' : 'none'
              }}
              onMouseEnter={(e) => {
                if (value !== option.title) {
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.title) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {value === option.title && (
                <Check size={18} style={{ flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{option.title}</div>
                <div style={{
                  fontSize: '0.8125rem',
                  opacity: value === option.title ? 0.9 : 0.6,
                  marginTop: '2px'
                }}>
                  {option.category} • {option.level}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }: { icon: React.ReactNode; title: string; value: string; subtitle: string }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </h3>
        <div style={{ color: '#94a3b8' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
        {subtitle}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.75rem 1.5rem',
        background: 'transparent',
        border: 'none',
        borderBottom: active ? '3px solid #0ea5e9' : '3px solid transparent',
        color: active ? '#0ea5e9' : '#64748b',
        fontWeight: active ? '600' : '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1rem',
        transition: 'all 0.2s'
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function SkillCard({ skill, score, color }: { skill: string; score: number; color: string }) {
  const percentage = Math.round(score * 100);

  return (
    <div style={{
      background: 'linear-gradient(to right, #f8fafc, #ffffff)',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '1rem',
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '1rem', textTransform: 'capitalize' }}>
          {skill}
        </span>
        <span style={{
          background: color,
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          {percentage}%
        </span>
      </div>
      <div style={{
        height: '8px',
        background: '#e2e8f0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: color,
          width: `${percentage}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}
