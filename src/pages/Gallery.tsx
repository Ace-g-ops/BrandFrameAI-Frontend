import { useState } from "react";
import { Images, Download, Trash2, ZoomIn, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Placeholder data for gallery
const placeholderImages = [
  { id: 1, prompt: "A mystical forest with bioluminescent plants", date: "2024-01-15" },
  { id: 2, prompt: "Cyberpunk city at night with neon signs", date: "2024-01-14" },
  { id: 3, prompt: "Abstract fluid art in vibrant colors", date: "2024-01-13" },
  { id: 4, prompt: "Serene Japanese garden in autumn", date: "2024-01-12" },
  { id: 5, prompt: "Futuristic spaceship interior design", date: "2024-01-11" },
  { id: 6, prompt: "Underwater coral reef with exotic fish", date: "2024-01-10" },
];

const Gallery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredImages = placeholderImages.filter((img) =>
    img.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gallery</h1>
          <p className="text-muted-foreground">Browse your generated masterpieces</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by prompt..."
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <Dialog key={image.id}>
              <div className="group glass rounded-xl overflow-hidden">
                {/* Image Placeholder */}
                <DialogTrigger asChild>
                  <div className="aspect-square bg-gradient-to-br from-secondary to-muted cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Images className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </DialogTrigger>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm text-foreground line-clamp-2 mb-2">{image.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{image.date}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal */}
              <DialogContent className="max-w-3xl glass border-border/50">
                <div className="aspect-square bg-gradient-to-br from-secondary to-muted rounded-lg flex items-center justify-center">
                  <Images className="w-24 h-24 text-muted-foreground/30" />
                </div>
                <div className="mt-4">
                  <p className="text-foreground mb-2">{image.prompt}</p>
                  <p className="text-sm text-muted-foreground">Generated on {image.date}</p>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Images className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No images found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try a different search term" : "Start generating to build your gallery"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Gallery;