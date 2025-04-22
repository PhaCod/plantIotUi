import { io, Socket } from 'socket.io-client';

// Types for IoT data
export type FeedType = "temp" | "humidity" | "moisture" | "light" | "pump" | "fan" | "led";

export interface FeedData {
  topic: any;
  type: FeedType;
  value: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";
const API_FEED_URL = process.env.NEXT_PUBLIC_API_DIRECT;
const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export class IoTApi {
  private static instance: IoTApi;

  private constructor() {}

  public static getInstance(): IoTApi {
    if (!IoTApi.instance) {
      IoTApi.instance = new IoTApi();
    }
    return IoTApi.instance;
  }

  public async checkHealth(): Promise<string> {
    try {
      const response = await fetch(API_BASE_URL);
      return await response.text();
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }

  public async postFeedData(feed: FeedType, value: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/${feed}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({ value }),
      });
      console.log(`Response: ${PUBLIC_API_KEY}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Failed to post data to ${feed}:`, error);
      throw error;
    }
  }
  
  public async getFeedLastData(feed: FeedType): Promise<FeedData> {
    try {
      const response = await fetch(`${API_FEED_URL}/${feed}/data/last`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-AIO-Key": PUBLIC_API_KEY || "",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FeedData = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to get data from ${feed}:`, error);
      throw error;
    }
  }

  public async setThreshold(topic: string, lower: number, upper: number): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ topic, lower, upper }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error("Failed to set threshold:", error);
      throw error;
    }
  }

  public subscribeToStream(
    onData: (data: FeedData) => void,
    onError?: (error: Event) => void
  ): void {
    // Use WebSocket instead of SSE
    socketIoClient.on("message", (data: any) => {
      try {
        const parsed: FeedData = typeof data === "string" ? JSON.parse(data) : data;
        onData(parsed);
        console.log(data);
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    });
  }

  public unsubscribeFromStream(): void {
    socketIoClient.disconnect();
  }
}

export const iotApi = IoTApi.getInstance();

const socket: Socket = io(API_BASE_URL);

export const socketIoClient = {
  on: (event: string, callback: (data: any) => void) => {
    socket.on(event, callback);
  },
  emit: (event: string, data: any) => {
    socket.emit(event, data);
  },
  disconnect: () => {
    socket.disconnect();
  },
};
