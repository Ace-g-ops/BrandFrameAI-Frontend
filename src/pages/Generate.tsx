import { useState } from "react";
import { Sparkles, Wand2, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Generate = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState({
    aspectRatio: "1:1",
    steps: 30,
    guidance: 7.5,
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    setIsGenerating(true);
    // Simulate generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    toast.success("Image generated successfully!");
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Generate</h1>
        <p className="text-muted-foreground">Transform your ideas into stunning images with AI</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Prompt Input */}
          <div className="glass rounded-xl p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              Prompt
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A serene mountain landscape at sunset, with golden light filtering through misty peaks..."
              className="min-h-[150px] bg-secondary/50 border-border/50 resize-none focus:ring-primary/50"
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-muted-foreground">
                {prompt.length} characters
              </span>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="glass rounded-xl p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
              <Settings className="w-4 h-4 text-primary" />
              Settings
            </label>

            <div className="space-y-6">
              {/* Aspect Ratio */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Aspect Ratio</label>
                <Select
                  value={settings.aspectRatio}
                  onValueChange={(value) => setSettings({ ...settings, aspectRatio: value })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">1:1 Square</SelectItem>
                    <SelectItem value="16:9">16:9 Landscape</SelectItem>
                    <SelectItem value="9:16">9:16 Portrait</SelectItem>
                    <SelectItem value="4:3">4:3 Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Steps */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-muted-foreground">Steps</label>
                  <span className="text-sm text-foreground">{settings.steps}</span>
                </div>
                <Slider
                  value={[settings.steps]}
                  onValueChange={([value]) => setSettings({ ...settings, steps: value })}
                  min={10}
                  max={50}
                  step={1}
                  className="[&_[role=slider]]:bg-primary"
                />
              </div>

              {/* Guidance Scale */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-muted-foreground">Guidance Scale</label>
                  <span className="text-sm text-foreground">{settings.guidance}</span>
                </div>
                <Slider
                  value={[settings.guidance]}
                  onValueChange={([value]) => setSettings({ ...settings, guidance: value })}
                  min={1}
                  max={20}
                  step={0.5}
                  className="[&_[role=slider]]:bg-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="glass rounded-xl p-6 flex flex-col">
          <label className="text-sm font-medium text-foreground mb-4">Preview</label>
          <div className="flex-1 min-h-[400px] rounded-lg bg-secondary/30 border border-border/30 flex items-center justify-center">
            {isGenerating ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">Creating your masterpiece...</p>
              </div>
            ) : (
              <div className="text-center px-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Wand2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Your generated image will appear here</p>
                <p className="text-sm text-muted-foreground/60 mt-2">Enter a prompt and click generate to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;