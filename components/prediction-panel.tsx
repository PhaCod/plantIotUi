"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Thermometer, Droplets, Sprout, SunDim, RefreshCw } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Mock prediction data
const generatePredictionData = () => {
  const data = []
  const now = new Date()

  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000)
    data.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temperature: 25 + Math.sin(i / 6) * 5 + (Math.random() * 2 - 1),
      humidity: 60 + Math.sin(i / 8) * 15 + (Math.random() * 5 - 2.5),
      moisture: 50 + Math.cos(i / 12) * 20 + (Math.random() * 3 - 1.5),
      lightIntensity: 1000 + Math.sin(i / 12) * 800 * (i > 6 && i < 18 ? 1 : 0.1) + (Math.random() * 100 - 50),
    })
  }

  return data
}

// Mock recommendations
const mockRecommendations = [
  {
    id: 1,
    parameter: "temperature",
    current: "28°C",
    recommended: "25°C",
    action: "Activate cooling system at 14:00",
    confidence: 92,
    impact: "high",
  },
  {
    id: 2,
    parameter: "soil-moisture",
    current: "35%",
    recommended: "50%",
    action: "Schedule irrigation for 15 minutes at 16:30",
    confidence: 88,
    impact: "medium",
  },
  {
    id: 3,
    parameter: "light",
    current: "1200 lux",
    recommended: "1500 lux",
    action: "Increase LED intensity to 85% from 12:00 to 16:00",
    confidence: 76,
    impact: "medium",
  },
  {
    id: 4,
    parameter: "humidity",
    current: "65%",
    recommended: "60%",
    action: "No immediate action required",
    confidence: 94,
    impact: "low",
  },
]

export default function PredictionPanel() {
  const [predictionData, setPredictionData] = useState(() => generatePredictionData())
  const [recommendations, setRecommendations] = useState(mockRecommendations)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshPredictions = () => {
    setIsRefreshing(true)

    // Simulate API call
    setTimeout(() => {
      setPredictionData(generatePredictionData())
      setIsRefreshing(false)
    }, 1500)
  }

  const getParameterIcon = (parameter) => {
    switch (parameter) {
      case "temperature":
        return <Thermometer size={16} className="text-red-500" />
      case "humidity":
        return <Droplets size={16} className="text-blue-500" />
      case "soil-moisture":
        return <Sprout size={16} className="text-green-500" />
      case "light":
        return <SunDim size={16} className="text-yellow-500" />
      default:
        return <Brain size={16} />
    }
  }

  const getImpactBadge = (impact) => {
    switch (impact) {
      case "high":
        return <Badge variant="destructive">High Impact</Badge>
      case "medium":
        return (
          <Badge variant="warning" className="bg-yellow-500">
            Medium Impact
          </Badge>
        )
      case "low":
        return <Badge variant="outline">Low Impact</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Predictions</CardTitle>
              <CardDescription>24-hour environmental forecast</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleRefreshPredictions}
              disabled={isRefreshing}
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="temperature">
            <TabsList className="mb-4">
              <TabsTrigger value="temperature" className="flex items-center gap-2">
                <Thermometer size={14} />
                Temperature
              </TabsTrigger>
              <TabsTrigger value="humidity" className="flex items-center gap-2">
                <Droplets size={14} />
                Humidity
              </TabsTrigger>
              <TabsTrigger value="soil" className="flex items-center gap-2">
                <Sprout size={14} />
                Soil Moisture
              </TabsTrigger>
              <TabsTrigger value="light" className="flex items-center gap-2">
                <SunDim size={14} />
                Light
              </TabsTrigger>
            </TabsList>

            <TabsContent value="temperature">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[15, 40]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      name="Temperature (°C)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="humidity">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[30, 90]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      name="Humidity (%)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="soil">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[20, 80]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="moisture"
                      stroke="#22c55e"
                      name="Soil Moisture (%)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="light">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 2000]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="lightIntensity"
                      stroke="#eab308"
                      name="Light (lux)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={18} />
            AI Recommendations
          </CardTitle>
          <CardDescription>Smart suggestions for optimal growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  {getParameterIcon(rec.parameter)}
                  <h4 className="font-medium capitalize">{rec.parameter.replace("-", " ")}</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current:</span> {rec.current}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recommended:</span> {rec.recommended}
                  </div>
                </div>
                <p className="text-sm mb-2">{rec.action}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Confidence: {rec.confidence}%</div>
                  {getImpactBadge(rec.impact)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

