
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
      color: "rgba(70,70,70,0.3)",
      fontSize: "1.5rem",
      fontWeight: "bold",
      textAlign: "center",
      zIndex: 3,
      userSelect: "none",
      transform: "rotate(-20deg)",
      textShadow: "1px 1px 2px rgba(255,255,255,0.8)"
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
      <div className="relative flex items-center justify-center w-full bg-slate-50 rounded-lg overflow-hidden border">
        <img
          src={fileUrl}
          alt="deliverable"
          className="max-h-64 w-full object-contain"
          style={{ opacity: 0.9 }}
        />
        <WatermarkLayer text={watermarkText} />
      </div>
    );
  }

  // PDF preview
  if (isPDF(fileType) || isPDF(getFileType(fileUrl))) {
    return (
      <div className="relative w-full h-64 bg-slate-50 rounded-lg overflow-hidden border">
        <iframe
          src={fileUrl}
          title="PDF Preview"
          className="w-full h-full"
        />
        <WatermarkLayer text={watermarkText} />
      </div>
    );
  }

  // Fallback for unknown file type
  return (
    <div className="w-full bg-slate-50 h-32 flex items-center justify-center rounded-lg border">
      <span className="text-slate-500 text-sm">Preview not available</span>
    </div>
  );
};

export default DeliverableWatermarkedPreview;
