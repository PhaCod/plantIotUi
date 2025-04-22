"use client"

import PermissionsManager from "@/components/admin/permissions-manager"



export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Permissions Manager</h1>
      <PermissionsManager />
    </div>
  )
}

