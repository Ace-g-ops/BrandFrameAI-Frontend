import { useState } from "react";
import { Settings2, Plus, Sparkles, Palette, Mountain, User, Building, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const presetCategories = [
  {
    id: "artistic",
    name: "Artistic Styles",
    icon: Palette,
    presets: [
      { id: 1, name: "Oil Painting", description: "Rich textures and classic brush strokes", prompt: "in the style of classical oil painting, rich colors, visible brushstrokes" },
      { id: 2, name: "Watercolor", description: "Soft, flowing watercolor aesthetics", prompt: "watercolor style, soft edges, flowing colors, paper texture" },
      { id: 3, name: "Digital Art", description: "Clean, modern digital illustration", prompt: "digital art, clean lines, vibrant colors, modern illustration style" },
    ],
  },
  {
    id: "nature",
    name: "Nature & Landscapes",
    icon: Mountain,
    presets: [
      { id: 4, name: "Cinematic Landscape", description: "Epic wide-angle nature shots", prompt: "cinematic landscape photography, golden hour, dramatic lighting, 8k resolution" },
      { id: 5, name: "Macro Nature", description: "Close-up details of nature", prompt: "macro photography, extreme detail, shallow depth of field, nature" },
    ],
  },
  {
    id: "portrait",
    name: "Portraits",
    icon: User,
    presets: [
      { id: 6, name: "Studio Portrait", description: "Professional studio lighting", prompt: "professional studio portrait, soft lighting, neutral background, high detail" },
      { id: 7, name: "Editorial", description: "Magazine-style fashion photography", prompt: "editorial fashion photography, dramatic lighting, high contrast, magazine quality" },
    ],
  },
  {
    id: "architecture",
    name: "Architecture",
    icon: Building,
    presets: [
      { id: 8, name: "Modern Architecture", description: "Clean, contemporary buildings", prompt: "modern architecture photography, clean lines, geometric shapes, minimalist" },
      { id: 9, name: "Interior Design", description: "Stylish interior spaces", prompt: "interior design photography, well-lit, styled space, architectural digest" },
    ],
  },
  {
    id: "scifi",
    name: "Sci-Fi & Fantasy",
    icon: Rocket,
    presets: [
      { id: 10, name: "Cyberpunk", description: "Neon-lit futuristic cityscapes", prompt: "cyberpunk aesthetic, neon lights, rain, futuristic city, blade runner style" },
      { id: 11, name: "Fantasy Epic", description: "Magical worlds and creatures", prompt: "epic fantasy art, magical atmosphere, detailed environment, dramatic lighting" },
    ],
  },
];

const Presets = () => {
  const [selectedCategory, setSelectedCategory] = useState("artistic");

  const handleApplyPreset = (presetName: string) => {
    toast.success(`Preset "${presetName}" applied to your next generation`);
  };

  const currentCategory = presetCategories.find((c) => c.id === selectedCategory);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Presets</h1>
          <p className="text-muted-foreground">Quick-apply styles to enhance your generations</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Create Preset
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass rounded-xl p-4 space-y-1">
            {presetCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                  selectedCategory === category.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <category.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Presets Grid */}
        <div className="lg:col-span-3">
          <div className="grid sm:grid-cols-2 gap-4">
            {currentCategory?.presets.map((preset) => (
              <div
                key={preset.id}
                className="glass rounded-xl p-5 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApplyPreset(preset.name)}
                    className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Apply
                  </Button>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{preset.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{preset.description}</p>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <p className="text-xs text-muted-foreground font-mono line-clamp-2">{preset.prompt}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {currentCategory?.presets.length === 0 && (
            <div className="glass rounded-xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Settings2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No presets yet</h3>
              <p className="text-muted-foreground mb-4">Create your first preset to get started</p>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Preset
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Presets;