import { useState } from "react";
import { api, GenerateImageParams, GeneratedImage } from "@/lib/api";
import { toast } from "sonner";

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (params: GenerateImageParams) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await api.generateImage(params);
      setGeneratedImage(result);
      toast.success("Image generated successfully!");
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate image";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generate,
    isGenerating,
    generatedImage,
    error,
    clearImage: () => setGeneratedImage(null),
  };
}