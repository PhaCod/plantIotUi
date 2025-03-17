"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gauge, Bell, Activity, Settings, BarChart3, User } from "lucide-react"
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

export default function Dashboard() {
  const [activeAlerts, setActiveAlerts] = useState(3)

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
          <Button variant="outline" size="sm" className="gap-2 relative">
            <Bell size={16} />
            Alerts
            {activeAlerts > 0 && <Badge className="absolute -top-2 -right-2 bg-red-500">{activeAlerts}</Badge>}
          </Button>
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

