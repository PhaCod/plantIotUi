"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Droplet, Fan, Lightbulb, Thermometer, AlertTriangle } from "lucide-react"

// Mock activity data
const mockActivities = [
  {
    id: 1,
    timestamp: "2023-05-15T08:30:00",
    type: "device",
    device: "water-pump",
    action: "activated",
    reason: "Soil moisture below threshold (25%)",
    automatic: true,
  },
  {
    id: 2,
    timestamp: "2023-05-15T09:15:00",
    type: "device",
    device: "water-pump",
    action: "deactivated",
    reason: "Soil moisture reached optimal level (45%)",
    automatic: true,
  },
  {
    id: 3,
    timestamp: "2023-05-15T10:45:00",
    type: "device",
    device: "fan",
    action: "activated",
    reason: "Temperature above threshold (33°C)",
    automatic: true,
  },
  {
    id: 4,
    timestamp: "2023-05-15T11:30:00",
    type: "device",
    device: "fan",
    action: "deactivated",
    reason: "Temperature decreased to optimal level (28°C)",
    automatic: true,
  },
  {
    id: 5,
    timestamp: "2023-05-15T12:00:00",
    type: "device",
    device: "lights",
    action: "activated",
    reason: "Light intensity below threshold (400 lux)",
    automatic: true,
  },
  {
    id: 6,
    timestamp: "2023-05-15T13:15:00",
    type: "alert",
    severity: "warning",
    message: "Humidity level approaching upper threshold (78%)",
    automatic: true,
  },
  {
    id: 7,
    timestamp: "2023-05-15T14:30:00",
    type: "device",
    device: "lights",
    action: "color-changed",
    reason: "Manual adjustment",
    automatic: false,
  },
  {
    id: 8,
    timestamp: "2023-05-15T15:45:00",
    type: "alert",
    severity: "critical",
    message: "Temperature spike detected (36°C)",
    automatic: true,
  },
  {
    id: 9,
    timestamp: "2023-05-15T16:00:00",
    type: "device",
    device: "fan",
    action: "activated",
    reason: "Manual activation",
    automatic: false,
  },
  {
    id: 10,
    timestamp: "2023-05-15T17:30:00",
    type: "device",
    device: "water-pump",
    action: "activated",
    reason: "Manual activation",
    automatic: false,
  },
]

export default function ActivityLog() {
  const [filter, setFilter] = useState("all")

  const filteredActivities = mockActivities.filter((activity) => {
    if (filter === "all") return true
    if (filter === "automatic") return activity.automatic
    if (filter === "manual") return !activity.automatic
    if (filter === "alerts") return activity.type === "alert"
    if (filter === "devices") return activity.type === "device"
    return true
  })

  const getDeviceIcon = (device) => {
    switch (device) {
      case "water-pump":
        return <Droplet size={16} />
      case "fan":
        return <Fan size={16} />
      case "lights":
        return <Lightbulb size={16} />
      default:
        return <Thermometer size={16} />
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle size={16} className="text-red-500" />
      case "warning":
        return <AlertTriangle size={16} className="text-yellow-500" />
      default:
        return <AlertTriangle size={16} className="text-gray-500" />
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>System and device activity history</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="alerts">Alerts Only</SelectItem>
              <SelectItem value="devices">Devices Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className="mt-0.5">
                {activity.type === "device" ? getDeviceIcon(activity.device) : getSeverityIcon(activity.severity)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {activity.type === "device"
                      ? `${activity.device.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} ${activity.action.replace("-", " ")}`
                      : activity.message}
                  </p>
                  <Badge variant={activity.automatic ? "outline" : "default"}>
                    {activity.automatic ? "Auto" : "Manual"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity.type === "device" && activity.reason}</p>
                <p className="text-xs text-muted-foreground mt-2">{formatDate(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

