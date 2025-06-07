'use client'

import MainScreen from "./content/Dashboard/MainScreen"
import { useEffect } from 'react'
import './globals.css'
import Header from '../components/Header/Header'
import HistorySection from '@/components/SideMenu/HistorySection'
import LeftSideMenu from '@/components/SideMenu/LeftSideMenu'
import Login from "./login/Login"
// // app/page.tsx
// here 

export default function HomePage() {
  useEffect(() => {
    const el = document.querySelector('.leftaside') as HTMLElement | null
    if (el) {
      el.style.display = 'none'
    }
  }, [])

  return <Login />
}
// here we go for deployment 
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (<>
//     <html lang="en">
//       <body>
//         <Header />
//         {/* test starts here  */}
//         <div className="contentDiv w-full max-w-[1445px] max-md:max-w-full">
//           <div className="mainDiv">
//           <main style={{ padding: '1rem' }}>{children}</main>
//           </div>

//           <div className="historyDiv">
//           <section className="px-5 py-10 ml-auto bg-white rounded-2xl shadow-sm h-[865px] w-auto max-md:w-full max-md:h-auto max-md:min-h-[600px] max-sm:px-2.5 max-sm:py-5 max-sm:w-full max-sm:shadow-none historySection">
//             <h2 className="mx-5 my-0 text-1xl text-stone-500">History</h2>
//             <hr className="mx-2.5 my-5 h-0.5 bg-stone-500 border-0" />
//           </section>
//           </div>
//         </div>
//         {/* test ends here  */}


//         {/* <main style={{ padding: '1rem' }}>{children}</main> */}
//         {/* <HistorySection/> */}
//         {/* <section className="px-5 py-10 ml-auto bg-white rounded-2xl shadow-sm h-[880px] w-[280px] max-md:w-60 max-md:h-auto max-md:min-h-[600px] max-sm:px-2.5 max-sm:py-5 max-sm:w-full max-sm:shadow-none">
//       <h2 className="mx-5 my-0 text-2xl text-stone-500">History</h2>
//       <hr className="mx-2.5 my-5 h-0.5 bg-stone-500 border-0" />
//     </section> */}
//         {/* <Footer /> */}
//       </body>
//     </html>
//     </> )
// }