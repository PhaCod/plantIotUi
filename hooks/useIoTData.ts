import { useState, useEffect } from 'react';
import { iotApi, FeedType, FeedData } from '@/lib/api';

interface IoTDataState {
  temp: string;
  humidity: string;
  moisture: string;
  light: string;
}

interface UseIoTDataReturn {
  data: IoTDataState;
  isConnected: boolean;
  error: Error | null;
  sendData: (feed: FeedType, value: string) => Promise<void>;
}

const initialState: IoTDataState = {
  temp: '',
  humidity: '',
  moisture: '',
  light: '',
};

export function useIoTData(): UseIoTDataReturn {
  const [data, setData] = useState<IoTDataState>(initialState);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    iotApi.checkHealth()
      .then(() => setIsConnected(true))
      .catch((err) => setError(err));

    iotApi.subscribeToStream(
      (newData: FeedData) => {
        setData((prevData) => ({
          ...prevData,
          [newData.type]: newData.value,
        }));
      },
      (err: Event) => {
        setIsConnected(false);
        setError(new Error('Connection lost'));
      }
    );

    return () => {
      iotApi.unsubscribeFromStream();
    };
  }, []);

  const sendData = async (feed: FeedType, value: string) => {
    try {
      await iotApi.postFeedData(feed, value);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send data'));
      throw err;
    }
  };

  return {
    data,
    isConnected,
    error,
    sendData,
  };
} 