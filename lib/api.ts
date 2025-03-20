// Types for IoT data
export type FeedType = "temp" | "humidity" | "moisture" | "light" | "pump" | "fan" | "led";

export interface FeedData {
  type: FeedType;
  value: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";
const API_FEED_URL = process.env.API_DIRECT;
const PUBLIC_API_KEY = process.env.API_KEY;

export class IoTApi {
  private static instance: IoTApi;
  private eventSource: EventSource | null = null;

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
      const response = await fetch(`${API_BASE_URL}/${feed}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AIO-Key": `${PUBLIC_API_KEY}`,
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
      
      const response = await fetch(`https://io.adafruit.com/api/v2/blueonline07/feeds/${feed}/data/last`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-AIO-Key": "aio_AWFu55mvdpc0VTCRlhFD8uZPCJex",
        },
      });
      console.log(`Hello ${PUBLIC_API_KEY}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FeedData = await response.json();
      return data;

      }
    catch (error) {
      console.error(`Failed to get data from ${feed}:`, error);
      throw error;
    }
  }

  public subscribeToStream(
    onData: (data: FeedData) => void,
    onError?: (error: Event) => void
  ): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(`${API_BASE_URL}/stream`);
    console.log("Event source:", this.eventSource);
    this.eventSource.onmessage = (event) => {
      try {
        const data: FeedData = JSON.parse(event.data);
        onData(data);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      if (onError) {
        onError(error);
      }
    };
  }


  public unsubscribeFromStream(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export const iotApi = IoTApi.getInstance();
