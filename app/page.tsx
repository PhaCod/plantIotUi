import type { Metadata } from "next"
import Dashboard from "@/components/dashboard"

export const metadata: Metadata = {
  title: "IoT Greenhouse Monitoring System",
  description: "Real-time monitoring and control for smart greenhouses",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <Dashboard />
    </main>
  )
}

