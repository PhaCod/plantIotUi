"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Fan, Zap, Lightbulb, Search, Check, X, UserCog } from "lucide-react"
import UserPermissionCard from "@/components/admin/user-permission-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { iotApi } from "@/app/api/iotApi/route"

interface User {
  _id: string;
  email: string;
  role: string;
  permissions: string[];
  channels?: string[]; // Made channels optional
}

interface Permissions {
  fan: boolean;
  pump: boolean;
  lights: boolean;
}

export default function PermissionsManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<Permissions | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const fetchedUsers = await iotApi.getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle selecting a user to edit
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setEditedPermissions({
      fan: user.permissions.includes("fan"),
      pump: user.permissions.includes("pump"),
      lights: user.permissions.includes("led"),
    });
  };

  // Handle permission toggle
  const handlePermissionChange = (device: keyof Permissions, value: boolean) => {
    if (editedPermissions) {
      setEditedPermissions({
        ...editedPermissions,
        [device]: value,
      });
    }
  };

  // Save permissions
  const handleSavePermissions = async () => {
    if (selectedUser && editedPermissions) {
      const updatedPermissions = Object.keys(editedPermissions).filter(
        (key) => editedPermissions[key as keyof Permissions]
      );

      try {
        await iotApi.addPermission(selectedUser.email, updatedPermissions);

        const updatedUsers = users.map((user) =>
          user._id === selectedUser._id
            ? {
              ...user,
              permissions: updatedPermissions,
            }
            : user
        );

        setUsers(updatedUsers);
        setSelectedUser(null);
        setEditedPermissions(null);

        console.log("Permissions updated successfully");

        // Refresh the page after saving permissions
        window.location.reload();
      } catch (error) {
        console.error("Failed to update permissions:", error);
      }
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setSelectedUser(null);
    setEditedPermissions(null);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await iotApi.deleteUser(userId);

      if ('error' in response) {
        console.error(response.error);
        return;
      }

      setUsers(users.filter((user) => user._id !== userId));
      console.log("User deleted successfully");
      // Refresh the page after saving permissions
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="cards" onValueChange={(value) => setViewMode(value as "cards" | "table")}>
          <TabsList>
            <TabsTrigger value="cards">Card View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {selectedUser ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCog className="mr-2 h-5 w-5" />
              Edit Permissions for {selectedUser.email}
            </CardTitle>
            <CardDescription>
              {selectedUser.role}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Device Access Permissions</h3>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-muted">
                        <Fan className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Ventilation Fan</p>
                        <p className="text-xs text-muted-foreground">Control fan operation</p>
                      </div>
                    </div>
                    <Switch
                      checked={editedPermissions?.fan || false}
                      onCheckedChange={(checked) => handlePermissionChange("fan", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-muted">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Water Pump</p>
                        <p className="text-xs text-muted-foreground">Control irrigation system</p>
                      </div>
                    </div>
                    <Switch
                      checked={editedPermissions?.pump || false}
                      onCheckedChange={(checked) => handlePermissionChange("pump", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-muted">
                        <Lightbulb className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">LED Lights</p>
                        <p className="text-xs text-muted-foreground">Control lighting system</p>
                      </div>
                    </div>
                    <Switch
                      checked={editedPermissions?.lights || false}
                      onCheckedChange={(checked) => handlePermissionChange("lights", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Subscribed Channels</h3>
                <div className="grid gap-2">
                  {selectedUser.channels?.map((channel) => (
                    <Badge key={channel} variant="outline" className="w-full text-left">
                      {channel}
                    </Badge>
                  )) || <p className="text-sm text-muted-foreground">No channels subscribed.</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSavePermissions}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Permissions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
              <p className="text-muted-foreground">No users found matching your search criteria.</p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user: { _id: string; email: string; role: string; permissions: string[] }) => (
                <UserPermissionCard
                  key={`${user._id}-${user.email}`} // Ensure a unique key by combining _id and email
                  user={{
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions,
                    channels: user.channels || [],
                  }}
                  onEdit={() => handleSelectUser(user)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>User Permissions</CardTitle>
                <CardDescription>Manage device access for all users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Fan</TableHead>
                      <TableHead>Water Pump</TableHead>
                      <TableHead>LED Lights</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow key={`${user._id}-${index}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.permissions.includes("fan") ? (
                            <Badge variant="default" className="w-16 justify-center">
                              Allowed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="w-16 justify-center">
                              Denied
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.permissions.includes("pump") ? (
                            <Badge variant="default" className="w-16 justify-center">
                              Allowed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="w-16 justify-center">
                              Denied
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.permissions.includes("led") ? (
                            <Badge variant="default" className="w-16 justify-center">
                              Allowed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="w-16 justify-center">
                              Denied
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={user.role === "admin"} // Disable delete button for admin role
                            >
                              Delete
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleSelectUser(user)}>
                              Edit
                            </Button>

                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
