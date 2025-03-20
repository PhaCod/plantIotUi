// Types for IoT data
export type FeedType = "temp" | "humidity" | "moisture" | "light";

export interface FeedData {
  type: FeedType;
  value: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

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

  public subscribeToStream(
    onData: (data: FeedData) => void,
    onError?: (error: Event) => void
  ): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(`${API_BASE_URL}/stream`);

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
