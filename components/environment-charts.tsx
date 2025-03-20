"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  time: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightIntensity: number;
}

export default function EnvironmentCharts() {
  const [timeRange, setTimeRange] = useState("6h");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Fetch data from backend API
  const fetchEnvironmentData = async (hours: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/environment-data?hours=${hours}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Format the data for the chart
      const formattedData = data.map(
        (item: {
          timestamp: string;
          temperature: number;
          humidity: number;
          soilMoisture: number;
          lightIntensity: number;
        }) => ({
          time: new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          temperature: item.temperature,
          humidity: item.humidity,
          soilMoisture: item.soilMoisture,
          lightIntensity: item.lightIntensity,
        })
      );

      setChartData(formattedData);
    } catch (err) {
      console.error("Error fetching environment data:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      // Fall back to mock data if API fails
      setChartData(generateMockData(hours));
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data generator as fallback
  const generateMockData = (hours: number) => {
    const data = [];
    const now = new Date();

    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: 25 + Math.sin(i / 3) * 5 + Math.random() * 2,
        humidity: 60 + Math.sin(i / 2) * 15 + Math.random() * 5,
        soilMoisture: 50 + Math.cos(i / 4) * 10 + Math.random() * 3,
        lightIntensity: 1000 + Math.sin(i / 2) * 500 + Math.random() * 100,
      });
    }

    return data;
  };

  // Load initial data
  useEffect(() => {
    const hours = Number.parseInt(timeRange.replace("h", ""));
    fetchEnvironmentData(hours);

    // Set up polling for real-time updates (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchEnvironmentData(hours);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [timeRange]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    const hours = Number.parseInt(value.replace("h", ""));
    fetchEnvironmentData(hours);
  };

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
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Updating...
            </div>
          )}
          {error && (
            <div className="text-sm text-red-500">
              Error loading data. Using fallback data.
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Parameters</TabsTrigger>
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="humidity">Humidity</TabsTrigger>
            <TabsTrigger value="soil">Soil Moisture</TabsTrigger>
            <TabsTrigger value="light">Light</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ef4444"
                    name="Temperature (°C)"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#3b82f6"
                    name="Humidity (%)"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="soilMoisture"
                    stroke="#22c55e"
                    name="Soil Moisture (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="lightIntensity"
                    stroke="#eab308"
                    name="Light (lux)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="temperature">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ef4444"
                    name="Temperature (°C)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="humidity">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#3b82f6"
                    name="Humidity (%)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="soil">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="soilMoisture"
                    stroke="#22c55e"
                    name="Soil Moisture (%)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="light">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="lightIntensity"
                    stroke="#eab308"
                    name="Light (lux)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
