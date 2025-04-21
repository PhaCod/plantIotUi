"use client";

import { useState, useEffect } from "react";
import { useProtectedApi } from "./useAuth";

export function useEnvironmentData() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchWithAuth } = useProtectedApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchWithAuth("/api/environment-data");
        const result = await response.json();
        
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.chartData);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchWithAuth]);

  return { data, error, isLoading };
} 