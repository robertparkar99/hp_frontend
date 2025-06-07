// app/layout.tsx
import './globals.css'
import Header from '../components/Header/Header'
import HistorySection from '@/components/SideMenu/HistorySection'
import LeftSideMenu from '@/components/SideMenu/LeftSideMenu'
import Login from './login/Login'

// import Footer from '../components/Footer'

export const metadata = {
  title: 'HP Menu',
  description: 'Simple layout with header, footer, and dynamic content',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<>
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
    </> )
}
