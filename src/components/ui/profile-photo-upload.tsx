
import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { User, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfilePhotoUploadProps {
  onImageUpload: (imageUrl: string | null) => void;
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
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG or GIF)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile photo should be less than 2MB",
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
        accept="image/jpeg, image/png, image/gif"
        className="sr-only"
        aria-label="Upload profile photo"
      />
      
      {previewUrl ? (
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-gray-200">
            <AvatarImage src={previewUrl} alt="Profile" />
            <AvatarFallback>
              <User className="w-8 h-8 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            aria-label="Remove photo"
          >
            <div className="text-red-500 rounded-full bg-white p-0.5">✕</div>
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Camera size={32} className="text-gray-400" />
        </div>
      )}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? "Change Photo" : "Upload Photo"}
      </Button>
    </div>
  );
};

export default ProfilePhotoUpload;
