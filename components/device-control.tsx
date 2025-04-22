"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Droplet,
  Fan,
  Lightbulb,
  Palette,
  CheckCircle,
  WifiOff,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { toast } from "@/components/ui/use-toast";
import { iotApi } from "@/app/api/iotApi/route";

export default function DeviceControl() {
  const [waterPump, setWaterPump] = useState(false);
  const [fan, setFan] = useState(false);
  const [lights, setLights] = useState(0);
  const [lightColor, setLightColor] = useState("#ffffff");
  const [lightIntensity, setLightIntensity] = useState(70);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Loading states
  const [waterPumpLoading, setWaterPumpLoading] = useState(false);
  const [fanLoading, setFanLoading] = useState(false);
  const [lightsLoading, setLightsLoading] = useState(false);
  const [applyingSettings, setApplyingSettings] = useState(false);

  // Success states
  const [waterPumpSuccess, setWaterPumpSuccess] = useState(false);
  const [fanSuccess, setFanSuccess] = useState(false);
  const [lightsSuccess, setLightsSuccess] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userData = await iotApi.getUserPermissions();
        setPermissions(userData.permissions || []);
      } catch (error) {
        console.error("Failed to fetch user permissions:", error);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (device: string) => permissions.includes(device);

  useEffect(() => {
    let connectionTimeout: NodeJS.Timeout = setTimeout(() => { }, 0);

    const resetConnection = () => {
      // setIsConnected(false)
      setWaterPump(false);
      setFan(false);
      setLights(0);
    };

    const setupConnection = () => {
      // Reset connection state
      resetConnection();
      setIsConnected(true);
      iotApi
        .getFeedLastData("fan")
        .then((data) => {
          setFan(data.value === "1");
          console.log("Fan pump data:", data.value);
        })
        .catch(() => {
          resetConnection();
        });
      iotApi
        .getFeedLastData("pump")
        .then((data) => {
          setWaterPump(data.value === "1");
          console.log("Water pump data:", data.value);
        })
        .catch(() => {
          resetConnection();
        });
      iotApi
        .getFeedLastData("led")
        .then((data) => {
          setLights(parseInt(data.value, 10));
          console.log("LED data:", data.value);
        })
        .catch(() => {
          resetConnection();
        });

      // // Set a timeout to check if we receive any data
      // connectionTimeout = setTimeout(() => {
      //   if (!isConnected) {
      //     resetConnection()
      //     toast({
      //       title: "Connection Error",
      //       description: "Unable to connect to IoT devices. Please check your connection.",
      //       variant: "destructive",
      //     })
      //   }
      // }, 5000) // Wait 5 seconds for initial data
    };

    setupConnection();

    return () => {
      clearTimeout(connectionTimeout);
      iotApi.unsubscribeFromStream();
    };
  }, []);

  const handleWaterPumpToggle = async () => {
    setWaterPumpLoading(true);
    setWaterPumpSuccess(false);

    try {
      await iotApi.postFeedData("pump", !waterPump ? "1" : "0");

      setWaterPump(!waterPump);
      setWaterPumpSuccess(true);

      toast({
        title: "Water Pump Control",
        description: !waterPump
          ? "Water pump activated successfully"
          : "Water pump deactivated successfully",
      });

      setTimeout(() => {
        setWaterPumpSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error controlling water pump:", error);
      toast({
        title: "Error",
        description: "Failed to control water pump. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWaterPumpLoading(false);
    }
  };

  const handleFanToggle = async () => {
    setFanLoading(true);
    setFanSuccess(false);

    try {
      await iotApi.postFeedData("fan", !fan ? "1" : "0");

      setFan(!fan);
      setFanSuccess(true);

      toast({
        title: "Ventilation Fan Control",
        description: !fan
          ? "Fan activated successfully"
          : "Fan deactivated successfully",
      });

      setTimeout(() => {
        setFanSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error controlling fan:", error);
      toast({
        title: "Error",
        description: "Failed to control fan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFanLoading(false);
    }
  };

  const updateLED = async (value: number) => {
    if (value < 0 || value > 8) {
      console.error("Invalid LED value. Must be between 0 and 8.");
      return;
    }

    setLightsLoading(true);
    setLightsSuccess(false);

    try {
      await iotApi.postFeedData("led", value.toString());

      setLights(value);
      setLightsSuccess(true);

      toast({
        title: "RGB LED Lights Control",
        description: `LED updated to value ${value} successfully`,
      });

      setTimeout(() => {
        setLightsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating LED:", error);
      toast({
        title: "Error",
        description: "Failed to update LED. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLightsLoading(false);
    }
  };

  const handleLightIntensityChange = (value: number) => {
    setLightIntensity(value);
  };

  const applyLightSettings = async () => {
    if (!lights) return;

    setApplyingSettings(true);

    try {
      await iotApi.postFeedData("light", lightIntensity.toString());

      toast({
        title: "RGB LED Lights Settings",
        description: "Light settings applied successfully",
      });
    } catch (error) {
      console.error("Error applying light settings:", error);
      toast({
        title: "Error",
        description: "Failed to apply light settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplyingSettings(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className={!isConnected || !hasPermission("pump") ? "opacity-50 pointer-events-none" : ""}>
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
            <Droplet
              size={40}
              className={waterPump ? "text-blue-500" : "text-gray-400"}
            />
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
              disabled={waterPumpLoading || !isConnected || !hasPermission("pump")}
            />
            <div className="grid gap-1.5">
              <label
                htmlFor="water-pump"
                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {waterPump ? "Active" : "Inactive"}
                {waterPumpLoading && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (Connecting...)
                  </span>
                )}
                {!isConnected && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (Offline)
                  </span>
                )}
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
            disabled={waterPumpLoading || waterPump || !isConnected || !hasPermission("pump")}
          >
            {waterPumpLoading && !waterPump ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
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
            disabled={waterPumpLoading || !waterPump || !isConnected || !hasPermission("pump")}
          >
            {waterPumpLoading && waterPump ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
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

      <Card className={!isConnected || !hasPermission("fan") ? "opacity-50 pointer-events-none" : ""}>
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
            <Switch
              id="fan"
              checked={fan}
              onCheckedChange={handleFanToggle}
              disabled={fanLoading || !isConnected}
            />
            <div className="grid gap-1.5">
              <label
                htmlFor="fan"
                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {fan ? "Active" : "Inactive"}
                {fanLoading && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (Connecting...)
                  </span>
                )}
                {!isConnected && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (Offline)
                  </span>
                )}
              </label>
              <p className="text-sm text-muted-foreground">
                {fan ? "Fan is running" : "Fan is off"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFanToggle()}
            disabled={fanLoading || fan || !isConnected}
          >
            {fanLoading && !fan ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
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
            onClick={() => handleFanToggle()}
            disabled={fanLoading || !fan || !isConnected}
          >
            {fanLoading && fan ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
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

      <Card className={!isConnected || !hasPermission("led") ? "opacity-50 pointer-events-none" : ""}>
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
                  backgroundColor: lights !== 0 ? lightColor : "#f3f4f6",
                  borderColor: (lights !== 0 && lights !== 1) ? lightColor : "#e5e7eb",
                }}
              >
                {lights == 0 ? (
                  <span className="text-gray-400">OFF</span>
                ) : (
                  <Lightbulb
                    size={48}
                    className={lights !== 1 ? "text-white" : "text-gray-400"}
                  />
                )}
                {lightsSuccess && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
              </div>

              <div className="space-y-2">

                <div className="grid grid-cols-3 gap-2 mt-4">
                  {["#000000", "#FFFFFF", "#FF0000", "#FFA500", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#800080"].map((color, index) => {
                    const colorNames = [
                      "Off",
                      "White",
                      "Red",
                      "Orange",
                      "Yellow",
                      "Green",
                      "Blue",
                      "Dark Purple",
                      "Light Purple",
                    ];
                    return (
                      <div key={color} className="flex flex-col items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`w-8 h-8 p-0 ${lights === index ? 'border-2 border-blue-500' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setLightColor(color);
                            updateLED(index);
                          }}
                          disabled={!isConnected}
                        />
                        <span className="text-xs mt-1">{`${colorNames[index]}`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">


        </CardFooter>
      </Card>
    </div>
  );
}
