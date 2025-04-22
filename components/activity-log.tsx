"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Droplet, Fan, Lightbulb, Thermometer, AlertTriangle } from "lucide-react"
import { iotApi } from "@/app/api/iotApi/route"

// Mock activity data
interface DeviceActivity {
  id: number
  timestamp: string
  type: "device"
  device: "pump" | "fan" | "light"
  action: string
  reason: string
  automatic: boolean
}

interface AlertActivity {
  id: number
  timestamp: string
  type: "alert"
  severity: "critical" | "warning" | "info"
  message: string
  automatic: boolean
}

type Activity = DeviceActivity | AlertActivity

// Extend Activity type to include ConfigThreshold
interface ConfigThresholdActivity {
  id: number;
  timestamp: string;
  type: "config";
  topic: string;
  threshold: string | null;
  bound: string | null;
}

type ExtendedActivity = Activity | ConfigThresholdActivity;

export default function ActivityLog() {
  const [filter, setFilter] = useState<string>("all");
  const [activities, setActivities] = useState<ExtendedActivity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const logs = await iotApi.getLogs();
        const parsedActivities: ExtendedActivity[] = logs.map((log, index) => {
          if (log.content.startsWith("ConfigThreshold")) {
            const match = /ConfigThreshold\(topic=(.*?), threshold=(.*?), bound=(.*?), timestamp=(.*?)\)/.exec(
              log.content
            );
            return {
              id: index + 1,
              timestamp: log.timestamp,
              type: "config",
              topic: match?.[1] || "unknown",
              threshold: match?.[2] || null,
              bound: match?.[3] || null,
            };
          } else if (log.content.startsWith("Action")) {
            const match = /Action\(user=(.*?), action=(.*?), device=(.*?), timestamp=(.*?)\)/.exec(
              log.content
            );
            return {
              id: index + 1,
              timestamp: log.timestamp,
              type: "device",
              device: match?.[3] || "unknown",
              action: parseFloat(match?.[2] || "0") === 1.0 ? "activated" : "deactivated",
              reason: `Performed by ${match?.[1] || "unknown user"}`,
              automatic: false,
            };
          }
          return null;
        }).filter(Boolean) as ExtendedActivity[];

        setActivities(parsedActivities);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      }
    };

    fetchData();
  }, []);

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    if (filter === "automatic") return activity.type === "device" && activity.automatic;
    if (filter === "manual") return activity.type === "device" && !activity.automatic;
    if (filter === "alerts") return activity.type === "alert";
    if (filter === "devices") return activity.type === "device";
    if (filter === "config") return activity.type === "config";
    return true;
  });

  const getDeviceIcon = (device: DeviceActivity["device"]) => {
    switch (device) {
      case "pump":
        return <Droplet size={16} />
      case "fan":
        return <Fan size={16} />
      case "light":
        return <Lightbulb size={16} />
      default:
        return <Thermometer size={16} />
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle size={16} className="text-red-500" />
      case "warning":
        return <AlertTriangle size={16} className="text-yellow-500" />
      default:
        return <AlertTriangle size={16} className="text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${date.toLocaleTimeString()}`;
  };

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
              <SelectItem value="config">Configurations Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className="mt-0.5">
                {activity.type === "device"
                  ? getDeviceIcon(activity.device as DeviceActivity["device"])
                  : activity.type === "alert"
                  ? getSeverityIcon((activity as AlertActivity).severity)
                  : <Thermometer size={16} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {activity.type === "device"
                      ? `${activity.device.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} ${activity.action}`
                      : activity.type === "alert"
                      ? (activity as AlertActivity).message
                      : `Config for ${activity.topic}`}
                  </p>
                  {activity.type === "device" && (
                    <Badge variant={activity.automatic ? "outline" : "default"}>
                      {activity.automatic ? "Auto" : "Manual"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.type === "device" && (activity as DeviceActivity).reason}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{formatDate(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

