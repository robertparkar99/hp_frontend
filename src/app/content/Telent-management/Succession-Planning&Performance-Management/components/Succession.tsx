import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronRight,
  ChevronDown,
  Award,
  Briefcase,
  GraduationCap,
  Landmark,
  Link2,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
  Users,
  ArrowRight
} from "lucide-react"

interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string;
  org_type?: string;
  user_id?: string;
}

interface SkillData {
  id: number;
  category?: string;
  sub_category: string;
  title: string;
  description: string;
  proficiency_level: string;
  user_rating: string;
  status: string;
}

interface CourseRecommendation {
  type: 'course';
  skill: string;
  courses: any[];
}

interface SuggestionRecommendation {
  type: 'suggestion';
  skill: string;
}

type Recommendation = CourseRecommendation | SuggestionRecommendation;



const learningPlanFlow = [
  {
    title: "Assess Readiness",
    description: "Start with the current readiness score and the role you want to move into.",
    badge: "01",
  },
  {
    title: "Identify Gaps",
    description: "Compare leadership, training, and admin skills against the target role.",
    badge: "02",
  },
  {
    title: "Assign Actions",
    description: "Add coaching, shadowing, learning modules, and stretch tasks.",
    badge: "03",
  },
  {
    title: "Review Progress",
    description: "Recheck progress, update the plan, and prepare the next move.",
    badge: "04",
  },
]

const getIconForRole = (roleName: string) => {
  if (roleName.toLowerCase().includes('educator') || roleName.toLowerCase().includes('training')) return GraduationCap
  if (roleName.toLowerCase().includes('clinician') || roleName.toLowerCase().includes('clinical')) return Stethoscope
  if (roleName.toLowerCase().includes('director') || roleName.toLowerCase().includes('executive')) return Briefcase
  return Users
}

const getIconForSkillCategory = (category: string) => {
  if (category.toLowerCase().includes('leadership') || category.toLowerCase().includes('management')) return Users
  if (category.toLowerCase().includes('clinical') || category.toLowerCase().includes('medical')) return Stethoscope
  if (category.toLowerCase().includes('education') || category.toLowerCase().includes('training')) return GraduationCap
  if (category.toLowerCase().includes('administration') || category.toLowerCase().includes('planning')) return Landmark
  return Target
}

const getToneForIndex = (index: number) => {
  const tones = [
    {
      card: "border-blue-200 bg-blue-50/70 hover:bg-blue-50 hover:border-blue-300",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-700",
    },
    {
      card: "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50 hover:border-emerald-300",
      icon: "bg-emerald-100 text-emerald-600",
      text: "text-emerald-700",
    },
    {
      card: "border-violet-200 bg-violet-50/70 hover:bg-violet-50 hover:border-violet-300",
      icon: "bg-violet-100 text-violet-600",
      text: "text-violet-700",
    },
  ]
  return tones[index % tones.length]
}

