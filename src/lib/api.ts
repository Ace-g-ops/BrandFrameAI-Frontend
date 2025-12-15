import axiosInstance, { handleApiError, createFormData, extractApiData } from './axios';

// API Base URL (for reference, axios instance handles this)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://brandframeai.fly.dev/api";

// ==================== Type Definitions ====================

export interface GenerateImageParams {
  product_image: File;
  shot_type: 'lifestyle' | 'hero' | 'flat_lay' | 'context' | 'white_background';
  product_description?: string;
}

export interface GeneratedImage {
  id: number;
  user_id: number;
  brand_preset_id: number | null;
  product_image_path: string;
  user_intent: string;
  structured_prompt: Record<string, any>;
  generated_image_url: string;
  shot_type: string;
  angle: string;
  style: string;
  bria_request_id: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Frontend convenience fields (mapped from backend)
  url?: string; // mapped from generated_image_url
  prompt?: string; // mapped from user_intent
}

export interface Preset {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  shot_type: string;
  structured_prompt: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Frontend convenience fields
  prompt?: string; // stringified structured_prompt
  category?: string; // derived from shot_type if needed
}

export interface CreatePresetParams {
  name: string;
  description?: string;
  shot_type: 'lifestyle' | 'hero' | 'flat_lay' | 'context' | 'white_background' | 'portrait' | 'landscape' | 'instagram_post' | 'square' | 'instagram_story';
  structured_prompt: Record<string, any>;
}

export interface UpdatePresetParams {
  name?: string;
  description?: string;
  structured_prompt?: Record<string, any>;
}

export interface ApplyPresetParams {
  preset_id: number;
  product_image: File;
  product_description?: string;
}

export interface BatchGenerateParams {
  preset_id: number;
  product_images: File[];
  product_descriptions?: string[];
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

// ==================== API Service Class ====================

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Token management
  getToken(): string | null {
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

  // Helper to map backend response to frontend format
  private mapGeneratedImage(data: any): GeneratedImage {
    return {
      ...data,
      url: data.generated_image_url,
      prompt: data.user_intent,
    };
  }

  private mapPreset(data: any): Preset {
    return {
      ...data,
      prompt: typeof data.structured_prompt === 'object' 
        ? JSON.stringify(data.structured_prompt) 
        : data.structured_prompt,
    };
  }

  // ==================== Authentication ====================
  
  async register(name: string, email: string, password: string, password_confirmation: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>("/register", {
        name,
        email,
        password,
        password_confirmation,
      });
      
      const data = extractApiData<AuthResponse>(response.data);
      this.setToken(data.token);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>("/login", {
        email,
        password,
      });
      
      const data = extractApiData<AuthResponse>(response.data);
      this.setToken(data.token);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      await axiosInstance.post("/logout");
      this.clearToken();
    } catch (error) {
      // Clear token even if request fails
      this.clearToken();
      throw new Error(handleApiError(error));
    }
  }

  async getUser(): Promise<User> {
    try {
      const response = await axiosInstance.get<User>("/user");
      return extractApiData<User>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Image Upload ====================
  
  async uploadProduct(productImage: File): Promise<{ message: string; path: string; url: string }> {
    try {
      const formData = createFormData({ product_image: productImage });
      const response = await axiosInstance.post("/upload-product", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return extractApiData(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Image Generation ====================
  
  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    try {
      const formData = createFormData({
        product_image: params.product_image,
        shot_type: params.shot_type,
        product_description: params.product_description || '',
      });

      const response = await axiosInstance.post("/generate", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Backend returns: { message, data: GeneratedImage, image_url }
      const responseData = response.data as { data?: GeneratedImage; image_url?: string; [key: string]: any };
      const imageData = responseData.data || responseData;
      return this.mapGeneratedImage(imageData);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Gallery (Generations) ====================
  
  async getImages(search?: string): Promise<GeneratedImage[]> {
    try {
      const params = search ? { search } : {};
      const response = await axiosInstance.get<GeneratedImage[]>("/generations", { params });
      const data = extractApiData<GeneratedImage[]>(response.data);
      return Array.isArray(data) ? data.map(img => this.mapGeneratedImage(img)) : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getImage(id: number): Promise<GeneratedImage> {
    try {
      const response = await axiosInstance.get<GeneratedImage>(`/generation/${id}`);
      const data = extractApiData<GeneratedImage>(response.data);
      return this.mapGeneratedImage(data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteImage(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/generation/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Brand Presets ====================
  
  async getPresets(): Promise<Preset[]> {
    try {
      const response = await axiosInstance.get<{ message?: string; data: Preset[] }>("/presets");
      // Backend returns: { message: "...", data: [...] }
      // Axios response.data is the actual response body
      const responseData = response.data as { message?: string; data: Preset[] } | Preset[];
      const data = extractApiData<Preset[]>(responseData);
      return Array.isArray(data) ? data.map(preset => this.mapPreset(preset)) : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPreset(id: number): Promise<Preset> {
    try {
      const response = await axiosInstance.get<Preset>(`/presets/${id}`);
      const data = extractApiData<Preset>(response.data);
      return this.mapPreset(data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createPreset(preset: CreatePresetParams): Promise<Preset> {
    try {
      const response = await axiosInstance.post<{ data: Preset } | Preset>("/presets", preset);
      const data = extractApiData<Preset>(response.data);
      return this.mapPreset(data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updatePreset(id: number, preset: UpdatePresetParams): Promise<Preset> {
    try {
      const response = await axiosInstance.put<{ data: Preset } | Preset>(`/presets/${id}`, preset);
      const data = extractApiData<Preset>(response.data);
      return this.mapPreset(data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deletePreset(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/presets/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async applyPreset(params: ApplyPresetParams): Promise<GeneratedImage> {
    try {
      // Backend expects preset_id in FormData body (route has {id} but controller doesn't use it)
      const formData = new FormData();
      formData.append('preset_id', params.preset_id.toString());
      formData.append('product_image', params.product_image);
      if (params.product_description) {
        formData.append('product_description', params.product_description);
      }

      const response = await axiosInstance.post(`/presets/${params.preset_id}/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Backend returns: { message, data: GeneratedImage, image_url }
      const responseData = response.data as { data?: GeneratedImage; image_url?: string; [key: string]: any };
      const imageData = responseData.data || responseData;
      return this.mapGeneratedImage(imageData);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Batch Processing ====================
  
  async batchGenerate(params: BatchGenerateParams): Promise<{ message: string; total_images: number; status: string }> {
    try {
      const formData = createFormData({
        preset_id: params.preset_id,
        product_images: params.product_images,
        product_descriptions: params.product_descriptions || [],
      });

      const response = await axiosInstance.post("/batch-generate", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return extractApiData(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const api = new ApiService(API_BASE_URL);

