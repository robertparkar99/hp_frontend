import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Award,
  Briefcase,
  Clock3,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Landmark,
  Link2,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"

interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string;
  org_type?: string;
  user_id?: string;
}

const developmentSkills = [
  {
    skill: "Clinical Expertise",
    progress: 90,
    status: "Advanced",
    icon: Stethoscope,
    note: "Keep sharpening evidence-based care and escalation decisions",
  },
  {
    skill: "Leadership & Management",
    progress: 60,
    status: "Developing",
    icon: Users,
    note: "Focus on delegation, coaching, and shift-to-shift coordination",
  },
  {
    skill: "Education & Training",
    progress: 50,
    status: "Building",
    icon: GraduationCap,
    note: "Support onboarding and structured learning for new nurses",
  },
  {
    skill: "Healthcare Administration",
    progress: 35,
    status: "Early",
    icon: Landmark,
    note: "Strengthen planning, reporting, and service-line visibility",
  },
]

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
  const [userName, setUserName] = useState("John Doe");
  const [showLearningPlan, setShowLearningPlan] = useState(false)
  const [careerSteps, setCareerSteps] = useState<any[]>([])
  const [lateralOpportunities, setLateralOpportunities] = useState<any[]>([])
  const [overallReadiness, setOverallReadiness] = useState(0)
  const [currentRole, setCurrentRole] = useState({ role: "Staff Nurse", level: "MID" })
  const [nextRole, setNextRole] = useState("Nurse Manager")
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [loading, setLoading] = useState(true);

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

    const role = localStorage.getItem("userRole") || "employee"
    const names = {
      "hr-manager": "Sarah Johnson",
      "line-manager": "Michael Chen",
      employee: "John Doe",
    }
    setUserName(names[role as keyof typeof names] || "User")

    // Fetch career journey data
    const fetchCareerJourney = async () => {
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
          const vertical = (data.vertical_data || []).map((item: any) => ({
            role: item.role_name,
            level: item.job_level,
            readiness: parseInt(item.progress.replace('%', '')),
            status: item.status,
          }))
          // Prepend current jobrole as the first step
          const currentStep = {
            role: data.current_jobrole.jobrole,
            level: data.current_jobrole.job_level,
            readiness: 100, // Current role is fully ready
            status: 'current',
          }
          const fullCareerSteps = [currentStep, ...vertical]
          const lateral = (data.lateral_data || []).map((item: any, index: number) => ({
            role: item.role_name,
            level: item.job_level,
            icon: getIconForRole(item.role_name),
            tone: getToneForIndex(index),
          }))
          setCareerSteps(fullCareerSteps)
          setLateralOpportunities(lateral)
          setCurrentRole({ role: data.current_jobrole.jobrole, level: data.current_jobrole.job_level })
          if (fullCareerSteps.length > 1) {
            setNextRole(fullCareerSteps[1].role)
          }
          if (vertical.length > 0) {
            const totalReadiness = vertical.reduce((sum: number, item: any) => sum + item.readiness, 0)
            setOverallReadiness(Math.round(totalReadiness / vertical.length))
          }
        }
      } catch (error) {
        console.error('Error fetching career journey:', error)
      } finally {
        setLoading(false);
      }
    };

    fetchCareerJourney();
  }, [sessionData.url, sessionData.user_id, sessionData.sub_institute_id, sessionData.token]); // Depend on sessionData values

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
                      <div className="text-xs text-slate-500">Department: <span className="text-blue-600">Nursing</span></div>
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
              <p className="text-sm text-slate-500">Step-by-step progression based on role hierarchy</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {careerSteps.length > 0 ? (
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
                          <div key={step.role} className="flex w-[130px] flex-col items-center sm:w-[140px]">
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
                              <Badge className={`mt-3 rounded-full border px-2.5 py-1 text-xs font-semibold ${index % 6 === 0 ? "border-blue-200 bg-blue-100 text-blue-700" :
                                index % 6 === 1 ? "border-emerald-200 bg-emerald-100 text-emerald-700" :
                                  index % 6 === 2 ? "border-orange-200 bg-orange-100 text-orange-700" :
                                    index % 6 === 3 ? "border-violet-200 bg-violet-100 text-violet-700" :
                                      index % 6 === 4 ? "border-pink-200 bg-pink-100 text-pink-700" : "border-cyan-200 bg-cyan-100 text-cyan-700"
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
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No career journey data available
                </div>
              )}

              {careerSteps.length > 0 && (
                <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Total Journey:</span> {careerSteps.length - 1} progression steps from current role to top leadership
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.07)]">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <Target className="h-5 w-5 text-violet-500" />
                Development Focus Areas
              </CardTitle>
              <p className="text-sm text-slate-500">Skills to strengthen for next role ({nextRole})</p>
            </CardHeader>
            <CardContent className="space-y-5 p-4 sm:p-5">
              {developmentSkills.map((skill) => {
                const Icon = skill.icon
                const iconTone =
                  skill.skill === "Clinical Expertise"
                    ? "bg-blue-100 text-blue-600"
                    : skill.skill === "Leadership & Management"
                      ? "bg-emerald-100 text-emerald-600"
                      : skill.skill === "Education & Training"
                        ? "bg-violet-100 text-violet-600"
                        : "bg-orange-100 text-orange-600"
                const barTone =
                  skill.skill === "Clinical Expertise"
                    ? "bg-blue-500"
                    : skill.skill === "Leadership & Management"
                      ? "bg-emerald-500"
                      : skill.skill === "Education & Training"
                        ? "bg-violet-500"
                        : "bg-orange-500"

                return (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconTone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900">{skill.skill}</div>
                        <div className="text-xs text-slate-500">{skill.status} Level</div>
                      </div>
                      <div className="text-sm font-semibold text-slate-700">{skill.progress}%</div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className={`h-full rounded-full ${barTone}`} style={{ width: `${skill.progress}%` }} />
                    </div>
                  </div>
                )
              })}

              <div className="pt-1 text-right">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Learning Plan button clicked, current state:", showLearningPlan);
                    setShowLearningPlan(!showLearningPlan);
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 active:scale-95 transition-transform"
                >
                  {showLearningPlan ? "Hide Learning Plan" : "View Learning Plan"}
                  <ArrowRight className={`h-4 w-4 transition-transform ${showLearningPlan ? "rotate-90" : ""}`} />
                </button>
              </div>
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
                Progress Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="rounded-2xl bg-slate-50 p-3 sm:p-4">
                <div className="grid gap-3 lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-500">Overall Readiness for</div>
                      <div className="text-xs font-medium text-slate-500">Next Role</div>
                    </div>

                    <div className="relative h-14 w-14 shrink-0">
                      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-200" />
                        <circle
                          cx="60"
                          cy="60"
                          r="48"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={301.59}
                          strokeDashoffset={301.59 * (1 - overallReadiness / 100)}
                          className="text-teal-500"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-900">{overallReadiness}%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <span><span className="font-semibold text-slate-900">Strengths:</span> Clinical Expertise, Patient Care</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
                          <AlertCircle className="h-3.5 w-3.5" />
                        </div>
                        <span><span className="font-semibold text-slate-900">Focus:</span> Leadership, Training</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                          <Clock3 className="h-3.5 w-3.5" />
                        </div>
                        <span><span className="font-semibold text-slate-900">Estimated Time:</span> 12-18 Months</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}