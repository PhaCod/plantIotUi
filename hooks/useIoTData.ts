import { useState, useEffect } from 'react';
import { iotApi, FeedType, FeedData } from '@/lib/api';
import { io } from 'socket.io-client';

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

const socket = io('http://127.0.0.1:5000'); 

export function useIoTData(): UseIoTDataReturn {
  const [data, setData] = useState<IoTDataState>(initialState);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setError(new Error('Disconnected from server'));
      console.log('Disconnected from server');
    });

    socket.on('message', (message: FeedData) => {
      setData((prevData) => ({
        ...prevData,
        [message.type]: message.value,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendData = async (feed: FeedType, value: string) => {
    try {
      socket.emit('message', { type: feed, value });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send data'));
      throw err;
    }
  };

  return { data, isConnected, error, sendData };
}