import { NextResponse } from "next/server"

// Define types for Adafruit IO data
interface AdafruitData {
  id: string
  value: string
  feed_id: number
  feed_key: string
  created_at: string
  created_epoch: number
  expiration: string
}

interface ChartDataPoint {
  time: string
  timestamp: number
  temperature?: number
  humidity?: number
  soilMoisture?: number
  lightIntensity?: number
}

// Adafruit IO API configuration
const ADAFRUIT_API_KEY = process.env.NEXT_PUBLIC_API_KEY
const ADAFRUIT_USERNAME = process.env.NEXT_PUBLIC_API_USERNAME

// Feed configuration - allows for easy modification if feed names change
const FEEDS = {
  temperature: "temp",
  humidity: "humidity",
  soilMoisture: "moisture", // Changed from "soil-moisture" to "moisture"
  lightIntensity: "light", // Changed from "light-intensity" to "light"
}

// Function to fetch data from a single feed
async function fetchFeedData(feedName: string) {
  try {
    const response = await fetch(
      `https://io.adafruit.com/api/v2/${ADAFRUIT_USERNAME}/feeds/${feedName}/data?limit=50`,
      {
        headers: {
          "X-AIO-Key": `${ADAFRUIT_API_KEY}`,
        },
        // Add a longer timeout for potentially slow API responses
        signal: AbortSignal.timeout(15000),
      },
    )

    if (!response.ok) {
      console.error(`Error fetching ${feedName} data: ${response.status} ${response.statusText}`)
      return { success: false, status: response.status, statusText: response.statusText }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error(`Exception fetching ${feedName} data:`, error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function GET(request: Request) {
  // Get the timeRange from the query parameters
  const { searchParams } = new URL(request.url)
  const timeRange = searchParams.get("timeRange") || "6h"

  try {
    // Fetch data for each feed independently
    const results = await Promise.all([
      fetchFeedData(FEEDS.temperature),
      fetchFeedData(FEEDS.humidity),
      fetchFeedData(FEEDS.soilMoisture),
      fetchFeedData(FEEDS.lightIntensity),
    ])

    // Check if any feeds failed
    const failedFeeds = results
      .map((result, index) => ({ result, feed: Object.values(FEEDS)[index] }))
      .filter((item) => !item.result.success)

    // Create error message if any feeds failed
    let errorMessage = null
    if (failedFeeds.length > 0) {
      const errorDetails = failedFeeds
        .map((f) => `${f.feed}: ${f.result.status || ""} ${f.result.statusText || ""} ${f.result.error || ""}`)
        .join(", ")
      errorMessage = `Failed feeds: ${errorDetails}`
      console.warn(errorMessage)
    }

    // Check if ALL feeds failed
    if (failedFeeds.length === 4) {
      return NextResponse.json({
        chartData: [],
        source: "api",
        error: "All feeds failed to fetch data. Please try again later.",
      })
    }

    // Process data from successful feeds only
    const [tempResult, humidityResult, soilMoistureResult, lightIntensityResult] = results

    // Process temperature data - only if successful
    const tempPoints = tempResult.success
      ? tempResult.data.map((item: AdafruitData) => {
          const date = new Date(item.created_at)
          return {
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            timestamp: date.getTime(),
            temperature: Number.parseFloat(item.value),
          }
        })
      : []

    // Process humidity data - only if successful
    const humidityPoints = humidityResult.success
      ? humidityResult.data.map((item: AdafruitData) => {
          const date = new Date(item.created_at)
          return {
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            timestamp: date.getTime(),
            humidity: Number.parseFloat(item.value),
          }
        })
      : []

    // Process soil moisture data - only if successful
    const soilMoisturePoints = soilMoistureResult.success
      ? soilMoistureResult.data.map((item: AdafruitData) => {
          const date = new Date(item.created_at)
          return {
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            timestamp: date.getTime(),
            soilMoisture: Number.parseFloat(item.value),
          }
        })
      : []

    // Process light intensity data - only if successful
    const lightIntensityPoints = lightIntensityResult.success
      ? lightIntensityResult.data.map((item: AdafruitData) => {
          const date = new Date(item.created_at)
          return {
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            timestamp: date.getTime(),
            lightIntensity: Number.parseFloat(item.value),
          }
        })
      : []

    // Combine all data points
    const allDataPoints = [...tempPoints, ...humidityPoints, ...soilMoisturePoints, ...lightIntensityPoints]

    // If we have no data points at all, return an error
    if (allDataPoints.length === 0) {
      return NextResponse.json({
        chartData: [],
        source: "api",
        error: "No data available from any feeds",
      })
    }

    // Get unique timestamps
    const uniqueTimestamps = [...new Set(allDataPoints.map((point) => point.timestamp))]

    // Sort timestamps in descending order (newest first)
    uniqueTimestamps.sort((a, b) => b - a)

    // Create combined data points
    const combinedData = uniqueTimestamps.map((timestamp) => {
      const date = new Date(timestamp)
      const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

      // Find data points for this timestamp
      const tempPoint = tempPoints.find((p: ChartDataPoint) => p.timestamp === timestamp)
      const humidityPoint = humidityPoints.find((p: ChartDataPoint) => p.timestamp === timestamp)
      const soilMoisturePoint = soilMoisturePoints.find((p: ChartDataPoint) => p.timestamp === timestamp)
      const lightIntensityPoint = lightIntensityPoints.find((p: ChartDataPoint) => p.timestamp === timestamp)

      // Combine data
      return {
        time: timeString,
        timestamp,
        temperature: tempPoint?.temperature,
        humidity: humidityPoint?.humidity,
        soilMoisture: soilMoisturePoint?.soilMoisture,
        lightIntensity: lightIntensityPoint?.lightIntensity,
      }
    })

    // Limit to the most recent data points (e.g., 50 points)
    const limitedData = combinedData.slice(0, 50)

    return NextResponse.json({
      chartData: limitedData,
      source: "adafruit",
      error: errorMessage,
    })
  } catch (error) {
    console.error("Error in environment-data API route:", error)

    // Return empty data with error message
    return NextResponse.json({
      chartData: [],
      source: "api",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

