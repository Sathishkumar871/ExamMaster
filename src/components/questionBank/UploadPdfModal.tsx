import React from "react";

interface UploadPdfModalProps {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
}

const UploadPdfModal: React.FC<UploadPdfModalProps> = ({
  open,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[500px] p-6">

        <h2 className="text-2xl font-bold mb-4">
          Upload PDF
        </h2>

        <input
          type="file"
          accept=".pdf"
          className="w-full border rounded-lg p-3 mb-4"
        />

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Upload
          </button>

        </div>

      </div>
    </div>
  );
};

export default UploadPdfModal;