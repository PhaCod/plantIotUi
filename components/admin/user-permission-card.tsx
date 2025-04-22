"use client"

import { useEffect, useState } from "react";
import { iotApi } from "@/app/api/iotApi/route";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Fan, Zap, Lightbulb, User } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface UserPermissionCardProps {
  user: {
    _id: string;
    email: string;
    role: string;
    permissions: string[];
    channels: string[];
  };
  onEdit: () => void;
}

export default function UserPermissionCard({ user, onEdit }: UserPermissionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await iotApi.deleteUser(user._id);
      console.log("User deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{user.email}</h3>
            </div>
          </div>
          <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
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
            {user.permissions.includes("fan") ? <Badge variant="default">Allowed</Badge> : <Badge variant="outline">Denied</Badge>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Water Pump</span>
            </div>
            {user.permissions.includes("pump") ? <Badge variant="default">Allowed</Badge> : <Badge variant="outline">Denied</Badge>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">LED Lights</span>
            </div>
            {user.permissions.includes("led") ? <Badge variant="default">Allowed</Badge> : <Badge variant="outline">Denied</Badge>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 p-3">
        <div className="flex space-x-2 w-full">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-24"
                disabled={user.role === "admin"} // Disable delete button for admin role
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
            Edit Permissions
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
