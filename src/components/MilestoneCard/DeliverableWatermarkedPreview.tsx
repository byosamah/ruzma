
import React, { useRef, useEffect, useState } from "react";
import { useWatermarkedPreview } from "@/hooks/useWatermarkedPreview";
import { Loader2 } from "lucide-react";

interface DeliverableWatermarkedPreviewProps {
  fileUrl: string;
  watermarkText: string;
  fileType: string;
}

const isImage = (type: string) =>
  type.includes("image/jpeg") || type.includes("image/png") || type.includes("image/jpg");

const isPDF = (type: string) =>
  type.includes("application/pdf") || type.endsWith(".pdf");

const getFileType = (url: string): string => {
  if (url.endsWith(".pdf")) return "application/pdf";
  if (url.match(/\.(jpe?g|png)$/i)) return "image/jpeg";
  return "";
};

const DeliverableWatermarkedPreview: React.FC<DeliverableWatermarkedPreviewProps> = ({
  fileUrl,
  watermarkText,
  fileType,
}) => {
  const { loading, generateWatermarkedPreview } = useWatermarkedPreview();
  const [securePreviewUrl, setSecurePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createSecurePreview = async () => {
      try {
        const actualFileType = fileType || getFileType(fileUrl);
        
        if (!isImage(actualFileType) && !isPDF(actualFileType)) {
          setError("File type not supported for secure preview");
          return;
        }

        const watermarkedUrl = await generateWatermarkedPreview(
          fileUrl,
          watermarkText,
          actualFileType
        );

        if (watermarkedUrl) {
          setSecurePreviewUrl(watermarkedUrl);
        } else {
          setError("Failed to generate secure preview");
        }
      } catch (err) {
        console.error('Error creating secure preview:', err);
        setError("Failed to generate secure preview");
      }
    };

    createSecurePreview();
  }, [fileUrl, watermarkText, fileType, generateWatermarkedPreview]);

  if (loading) {
    return (
      <div className="relative flex items-center justify-center w-full h-full min-h-[300px] bg-slate-100 rounded overflow-hidden">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
          <p className="text-sm text-slate-600">Creating secure preview...</p>
        </div>
      </div>
    );
  }

  if (error || !securePreviewUrl) {
    return (
      <div className="relative flex items-center justify-center w-full h-full min-h-[300px] bg-slate-100 rounded overflow-hidden">
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-2">Secure preview unavailable</p>
          <p className="text-xs text-slate-400">{error || "Failed to generate watermarked preview"}</p>
        </div>
      </div>
    );
  }

  const actualFileType = fileType || getFileType(fileUrl);

  // Image preview with embedded watermark
  if (isImage(actualFileType)) {
    return (
      <div className="relative flex items-center justify-center w-full h-full min-h-[300px] bg-slate-100 rounded overflow-hidden">
        <img
          src={securePreviewUrl}
          alt="Secure watermarked preview"
          className="max-h-[350px] rounded object-contain w-auto mx-auto"
          style={{ width: "100%", height: "auto", objectFit: "contain" }}
          onError={() => setError("Failed to load secure preview")}
        />
      </div>
    );
  }

  // PDF preview with embedded watermark
  if (isPDF(actualFileType)) {
    return (
      <div className="relative w-full min-h-[420px] bg-slate-100 rounded overflow-hidden">
        <iframe
          src={securePreviewUrl}
          title="Secure PDF Preview"
          className="w-full h-[430px] rounded"
          onError={() => setError("Failed to load secure PDF preview")}
        />
      </div>
    );
  }

  // Fallback for unknown file type
  return (
    <div className="w-full bg-slate-100 min-h-[100px] flex items-center justify-center rounded">
      <span className="text-slate-500 text-sm">Secure preview not available for this file type</span>
    </div>
  );
};

export default DeliverableWatermarkedPreview;
