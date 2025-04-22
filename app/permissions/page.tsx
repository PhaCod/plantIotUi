"use client"

import PermissionsManager from "@/components/admin/permissions-manager"
import { Button } from "@/components/ui/button"



export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <Button
        variant="outline"
        size="sm"
        className="mb-4"
        onClick={() => window.location.href = '/'}
      >
        Back to Home
      </Button>
      <h1 className="text-3xl font-bold mb-6">Permissions Manager</h1>
      <PermissionsManager />
    </div>
  )
}

