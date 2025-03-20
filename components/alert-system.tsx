"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, Bell, BellOff } from "lucide-react"

// Mock alerts data
const mockAlerts = [
  {
    id: 1,
    timestamp: "2023-05-15T13:15:00",
    type: "temperature",
    message: "Temperature above threshold",
    details: "Current: 34°C, Threshold: 32°C",
    severity: "warning",
    status: "active",
  },
  {
    id: 2,
    timestamp: "2023-05-15T14:30:00",
    type: "soil-moisture",
    message: "Soil moisture critically low 💧",
    details: "Current: 22%, Threshold: 30%",
    severity: "critical",
    status: "active",
  },
  {
    id: 3,
    timestamp: "2023-05-15T15:45:00",
    type: "humidity",
    message: "Humidity above optimal range",
    details: "Current: 85%, Threshold: 80%",
    severity: "warning",
    status: "active",
  },
  {
    id: 4,
    timestamp: "2023-05-15T10:15:00",
    type: "temperature",
    message: "Temperature below optimal range",
    details: "Current: 16°C, Threshold: 18°C",
    severity: "warning",
    status: "resolved",
  },
  {
    id: 5,
    timestamp: "2023-05-15T08:30:00",
    type: "light",
    message: "Light intensity too low",
    details: "Current: 350 lux, Threshold: 500 lux",
    severity: "warning",
    status: "resolved",
  },
]

<<<<<<< HEAD
export default function AlertSystem({ onAlertCountChange }) {
  const [alerts, setAlerts] = useState(mockAlerts)
=======
export default function AlertSystem({ onAlertCountChange }: { onAlertCountChange?: (count: number) => void }) {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
>>>>>>> origin/main

  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const resolvedAlerts = alerts.filter((alert) => alert.status === "resolved")

  useEffect(() => {
    if (onAlertCountChange) {
      onAlertCountChange(activeAlerts.length)
    }
  }, [activeAlerts.length, onAlertCountChange])

  const handleResolveAlert = (id) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, status: "resolved" } : alert)))
  }

  const handleDismissAll = () => {
    setAlerts(alerts.map((alert) => (alert.status === "active" ? { ...alert, status: "resolved" } : alert)))
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "critical":
        return (
          <Badge variant="destructive" className="ml-2">
            Critical
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="warning" className="ml-2 bg-yellow-500">
            Warning
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="ml-2">
            Info
          </Badge>
        )
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
            <CardTitle>Smart Alert System 🔥</CardTitle>
            <CardDescription>Monitor and manage system alerts</CardDescription>
          </div>
          {activeAlerts.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDismissAll}>
              Resolve All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Bell size={14} />
              Active
              {activeAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {activeAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <BellOff size={14} />
              Resolved
              {resolvedAlerts.length > 0 && (
                <Badge variant="outline" className="ml-1">
                  {resolvedAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle size={48} className="text-green-500 mb-4" />
                <h3 className="text-lg font-medium">All Clear</h3>
                <p className="text-sm text-muted-foreground mt-1">No active alerts at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.severity === "critical"
                        ? "border-red-200 bg-red-50"
                        : alert.severity === "warning"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          size={20}
                          className={
                            alert.severity === "critical"
                              ? "text-red-500"
                              : alert.severity === "warning"
                                ? "text-yellow-500"
                                : "text-blue-500"
                          }
                        />
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium">{alert.message}</h4>
                            {getSeverityBadge(alert.severity)}
                          </div>
                          <p className="text-sm mt-1">{alert.details}</p>
                          <p className="text-xs text-muted-foreground mt-2">{formatDate(alert.timestamp)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleResolveAlert(alert.id)}>
                        <CheckCircle size={16} className="mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved">
            {resolvedAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <XCircle size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No Resolved Alerts</h3>
                <p className="text-sm text-muted-foreground mt-1">There are no resolved alerts in the history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resolvedAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-green-500" />
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium">{alert.message}</h4>
                          <Badge variant="outline" className="ml-2">
                            Resolved
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{alert.details}</p>
                        <p className="text-xs text-muted-foreground mt-2">{formatDate(alert.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

