"use client"

import { useState } from "react";
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

export default function Dashboard() {
  const [activeAlerts, setActiveAlerts] = useState(3)
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      const response = await fetch("/api/subscribe", {
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
                Admin User
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatsCards />
      </div>

      <Tabs defaultValue="dashboard" className="mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Gauge size={16} />
            Device Control
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity size={16} />
            Activity
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell size={16} />
            Alerts
            {activeAlerts > 0 && <Badge className="ml-1 bg-red-500">{activeAlerts}</Badge>}
          </TabsTrigger>
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
      </Tabs>
    </div>
  )
}

