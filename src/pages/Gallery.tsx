import { useState, useEffect } from "react";
import { Images, Download, Trash2, ZoomIn, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { api, GeneratedImage } from "@/lib/api";
import { toast } from "sonner";

const Gallery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async (search?: string) => {
    setIsLoading(true);
    try {
      const data = await api.getImages(search);
      setImages(data);
    } catch (err) {
      toast.error("Failed to load gallery");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Debounce search
    const timer = setTimeout(() => fetchImages(value), 300);
    return () => clearTimeout(timer);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Image deleted");
    } catch (err) {
      toast.error("Failed to delete image");
    }
  };

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
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by prompt..."
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Dialog key={image.id}>
              <div className="group glass rounded-xl overflow-hidden">
                {/* Image */}
                <DialogTrigger asChild>
                  <div className="aspect-square cursor-pointer relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
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
                    <span className="text-xs text-muted-foreground">
                      {new Date(image.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <a href={image.url} download>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal */}
              <DialogContent className="max-w-3xl glass border-border/50">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full rounded-lg"
                />
                <div className="mt-4">
                  <p className="text-foreground mb-2">{image.prompt}</p>
                  <p className="text-sm text-muted-foreground">
                    Generated on {new Date(image.created_at).toLocaleDateString()}
                  </p>
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