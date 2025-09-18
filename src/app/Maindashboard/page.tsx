// app/dashboard/page.tsx

import MainScreen from "../content/Dashboard/MainScreen";
import Header from '../../components/Header/Header'
import '../globals.css'

// export default function DashboardPage() {
//   console.log("DashboardPage rendered");
//   return <MainScreen />;
// }

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (<>

    <Header />
    {/* test starts here  */}
    <div className="contentDiv h-[60vh] w-full">
      <div className="mainDiv">
        <main className="hide-scroll" style={{ padding: '1rem', height:'90vh', overflow:'auto'}}> <MainScreen/></main>
      </div>
    </div>

  </>)
}