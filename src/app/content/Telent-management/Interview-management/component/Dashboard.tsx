// import { DashboardStats } from "./DashboardStats";
// import { UpcomingInterviews } from "./UpcomingInterviews";
// import { CandidatePipeline } from "./CandidatePipeline";

// export function Dashboard() {
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
//         <p className="text-muted-foreground">
//           Welcome back! Here's what's happening with your interviews today.
//         </p>
//       </div>

//       {/* Stats Cards */}
//       <DashboardStats />

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <UpcomingInterviews />
//         <CandidatePipeline />
//       </div>
//     </div>
//   );
// }


import { DashboardStats } from "./DashboardStats";
import { UpcomingInterviews } from "./UpcomingInterviews";
import { CandidatePipeline } from "./CandidatePipeline";
import { Calendar, Users, UserCheck } from "lucide-react"; // Make sure to install lucicon-react

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your interviews today.
        </p>
      </div>

      {/* Navigation Menu Toggle */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Calendar className="h-4 w-4" />
            Schedule Interview
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
            <Users className="h-4 w-4" />
            Candidates
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
            <UserCheck className="h-4 w-4" />
            Interview Panel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingInterviews />
        <CandidatePipeline />
      </div>
    </div>
  );
}