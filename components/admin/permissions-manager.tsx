"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Fan, Zap, Lightbulb, Search, Check, X, UserCog } from "lucide-react"
import UserPermissionCard from "@/components/admin/user-permission-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Greenhouse Manager",
    permissions: { fan: true, pump: true, lights: true },
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Gardener",
    permissions: { fan: true, pump: false, lights: true },
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.j@example.com",
    role: "Assistant",
    permissions: { fan: false, pump: false, lights: false },
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.d@example.com",
    role: "Intern",
    permissions: { fan: false, pump: false, lights: false },
  },
  {
    id: 5,
    name: "Michael Wilson",
    email: "michael.w@example.com",
    role: "Technician",
    permissions: { fan: true, pump: true, lights: false },
  },
  {
    id: 6,
    name: "Sarah Brown",
    email: "sarah.b@example.com",
    role: "Researcher",
    permissions: { fan: false, pump: true, lights: true },
  },
  {
    id: 7,
    name: "David Miller",
    email: "david.m@example.com",
    role: "Visitor",
    permissions: { fan: false, pump: false, lights: false },
  },
]

interface Permissions {
  fan: boolean;
  pump: boolean;
  lights: boolean;
}

export default function PermissionsManager() {
  const [users, setUsers] = useState(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(null)
  const [editedPermissions, setEditedPermissions] = useState<Permissions | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle selecting a user to edit
  const handleSelectUser = (user: (typeof users)[0]) => {
    setSelectedUser(user)
    setEditedPermissions(user.permissions)
  }

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
  const handleSavePermissions = () => {
    if (selectedUser && editedPermissions) {
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, permissions: editedPermissions } : user,
      )
      setUsers(updatedUsers)
      setSelectedUser(null)
      setEditedPermissions(null)
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setSelectedUser(null)
    setEditedPermissions(null)
  }

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
              Edit Permissions for {selectedUser.name}
            </CardTitle>
            <CardDescription>
              {selectedUser.email} • {selectedUser.role}
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
              {filteredUsers.map((user) => (
                <UserPermissionCard key={user.id} user={user} onEdit={() => handleSelectUser(user)} />
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.permissions.fan ? (
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
                          {user.permissions.pump ? (
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
                          {user.permissions.lights ? (
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
                          <Button variant="ghost" size="sm" onClick={() => handleSelectUser(user)}>
                            Edit
                          </Button>
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
