// Utility functions for API requests with authentication

/**
 * Get the authentication headers for API requests
 * @returns Headers object with Authorization header if token exists
 */
export const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Only run in browser environment
  if (typeof window !== "undefined") {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  return headers;
};

/**
 * Make an authenticated API request
 * @param url The API endpoint URL
 * @param options Request options
 * @returns Response from the API
 */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const authHeaders = getAuthHeaders();

  // Merge the auth headers with any existing headers
  const headers = {
    ...authHeaders,
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
