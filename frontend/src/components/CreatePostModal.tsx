import { useState, useRef } from "react";
import api from "../services/api";
import ImageUpload from "./ImageUpload";

interface CreatePostModalProps {
  show: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreatePostModal({
  show,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const [text, setText] = useState("");
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImgFile(null);
    setImgPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!text.trim() || !imgFile) {
      setError("Both text and an image file are required");
      return;
    }

    setIsLoading(true);
    try {
      // Upload the image file first
      const formData = new FormData();
      formData.append("file", imgFile);
      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "image/jpeg" },
      });
      const imgUrl = uploadRes.data.url;

      // Create the post with the uploaded image URL
      await api.post("/post", { text, img: imgUrl });
      setText("");
      setImgFile(null);
      setImgPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onPostCreated();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create New Post</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="text" className="form-label">
                  Post Content
                </label>
                <textarea
                  className="form-control"
                  id="text"
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's on your mind?"
                  disabled={isLoading}
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Image</label>
                <ImageUpload
                  preview={imgPreview}
                  onFileSelect={handleFileSelect}
                  onRemove={removeImage}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
