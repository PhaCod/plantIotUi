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
}

export default function Dashboard() {
  
  
  interface StatsCardsRef {
    updateSensorData: (topic: string, lower: number, upper: number) => void;
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
      }
    }

    fetchUserRole();
  }, []);

  const [temperatureThreshold, setTemperatureThreshold] = useState({ lower: 0, upper: 0 });
  const [humidityThreshold, setHumidityThreshold] = useState({ lower: 0, upper: 0 });
  const [soilMoistureThreshold, setSoilMoistureThreshold] = useState({ lower: 0, upper: 0 });
  const [lightThreshold, setLightThreshold] = useState({ lower: 0, upper: 0 });

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

  const handleSubscribe = async () => {
    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/subcription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe. Please try again.");
      }

      setError("");
      alert("Subscription successful!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const handleSetThreshold = async (topic: string, lower: number, upper: number) => {
    try {
      const response = await iotApi.setThreshold(topic, lower, upper);
      toast({
        title: "Threshold Updated",
        description: `The ${topic} thresholds have been successfully updated.`,
      });

      // Update the thresholds in StatsCards
      if (statsCardsRef.current) {
        statsCardsRef.current.updateSensorData(topic, lower, upper);
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
          <Button variant="outline" size="sm" className="gap-2">
            <Settings size={16} />
            Settings
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 relative">
                <BellRing size={16} />
                Subscribe
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Subscribe to Alerts</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter your email address to receive notifications from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
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
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatsCards ref={statsCardsRef} />
      </div>

      <Tabs defaultValue="dashboard" className="mb-6">
        <TabsList className={`grid ${userRole === 'admin' ? 'grid-cols-5' : 'grid-cols-3'} mb-4`}>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Dashboard
          </TabsTrigger>
          {userRole === 'admin' && (
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Gauge size={16} />
              Device Control
            </TabsTrigger>
          )}
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity size={16} />
            Activity
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell size={16} />
            Alerts
            {activeAlerts > 0 && <Badge className="ml-1 bg-red-500">{activeAlerts}</Badge>}
          </TabsTrigger>
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

        {userRole === 'admin' && (
          <TabsContent value="devices">
            <DeviceControl />
          </TabsContent>
        )}

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
                      placeholder="Min"
                      className="w-full"
                      value={temperatureThreshold.lower}
                      onChange={(e) => {
                        setTemperatureThreshold({ ...temperatureThreshold, lower: Number(e.target.value) });
                        setIsTemperatureChanged(true);
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      className="w-full"
                      value={temperatureThreshold.upper}
                      onChange={(e) => {
                        setTemperatureThreshold({ ...temperatureThreshold, upper: Number(e.target.value) });
                        setIsTemperatureChanged(true);
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    disabled={!isTemperatureChanged}
                    onClick={() => handleSetThreshold("temp", temperatureThreshold.lower, temperatureThreshold.upper)}
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
                      placeholder="Min"
                      className="w-full"
                      value={humidityThreshold.lower}
                      onChange={(e) => {
                        setHumidityThreshold({ ...humidityThreshold, lower: Number(e.target.value) });
                        setIsHumidityChanged(true);
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      className="w-full"
                      value={humidityThreshold.upper}
                      onChange={(e) => {
                        setHumidityThreshold({ ...humidityThreshold, upper: Number(e.target.value) });
                        setIsHumidityChanged(true);
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    disabled={!isHumidityChanged}
                    onClick={() => handleSetThreshold("humidity", humidityThreshold.lower, humidityThreshold.upper)}
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
                      placeholder="Min"
                      className="w-full"
                      value={soilMoistureThreshold.lower}
                      onChange={(e) => {
                        setSoilMoistureThreshold({ ...soilMoistureThreshold, lower: Number(e.target.value) });
                        setIsSoilMoistureChanged(true);
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      className="w-full"
                      value={soilMoistureThreshold.upper}
                      onChange={(e) => {
                        setSoilMoistureThreshold({ ...soilMoistureThreshold, upper: Number(e.target.value) });
                        setIsSoilMoistureChanged(true);
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    disabled={!isSoilMoistureChanged}
                    onClick={() => handleSetThreshold("moisture", soilMoistureThreshold.lower, soilMoistureThreshold.upper)}
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
                      placeholder="Min"
                      className="w-full"
                      value={lightThreshold.lower}
                      onChange={(e) => {
                        setLightThreshold({ ...lightThreshold, lower: Number(e.target.value) });
                        setIsLightChanged(true);
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      className="w-full"
                      value={lightThreshold.upper}
                      onChange={(e) => {
                        setLightThreshold({ ...lightThreshold, upper: Number(e.target.value) });
                        setIsLightChanged(true);
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    disabled={!isLightChanged}
                    onClick={() => handleSetThreshold("light", lightThreshold.lower, lightThreshold.upper)}
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

