"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}

export function useProtectedApi() {
  const { session } = useAuth();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (!session?.accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (response.status === 401) {
      // Handle unauthorized access
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    return response;
  };

  return { fetchWithAuth };
} 