import { JWTManager } from "./jwtUtils";

class ApiClient {
  baseURL: string = "http://localhost:3000";

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = JWTManager.getToken();

    // Create headers object with proper typing
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add existing headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.entries(options.headers).forEach(([key, value]) => {
          headers[key] = value as string;
        });
      }
    }

    // Add authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (response.status === 401) {
        // Token is invalid or expired
        JWTManager.removeToken();
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Authentication failed");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }

  // For file uploads or other content types
  async postFormData(endpoint: string, formData: FormData) {
    const token = JWTManager.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.request(endpoint, {
      method: "POST",
      headers,
      body: formData,
    });
  }
}

export const apiClient = new ApiClient();
