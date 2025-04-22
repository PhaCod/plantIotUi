"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Fan, Zap, Lightbulb, User } from "lucide-react"

interface UserPermissionCardProps {
  user: {
    id: number
    name: string
    email: string
    role: string
    permissions: {
      fan: boolean
      pump: boolean
      lights: boolean
    }
  }
  onEdit: () => void
}

export default function UserPermissionCard({ user, onEdit }: UserPermissionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Badge variant="outline">{user.role}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h4 className="mb-2 text-sm font-medium">Device Permissions</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Fan className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Ventilation Fan</span>
            </div>
            {user.permissions.fan ? <Badge variant="default">Allowed</Badge> : <Badge variant="outline">Denied</Badge>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Water Pump</span>
            </div>
            {user.permissions.pump ? <Badge variant="default">Allowed</Badge> : <Badge variant="outline">Denied</Badge>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">LED Lights</span>
            </div>
            {user.permissions.lights ? (
              <Badge variant="default">Allowed</Badge>
            ) : (
              <Badge variant="outline">Denied</Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 p-3">
        <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
          Edit Permissions
        </Button>
      </CardFooter>
    </Card>
  )
}
