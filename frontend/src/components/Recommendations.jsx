import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Lightbulb, Sparkles, Target, TrendingUp, Users, Heart, Star, RefreshCw } from 'lucide-react'

const sampleRecommendations = [
  {
    id: 1,
    title: "Video Content Campaign",
    description: "Create a series of short videos to increase social media engagement",
    category: "Content",
    priority: "High",
    impact: "High",
    effort: "Medium",
    tags: ["Video", "Social Media", "Engagement"]
  },
  {
    id: 2,
    title: "Customer Loyalty Program",
    description: "Implement a points system to reward loyal customers",
    category: "Marketing",
    priority: "Medium",
    impact: "High",
    effort: "High",
    tags: ["Loyalty", "Retention", "Rewards"]
  },
  {
    id: 3,
    title: "Local SEO Optimization",
    description: "Improve local search engine ranking to attract more nearby customers",
    category: "SEO",
    priority: "High",
    impact: "Medium",
    effort: "Low",
    tags: ["SEO", "Local", "Visibility"]
  },
  {
    id: 4,
    title: "Influencer Collaboration",
    description: "Partner with micro-influencers in your industry",
    category: "Partnership",
    priority: "Medium",
    impact: "Medium",
    effort: "Medium",
    tags: ["Influencers", "Partnership", "Reach"]
  }
]

const categories = ["All", "Content", "Marketing", "SEO", "Partnership", "Innovation"]

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState(sampleRecommendations)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = selectedCategory === "All" || rec.category === selectedCategory
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const generateNewRecommendations = async () => {
    setIsGenerating(true)
    // Simulation of recommendation generation
    setTimeout(() => {
      const newRec = {
        id: recommendations.length + 1,
        title: customPrompt || "New Marketing Strategy",
        description: "Recommendation generated based on your criteria and current market trends",
        category: "Innovation",
        priority: "Medium",
        impact: "Medium",
        effort: "Medium",
        tags: ["Custom", "AI", "Innovation"]
      }
      setRecommendations([newRec, ...recommendations])
      setCustomPrompt("")
      setIsGenerating(false)
    }, 2000)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "Low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getImpactIcon = (impact) => {
    switch (impact) {
      case "High": return <TrendingUp className="h-4 w-4 text-green-600" />
      case "Medium": return <Target className="h-4 w-4 text-yellow-600" />
      case "Low": return <Users className="h-4 w-4 text-gray-600" />
      default: return <Heart className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Lightbulb className="h-8 w-8 text-yellow-500" />
          Idea Recommendations
        </h1>
        <Badge variant="outline" className="text-sm">
          {filteredRecommendations.length} recommendations
        </Badge>
      </div>

      {/* Custom Recommendation Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Recommendation Generator
          </CardTitle>
          <CardDescription>
            Describe your goal or challenge to get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex: I want to increase engagement on my social media..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={generateNewRecommendations}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search recommendations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* List of Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecommendations.map(rec => (
          <Card key={rec.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {rec.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {getImpactIcon(rec.impact)}
                  <Star className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Impact:</span>
                  <span className="font-medium">{rec.impact}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Effort:</span>
                  <span className="font-medium">{rec.effort}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {rec.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No recommendations found for your search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

