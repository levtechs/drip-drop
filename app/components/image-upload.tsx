"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { uploadMultipleImages } from "../lib/image-upload";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  listingId?: string;
}

interface PreviewImage {
  id: string;
  url: string;
  isUploading: boolean;
  progress: number;
  error?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  disabled = false,
  listingId,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<PreviewImage[]>(
    images.map((url) => ({ id: url, url, isUploading: false, progress: 100 }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;

      if (remainingSlots <= 0) {
        return;
      }

      const filesToUpload = fileArray.slice(0, remainingSlots);
      const newPreviews: PreviewImage[] = filesToUpload.map((file) => ({
        id: `temp-${file.name}-${Date.now()}`,
        url: URL.createObjectURL(file),
        isUploading: true,
        progress: 0,
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);
      setIsUploading(true);

      try {
        const results = await uploadMultipleImages(
          filesToUpload,
          "listing",
          listingId,
          () => {}
        );

        const successfulUrls = results.map((r) => r.url);
        const newImageUrls = [...images, ...successfulUrls];
        onImagesChange(newImageUrls);

        setPreviews((prev) =>
          prev.map((p) => {
            const isUploaded = newPreviews.some((np) => np.id === p.id);
            if (isUploaded) {
              return { ...p, isUploading: false, progress: 100 };
            }
            return p;
          })
        );
      } catch (error) {
        console.error("Upload failed:", error);
        setPreviews((prev) =>
          prev.map((p) => {
            if (newPreviews.some((np) => np.id === p.id)) {
              return { ...p, isUploading: false, error: "Upload failed" };
            }
            return p;
          })
        );
      } finally {
        setIsUploading(false);
      }
    },
    [images, maxImages, onImagesChange, listingId]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [disabled, isUploading, handleFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      e.target.value = "";
    },
    [handleFiles]
  );

  const removeImage = useCallback(
    (index: number) => {
      const previewToRemove = previews[index];
      const newImages = images.filter((_, i) => i !== index);
      const newPreviews = previews.filter((_, i) => i !== index);
      onImagesChange(newImages);
      setPreviews(newPreviews);
      URL.revokeObjectURL(previewToRemove.url);
    },
    [images, previews, onImagesChange]
  );

  const reorderImages = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= images.length) return;

      const newImages = [...images];
      const [removed] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, removed);
      onImagesChange(newImages);

      const newPreviews = [...previews];
      const [removedPreview] = newPreviews.splice(fromIndex, 1);
      newPreviews.splice(toIndex, 0, removedPreview);
      setPreviews(newPreviews);
    },
    [images, previews, onImagesChange]
  );

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Images ({images.length}/{maxImages})
      </label>

      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
          ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || !canAddMore}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`
              p-3 rounded-full transition-colors
              ${isDragging ? "bg-primary text-white" : "bg-muted text-muted-foreground"}
            `}
          >
            {isUploading ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {canAddMore ? "Drop images here or click to upload" : "Maximum images reached"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, GIF up to 10MB
            </p>
          </div>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {previews.map((preview, index) => (
            <div
              key={preview.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <Image
                src={preview.url}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />

              {preview.isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    {preview.error ? (
                      <p className="text-xs text-red-300 px-2">Failed</p>
                    ) : (
                      <>
                        <svg className="w-5 h-5 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-xs mt-1">{preview.progress}%</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!preview.isUploading && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
              )}

              <div className="absolute top-1.5 left-1.5">
                <span className="px-1.5 py-0.5 text-xs font-medium bg-black/60 text-white rounded">
                  {index + 1}
                </span>
              </div>

              {!disabled && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderImages(index, index - 1);
                      }}
                      className="absolute bottom-1.5 left-1.5 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                    >
                      <svg className="w-3.5 h-3.5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  )}

                  {index < previews.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderImages(index, index + 1);
                      }}
                      className="absolute bottom-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                    >
                      <svg className="w-3.5 h-3.5 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
