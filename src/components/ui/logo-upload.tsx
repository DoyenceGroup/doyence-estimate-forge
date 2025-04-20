
import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Upload, X } from "lucide-react";

interface LogoUploadProps {
  onImageUpload: (image: string | null) => void;
  initialImage?: string;
  className?: string;
}

const LogoUpload = ({ 
  onImageUpload, 
  initialImage, 
  className = "" 
}: LogoUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Log when initialImage prop changes
  useEffect(() => {
    console.log("[LogoUpload] initialImage prop:", initialImage ? 
      `Received (length: ${initialImage.length})` : "Not provided");
    
    if (initialImage !== undefined && initialImage !== previewUrl) {
      console.log("[LogoUpload] Updating previewUrl from initialImage prop");
      setPreviewUrl(initialImage || null);
    }
  }, [initialImage]);

  // Log when previewUrl state changes
  useEffect(() => {
    console.log("[LogoUpload] previewUrl state:", previewUrl ? 
      `Set (length: ${previewUrl.length})` : "Not set");
  }, [previewUrl]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("[LogoUpload] No file selected");
      return;
    }

    console.log("[LogoUpload] File selected:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)}KB`
    });

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      console.error("[LogoUpload] Invalid file type:", file.type);
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, GIF, or SVG).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.error("[LogoUpload] File too large:", `${(file.size / 1024 / 1024).toFixed(2)}MB`);
      toast({
        title: "File too large",
        description: "Image size should be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      console.log("[LogoUpload] File converted to base64:", 
        `Length: ${result.length}, starts with: ${result.substring(0, 20)}...`);
      
      setPreviewUrl(result);
      onImageUpload(result);
    };
    reader.onerror = (error) => {
      console.error("[LogoUpload] Error reading file:", error);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    console.log("[LogoUpload] Removing image");
    setPreviewUrl(null);
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/jpeg, image/png, image/gif, image/svg+xml"
        className="sr-only"
        aria-label="Upload company logo"
      />
      
      {previewUrl ? (
        <div className="relative w-40 h-40 border rounded-lg overflow-hidden">
          <img
            src={previewUrl}
            alt="Company logo preview"
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            aria-label="Remove logo"
          >
            <X size={18} className="text-gray-700" />
          </button>
        </div>
      ) : (
        <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 bg-gray-50">
          <Upload size={32} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 text-center">Upload your company logo</p>
        </div>
      )}
      
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="mt-2"
      >
        {previewUrl ? "Change Logo" : "Upload Logo"}
      </Button>
    </div>
  );
};

export default LogoUpload;
