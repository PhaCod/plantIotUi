"use client"

import { forwardRef, useImperativeHandle, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, SunDim, Sprout } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { iotApi } from "@/app/api/iotApi/route";

interface SensorData {
  temperature: number | null
  humidity: number | null
  moisture: number | null
  lightIntensity: number | null
  temperatureThreshold?: { lower: number; upper: number }
  humidityThreshold?: { lower: number; upper: number }
  moistureThreshold?: { lower: number; upper: number }
  lightIntensityThreshold?: { lower: number; upper: number }
}

const initialSensorData: SensorData = {
  temperature: null,
  humidity: null,
  moisture: null,
  lightIntensity: null,
}

const StatsCards = forwardRef((props, ref) => {
  const [sensorData, setSensorData] = useState<SensorData>(initialSensorData)
  const [isConnected, setIsConnected] = useState(false)

  // Subscribe to real-time sensor updates
  useEffect(() => {
    const resetConnection = () => {
      setSensorData(initialSensorData);
      setIsConnected(false);
    };

    const setupConnection = async () => {
      resetConnection();

      try {
        const tempThreshold = await iotApi.getThreshold("temp");
        const humidityThreshold = await iotApi.getThreshold("humidity");
        const moistureThreshold = await iotApi.getThreshold("moisture");
        const lightThreshold = await iotApi.getThreshold("light");

        console.log("Thresholds:", {
          temp: tempThreshold,
          humidity: humidityThreshold,
          moisture: moistureThreshold,
          light: lightThreshold,
        });

        setSensorData((prev) => ({
          ...prev,
          temperatureThreshold: tempThreshold,
          humidityThreshold: humidityThreshold,
          moistureThreshold: moistureThreshold,
          lightIntensityThreshold: lightThreshold,
        }));

        iotApi.getFeedLastData("temp").then((data) => {
          setSensorData((prev) => ({ ...prev, temperature: parseFloat(data.value) }));
        });
        iotApi.getFeedLastData("humidity").then((data) => {
          setSensorData((prev) => ({ ...prev, humidity: parseFloat(data.value) }));
        });
        iotApi.getFeedLastData("moisture").then((data) => {
          setSensorData((prev) => ({ ...prev, moisture: parseFloat(data.value) }));
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
                return { ...prev, moisture: parseFloat(data.value) };
              case "light":
                return { ...prev, lightIntensity: parseFloat(data.value) };
              default:
                return prev;
            }
          });
        });
      } catch (error) {
        console.error("Error setting up connection:", error);
      }
    };

    setupConnection();

    return () => {
      iotApi.unsubscribeFromStream();
    };
  }, [])

  useImperativeHandle(ref, () => ({
    updateSensorData: (topic: string, lower: number, upper: number) => {
      setSensorData((prev) => {
        if (topic === "humidity") {
          return { ...prev, humidityThreshold: { lower, upper } };
        } else if (topic === "temp") {
          return { ...prev, temperatureThreshold: { lower, upper } };
        } else if (topic === "moisture") {
          return { ...prev, moistureThreshold: { lower, upper } };
        } else if (topic === "light") {
          return { ...prev, lightIntensityThreshold: { lower, upper } };
        }
        return prev;
      });
    },
  }));

  // Format sensor value with fallback
  const formatSensorValue = (value: number | null, format: (n: number) => string) => {
    return value !== null ? format(value) : "--"
  }

  // Determine status colors based on thresholds
  const getTemperatureStatus = (value: number | null) => {
    if (value === null) return "text-gray-400"
    if (sensorData.temperatureThreshold) {
      if (value > sensorData.temperatureThreshold.upper) return "text-red-500"
      if (value < sensorData.temperatureThreshold.lower) return "text-blue-500"
    }
    return "text-green-500"
  }
  const getHumidityStatus = (value: number | null) => {
    if (value === null) return "text-gray-400"
    if (sensorData.humidityThreshold) {
      if (value > sensorData.humidityThreshold.upper) return "text-red-500"
      if (value < sensorData.humidityThreshold.lower) return "text-yellow-500"
    }
    return "text-green-500"
  }

  const getmoistureStatus = (value: number | null) => {
    if (value === null) return "text-gray-400"
    if (sensorData.moistureThreshold) {
      if (value < sensorData.moistureThreshold.lower) return "text-red-500"
      if (value > sensorData.moistureThreshold.upper) return "text-blue-500"
    }
    return "text-green-500"
  }

  const getLightStatus = (value: number | null) => {
    if (value === null) return "text-gray-400"
    if (sensorData.lightIntensityThreshold) {
      if (value > sensorData.lightIntensityThreshold.upper) return "text-yellow-500"
      if (value < sensorData.lightIntensityThreshold.lower) return "text-blue-500"
    }
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
            <p className="text-xs text-muted-foreground">
              Optimal range: {sensorData.temperatureThreshold?.lower ?? "--"}-{sensorData.temperatureThreshold?.upper ?? "--"}°C
            </p>
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
            <p className="text-xs text-muted-foreground">
              Optimal range: {sensorData.humidityThreshold?.lower ?? "--"}-{sensorData.humidityThreshold?.upper ?? "--"}%
            </p>
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
                <div className={`text-2xl font-bold ${getmoistureStatus(sensorData.moisture)}`}>
                  {formatSensorValue(sensorData.moisture, (v) => `${v.toFixed(0)}%`)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`$$H_{soil} = ${sensorData.moisture?.toFixed(0) ?? "--"}\\%$$`}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">
              Optimal range: {sensorData.moistureThreshold?.lower ?? "--"}-{sensorData.moistureThreshold?.upper ?? "--"}%
            </p>
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
            <p className="text-xs text-muted-foreground">
              Optimal range: {sensorData.lightIntensityThreshold?.lower ?? "--"}-{sensorData.lightIntensityThreshold?.upper ?? "--"} lux
            </p>
          </CardContent>
        </Card>
      </>
    </TooltipProvider>
  )
})

export default StatsCards;
