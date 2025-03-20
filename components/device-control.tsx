"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Droplet, Fan, Lightbulb, Palette, CheckCircle, WifiOff } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { toast } from "@/components/ui/use-toast"
import { iotApi, FeedType } from "@/lib/api"

export default function DeviceControl() {
  const [waterPump, setWaterPump] = useState(false)
  const [fan, setFan] = useState(false)
  const [lights, setLights] = useState(false)
  const [lightColor, setLightColor] = useState("#22c55e")
  const [lightIntensity, setLightIntensity] = useState(70)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Loading states
  const [waterPumpLoading, setWaterPumpLoading] = useState(false)
  const [fanLoading, setFanLoading] = useState(false)
  const [lightsLoading, setLightsLoading] = useState(false)
  const [applyingSettings, setApplyingSettings] = useState(false)

  // Success states
  const [waterPumpSuccess, setWaterPumpSuccess] = useState(false)
  const [fanSuccess, setFanSuccess] = useState(false)
  const [lightsSuccess, setLightsSuccess] = useState(false)

  // Subscribe to real-time updates
  useEffect(() => {
    let connectionTimeout: NodeJS.Timeout

    const resetConnection = () => {
      setIsConnected(false)
      setWaterPump(false)
      setFan(false)
      setLights(false)
    }

    const setupConnection = () => {
      // Reset connection state
      resetConnection()

      // Set a timeout to check if we receive any data
      connectionTimeout = setTimeout(() => {
        if (!isConnected) {
          resetConnection()
          toast({
            title: "Connection Error",
            description: "Unable to connect to IoT devices. Please check your connection.",
            variant: "destructive",
          })
        }
      }, 5000) // Wait 5 seconds for initial data

      iotApi.subscribeToStream(
        (data) => {
          setIsConnected(true)
          // Update states based on received data
          switch (data.type) {
            case 'moisture':
              setWaterPump(data.value === '1')
              break
            case 'temp':
              setFan(data.value === '1')
              break
            case 'light':
              setLightIntensity(Math.min(100, Math.max(0, parseFloat(data.value))))
              break
          }
        },
        (error) => {
          resetConnection()
          toast({
            title: "Connection Error",
            description: "Failed to connect to IoT stream. Please refresh the page.",
            variant: "destructive",
          })
        }
      )
    }

    setupConnection()

    return () => {
      clearTimeout(connectionTimeout)
      iotApi.unsubscribeFromStream()
    }
  }, [])

  const handleWaterPumpToggle = async () => {
    setWaterPumpLoading(true)
    setWaterPumpSuccess(false)

    try {
      await iotApi.postFeedData('moisture', !waterPump ? '1' : '0')

      setWaterPump(!waterPump)
      setWaterPumpSuccess(true)

      toast({
        title: "Water Pump Control",
        description: !waterPump ? "Water pump activated successfully" : "Water pump deactivated successfully",
      })

      setTimeout(() => {
        setWaterPumpSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error controlling water pump:", error)
      toast({
        title: "Error",
        description: "Failed to control water pump. Please try again.",
        variant: "destructive",
      })
    } finally {
      setWaterPumpLoading(false)
    }
  }

  const handleFanToggle = async () => {
    setFanLoading(true)
    setFanSuccess(false)

    try {
      await iotApi.postFeedData('temp', !fan ? '1' : '0')

      setFan(!fan)
      setFanSuccess(true)

      toast({
        title: "Ventilation Fan Control",
        description: !fan ? "Fan activated successfully" : "Fan deactivated successfully",
      })

      setTimeout(() => {
        setFanSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error controlling fan:", error)
      toast({
        title: "Error",
        description: "Failed to control fan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFanLoading(false)
    }
  }

  const handleLightsToggle = async () => {
    setLightsLoading(true)
    setLightsSuccess(false)

    try {
      await iotApi.postFeedData('light', !lights ? lightIntensity.toString() : '0')

      setLights(!lights)
      setLightsSuccess(true)

      toast({
        title: "RGB LED Lights Control",
        description: !lights ? "Lights turned on successfully" : "Lights turned off successfully",
      })

      setTimeout(() => {
        setLightsSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error controlling lights:", error)
      toast({
        title: "Error",
        description: "Failed to control lights. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLightsLoading(false)
    }
  }

  const handleLightIntensityChange = (value: number) => {
    setLightIntensity(value)
  }

  const applyLightSettings = async () => {
    if (!lights) return

    setApplyingSettings(true)

    try {
      await iotApi.postFeedData('light', lightIntensity.toString())

      toast({
        title: "RGB LED Lights Settings",
        description: "Light settings applied successfully",
      })
    } catch (error) {
      console.error("Error applying light settings:", error)
      toast({
        title: "Error",
        description: "Failed to apply light settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setApplyingSettings(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className={!isConnected ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Water Pump Control ⚡</CardTitle>
              <CardDescription>Control irrigation system</CardDescription>
            </div>
            {!isConnected && <WifiOff className="h-5 w-5 text-gray-400" />}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-100 border-4 border-blue-200 relative">
            <Droplet size={40} className={waterPump ? "text-blue-500" : "text-gray-400"} />
            {waterPumpSuccess && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <CheckCircle size={16} />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Switch
              id="water-pump"
              checked={waterPump}
              onCheckedChange={handleWaterPumpToggle}
              disabled={waterPumpLoading || !isConnected}
            />
            <div className="grid gap-1.5">
              <label
                htmlFor="water-pump"
                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {waterPump ? "Active" : "Inactive"}
                {waterPumpLoading && <span className="ml-2 text-sm text-muted-foreground">(Connecting...)</span>}
                {!isConnected && <span className="ml-2 text-sm text-muted-foreground">(Offline)</span>}
              </label>
              <p className="text-sm text-muted-foreground">
                {waterPump ? "Water pump is running" : "Water pump is off"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleWaterPumpToggle()}
            disabled={waterPumpLoading || waterPump || !isConnected}
          >
            {waterPumpLoading && !waterPump ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Turning On...
              </span>
            ) : (
              "Turn On"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleWaterPumpToggle()}
            disabled={waterPumpLoading || !waterPump || !isConnected}
          >
            {waterPumpLoading && waterPump ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Turning Off...
              </span>
            ) : (
              "Turn Off"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className={!isConnected ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Ventilation Fan 🌀</CardTitle>
              <CardDescription>Control air circulation</CardDescription>
            </div>
            {!isConnected && <WifiOff className="h-5 w-5 text-gray-400" />}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-gray-200 relative">
            <Fan
              size={40}
              className={fan ? "text-gray-700 animate-spin" : "text-gray-400"}
              style={{ animationDuration: "3s" }}
            />
            {fanSuccess && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <CheckCircle size={16} />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Switch id="fan" checked={fan} onCheckedChange={handleFanToggle} disabled={fanLoading || !isConnected} />
            <div className="grid gap-1.5">
              <label
                htmlFor="fan"
                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {fan ? "Active" : "Inactive"}
                {fanLoading && <span className="ml-2 text-sm text-muted-foreground">(Connecting...)</span>}
                {!isConnected && <span className="ml-2 text-sm text-muted-foreground">(Offline)</span>}
              </label>
              <p className="text-sm text-muted-foreground">{fan ? "Fan is running" : "Fan is off"}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => handleFanToggle()} disabled={fanLoading || fan || !isConnected}>
            {fanLoading && !fan ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Turning On...
              </span>
            ) : (
              "Turn On"
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleFanToggle()} disabled={fanLoading || !fan || !isConnected}>
            {fanLoading && fan ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Turning Off...
              </span>
            ) : (
              "Turn Off"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className={`md:col-span-2 ${!isConnected ? "opacity-50 pointer-events-none" : ""}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>RGB LED Lights 💡</CardTitle>
              <CardDescription>Control grow lights</CardDescription>
            </div>
            {!isConnected && <WifiOff className="h-5 w-5 text-gray-400" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center border-4 relative"
                style={{
                  backgroundColor: lights ? lightColor : "#f3f4f6",
                  borderColor: lights ? lightColor : "#e5e7eb",
                  opacity: lights ? lightIntensity / 100 : 0.3,
                }}
              >
                <Lightbulb size={48} className={lights ? "text-white" : "text-gray-400"} />
                {lightsSuccess && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <Switch id="lights" checked={lights} onCheckedChange={handleLightsToggle} disabled={lightsLoading || !isConnected} />
                <div className="grid gap-1.5">
                  <label
                    htmlFor="lights"
                    className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {lights ? "Active" : "Inactive"}
                    {lightsLoading && <span className="ml-2 text-sm text-muted-foreground">(Connecting...)</span>}
                    {!isConnected && <span className="ml-2 text-sm text-muted-foreground">(Offline)</span>}
                  </label>
                  <p className="text-sm text-muted-foreground">{lights ? "Lights are on" : "Lights are off"}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium leading-none">Light Intensity</label>
                  <span className="text-sm text-muted-foreground">{lightIntensity}%</span>
                </div>
                <Slider
                  value={[lightIntensity]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleLightIntensityChange(value[0])}
                  disabled={!lights || !isConnected}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium leading-none">Light Color</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    disabled={!lights || !isConnected}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: lightColor }}></div>
                    <Palette size={14} />
                  </Button>
                </div>
                {showColorPicker && (
                  <div className="mt-2">
                    <HexColorPicker color={lightColor} onChange={setLightColor} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
              style={{ backgroundColor: "#ef4444" }}
              onClick={() => setLightColor("#ef4444")}
              disabled={!lights || !isConnected}
            />
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
              style={{ backgroundColor: "#3b82f6" }}
              onClick={() => setLightColor("#3b82f6")}
              disabled={!lights || !isConnected}
            />
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
              style={{ backgroundColor: "#22c55e" }}
              onClick={() => setLightColor("#22c55e")}
              disabled={!lights || !isConnected}
            />
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
              style={{ backgroundColor: "#eab308" }}
              onClick={() => setLightColor("#eab308")}
              disabled={!lights || !isConnected}
            />
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
              style={{ backgroundColor: "#a855f7" }}
              onClick={() => setLightColor("#a855f7")}
              disabled={!lights || !isConnected}
            />
          </div>
          <Button variant="default" size="sm" disabled={!lights || applyingSettings || !isConnected} onClick={applyLightSettings}>
            {applyingSettings ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Applying...
              </span>
            ) : (
              "Apply Settings"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

