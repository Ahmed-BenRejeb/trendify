import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Image, Wand2, Download, RefreshCw, Palette, Camera, Sparkles } from 'lucide-react'

const stylePresets = [
  { value: "realistic", label: "Realistic", description: "Realistic and natural photos" },
  { value: "artistic", label: "Artistic", description: "Painting and art style" },
  { value: "cartoon", label: "Cartoon", description: "Cartoon style" },
  { value: "abstract", label: "Abstract", description: "Abstract and modern art" },
  { value: "vintage", label: "Vintage", description: "Retro and vintage style" },
  { value: "minimalist", label: "Minimalist", description: "Clean and simple design" }
]

const aspectRatios = [
  { value: "square", label: "Square (1:1)", description: "Perfect for social media" },
  { value: "landscape", label: "Landscape (16:9)", description: "Ideal for banners" },
  { value: "portrait", label: "Portrait (9:16)", description: "Perfect for stories" },
  { value: "auto", label: "Automatic", description: "Let AI decide" }
]

const sampleImages = [
  {
    id: 1,
    prompt: "A sunset over a mountain with golden clouds",
    style: "realistic",
    url: "/api/placeholder/400/400",
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    prompt: "Modern logo for a tech startup, minimalist style",
    style: "minimalist",
    url: "/api/placeholder/400/400",
    timestamp: new Date().toISOString()
  }
]

export default function ImageGeneration() {
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("realistic")
  const [selectedRatio, setSelectedRatio] = useState("square")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState(sampleImages)
  const [selectedImage, setSelectedImage] = useState(null)

  const generateImage = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    
    // Image generation simulation
    setTimeout(() => {
      const newImage = {
        id: generatedImages.length + 1,
        prompt: prompt,
        style: selectedStyle,
        url: "/api/placeholder/400/400",
        timestamp: new Date().toISOString()
      }
      
      setGeneratedImages([newImage, ...generatedImages])
      setSelectedImage(newImage)
      setIsGenerating(false)
    }, 3000)
  }

  const downloadImage = (image) => {
    // Download simulation
    console.log("Downloading image:", image.id)
  }

  const regenerateImage = (image) => {
    setPrompt(image.prompt)
    generateImage()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Palette className="h-8 w-8 text-purple-500" />
          AI Image Generation
        </h1>
        <Badge variant="outline" className="text-sm">
          {generatedImages.length} images generated
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-500" />
                Create an Image
              </CardTitle>
              <CardDescription>
                Describe the image you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Ex: A cute cat playing in a flower garden, watercolor style..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Artistic Style</label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stylePresets.map(style => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-muted-foreground">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Aspect Ratio</label>
                <Select value={selectedRatio} onValueChange={setSelectedRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map(ratio => (
                      <SelectItem key={ratio.value} value={ratio.value}>
                        <div>
                          <div className="font-medium">{ratio.label}</div>
                          <div className="text-xs text-muted-foreground">{ratio.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
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
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Suggested Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Suggested Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Modern logo for a tech company",
                "Mountain landscape at sunset",
                "Portrait of a fantasy character",
                "Futuristic user interface design"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-2"
                  onClick={() => setPrompt(suggestion)}
                >
                  <div className="text-xs text-muted-foreground text-left">
                    {suggestion}
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Display Area */}
        <div className="lg:col-span-2">
          {selectedImage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Image</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regenerateImage(selectedImage)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadImage(selectedImage)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {selectedImage.prompt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Image className="h-16 w-16 mx-auto mb-4" />
                    <p>Generated image would appear here</p>
                    <p className="text-sm">Style: {stylePresets.find(s => s.value === selectedImage.style)?.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No image selected</h3>
                <p className="text-muted-foreground">
                  Generate a new image or select one from history
                </p>
              </CardContent>
            </Card>
          )}

          {/* Image History */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Generation History</CardTitle>
              <CardDescription>
                Your recently generated images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {generatedImages.map(image => (
                  <div
                    key={image.id}
                    className={`cursor-pointer rounded-lg border-2 transition-colors ${
                      selectedImage?.id === image.id 
                        ? 'border-primary' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {image.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(image.timestamp).toLocaleDateString(
                        'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

