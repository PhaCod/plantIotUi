"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, SunDim, Sprout } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { iotApi } from "@/app/api/iotApi/route";

interface SensorData {
  temperature: number | null
  humidity: number | null
  soilMoisture: number | null
  lightIntensity: number | null
}

const initialSensorData: SensorData = {
  temperature: null,
  humidity: null,
  soilMoisture: null,
  lightIntensity: null,
}

export default function StatsCards() {
  const [sensorData, setSensorData] = useState<SensorData>(initialSensorData)
  const [isConnected, setIsConnected] = useState(false)

  // Subscribe to real-time sensor updates
  useEffect(() => {
    const resetConnection = () => {
      setSensorData(initialSensorData);
      setIsConnected(false);
    };

    const setupConnection = () => {
      resetConnection();
      iotApi.getFeedLastData("temp").then((data) => {
        setSensorData((prev) => ({ ...prev, temperature: parseFloat(data.value) }));
      });
      iotApi.getFeedLastData("humidity").then((data) => {
        setSensorData((prev) => ({ ...prev, humidity: parseFloat(data.value) }));
      });
      iotApi.getFeedLastData("moisture").then((data) => {
        setSensorData((prev) => ({ ...prev, soilMoisture: parseFloat(data.value) }));
      });
      iotApi.getFeedLastData("light").then((data) => {
        setSensorData((prev) => ({ ...prev, lightIntensity: parseFloat(data.value) }));
      });

      iotApi.subscribeToStream((data) => {
        setIsConnected(true);
        setSensorData((prev) => {
          switch (data.topic) {
            case "temp":
              return { ...prev, temperature: parseFloat(data.value) };
            case "humidity":
              return { ...prev, humidity: parseFloat(data.value) };
            case "moisture":
              return { ...prev, soilMoisture: parseFloat(data.value) };
            case "light":
              return { ...prev, lightIntensity: parseFloat(data.value) };
            default:
              return prev;
          }
        });
      });
    };

    setupConnection();

    return () => {
      iotApi.unsubscribeFromStream();
    };
  }, [])

  // Format sensor value with fallback
  const formatSensorValue = (value: number | null, format: (n: number) => string) => {
    return value !== null ? format(value) : "--"
  }

  // Determine status colors based on thresholds
  const getTemperatureStatus = (value: number | null) => {
    if (value === null) return "text-gray-400"
    if (value > 32) return "text-red-500"
    if (value < 18) return "text-blue-500"
    return "text-green-500"
  }

  const getHumidityStatus = (value: number | null) => {
    if (value === null) return "text-gray-400"
    if (value > 80) return "text-red-500"
    if (value < 40) return "text-yellow-500"
    return "text-green-500"
  }

  const getSoilMoistureStatus = (value: number | null) => {
    if (value === null) return "text-gray-400"
    if (value < 30) return "text-red-500"
    if (value > 70) return "text-blue-500"
    return "text-green-500"
  }

  const getLightStatus = (value: number | null) => {
    if (value === null) return "text-gray-400"
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
            <Thermometer className={`h-4 w-4 ${isConnected ? "text-muted-foreground" : "text-gray-400"}`} />
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-2xl font-bold ${getTemperatureStatus(sensorData.temperature)}`}>
                  {formatSensorValue(sensorData.temperature, (v) => `${v.toFixed(1)}°C`)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`$$T_{air} = ${sensorData.temperature?.toFixed(1) ?? "--"}°C$$`}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">Optimal range: 18-32°C</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Air Humidity</CardTitle>
            <Droplets className={`h-4 w-4 ${isConnected ? "text-muted-foreground" : "text-gray-400"}`} />
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-2xl font-bold ${getHumidityStatus(sensorData.humidity)}`}>
                  {formatSensorValue(sensorData.humidity, (v) => `${v.toFixed(0)}%`)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`$$H_{air} = ${sensorData.humidity?.toFixed(0) ?? "--"}\\%$$`}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">Optimal range: 40-80%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soil Moisture</CardTitle>
            <Sprout className={`h-4 w-4 ${isConnected ? "text-muted-foreground" : "text-gray-400"}`} />
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-2xl font-bold ${getSoilMoistureStatus(sensorData.soilMoisture)}`}>
                  {formatSensorValue(sensorData.soilMoisture, (v) => `${v.toFixed(0)}%`)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`$$H_{soil} = ${sensorData.soilMoisture?.toFixed(0) ?? "--"}\\%$$`}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">Optimal range: 30-70%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Light Intensity</CardTitle>
            <SunDim className={`h-4 w-4 ${isConnected ? "text-muted-foreground" : "text-gray-400"}`} />
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-2xl font-bold ${getLightStatus(sensorData.lightIntensity)}`}>
                  {formatSensorValue(sensorData.lightIntensity, (v) => `${v.toFixed(0)} lux`)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`$$Lux = ${sensorData.lightIntensity?.toFixed(0) ?? "--"}$$`}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">Optimal range: 500-2000 lux</p>
          </CardContent>
        </Card>
      </>
    </TooltipProvider>
  )
}
