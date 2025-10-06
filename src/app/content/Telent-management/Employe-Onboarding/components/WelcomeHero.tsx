import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Sparkles } from "lucide-react"
// import heroImage from "@/assets/hero-onboarding.jpg"

interface WelcomeHeroProps {
  userName?: string
  companyName?: string
  onGetStarted?: () => void
}

export const WelcomeHero = ({
  userName = "John",
  companyName = "TechCorp",
  onGetStarted
}: WelcomeHeroProps) => {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-hero text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        // style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90" />
      
      <CardContent className="relative z-10 px-8 py-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-medium text-yellow-100">Welcome to the team!</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            Welcome to {companyName}, {userName}!
          </h1>
          
          <p className="text-lg text-blue-100 mb-8 leading-relaxed">
            We're thrilled to have you join our team. Your onboarding journey is designed to help you 
            settle in, meet your colleagues, and start making an impact from day one.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="border-white/30 text-blue-500 hover:bg-white/10 hover:text-white"
            >
              View Guide
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}