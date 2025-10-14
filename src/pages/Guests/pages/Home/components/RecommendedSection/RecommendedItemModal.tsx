/**
 * Recommended Item Modal Component
 *
 * Displays detailed information about a recommended item (product, amenity, or menu item)
 * Features:
 * - Full-screen mobile-optimized modal
 * - Image display
 * - Full description
 * - Price information
 * - Category badge
 * - Close button
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { RecommendedItem } from "../../../../../../hooks/queries";

interface RecommendedItemModalProps {
  item: RecommendedItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecommendedItemModal = ({
  item,
  isOpen,
  onClose,
}: RecommendedItemModalProps) => {
  console.log("🔍 [RecommendedItemModal] Render:", {
    isOpen,
    hasItem: !!item,
    itemTitle: item?.title,
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      console.log("🔒 [RecommendedItemModal] Locking body scroll");
      document.body.style.overflow = "hidden";
    } else {
      console.log("🔓 [RecommendedItemModal] Unlocking body scroll");
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !item) {
    console.log(
      "❌ [RecommendedItemModal] Not rendering - isOpen:",
      isOpen,
      "hasItem:",
      !!item
    );
    return null;
  }

  console.log("✅ [RecommendedItemModal] Rendering modal for:", item.title);

  // Get category styling
  const getCategoryStyle = () => {
    switch (item.type) {
      case "product":
        return "bg-blue-100 text-blue-800";
      case "amenity":
        return "bg-green-100 text-green-800";
      case "menu_item":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Modal Container - Slides up on mobile */}
      <div className="bg-white w-full sm:max-w-lg sm:rounded-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-b-lg animate-in slide-in-from-bottom duration-300 sm:animate-in sm:fade-in">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-gray-900 flex-1 pr-3 line-clamp-1">
            {item.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors touch-manipulation flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-3">
          {/* Image Section with Badge Overlay */}
          <div className="relative w-full h-48 sm:h-56 bg-gray-200 rounded-lg overflow-hidden mb-3">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-sm">No image available</span>
              </div>
            )}

            {/* Category Badge - Top Left */}
            <div className="absolute top-2 left-2">
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg ${getCategoryStyle()}`}
              >
                {item.category}
              </span>
            </div>

            {/* Price Badge - Top Right */}
            {item.price !== undefined && (
              <div className="absolute top-2 right-2 bg-gray-900/90 text-white px-2.5 py-1 rounded-lg shadow-lg">
                <span className="text-sm font-bold">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>

          {/* Description */}
          {item.description ? (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Description
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {item.description}
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-gray-500 italic">
                No description available.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-4">
            {item.type === "product" && (
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors touch-manipulation text-sm">
                Add to Cart
              </button>
            )}
            {item.type === "amenity" && (
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors touch-manipulation text-sm">
                Book Now
              </button>
            )}
            {item.type === "menu_item" && (
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors touch-manipulation text-sm">
                Order Now
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-4 rounded-lg transition-colors touch-manipulation text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
