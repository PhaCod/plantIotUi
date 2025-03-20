"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define types for chart data
interface ChartDataPoint {
  time: string
  timestamp: number
  temperature?: number
  humidity?: number
  soilMoisture?: number
  lightIntensity?: number
}

export default function EnvironmentCharts() {
  const [timeRange, setTimeRange] = useState("6h")
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all environment data from Adafruit IO
  const fetchEnvironmentData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Create a server-side API route to proxy the requests and avoid CORS issues
      // Instead of calling Adafruit IO directly, we'll use our own API endpoint
      const response = await fetch("/api/environment-data?timeRange=" + timeRange)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        console.warn("API returned an error:", data.error)
        setError(data.error)
      }

      // Use the data we got, even if it's partial
      if (data.chartData && data.chartData.length > 0) {
        setChartData(data.chartData)
      } else {
        setError("No data available from API")
        setChartData([])
      }
    } catch (err) {
      console.error("Error fetching environment data:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setChartData([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchEnvironmentData()

    // Set up polling for real-time updates (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchEnvironmentData()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [timeRange])

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    // We'll refetch data when the time range changes
    fetchEnvironmentData()
  }

  // Check if we have data for each parameter
  const hasTemperatureData = chartData.some((point) => point.temperature !== undefined)
  const hasHumidityData = chartData.some((point) => point.humidity !== undefined)
  const hasSoilMoistureData = chartData.some((point) => point.soilMoisture !== undefined)
  const hasLightIntensityData = chartData.some((point) => point.lightIntensity !== undefined)

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Environment Parameters</CardTitle>
            <CardDescription>Historical data visualization</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
            </SelectContent>
          </Select>
          {isLoading && (
            <div className="flex items-center text-sm text-muted-foreground">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Updating...
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="temperature">
          <TabsList className="mb-4">
            <TabsTrigger value="temperature" disabled={!hasTemperatureData}>
              Temperature
            </TabsTrigger>
            <TabsTrigger value="humidity" disabled={!hasHumidityData}>
              Humidity
            </TabsTrigger>
            <TabsTrigger value="soil" disabled={!hasSoilMoistureData}>
              Soil Moisture
            </TabsTrigger>
            <TabsTrigger value="light" disabled={!hasLightIntensityData}>
              Light
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temperature">
            {hasTemperatureData ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      name="Temperature (°C)"
                      strokeWidth={2}
                      isAnimationActive={false}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-md">
                <p className="text-gray-500">No temperature data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="humidity">
            {hasHumidityData ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      name="Humidity (%)"
                      strokeWidth={2}
                      isAnimationActive={false}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-md">
                <p className="text-gray-500">No humidity data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="soil">
            {hasSoilMoistureData ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="soilMoisture"
                      stroke="#22c55e"
                      name="Soil Moisture (%)"
                      strokeWidth={2}
                      isAnimationActive={false}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-md">
                <p className="text-gray-500">No soil moisture data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="light">
            {hasLightIntensityData ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, "auto"]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="lightIntensity"
                      stroke="#eab308"
                      name="Light (lux)"
                      strokeWidth={2}
                      isAnimationActive={false}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-md">
                <p className="text-gray-500">No light intensity data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

