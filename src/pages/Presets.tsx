import { useState, useEffect } from "react";
import { Settings2, Plus, Sparkles, Loader2, Edit2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api, Preset } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { PresetForm } from "@/components/PresetForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getErrorMessage, getShotTypeLabel } from "@/lib/api-utils";

const shotTypeIcons: Record<string, string> = {
  lifestyle: "📸",
  hero: "⭐",
  flat_lay: "📐",
  context: "🌍",
  white_background: "⬜",
  portrait: "👤",
  landscape: "🏔️",
  instagram_post: "📱",
  square: "⬛",
  instagram_story: "📲",
};

const Presets = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [shotTypes, setShotTypes] = useState<string[]>([]);
  const [selectedShotType, setSelectedShotType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [deletingPreset, setDeletingPreset] = useState<Preset | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPresets();
      setPresets(data);
      
      // Extract unique shot types
      const uniqueShotTypes = [...new Set(data.map((p) => p.shot_type))];
      setShotTypes(uniqueShotTypes);
      if (uniqueShotTypes.length > 0 && !selectedShotType) {
        setSelectedShotType(uniqueShotTypes[0]);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
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

  const handleCreatePreset = () => {
    setEditingPreset(null);
    setIsFormOpen(true);
  };

  const handleEditPreset = (preset: Preset) => {
    setEditingPreset(preset);
    setIsFormOpen(true);
  };

  const handleDeletePreset = async () => {
    if (!deletingPreset) return;

    try {
      await api.deletePreset(deletingPreset.id);
      toast.success("Preset deleted successfully");
      setDeletingPreset(null);
      fetchPresets();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleFormSuccess = () => {
    fetchPresets();
  };

  const filteredPresets = selectedShotType 
    ? presets.filter((p) => p.shot_type === selectedShotType)
    : presets;

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
        <Button 
          onClick={handleCreatePreset}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Preset
        </Button>
      </div>

      {presets.length > 0 ? (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Shot Type Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-4 space-y-1">
              <button
                onClick={() => setSelectedShotType("")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                  !selectedShotType
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <span>📁</span>
                <span className="font-medium text-sm">All Presets</span>
              </button>
              {shotTypes.map((shotType) => (
                <button
                  key={shotType}
                  onClick={() => setSelectedShotType(shotType)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                    selectedShotType === shotType
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <span>{shotTypeIcons[shotType] || "📁"}</span>
                  <span className="font-medium text-sm">{getShotTypeLabel(shotType)}</span>
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
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApplyPreset(preset)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        Apply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPreset(preset)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingPreset(preset)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {preset.description || 'No description'}
                  </p>
                  <div className="mb-3">
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                      {getShotTypeLabel(preset.shot_type)}
                    </span>
                  </div>
                  {preset.structured_prompt && (
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                      <p className="text-xs text-muted-foreground font-mono line-clamp-2">
                        {JSON.stringify(preset.structured_prompt)}
                      </p>
                    </div>
                  )}
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
          <Button 
            onClick={handleCreatePreset}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Preset
          </Button>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <PresetForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPreset(null);
        }}
        onSuccess={handleFormSuccess}
        preset={editingPreset}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPreset} onOpenChange={() => setDeletingPreset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPreset?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePreset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Presets;