"use client"

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gauge, BellRing, Bell, Activity, Settings, BarChart3, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import StatsCards from "@/components/stats-cards"
import EnvironmentCharts from "@/components/environment-charts"
import DeviceControl from "@/components/device-control"
import AlertSystem from "@/components/alert-system"
import ActivityLog from "@/components/activity-log" // Import ActivityLog component
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { signOut } from "next-auth/react";
import { ForwardedRef } from "react"; // Add this import if not already present
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { iotApi } from "@/app/api/iotApi/route";
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { getSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

interface CustomJwtPayload extends JwtPayload {
  role?: string;
  email?: string; // Add email property
}

export default function Dashboard() {


  interface StatsCardsRef {
    updateSensorData: (topic: string, lower: number, upper: string) => void;
  }

  const statsCardsRef = useRef<StatsCardsRef | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

  const [activeAlerts, setActiveAlerts] = useState(3);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Retrieve session and decode the JWT to get the user's role
    async function fetchUserRole() {
      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken; // Extract access token
      if (token) {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        setUserRole(decoded.role || "");
        setEmail(decoded.email || ""); // Set email from decoded token
      }
    }

    fetchUserRole();
  }, []);

  const [temperatureThreshold, setTemperatureThreshold] = useState({ value: 0, bound: "" });
  const [humidityThreshold, setHumidityThreshold] = useState({ value: 0, bound: "" });
  const [soilMoistureThreshold, setSoilMoistureThreshold] = useState({ value: 0, bound: ""});
  const [lightThreshold, setLightThreshold] = useState({ value: 0, bound: "" });

  const [isTemperatureChanged, setIsTemperatureChanged] = useState(false);
  const [isHumidityChanged, setIsHumidityChanged] = useState(false);
  const [isSoilMoistureChanged, setIsSoilMoistureChanged] = useState(false);
  const [isLightChanged, setIsLightChanged] = useState(false);

  useEffect(() => {
    async function fetchThresholds() {
      try {
        const temp = await iotApi.getThreshold("temp");
        setTemperatureThreshold(temp);

        const humidity = await iotApi.getThreshold("humidity");
        setHumidityThreshold(humidity);

        const soilMoisture = await iotApi.getThreshold("moisture");
        setSoilMoistureThreshold(soilMoisture);

        const light = await iotApi.getThreshold("light");
        setLightThreshold(light);
      } catch (error) {
        console.error("Failed to fetch thresholds:", error);
      }
    }

    fetchThresholds();
  }, []);

  const [subscriptions, setSubscriptions] = useState({
    temp: false,
    humidity: false,
    soilMoisture: false,
    light: false,
  });

  const handleSubscribe = async () => {

    const selectedChannels = Object.keys(subscriptions).filter(
      (key) => subscriptions[key as keyof typeof subscriptions]
    );

    // If no channels are selected, send an empty array
    const channelsToSend = selectedChannels.length > 0 ? selectedChannels : [];

    try {
      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken;
      const response = await fetch(`${API_BASE_URL}/subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to Authorization header,
        },
        body: JSON.stringify({ channels: channelsToSend }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe. Please try again.");
      }

      setError("");
      toast({
        title: "Subscription Successful",
        description: "You have successfully subscribed to the selected alerts.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const handleSetThreshold = async (topic: string, value: number, bound: string) => {
    try {
      const response = await iotApi.setThreshold(topic, value, bound);
      toast({
        title: "Threshold Updated",
        description: `The ${topic} thresholds have been successfully updated.`,
      });

      // Update the thresholds in StatsCards
      if (statsCardsRef.current) {
        const thresholds = {
          temp: await iotApi.getThreshold("temp"),
          humidity: await iotApi.getThreshold("humidity"),
          moisture: await iotApi.getThreshold("moisture"),
          light: await iotApi.getThreshold("light"),
        };

        if (thresholds[topic]) {
          statsCardsRef.current.updateSensorData(
            topic,
            thresholds[topic].lower,
            thresholds[topic].upper
          );
        }
      }

      // Reset the change state for all topics
      if (topic === "humidity") {
        setIsHumidityChanged(false);
      } else if (topic === "temp") {
        setIsTemperatureChanged(false);
      } else if (topic === "moisture") {
        setIsSoilMoistureChanged(false);
      } else if (topic === "light") {
        setIsLightChanged(false);
      }


    } catch (error) {
      console.error("Failed to set threshold:", error);
      toast({
        title: "Error",
        description: "Failed to set threshold. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-800">IoT Greenhouse Monitoring System</h1>
          <p className="text-gray-600">Real-time environmental monitoring and control</p>
        </div>
        <div className="flex items-center gap-4">
          {userRole === 'admin' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.location.href = '/permissions'}
            >
              <Settings size={16} />
              Permissions Manager
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 relative">
                <BellRing size={16} />
                Subscribe
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Subscribe</AlertDialogTitle>
                <AlertDialogDescription>
                  Select the types of alerts you want to subscribe to.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor="temp-alert" className="flex-1">Temperature Alerts</label>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="checkbox"
                      id="temp-alert"
                      checked={subscriptions.temp}
                      onChange={(e) => setSubscriptions({ ...subscriptions, temp: e.target.checked })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor="humidity-alert" className="flex-1">Humidity Alerts</label>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="checkbox"
                      id="humidity-alert"
                      checked={subscriptions.humidity}
                      onChange={(e) => setSubscriptions({ ...subscriptions, humidity: e.target.checked })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor="soil-moisture-alert" className="flex-1">Soil Moisture Alerts</label>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="checkbox"
                      id="soil-moisture-alert"
                      checked={subscriptions.soilMoisture}
                      onChange={(e) => setSubscriptions({ ...subscriptions, soilMoisture: e.target.checked })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor="light-alert">Light Alerts</label>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="checkbox"
                      id="light-alert"
                      checked={subscriptions.light}
                      onChange={(e) => setSubscriptions({ ...subscriptions, light: e.target.checked })}
                    />
                    <div className="flex-1"></div>
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button onClick={handleSubscribe}>Subscribe</Button>

              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User size={16} />
                {userRole === 'admin' ? 'Admin' : 'User'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{email || "No email available"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatsCards ref={statsCardsRef} />
      </div>

      <Tabs defaultValue="dashboard" className="mb-6">
        <TabsList className={`grid ${userRole === 'admin' ? 'grid-cols-4' : 'grid-cols-2'} mb-4`}>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Gauge size={16} />
            Device Control
          </TabsTrigger>
          {userRole === 'admin' && (
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity size={16} />
              Activity
            </TabsTrigger>
          )}
          {userRole === 'admin' && (
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              Thresholds
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <EnvironmentCharts />
        </TabsContent>

        <TabsContent value="devices">
          <DeviceControl />
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 gap-6">
            <ActivityLog />
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <AlertSystem onAlertCountChange={setActiveAlerts} />
        </TabsContent>

        {userRole === 'admin' && (
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temperature Thresholds</CardTitle>
                  <CardDescription>Set min and max temperature values</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      placeholder="Value"
                      className="w-full"
                      value={temperatureThreshold.value} // Allow 0 as a valid value
                      onChange={(e) => {
                        setTemperatureThreshold({ ...temperatureThreshold, value: Number(e.target.value) });
                        setIsTemperatureChanged(true);
                      }}
                    />
                    <select
                      className="w-full border rounded-md p-2"
                      value={temperatureThreshold.bound || ""} // Ensure the initial value is empty
                      onChange={(e) => {
                        const selectedBound = e.target.value;
                        setTemperatureThreshold({ ...temperatureThreshold, bound: selectedBound }); // Update bound state
                        setIsTemperatureChanged(true);
                      }}
                    >
                      <option value="" disabled hidden>Select Bound</option> // Add placeholder option
                      <option value="lower">Lower</option>
                      <option value="upper">Upper</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    onClick={() => handleSetThreshold("temp", temperatureThreshold.value, temperatureThreshold.bound)} // Use bound state
                  >
                    Save
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Humidity Thresholds</CardTitle>
                  <CardDescription>Set min and max humidity values</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      placeholder="Value"
                      className="w-full"
                      value={humidityThreshold.value} // Allow 0 as a valid value
                      onChange={(e) => {
                        setHumidityThreshold({ ...humidityThreshold, value: Number(e.target.value) });
                        setIsHumidityChanged(true);
                      }}
                    />
                    <select
                      className="w-full border rounded-md p-2"
                      value={humidityThreshold.bound || ""} // Ensure the initial value is empty
                      onChange={(e) => {
                        const selectedBound = e.target.value;
                        setHumidityThreshold({ ...humidityThreshold, bound: selectedBound }); // Update bound state
                        setIsHumidityChanged(true);
                      }}
                    >
                      <option value="" disabled hidden>Select Bound</option> // Add placeholder option
                      <option value="lower">Lower</option>
                      <option value="upper">Upper</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    onClick={() => handleSetThreshold("humidity", humidityThreshold.value, humidityThreshold.bound)}
                  >
                    Save
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Soil Moisture Thresholds</CardTitle>
                  <CardDescription>Set min and max soil moisture values</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      placeholder="Value"
                      className="w-full"
                      value={soilMoistureThreshold.value} // Allow 0 as a valid value
                      onChange={(e) => {
                        setSoilMoistureThreshold({ ...soilMoistureThreshold, value: Number(e.target.value) });
                        setIsSoilMoistureChanged(true);
                      }}
                    />
                    <select
                      className="w-full border rounded-md p-2"
                      value={soilMoistureThreshold.bound || ""} // Ensure the initial value is empty
                      onChange={(e) => {
                        const selectedBound = e.target.value;
                        setSoilMoistureThreshold({ ...soilMoistureThreshold, bound: selectedBound }); // Update bound state
                        setIsSoilMoistureChanged(true);
                      }}
                    >
                      <option value="" disabled hidden>Select Bound</option> // Add placeholder option
                      <option value="lower">Lower</option>
                      <option value="upper">Upper</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    onClick={() => handleSetThreshold("moisture", soilMoistureThreshold.value, soilMoistureThreshold.bound)}
                  >
                    Save
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Light Thresholds</CardTitle>
                  <CardDescription>Set min and max light values</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      placeholder="Value"
                      className="w-full"
                      value={lightThreshold.value} // Allow 0 as a valid value
                      onChange={(e) => {
                        setLightThreshold({ ...lightThreshold, value: Number(e.target.value) });
                        setIsLightChanged(true);
                      }}
                    />
                    <select
                      className="w-full border rounded-md p-2"
                      value={lightThreshold.bound || ""} // Ensure the initial value is empty
                      onChange={(e) => {
                        const selectedBound = e.target.value;
                        setLightThreshold({ ...lightThreshold, bound: selectedBound }); // Update bound state
                        setIsLightChanged(true);
                      }}
                    >
                      <option value="" disabled hidden>Select Bound</option> // Add placeholder option
                      <option value="lower">Lower</option>
                      <option value="upper">Upper</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    onClick={() => handleSetThreshold("light", lightThreshold.value, lightThreshold.bound)}
                  >
                    Save
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

