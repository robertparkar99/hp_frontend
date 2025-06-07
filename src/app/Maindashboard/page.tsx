// app/dashboard/layout.tsx
import Header from '../../components/Header/Header'
import '../globals.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <div className="contentDiv w-full max-w-[1445px] max-md:max-w-full">
        <div className="mainDiv">
          <main style={{ padding: '1rem' }}>{children}</main>
        </div>
      </div>
    </>
  )
}