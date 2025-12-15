import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api, CreatePresetParams, UpdatePresetParams, Preset } from "@/lib/api";
import { getErrorMessage } from "@/lib/api-utils";

interface PresetFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preset?: Preset | null; // If provided, we're editing
}

const shotTypes = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'hero', label: 'Hero' },
  { value: 'flat_lay', label: 'Flat Lay' },
  { value: 'context', label: 'Context' },
  { value: 'white_background', label: 'White Background' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'instagram_post', label: 'Instagram Post' },
  { value: 'square', label: 'Square' },
  { value: 'instagram_story', label: 'Instagram Story' },
];

export function PresetForm({ open, onClose, onSuccess, preset }: PresetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shot_type: 'lifestyle' as CreatePresetParams['shot_type'],
    structured_prompt: {
      style: '',
      angle: '',
      lighting: '',
      composition: '',
      mood: '',
    },
  });

  useEffect(() => {
    if (preset) {
      // Editing mode - populate form
      setFormData({
        name: preset.name,
        description: preset.description || '',
        shot_type: preset.shot_type as CreatePresetParams['shot_type'],
        structured_prompt: {
          style: preset.structured_prompt?.style || '',
          angle: preset.structured_prompt?.angle || '',
          lighting: preset.structured_prompt?.lighting || '',
          composition: preset.structured_prompt?.composition || '',
          mood: preset.structured_prompt?.mood || '',
        },
      });
    } else {
      // Create mode - reset form
      setFormData({
        name: '',
        description: '',
        shot_type: 'lifestyle',
        structured_prompt: {
          style: '',
          angle: '',
          lighting: '',
          composition: '',
          mood: '',
        },
      });
    }
  }, [preset, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    if (!formData.shot_type) {
      toast.error("Please select a shot type");
      return;
    }

    // Validate structured_prompt has at least some fields
    const hasPromptFields = Object.values(formData.structured_prompt).some(v => v.trim());
    if (!hasPromptFields) {
      toast.error("Please fill in at least one structured prompt field");
      return;
    }

    setIsSubmitting(true);
    try {
      if (preset) {
        // Update existing preset
        const updateData: UpdatePresetParams = {
          name: formData.name,
          description: formData.description || undefined,
          structured_prompt: formData.structured_prompt,
        };
        await api.updatePreset(preset.id, updateData);
        toast.success("Preset updated successfully");
      } else {
        // Create new preset
        const createData: CreatePresetParams = {
          name: formData.name,
          description: formData.description || undefined,
          shot_type: formData.shot_type,
          structured_prompt: formData.structured_prompt,
        };
        await api.createPreset(createData);
        toast.success("Preset created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStructuredPrompt = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      structured_prompt: {
        ...prev.structured_prompt,
        [field]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass border-border/50">
        <DialogHeader>
          <DialogTitle>{preset ? 'Edit Preset' : 'Create New Preset'}</DialogTitle>
          <DialogDescription>
            {preset 
              ? 'Update your brand preset settings'
              : 'Create a reusable brand preset with custom styling parameters'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Preset Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Luxury Product Shot"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of this preset"
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="shot_type">Shot Type *</Label>
              <Select
                value={formData.shot_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, shot_type: value as CreatePresetParams['shot_type'] }))}
                disabled={!!preset} // Can't change shot type when editing
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select shot type" />
                </SelectTrigger>
                <SelectContent>
                  {shotTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preset && (
                <p className="text-xs text-muted-foreground mt-1">
                  Shot type cannot be changed when editing
                </p>
              )}
            </div>
          </div>

          {/* Structured Prompt */}
          <div className="space-y-4">
            <div>
              <Label>Structured Prompt Settings</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Define the styling parameters for this preset
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="style">Style</Label>
                <Input
                  id="style"
                  value={formData.structured_prompt.style}
                  onChange={(e) => updateStructuredPrompt('style', e.target.value)}
                  placeholder="e.g., professional, minimalist, premium"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="angle">Camera Angle</Label>
                <Input
                  id="angle"
                  value={formData.structured_prompt.angle}
                  onChange={(e) => updateStructuredPrompt('angle', e.target.value)}
                  placeholder="e.g., 4 degree angle, top-down, eye-level"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="lighting">Lighting</Label>
                <Input
                  id="lighting"
                  value={formData.structured_prompt.lighting}
                  onChange={(e) => updateStructuredPrompt('lighting', e.target.value)}
                  placeholder="e.g., soft natural light, studio lighting"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="composition">Composition</Label>
                <Input
                  id="composition"
                  value={formData.structured_prompt.composition}
                  onChange={(e) => updateStructuredPrompt('composition', e.target.value)}
                  placeholder="e.g., rule of thirds, centered, fill frame"
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="mood">Mood & Atmosphere</Label>
                <Input
                  id="mood"
                  value={formData.structured_prompt.mood}
                  onChange={(e) => updateStructuredPrompt('mood', e.target.value)}
                  placeholder="e.g., casual, authentic, elegant, sophisticated"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {preset ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                preset ? 'Update Preset' : 'Create Preset'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

