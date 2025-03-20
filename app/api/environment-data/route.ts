import { NextResponse } from "next/server"

// This would be replaced with your actual database or IoT device integration
const generateRealData = (hours: number) => {
  const data = []
  const now = new Date()

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)

    // In a real application, you would fetch this data from your database
    // or directly from IoT sensors
    data.push({
      timestamp: timestamp.toISOString(),
      temperature: 25 + Math.sin(i / 3) * 5 + Math.random() * 2,
      humidity: 60 + Math.sin(i / 2) * 15 + Math.random() * 5,
      soilMoisture: 50 + Math.cos(i / 4) * 10 + Math.random() * 3,
      lightIntensity: 1000 + Math.sin(i / 2) * 500 + Math.random() * 100,
    })
  }

  return data
}

export async function GET(request: Request) {
  // Get the hours parameter from the URL
  const { searchParams } = new URL(request.url)
  const hours = Number.parseInt(searchParams.get("hours") || "6")

  try {
    // In a real application, you would:
    // 1. Connect to your database or IoT platform
    // 2. Query for the sensor data within the specified time range
    // 3. Format and return the data

    // For this example, we'll generate mock data
    const data = generateRealData(hours)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching environment data:", error)
    return NextResponse.json({ error: "Failed to fetch environment data" }, { status: 500 })
  }
}

