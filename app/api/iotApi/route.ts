import { io, Socket } from 'socket.io-client';
import { getSession } from "next-auth/react";

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
  private userPermissionsCache: any = null;

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
      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken; // Extract access token
      const response = await fetch(`${API_BASE_URL}/devices/${feed}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to Authorization header
        },
        body: JSON.stringify({ value }),
      });
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

  public async getThreshold(feed: FeedType): Promise<{ value: number; bound: string }> {
    try {
      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken; // Extract access token

      if (!token) {
        throw new Error("Access token is missing");
      }

      const response = await fetch(`${API_BASE_URL}/config`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to Authorization header
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract and return the threshold for the specific feed type
      if (data[feed]) {
        return data[feed];
      } else {
        throw new Error(`Threshold data for feed type '${feed}' not found`);
      }
    } catch (error) {
      console.error(`Failed to get threshold for ${feed}:`, error);
      throw error;
    }
  }

  public async setThreshold(topic: string, value: number, bound: string): Promise<string> {
    try {
      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken; // Extract access token

      if (!token) {
        throw new Error("Access token is missing");
      }

      const response = await fetch(`${API_BASE_URL}/config/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to Authorization header
        },
        body: JSON.stringify({ topic, value, bound }),
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

  public async subscribeToChannels(channels: string[]): Promise<string> {
    try {
      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken; // Extract access token

      if (!token) {
        throw new Error("Access token is missing");
      }

      const response = await fetch(`${API_BASE_URL}/subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to Authorization header
        },
        body: JSON.stringify({ channels }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error("Failed to subscribe to channels:", error);
      throw error;
    }
  }

  public async getSubscribedChannels(): Promise<string[]> {
    try {
      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken; // Extract access token

      if (!token) {
        throw new Error("Access token is missing");
      }

      const response = await fetch(`${API_BASE_URL}/subscription`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to Authorization header
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.channels;
    } catch (error) {
      console.error("Failed to get subscribed channels:", error);
      throw error;
    }
  }

  public async getAllUsers(limit: number = 10): Promise<any[]> {
    try {
      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken; // Extract access token

      if (!token) {
        throw new Error("Access token is missing");
      }

      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to Authorization header
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch all users:", error);
      throw error;
    }
  }

  public async getLogs(): Promise<{ content: string; timestamp: string }[]> {
    try {
      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken; // Extract access token

      if (!token) {
        throw new Error("Access token is missing");
      }

      const response = await fetch(`${API_BASE_URL}/logs/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to Authorization header
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.map((log: any) => ({
        content: log.content,
        timestamp: log.timestamp,
      }));
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      throw error;
    }
  }

  public async getUserPermissions(): Promise<any> {
    try {
      // Check if permissions are already cached
      if (this.userPermissionsCache) {
        return this.userPermissionsCache;
      }

      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken; // Extract access token

      if (!token) {
        throw new Error("Access token is missing");
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to Authorization header
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache the permissions in memory
      this.userPermissionsCache = data;

      return data;
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
      throw error;
    }
  }

  public async addPermission(email: string, topics: string[]): Promise<string> {
    try {
      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken; // Extract access token

      if (!token) {
        throw new Error("Access token is missing");
      }

      const response = await fetch(`${API_BASE_URL}/devices/permission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to Authorization header
        },
        body: JSON.stringify({ email, topics }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error("Failed to add permission:", error);
      throw error;
    }
  }

  public async deleteUser(userId: string): Promise<{ message: string } | { error: string }> {
    try {
      const session = await getSession(); // Retrieve session from next-auth
      const token = session?.accessToken; // Extract access token

      if (!token) {
        throw new Error("Access token is missing");
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to Authorization header
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { error: "User not found" };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to delete user:", error);
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