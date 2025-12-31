import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { MapPin, Camera, MessageSquare, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg "style={{ backgroundColor: '#00008A', color: 'white' }}>
              <MapPin className="h-6 w-6 text-primary-foreground" style={{ backgroundColor: '#00008A', color: 'white' }}/>
            </div>
            <span className="text-xl font-semibold text-foreground">CivicEcho</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/Login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/Signup" >
              <Button style={{ backgroundColor: '#00008A', color: 'white' }}>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Report Issues in Your Community
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Help make your city better by reporting potholes, broken streetlights, graffiti, and other civic issues.
            Your reports help local government respond faster.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/Signup">
 <Button
  size="lg"
  className="w-full sm:w-auto"
  style={{ backgroundColor: '#00008A', color: 'white' }}
>
  Get Started
</Button>

</Link>

            <Link to="/Login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-balance text-center text-3xl font-semibold text-foreground">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: '#00008A', color: 'white' }}>
                  <MapPin className="h-6 w-6 text-primary" style={{ backgroundColor: '#00008A', color: 'white' }} />
                </div>
                <CardTitle>Locate Issue</CardTitle>
                <CardDescription>Pin the exact location of the problem on the map</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg "style={{ backgroundColor: '#00008A', color: 'white' }}>
                  <Camera className="h-6 w-6 "style={{ backgroundColor: '#00008A', color: 'white' }} />
                </div>
                <CardTitle>Add Photo</CardTitle>
                <CardDescription>Take or upload a photo to document the issue</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg "style={{ backgroundColor: '#00008A', color: 'white' }}>
                  <MessageSquare className="h-6 w-6 "style={{ backgroundColor: '#00008A', color: 'white' }} />
                </div>
                <CardTitle>Describe</CardTitle>
                <CardDescription>Provide details about the problem</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg "style={{ backgroundColor: '#00008A', color: 'white' }}>
                  <CheckCircle className="h-6 w-6 "style={{ backgroundColor: '#00008A', color: 'white' }} />
                </div>
                <CardTitle>Track Status</CardTitle>
                <CardDescription>Follow your report until it's resolved</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 CivicReport. Making communities better, one report at a time.</p>
        </div>
      </footer>
    </div>
  )
}
