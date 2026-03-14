import { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
  preview?: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
  shape?: "rounded" | "circle";
}

export default function ImageUpload({
  preview,
  onFileSelect,
  onRemove,
  disabled = false,
  shape = "rounded",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile],
  );

  const openPicker = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const isCircle = shape === "circle";

  return (
    <div>
      <input
        type="file"
        className="d-none"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {!preview ? (
        /* ── Drop zone ── */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openPicker}
          style={{
            border: `2px dashed ${isDragging ? "#0d6efd" : "#ced4da"}`,
            borderRadius: "12px",
            padding: "40px 20px",
            textAlign: "center",
            cursor: disabled ? "default" : "pointer",
            backgroundColor: isDragging ? "#e8f0fe" : "#fafafa",
            transition: "all 0.2s ease",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#90a4ae"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <p className="text-muted mb-2" style={{ fontSize: "0.95rem" }}>
            Drop to upload your photo or
          </p>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
          >
            Choose file
          </button>
        </div>
      ) : isCircle ? (
        /* ── Circle preview (profile picture) ── */
        <div className="position-relative d-inline-block">
          <img
            src={preview}
            alt="Preview"
            className="rounded-circle"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: "2px solid #dee2e6",
            }}
          />
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary position-absolute bottom-0 end-0"
            onClick={openPicker}
            style={{
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              padding: 0,
            }}
            title="Change photo"
          >
            📷
          </button>
        </div>
      ) : (
        /* ── Rectangular preview (post image) ── */
        <div className="position-relative d-inline-block w-100">
          <img
            src={preview}
            alt="Preview"
            className="img-fluid rounded"
            style={{
              maxHeight: "250px",
              width: "100%",
              objectFit: "contain",
              backgroundColor: "#f8f9fa",
            }}
          />
          <button
            type="button"
            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
            onClick={onRemove}
            style={{
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
