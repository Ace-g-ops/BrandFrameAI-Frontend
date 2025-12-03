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

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        // Add CSRF token if needed for Laravel
        // "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || "",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
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

  // Gallery
  async getImages(search?: string): Promise<GeneratedImage[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.request<GeneratedImage[]>(`/images${query}`);
  }

  async deleteImage(id: number): Promise<void> {
    return this.request(`/images/${id}`, {
      method: "DELETE",
    });
  }

  // Presets
  async getPresets(): Promise<Preset[]> {
    return this.request<Preset[]>("/presets");
  }

  async createPreset(preset: Omit<Preset, "id">): Promise<Preset> {
    return this.request<Preset>("/presets", {
      method: "POST",
      body: JSON.stringify(preset),
    });
  }
}

export const api = new ApiService(API_BASE_URL);