export default function Succession() {
  const router = useRouter()
  const [userName, setUserName] = useState("John Doe");
  const [department, setDepartment] = useState("Nursing");
  const [showLearningPlan, setShowLearningPlan] = useState(false)
  const [careerSteps, setCareerSteps] = useState<any[]>([])
  const [lateralOpportunities, setLateralOpportunities] = useState<any[]>([])
  const [overallReadiness, setOverallReadiness] = useState(0)
  const [currentRole, setCurrentRole] = useState({ role: "Staff Nurse", level: "MID", id: 0 })
  const [nextRole, setNextRole] = useState("Nurse Manager")
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [careerLoading, setCareerLoading] = useState(false);
  const [jobroleId, setJobroleId] = useState<number | null>(null);
  const [developmentSkills, setDevelopmentSkills] = useState<SkillData[]>([]);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState({ role: "", level: "", id: 0, readiness: 100 });
  const [selectedSource, setSelectedSource] = useState<"career" | "lateral">("career");
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [lmsCourses, setLmsCourses] = useState<any[]>([]);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  // Load session data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, org_type, user_id });
      }
    }
  }, []);

  // Fetch career journey data only when sessionData is ready
  useEffect(() => {
    // Don't fetch if sessionData doesn't have required fields
    if (!sessionData.url || !sessionData.user_id || !sessionData.sub_institute_id) {
      if (sessionData.url === undefined) {
        // Still loading session data
        return;
      }
      // Session data exists but missing required fields
      console.error('Missing required session data for career journey fetch');
      setLoading(false);
      return;
    }



    // Fetch career journey data
    const fetchCareerJourney = async () => {
      setCareerLoading(true);
      try {
        const url = `${sessionData.url}/api/career-journey?user_id=${sessionData.user_id}&sub_institute_id=${sessionData.sub_institute_id}`;
        console.log('Fetching career journey from:', url);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${sessionData.token}`
          },
        });

        const data = await response.json();

        if (data.status && data.current_jobrole) {
          // Set user name from API response
          if (data.user) {
            setUserName(data.user.name);
            setDepartment(data.user.department_name || "Nursing");
          }

          const vertical = (data.vertical_data || []).map((item: any) => ({
            role: item.role_name,
            level: item.job_level,
            readiness: parseInt(item.progress.replace('%', '')),
            status: item.status,
            id: item.jobrole_id || item.id,
          }))
          // Prepend current jobrole as the first step
          const currentStep = {
            role: data.current_jobrole.jobrole,
            level: data.current_jobrole.job_level,
            readiness: 100, // Current role is fully ready
            status: 'current',
            id: data.current_jobrole.id,
          }
          const fullCareerSteps = [currentStep, ...vertical]
          const lateral = (data.lateral_data || []).map((item: any, index: number) => ({
            id: item.jobrole_id || item.id,
            role: item.role_name,
            level: item.job_level,
            icon: getIconForRole(item.role_name),
            tone: getToneForIndex(index),
          }))
          setCareerSteps(fullCareerSteps)
          setLateralOpportunities(lateral)
          setCurrentRole({ role: data.current_jobrole.jobrole, level: data.current_jobrole.job_level, id: data.current_jobrole.id })
          setJobroleId(data.current_jobrole.id)
          setSelectedRoleId(data.current_jobrole.id)
          setSelectedRole({ role: data.current_jobrole.jobrole, level: data.current_jobrole.job_level, id: data.current_jobrole.id, readiness: 100 })
          if (fullCareerSteps.length > 1) {
            setNextRole(fullCareerSteps[1].role)
          }
          if (vertical.length > 0) {
            const totalReadiness = vertical.reduce((sum: number, item: any) => sum + item.readiness, 0)
            setOverallReadiness(Math.round(totalReadiness / vertical.length))
          }

          // Compute readiness for next role based on skill matching
          if (vertical.length > 0) {
            const nextRoleId = vertical[0].id
            const nextJobroleUrl = `${sessionData.url}/get-kaba?sub_institute_id=${sessionData.sub_institute_id}&type=jobrole&type_id=${nextRoleId}`;
            const ratingsUrl = `${sessionData.url}/table_data?table=user_rating_details&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[user_id]=${sessionData.user_id}&filters[jobrole_id]=${data.current_jobrole.id}`;

            try {
              const [nextJobroleResponse, ratingsResponse] = await Promise.all([
                fetch(nextJobroleUrl, {
                  headers: {
                    Authorization: `Bearer ${sessionData.token}`
                  },
                }),
                fetch(ratingsUrl, {
                  headers: {
                    Authorization: `Bearer ${sessionData.token}`
                  },
                })
              ]);

              const nextJobroleData = await nextJobroleResponse.json();
              const ratingsData = await ratingsResponse.json();

              const userRatingsMap: { [key: string]: number } = {};
              if (ratingsData && Array.isArray(ratingsData) && ratingsData.length > 0 && ratingsData[0].skill_ids) {
                let parsedSkillIds = {};
                if (typeof ratingsData[0].skill_ids === "string") {
                  parsedSkillIds = JSON.parse(ratingsData[0].skill_ids);
                } else {
                  parsedSkillIds = ratingsData[0].skill_ids;
                }
                Object.entries(parsedSkillIds).forEach(([skillId, rating]) => {
                  userRatingsMap[skillId] = Number(rating);
                });
              }

              let totalCompleted = 0;
              let totalRequired = 0;
              (nextJobroleData.skill || []).forEach((skill: any) => {
                const required = Number(skill.proficiency_level);
                const completed = userRatingsMap[skill.id.toString()] || 0;
                totalCompleted += completed;
                totalRequired += required;
              });

              const calculatedReadiness = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

              // Update the readiness for the next role
              fullCareerSteps[1].readiness = calculatedReadiness;
              setCareerSteps([...fullCareerSteps]);
            } catch (error) {
              console.error('Error computing readiness for next role:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching career journey:', error)
      } finally {
        setLoading(false);
        setDataFetched(true);
        setCareerLoading(false);
      }
    };

    fetchCareerJourney();
  }, [sessionData.url, sessionData.user_id, sessionData.sub_institute_id, sessionData.token]); // Depend on sessionData values

  // Fetch development skills data
  useEffect(() => {
    if (!sessionData.url || !sessionData.sub_institute_id || !sessionData.user_id || !selectedRoleId || !currentRole.id) {
      return;
    }

    const fetchDevelopmentSkills = async () => {
      setSkillsLoading(true);
      try {
        // Fetch selected job role skills and current job role user ratings in parallel
        const jobroleUrl = `${sessionData.url}/get-kaba?sub_institute_id=${sessionData.sub_institute_id}&type=jobrole&type_id=${selectedRoleId}`;
        const ratingsUrl = `${sessionData.url}/table_data?table=user_rating_details&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[user_id]=${sessionData.user_id}&filters[jobrole_id]=${currentRole.id}`;

        console.log('Fetching selected job role skills from:', jobroleUrl);
        console.log('Fetching current job role user ratings from:', ratingsUrl);

        const [jobroleResponse, ratingsResponse] = await Promise.all([
          fetch(jobroleUrl, {
            headers: {
              Authorization: `Bearer ${sessionData.token}`
            },
          }),
          fetch(ratingsUrl, {
            headers: {
              Authorization: `Bearer ${sessionData.token}`
            },
          })
        ]);

        const jobroleData = await jobroleResponse.json();
        const ratingsData = await ratingsResponse.json();

        console.log("current ratingsData =>", ratingsData);

        // Correct user rating mapping from current role
        const userRatingsMap: { [key: string]: string } = {};

        if (
          ratingsData &&
          Array.isArray(ratingsData) &&
          ratingsData.length > 0 &&
          ratingsData[0].skill_ids
        ) {
          let parsedSkillIds = {};

          // IMPORTANT: skill_ids is string → parse JSON
          if (typeof ratingsData[0].skill_ids === "string") {
            parsedSkillIds = JSON.parse(ratingsData[0].skill_ids);
          } else {
            parsedSkillIds = ratingsData[0].skill_ids;
          }

          Object.entries(parsedSkillIds).forEach(([skillId, rating]) => {
            userRatingsMap[skillId] = String(rating);
          });
        }

        console.log("userRatingsMap =>", userRatingsMap);

        // Process skills for selected role, using current role ratings as baseline
        const skills: SkillData[] = (jobroleData.skill || []).map((skill: any) => {
          const userRating = userRatingsMap[skill.id.toString()] || 'Not Rated';
          const required = parseInt(skill.proficiency_level);
          const user = userRating !== 'Not Rated' ? parseInt(userRating) : 0;
          let status = 'Pending';
          if (userRating !== 'Not Rated') {
            status = user >= required ? 'Completed' : 'In Progress';
          }
          return {
            id: skill.id,
            category: skill.category,
            sub_category: skill.sub_category,
            title: skill.title,
            description: skill.description,
            proficiency_level: skill.proficiency_level,
            user_rating: userRating,
            status,
          };
        });

        setDevelopmentSkills(skills);

        // Compute readiness for selected role (except current role which stays 100)
        if (selectedRoleId !== currentRole.id) {
          const totalCompleted = skills.reduce((sum, skill) => sum + (skill.user_rating !== "Not Rated" ? Number(skill.user_rating) : 0), 0);
          const totalRequired = skills.reduce((sum, skill) => sum + Number(skill.proficiency_level), 0);
          const calculatedReadiness = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
          setSelectedRole(prev => ({ ...prev, readiness: calculatedReadiness }));
        }
      } catch (error) {
        console.error('Error fetching development skills:', error);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchDevelopmentSkills();
  }, [sessionData.url, sessionData.sub_institute_id, sessionData.user_id, sessionData.token, selectedRoleId, currentRole.id]);

  // Fetch LMS courses
  useEffect(() => {
    if (!sessionData.url || !sessionData.sub_institute_id || !sessionData.user_id) {
      return;
    }

    const fetchLmsCourses = async () => {
      try {
        const url = `${sessionData.url}/lms/course_master?type=API&sub_institute_id=${sessionData.sub_institute_id}&syear=2025&user_id=${sessionData.user_id}&user_profile_name=Admin`;
        console.log('Fetching LMS courses from:', url);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${sessionData.token}`
          },
        });

        const data = await response.json();

        if (data.message === "SUCCESS" && data.lms_subject?.Skill) {
          setLmsCourses(data.lms_subject.Skill);
        }
      } catch (error) {
        console.error('Error fetching LMS courses:', error);
      }
    };

    fetchLmsCourses();
  }, [sessionData.url, sessionData.sub_institute_id, sessionData.user_id, sessionData.token]);

  // Memoize skill statistics to avoid recalculating on every render
  const skillStats = useMemo(() => ({
    total: developmentSkills.length,
    completed: developmentSkills.filter(s => s.status === "Completed").length,
    inProgress: developmentSkills.filter(s => s.status === "In Progress").length,
    pending: developmentSkills.filter(s => s.status === "Pending").length,
  }), [developmentSkills]);

  // Memoize skill improvement recommendations
  const skillRecommendations = useMemo(() => {
    const pendingSkills = developmentSkills.filter(s => s.status === "Pending");
    const inProgressSkills = developmentSkills.filter(s => s.status === "In Progress");
    const relevantSkills = [...pendingSkills, ...inProgressSkills];

    // Courses: For each relevant skill, check for LMS course matches
    const courseRecommendations: Recommendation[] = relevantSkills.map(skill => {
      const matchingCourses = lmsCourses.filter(course => course.subject_name === skill.title);
      if (matchingCourses.length > 0) {
        return { type: 'course' as const, skill: skill.title, courses: matchingCourses };
      } else {
        return { type: 'suggestion' as const, skill: skill.title };
      }
    });

    const courseRecs = courseRecommendations.filter(rec => rec.type === 'course');
    const coursesCount = courseRecs.length;
    const courseSkills = courseRecs.map(rec => rec.skill).slice(0, 2).join(' and ');
    const description = courseSkills ? `Courses for ${courseSkills} will close your top skill gaps.` : 'Recommended courses will help close your skill gaps.';

    return {
      courses: { recommendations: courseRecommendations, count: coursesCount, description }
    };
  }, [developmentSkills, lmsCourses]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading career journey data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-3">
      <div className="mx-auto max-w-[1180px] space-y-4">
        <section className="rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-[30px] font-bold leading-none text-slate-900">Succession Planning</h1>
              <p className="mt-1 text-sm text-slate-500"> Career Path & Growth Opportunities</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-2">
              <Card className="border-slate-200 bg-slate-50 shadow-none">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">Employee</div>
                      <div className="truncate text-sm font-semibold text-slate-900">{userName}</div>
                      <div className="text-xs text-slate-500">Department: <span className="text-blue-600">{department}</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-violet-200 bg-violet-50 shadow-none">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                      <Briefcase className="h-5 w-5" />
                    </div>
                     <div>
                       <div className="text-xs text-slate-500">Current Role</div>
                       <div className="text-sm font-semibold text-slate-900">{currentRole.role} ({currentRole.level})</div>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.95fr]">
          <Card className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.07)]">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Your Career Journey
              </CardTitle>

            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {careerLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-500">Loading career journey...</p>
                </div>
              ) : careerSteps.length > 0 ? (
                <div className="relative overflow-x-auto pb-2">
                  <div className="min-w-[860px]">
                    <div className="relative px-3">
                      <div className="absolute left-8 right-8 top-[18px] flex h-[3px] overflow-hidden rounded-full bg-slate-200">
                        {careerSteps.slice(0, -1).map((_, index) => (
                          <div
                            key={index}
                            className={`h-full flex-1 ${index % 5 === 0
                              ? "bg-blue-400"
                              : index % 5 === 1
                                ? "bg-emerald-400"
                                : index % 5 === 2
                                  ? "bg-orange-400"
                                  : index % 5 === 3
                                    ? "bg-violet-400"
                                    : "bg-pink-400"
                              }`}
                          />
                        ))}
                      </div>
                      <div className="relative flex items-start justify-between gap-3">
                        {careerSteps.map((step, index) => (
                          <div
                            key={step.role}
                            className={`flex w-[130px] flex-col items-center cursor-pointer transition-all duration-300 sm:w-[140px] ${step.id === selectedRoleId
                                ? "scale-105 rounded-2xl"
                                : "scale-95 opacity-80"
                              }`}
                            onClick={() => {
                              setSelectedRoleId(step.id);
                              setSelectedRole({
                                role: step.role,
                                level: step.level,
                                id: step.id,
                                readiness: step.readiness,
                              });
                              setSelectedSource("career");
                            }}
                          >
                            <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-bold text-white shadow-sm ${index % 6 === 0 ? "bg-blue-500" :
                              index % 6 === 1 ? "bg-emerald-500" :
                                index % 6 === 2 ? "bg-orange-500" :
                                  index % 6 === 3 ? "bg-violet-500" :
                                    index % 6 === 4 ? "bg-pink-500" : "bg-cyan-500"
                              }`}>
                              {index + 1}
                            </div>
                            <div className={`mt-4 w-full rounded-2xl border px-3 py-3 text-center shadow-sm ${index % 6 === 0 ? "border-blue-200 bg-blue-50" :
                              index % 6 === 1 ? "border-emerald-200 bg-emerald-50" :
                                index % 6 === 2 ? "border-orange-200 bg-orange-50" :
                                  index % 6 === 3 ? "border-violet-200 bg-violet-50" :
                                    index % 6 === 4 ? "border-pink-200 bg-pink-50" : "border-cyan-200 bg-cyan-50"
                              }`}>
                              <div className={`text-xs font-semibold uppercase ${index % 6 === 0 ? "text-blue-600" :
                                index % 6 === 1 ? "text-emerald-600" :
                                  index % 6 === 2 ? "text-orange-600" :
                                    index % 6 === 3 ? "text-violet-600" :
                                      index % 6 === 4 ? "text-pink-600" : "text-cyan-600"
                                }`}>
                                {index === 0 ? "Current" : index === 1 ? "Next" : index === careerSteps.length - 1 ? "Long-term Goal" : "Then"}
                              </div>
                              <div className="mt-1 text-sm font-bold leading-tight text-slate-900">{step.role}</div>
                              <div className="mt-1 text-xs font-medium text-slate-500">{step.level}</div>
                              <Badge className={`mt-3 rounded-full border px-2.5 py-1 text-xs font-semibold ${index % 6 === 0 ? "border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:border-blue-300" :
                                index % 6 === 1 ? "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:border-emerald-300" :
                                  index % 6 === 2 ? "border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-200 hover:border-orange-300" :
                                    index % 6 === 3 ? "border-violet-200 bg-violet-100 text-violet-700 hover:bg-violet-200 hover:border-violet-300" :
                                      index % 6 === 4 ? "border-pink-200 bg-pink-100 text-pink-700 hover:bg-pink-200 hover:border-pink-300" : "border-cyan-200 bg-cyan-100 text-cyan-700 hover:bg-cyan-200 hover:border-cyan-300"
                                }`}>
                                {step.readiness}% Ready
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : dataFetched ? (
                <div className="text-center py-8 text-slate-500">
                  No career journey data available
                </div>
              ) : null}

              {careerSteps.length > 0 && (
                <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                  <div className="flex items-center gap-3">


                    {/* Content */}
                    <div className="flex-1">
                      <div className="text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">
                          Total Journey:
                        </span>{" "}
                        {careerSteps.length - 1} progression steps from current role to top leadership
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Step-by-step progression based on role hierarchy. Click any step to
                        view its required skills, skill gaps, and readiness in the Development
                        Focus Areas section.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Target className="h-5 w-5 text-violet-500" />
                Development Focus Areas
              </CardTitle>

              <p className="text-sm text-slate-500">
                Skill readiness for {selectedRole.role} ({selectedRole.level})
              </p>
              <p className="text-sm text-slate-500">
                Source: {selectedSource === "career" ? "Career Journey Progression" : "Alternative (Lateral) Opportunity"}
              </p>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {skillsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-500">Loading skills...</p>
                </div>
              ) : (
                <>
                  {/* TOP SUMMARY */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
                      <p className="text-xs text-slate-500">Total Skills</p>
                      <h2 className="text-2xl font-bold text-blue-600">
                        {skillStats.total}
                      </h2>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                      <p className="text-xs text-slate-500">Completed</p>
                      <h2 className="text-2xl font-bold text-emerald-600">
                        {skillStats.completed}
                      </h2>
                    </div>

                    <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                      <p className="text-xs text-slate-500">In Progress</p>
                      <h2 className="text-2xl font-bold text-amber-600">
                        {skillStats.inProgress}
                      </h2>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                      <p className="text-xs text-slate-500">Pending</p>
                      <h2 className="text-2xl font-bold text-slate-700">
                        {skillStats.pending}
                      </h2>
                    </div>
                  </div>

                  {/* SKILL CARDS */}
                  <div className="max-h-64 overflow-y-auto scrollbar-hide">
                    <div className="space-y-3">
                      {developmentSkills
                        .slice(0, showAllSkills ? developmentSkills.length : 2)
                        .map((skill) => {
                          const required = Number(skill.proficiency_level)
                          const completedFromCurrent = skill.user_rating !== "Not Rated"
                            ? Number(skill.user_rating)
                            : 0

                          const remainingGap = Math.max(0, required - completedFromCurrent)
                          const progress = Math.min((completedFromCurrent / required) * 100, 100)

                          const statusColor =
                            skill.status === "Completed"
                              ? "border-l-emerald-500"
                              : skill.status === "In Progress"
                                ? "border-l-amber-500"
                                : "border-l-slate-400"

                          const badgeColor =
                            skill.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:border-emerald-300"
                              : skill.status === "In Progress"
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-200 hover:border-amber-300"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:border-slate-300"

                          return (
                            <div
                              key={skill.id}
                              className={`rounded-2xl border border-slate-200 border-l-[6px] ${statusColor} bg-white p-5 shadow-sm hover:shadow-md transition`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="text-base font-bold text-slate-900">
                                    {skill.title}
                                  </h3>

                                  <p className="text-sm text-slate-500 mt-1">
                                    {skill.category} • {skill.sub_category}
                                  </p>
                                </div>

                                <Badge className={`rounded-full px-3 py-1 ${badgeColor}`}>
                                  {skill.status}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                                <div>
                                  <p className="text-xs text-slate-500">Required</p>
                                  <p className="font-semibold">{required}</p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">Completed from Current</p>
                                  <p className="font-semibold">
                                    {completedFromCurrent}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">Remaining Gap</p>
                                  <p className="font-semibold text-red-500">
                                    {remainingGap}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">Readiness</p>
                                  <p className="font-semibold text-blue-600">
                                    {Math.round(progress)}%
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* View More Button */}
                    {skillStats.total > 2 && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => setShowAllSkills(!showAllSkills)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {showAllSkills ? "Show Less" : "View More Skills"}
                        </button>
                      </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {showLearningPlan && (
          <section className="overflow-hidden rounded-[16px] border border-sky-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.07)]">
            <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Sparkles className="h-5 w-5 text-sky-500" />
                Development Workflow
              </div>
              <p className="mt-1 text-sm text-slate-500">
                A simple succession planning flow from readiness to reassessment.
              </p>
            </div>

            <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-4">
              {learningPlanFlow.map((step, index) => (
                <div key={step.badge} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-600">
                      {step.badge}
                    </div>
                    {index < learningPlanFlow.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-slate-400 md:hidden" />
                    )}
                  </div>
                  <div className="mt-3 text-sm font-semibold text-slate-900">{step.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">{step.description}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.95fr]">
          <Card className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.07)]">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <Link2 className="h-4 w-4" />
                </div>
                Alternative (Lateral) Opportunities
              </CardTitle>
              <p className="text-sm text-slate-500">Roles you can move into based on your profile</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {lateralOpportunities.length > 0 ? (
                  lateralOpportunities.map((opp) => {
                    const Icon = opp.icon
                    return (
                      <div
                        key={opp.role}
                        className={`flex min-h-[74px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 ${opp.tone.card}`}
                        onClick={() => {
                          setSelectedRoleId(opp.id);
                          setSelectedRole({
                            role: opp.role,
                            level: opp.level,
                            id: opp.id,
                            readiness: 0,
                          });
                          setSelectedSource("lateral");
                        }}
                      >
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${opp.tone.icon}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="text-sm font-semibold text-slate-900">{opp.role}</div>
                          <div className={`mt-0.5 text-xs font-medium ${opp.tone.text}`}>{opp.level}</div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-3 text-center py-4 text-slate-500">
                    No lateral opportunities available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.07)]">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                Skill Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-4">
                {/* Complete Recommended Courses */}
                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setShowCourseDetails(!showCourseDetails)}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">Complete Recommended Courses</div>
                      <p className="text-sm text-slate-700 mt-1">{skillRecommendations.courses.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 hover:border-green-700">
                        {skillRecommendations.courses.count} Courses
                      </Badge>
                      {showCourseDetails ? <ChevronDown className="h-4 w-4 text-green-600" /> : <ChevronRight className="h-4 w-4 text-green-600" />}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {showCourseDetails && (
          <section className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.07)]">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <GraduationCap className="h-4 w-4" />
                </div>
                Skill-wise Course Recommendations
              </CardTitle>
              <p className="text-sm text-slate-500">Detailed course recommendations based on your pending and in-progress skills</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-4">
                {skillRecommendations.courses.recommendations.map((rec, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-900">{rec.skill}</div>
                    {rec.type === 'course' ? (
                      <div className="mt-2">
                        <div className="text-sm text-slate-700 mb-2">Available Course(s):</div>
                        <div className="flex flex-wrap gap-2">
                           {rec.courses.map((course, idx) => (
                             <Link
                               key={idx}
                               href={`/content/LMS?search=${encodeURIComponent(course.subject_name)}`}
                               className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                             >
                               {course.subject_name}
                             </Link>
                           ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-slate-700 mb-2">
                          Course not available for this skill. Suggested to create a new learning course for: <span className="font-medium">{rec.skill}</span>
                        </p>
                        <button
                          onClick={() => router.push('/content/Libraries/skillLibrary?search=' + encodeURIComponent(rec.skill))}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 transition-colors"
                        >
                          Create Course
                        </button>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </section>
        )}
      </div>
    </div>
  )
}