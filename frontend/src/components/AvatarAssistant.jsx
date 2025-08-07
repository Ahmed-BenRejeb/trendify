import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { MessageCircle, Volume2, VolumeX, X } from 'lucide-react'
import avatarImage from '../assets/ia_consultant_avatar.png'

const explanations = {
  reach: "Total reach of 78K represents the total number of unique individuals who have seen your content across all platforms. This 15.2% increase signifies a strong growth in your overall visibility and brand exposure. It indicates that your content is effectively reaching a wider audience, which is crucial for brand awareness and top-of-funnel marketing efforts.",
  engagement: "Total engagement of 2.2K with a 4.2% engagement rate is excellent! This means your audience is actively interacting with your content through likes, comments, shares, and clicks. A high engagement rate suggests that your content resonates well with your target audience, fostering a strong community and driving meaningful interactions. This is a key indicator of content quality and audience connection.",
  growth: "The 12.8% follower growth, with 2,340 new subscribers this month, indicates that your content strategy is successfully attracting new users interested in TALAN. Consistent follower growth is vital for expanding your audience base and increasing the potential reach of your future campaigns. It reflects the effectiveness of your acquisition strategies and the appeal of your brand.",
  posts: "44 posts this month represents a regular and sustained publishing frequency, which is essential for maintaining community engagement and staying top-of-mind with your audience. Consistent posting helps in building a loyal following and ensures a steady flow of content to keep your audience informed and entertained.",
  linkedin: "LinkedIn generated 363 reactions with 33 shares, demonstrating the effectiveness of your professional content in engaging your B2B network. High shares on LinkedIn indicate that your content is perceived as valuable and shareable within professional circles, enhancing your thought leadership and industry presence.",
  instagram: "Instagram shows 99 likes with a more visual audience. The 4 active posts suggest a potential to increase publishing frequency to further leverage this platform's visual appeal and reach a broader audience. Instagram is ideal for showcasing your brand's visual identity and connecting with a younger demographic.",
  tiktok: "TikTok performs exceptionally well with 64K views and 1,281 likes. This platform generates the largest reach and engagement for TALAN, highlighting its significant potential for viral growth and reaching a massive, highly engaged audience. Focusing on short, engaging video content on TikTok can yield substantial returns.",
  trends: "Monthly trends show consistent growth across all platforms, with TikTok leading the way, followed by LinkedIn and then Instagram. This trend analysis helps identify which platforms are driving the most impact and where to allocate resources for future content strategies. It also highlights emerging opportunities and potential areas for improvement.",
  content: "Videos generate the most engagement (4,500), followed by carousels (3,200). Prioritize these formats to maximize impact and audience interaction. Understanding which content types perform best allows for optimization of your content creation efforts, leading to higher ROI and more effective communication with your audience."
}

export default function AvatarAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentExplanation, setCurrentExplanation] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)

  const handleExplain = (topic) => {
    setCurrentExplanation(explanations[topic] || "Sorry, I don't have an explanation for this topic.")
    setIsOpen(true)
  }

  const toggleAudio = () => {
    if (isPlaying) {
      // Arrêter la lecture audio
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    } else {
      // Démarrer la lecture audio
      const utterance = new SpeechSynthesisUtterance(currentExplanation)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.onend = () => setIsPlaying(false)
      window.speechSynthesis.speak(utterance)
      setIsPlaying(true)
    }
  }

  return (
    <>
      {/* Avatar flottant */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-16 rounded-full p-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <img 
              src={avatarImage} 
              alt="Assistant IA" 
              className="w-14 h-14 rounded-full object-cover"
            />
          </Button>
          
          {/* Indicateur de notification */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      </div>

      {/* Panel d'explication */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <img 
                  src={avatarImage} 
                  alt="Assistant IA" 
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">TALAN AI Assistant</h3>
                  <p className="text-sm text-gray-600">
                    Hello! I am your AI assistant. Click on the elements on the page for detailed explanations.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {currentExplanation && (
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {currentExplanation}
                  </p>
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleAudio}
                      className="p-1 h-auto"
                    >
                      {isPlaying ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2">Available topics:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExplain('reach')}
                    className="text-xs"
                  >
                    Reach
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExplain("engagement")}
                    className="text-xs"
                  >
                    Engagement
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExplain("growth")}
                    className="text-xs"
                  >
                    Growth
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExplain("trends")}
                    className="text-xs"
                  >
                    Trends
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExplain("linkedin")}
                    className="text-xs"
                  >
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExplain("tiktok")}
                    className="text-xs"
                  >
                    TikTok
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExplain("content")}
                    className="text-xs"
                  >
                    Content
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

