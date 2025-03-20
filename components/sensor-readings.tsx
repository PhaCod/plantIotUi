"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, SunDim, Sprout } from "lucide-react"
import { iotApi } from "@/lib/api"

interface SensorData {
  temperature: number
  humidity: number
  soilMoisture: number
  lightIntensity: number
}

const initialSensorData: SensorData = {
  temperature: 0,
  humidity: 0,
  soilMoisture: 0,
  lightIntensity: 0,
}

export default function SensorReadings() {
  const [sensorData, setSensorData] = useState<SensorData>(initialSensorData)

  // Subscribe to real-time sensor updates
  useEffect(() => {
    iotApi.subscribeToStream(
      (data) => {
        setSensorData((prev) => {
          switch (data.type) {
            case 'temp':
              return { ...prev, temperature: parseFloat(data.value) }
            case 'humidity':
              return { ...prev, humidity: parseFloat(data.value) }
            case 'moisture':
              return { ...prev, soilMoisture: parseFloat(data.value) }
            case 'light':
              return { ...prev, lightIntensity: parseFloat(data.value) }
            default:
              return prev
          }
        })
      },
      (error) => {
        console.error("Failed to connect to sensor stream:", error)
      }
    )

    return () => {
      iotApi.unsubscribeFromStream()
    }
  }, [])

  // Determine status colors based on thresholds
  const getTemperatureStatus = (value: number) => {
    if (value > 32) return "text-red-500"
    if (value < 18) return "text-blue-500"
    return "text-green-500"
  }

  const getHumidityStatus = (value: number) => {
    if (value > 80) return "text-red-500"
    if (value < 40) return "text-yellow-500"
    return "text-green-500"
  }

  const getSoilMoistureStatus = (value: number) => {
    if (value < 30) return "text-red-500"
    if (value > 70) return "text-blue-500"
    return "text-green-500"
  }

  const getLightStatus = (value: number) => {
    if (value > 2000) return "text-yellow-500"
    if (value < 500) return "text-blue-500"
    return "text-green-500"
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temperature</CardTitle>
          <Thermometer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getTemperatureStatus(sensorData.temperature)}`}>
            {sensorData.temperature.toFixed(1)}°C
          </div>
          <p className="text-xs text-muted-foreground">Optimal range: 18-32°C</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Air Humidity</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getHumidityStatus(sensorData.humidity)}`}>
            {sensorData.humidity.toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground">Optimal range: 40-80%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Soil Moisture</CardTitle>
          <Sprout className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getSoilMoistureStatus(sensorData.soilMoisture)}`}>
            {sensorData.soilMoisture.toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground">Optimal range: 30-70%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Light Intensity</CardTitle>
          <SunDim className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getLightStatus(sensorData.lightIntensity)}`}>
            {sensorData.lightIntensity.toFixed(0)} lux
          </div>
          <p className="text-xs text-muted-foreground">Optimal range: 500-2000 lux</p>
        </CardContent>
      </Card>
    </>
  )
}

