// Configure your Laravel API base URL here
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export interface GenerateImageParams {
  prompt: string;
  aspect_ratio?: string;
  steps?: number;
  guidance?: number;
  preset_id?: number | null;
}

export interface GeneratedImage {
  id: number;
  url: string;
  prompt: string;
  created_at: string;
  settings?: {
    aspect_ratio: string;
    steps: number;
    guidance: number;
  };
}

export interface Preset {
  id: number;
  name: string;
  description: string;
  prompt: string;
  category: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  clearToken(): void {
    localStorage.removeItem("auth_token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async register(name: string, email: string, password: string, password_confirmation: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, password_confirmation }),
    }, false);
    this.setToken(response.token);
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false);
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request("/logout", { method: "POST" });
    this.clearToken();
  }

  async getUser(): Promise<User> {
    return this.request<User>("/user");
  }

  // Image Upload
  async uploadProduct(formData: FormData): Promise<unknown> {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}/upload-product`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  // Image Generation
  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    return this.request<GeneratedImage>("/generate", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Gallery (generations)
  async getImages(search?: string): Promise<GeneratedImage[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.request<GeneratedImage[]>(`/generations${query}`);
  }

  async getImage(id: number): Promise<GeneratedImage> {
    return this.request<GeneratedImage>(`/generation/${id}`);
  }

  async deleteImage(id: number): Promise<void> {
    return this.request(`/generation/${id}`, {
      method: "DELETE",
    });
  }

  // Presets
  async getPresets(): Promise<Preset[]> {
    return this.request<Preset[]>("/presets");
  }

  async getPreset(id: number): Promise<Preset> {
    return this.request<Preset>(`/presets/${id}`);
  }

  async createPreset(preset: Omit<Preset, "id">): Promise<Preset> {
    return this.request<Preset>("/presets", {
      method: "POST",
      body: JSON.stringify(preset),
    });
  }

  async updatePreset(id: number, preset: Partial<Omit<Preset, "id">>): Promise<Preset> {
    return this.request<Preset>(`/presets/${id}`, {
      method: "PUT",
      body: JSON.stringify(preset),
    });
  }

  async deletePreset(id: number): Promise<void> {
    return this.request(`/presets/${id}`, {
      method: "DELETE",
    });
  }

  async applyPreset(id: number): Promise<GeneratedImage> {
    return this.request<GeneratedImage>(`/presets/${id}/apply`, {
      method: "POST",
    });
  }

  // Batch Processing
  async batchGenerate(params: unknown): Promise<unknown> {
    return this.request("/batch-generate", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}

export const api = new ApiService(API_BASE_URL);
