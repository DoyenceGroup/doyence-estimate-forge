
import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Camera, User, X } from "lucide-react";

interface ProfilePhotoUploadProps {
  onImageUpload: (image: string | null) => void;
  initialImage?: string;
  className?: string;
}

const ProfilePhotoUpload = ({ 
  onImageUpload, 
  initialImage, 
  className = "" 
}: ProfilePhotoUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, GIF, or SVG).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
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
      setPreviewUrl(result);
      onImageUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
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
        aria-label="Upload profile photo"
      />
      
      {previewUrl ? (
        <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-200">
          <img
            src={previewUrl}
            alt="Profile photo preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            aria-label="Remove photo"
          >
            <X size={16} className="text-gray-700" />
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center bg-gray-50">
          <User size={32} className="text-gray-400 mb-1" />
          <p className="text-xs text-gray-500 text-center">Profile photo</p>
        </div>
      )}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1"
      >
        <Camera size={16} />
        {previewUrl ? "Change Photo" : "Upload Photo"}
      </Button>
    </div>
  );
};

export default ProfilePhotoUpload;
