import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { TrendingUp, Users, Activity, Eye, Share2, Heart, MessageCircle, Play, Calendar } from 'lucide-react'
import { aggregatedMetrics, monthlyTrends, platformDistribution, contentTypePerformance, weeklyEngagement } from '../data/processedData.js'
import AvatarAssistant from './AvatarAssistant.jsx'

export default function Insights() {
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Insights & Analytics TALAN
          </h1>
          <p className="text-lg text-gray-600 mt-2">Social Media Dashboard</p>
        </div>
        <div className="text-sm text-muted-foreground bg-white px-4 py-2 rounded-lg shadow-sm">
          <Calendar className="h-4 w-4 inline mr-2" />
          Last updated: {new Date().toLocaleDateString(
            'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          )}
        </div>
      </div>

      {/* KPI Cards with vibrant colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Reach</CardTitle>
            <Eye className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(aggregatedMetrics.totalReach)}</div>
            <p className="text-xs text-blue-200">
              +15.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Engagement</CardTitle>
            <Heart className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(aggregatedMetrics.totalEngagement)}</div>
            <p className="text-xs text-purple-200">
              +{aggregatedMetrics.avgEngagementRate}% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-100">Follower Growth</CardTitle>
            <TrendingUp className="h-5 w-5 text-pink-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+{aggregatedMetrics.followerGrowth}%</div>
            <p className="text-xs text-pink-200">
              +2,340 new followers this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Active Posts</CardTitle>
            <Activity className="h-5 w-5 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">44</div>
            <p className="text-xs text-green-200">
              Posts this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Monthly Trends by Platform</CardTitle>
            <CardDescription className="text-gray-600">
              Engagement evolution over the last 7 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorLinkedin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0077B5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0077B5" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorTiktok" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorInstagram" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E4405F" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#E4405F" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="linkedin" stackId="1" stroke="#0077B5" fill="url(#colorLinkedin)" name="LinkedIn" />
                <Area type="monotone" dataKey="instagram" stackId="1" stroke="#E4405F" fill="url(#colorInstagram)" name="Instagram" />
                <Area type="monotone" dataKey="tiktok" stackId="1" stroke="#000000" fill="url(#colorTiktok)" name="TikTok" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Platform Distribution</CardTitle>
            <CardDescription className="text-gray-600">
              Engagement distribution by social network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={platformDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Content Type Performance</CardTitle>
            <CardDescription className="text-gray-600">
              Average engagement by publication format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentTypePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="type" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="engagement" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Weekly Engagement</CardTitle>
            <CardDescription className="text-gray-600">
              Community activity by day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyEngagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-indigo-800 flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              LinkedIn Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-indigo-600">Total Reactions</span>
                <span className="font-bold text-indigo-800">363</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">Shares</span>
                <span className="font-bold text-indigo-800">33</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">Comments</span>
                <span className="font-bold text-indigo-800">3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-rose-50 to-rose-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-rose-800 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Instagram Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-rose-600">Total Likes</span>
                <span className="font-bold text-rose-800">99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-600">Comments</span>
                <span className="font-bold text-rose-800">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-600">Active Posts</span>
                <span className="font-bold text-rose-800">4</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Play className="h-5 w-5" />
              TikTok Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Views</span>
                <span className="font-bold text-gray-800">{formatNumber(63964)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Likes</span>
                <span className="font-bold text-gray-800">1,281</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shares</span>
                <span className="font-bold text-gray-800">376</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Avatar Assistant */}
      <AvatarAssistant />
    </div>
  )
}

