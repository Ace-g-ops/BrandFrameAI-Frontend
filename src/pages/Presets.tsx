import { useState, useEffect } from "react";
import { Settings2, Plus, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api, Preset } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const categoryIcons: Record<string, string> = {
  artistic: "🎨",
  nature: "🏔️",
  portrait: "👤",
  architecture: "🏛️",
  scifi: "🚀",
};

const Presets = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPresets();
      setPresets(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map((p) => p.category))];
      setCategories(uniqueCategories);
      if (uniqueCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(uniqueCategories[0]);
      }
    } catch (err) {
      toast.error("Failed to load presets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (preset: Preset) => {
    // Store preset in sessionStorage and navigate to generate page
    sessionStorage.setItem("selectedPreset", JSON.stringify(preset));
    toast.success(`Preset "${preset.name}" applied`);
    navigate("/generate");
  };

  const filteredPresets = presets.filter((p) => p.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

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

      {presets.length > 0 ? (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-4 space-y-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all capitalize",
                    selectedCategory === category
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <span>{categoryIcons[category] || "📁"}</span>
                  <span className="font-medium text-sm">{category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Presets Grid */}
          <div className="lg:col-span-3">
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredPresets.map((preset) => (
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
                      onClick={() => handleApplyPreset(preset)}
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
          </div>
        </div>
      ) : (
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
  );
};

export default Presets;