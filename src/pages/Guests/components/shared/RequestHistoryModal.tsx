/**
 * Request History Modal Component
 *
 * Displays guest's request history
 * Features:
 * - Full-screen mobile-optimized modal
 * - Request history list
 * - Close button
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface RequestHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestHistoryModal = ({
  isOpen,
  onClose,
}: RequestHistoryModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Request History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* TODO: Add request history content here */}
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🕐</div>
            <p className="text-gray-600 mb-2">Request History</p>
            <p className="text-sm text-gray-500">
              Your request history will appear here
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
