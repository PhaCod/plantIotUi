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
import { iotApi, FeedType } from "@/lib/api";

export default function DeviceControl() {
  const [waterPump, setWaterPump] = useState(false);
  const [fan, setFan] = useState(false);
  const [lights, setLights] = useState(false);
  const [lightColor, setLightColor] = useState("#22c55e");
  const [lightIntensity, setLightIntensity] = useState(70);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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
    let connectionTimeout: NodeJS.Timeout = setTimeout(() => { }, 0);

    const resetConnection = () => {
      // setIsConnected(false)
      setWaterPump(false);
      setFan(false);
      setLights(false);
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

  const handleLEDToggle = async () => {
    setLightsLoading(true);
    setLightsSuccess(false);

    try {
      await iotApi.postFeedData("led", !lights ? "1" : "0");

      setLights(!lights);
      setLightsSuccess(true);

      toast({
        title: "RGB LED Lights Control",
        description: !lights
          ? "Lights turned on successfully"
          : "Lights turned off successfully",
      });

      setTimeout(() => {
        setLightsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error controlling lights:", error);
      toast({
        title: "Error",
        description: "Failed to control lights. Please try again.",
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
      <Card>
        <CardHeader>
          <CardTitle>Temperature Thresholds 🌡️</CardTitle>
          <CardDescription>Set min and max temperature values</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input type="number" placeholder="Min" className="w-full" />
            <Input type="number" placeholder="Max" className="w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default">Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Humidity Thresholds 💧</CardTitle>
          <CardDescription>Set min and max humidity values</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input type="number" placeholder="Min" className="w-full" />
            <Input type="number" placeholder="Max" className="w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default">Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Soil Moisture Thresholds 🌱</CardTitle>
          <CardDescription>Set min and max soil moisture values</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input type="number" placeholder="Min" className="w-full" />
            <Input type="number" placeholder="Max" className="w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default">Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Light Thresholds 💡</CardTitle>
          <CardDescription>Set min and max light values</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input type="number" placeholder="Min" className="w-full" />
            <Input type="number" placeholder="Max" className="w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default">Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
