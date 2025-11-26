import { useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, XCircle } from "lucide-react";

export default function MobileUpload() {
  const [, params] = useRoute("/upload/:sessionId");
  const sessionId = params?.sessionId || "";

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    setUploading(true);
    setUploadStatus("idle");

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch(`/api/upload/${sessionId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedCount(data.uploadedCount);
        setUploadStatus("success");
        setSelectedFiles([]);
      } else {
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Amor por Fotos</h1>
          <p className="text-gray-600">Envie suas fotos para o totem</p>
          <p className="text-sm text-gray-500 mt-2">Sessão: {sessionId}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <label
            htmlFor="file-input"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Toque para selecionar fotos</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG ou HEIC</p>
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h3 className="font-bold mb-3">Fotos selecionadas ({selectedFiles.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-full"
        >
          {uploading ? "Enviando..." : `Enviar ${selectedFiles.length} foto(s)`}
        </Button>

        {uploadStatus === "success" && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-bold text-green-800">Sucesso!</p>
              <p className="text-sm text-green-700">
                {uploadedCount} foto(s) enviada(s) para o totem.
              </p>
            </div>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-bold text-red-800">Erro no envio</p>
              <p className="text-sm text-red-700">
                Tente novamente ou entre em contato com o atendente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
