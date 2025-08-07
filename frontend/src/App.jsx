import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { BarChart3, Lightbulb, Image, Menu, X } from 'lucide-react'
import Insights from './components/Insights.jsx'
import Recommendations from './components/Recommendations.jsx'
import ImageGeneration from './components/ImageGeneration.jsx'
import './App.css'

const navigation = [
  { id: 'insights', name: 'Insights', icon: BarChart3, component: Insights },
  { id: 'recommendations', name: 'Recommendations', icon: Lightbulb, component: Recommendations },
  { id: 'generation', name: 'Image Generation', icon: Image, component: ImageGeneration }
]

function App() {
  const [activeTab, setActiveTab] = useState('insights')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const ActiveComponent = navigation.find(nav => nav.id === activeTab)?.component || Insights

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src="/src/assets/talan_logo.png" alt="Talan Logo" className="h-8" />
              <h1 className="text-xl font-bold">Insights Platform</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(item.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-card">
            <nav className="flex flex-col p-4 gap-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => {
                      setActiveTab(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 justify-start"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl">
        <ActiveComponent />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Insights Platform - Your AI assistant for analysis and creativity
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Developed with ❤️ by Manus</span>
              <span>•</span>
              <span>Version 1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

