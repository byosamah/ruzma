
import React, { useRef, useEffect, useState } from "react";

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

const WatermarkLayer: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      pointerEvents: "none",
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "rgba(70,70,70,0.35)",
      fontSize: "2.5rem",
      fontWeight: "bold",
      textAlign: "center",
      zIndex: 3,
      userSelect: "none",
      transform: "rotate(-20deg)"
    }}
  >
    {text}
  </div>
);

const DeliverableWatermarkedPreview: React.FC<DeliverableWatermarkedPreviewProps> = ({
  fileUrl,
  watermarkText,
  fileType,
}) => {
  // Image preview
  if (isImage(fileType) || isImage(getFileType(fileUrl))) {
    return (
      <div className="relative flex items-center justify-center w-full h-full min-h-[300px] bg-slate-100 rounded overflow-hidden">
        <img
          src={fileUrl}
          alt="deliverable"
          className="max-h-[350px] rounded object-contain w-auto mx-auto"
          style={{ width: "100%", height: "auto", opacity: 1, objectFit: "contain" }}
        />
        <WatermarkLayer text={watermarkText} />
      </div>
    );
  }

  // PDF preview
  if (isPDF(fileType) || isPDF(getFileType(fileUrl))) {
    // Use an <iframe> overlaying watermark text
    return (
      <div className="relative w-full min-h-[420px] bg-slate-100 rounded overflow-hidden">
        <iframe
          src={fileUrl}
          title="PDF Preview"
          className="w-full h-[430px] rounded z-1"
        />
        <WatermarkLayer text={watermarkText} />
      </div>
    );
  }

  // Fallback for unknown file type
  return (
    <div className="w-full bg-slate-100 min-h-[100px] flex items-center justify-center rounded">
      <span className="text-slate-500 text-sm">Preview not available</span>
    </div>
  );
};

export default DeliverableWatermarkedPreview;
