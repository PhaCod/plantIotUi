"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, SunDim, Sprout } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data - would be replaced with real sensor data
const mockSensorData = {
  temperature: 28.5,
  humidity: 65,
  soilMoisture: 45,
  lightIntensity: 1200,
}

export default function StatsCards() {
  const [sensorData, setSensorData] = useState(mockSensorData)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData({
        temperature: mockSensorData.temperature + (Math.random() * 2 - 1),
        humidity: Math.max(0, Math.min(100, mockSensorData.humidity + (Math.random() * 4 - 2))),
        soilMoisture: Math.max(0, Math.min(100, mockSensorData.soilMoisture + (Math.random() * 3 - 1.5))),
        lightIntensity: Math.max(0, mockSensorData.lightIntensity + (Math.random() * 100 - 50)),
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Determine status colors based on thresholds
  const getTemperatureStatus = (value) => {
    if (value > 32) return "text-red-500"
    if (value < 18) return "text-blue-500"
    return "text-green-500"
  }

  const getHumidityStatus = (value) => {
    if (value > 80) return "text-red-500"
    if (value < 40) return "text-yellow-500"
    return "text-green-500"
  }

  const getSoilMoistureStatus = (value) => {
    if (value < 30) return "text-red-500"
    if (value > 70) return "text-blue-500"
    return "text-green-500"
  }

  const getLightStatus = (value) => {
    if (value > 2000) return "text-yellow-500"
    if (value < 500) return "text-blue-500"
    return "text-green-500"
  }

  return (
    <TooltipProvider>
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-2xl font-bold ${getTemperatureStatus(sensorData.temperature)}`}>
                  {sensorData.temperature.toFixed(1)}°C
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`$$T_{air} = ${sensorData.temperature.toFixed(1)}°C$$`}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">Optimal range: 18-32°C</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Air Humidity</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-2xl font-bold ${getHumidityStatus(sensorData.humidity)}`}>
                  {sensorData.humidity.toFixed(0)}%
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`$$H_{air} = ${sensorData.humidity.toFixed(0)}\\%$$`}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">Optimal range: 40-80%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soil Moisture</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-2xl font-bold ${getSoilMoistureStatus(sensorData.soilMoisture)}`}>
                  {sensorData.soilMoisture.toFixed(0)}%
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`$$H_{soil} = ${sensorData.soilMoisture.toFixed(0)}\\%$$`}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">Optimal range: 30-70%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Light Intensity</CardTitle>
            <SunDim className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-2xl font-bold ${getLightStatus(sensorData.lightIntensity)}`}>
                  {sensorData.lightIntensity.toFixed(0)} lux
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`$$Lux = ${sensorData.lightIntensity.toFixed(0)}$$`}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">Optimal range: 500-2000 lux</p>
          </CardContent>
        </Card>
      </>
    </TooltipProvider>
  )
}

