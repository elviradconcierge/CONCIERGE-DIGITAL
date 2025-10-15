/**
 * Recommended Item Modal Component
 *
 * Displays detailed information about a recommended item (product, amenity, or menu item)
 * 
 * Refactored to use:
 * - ModalHeader: Reusable modal header with close button
 * - ModalItemImage: Image display with badges
 * - RestaurantDetails: Restaurant-specific information
 * - TourDetails: Tour-specific information
 * - ContactInfo: Contact information display
 * - ModalActionButtons: Action buttons based on item type
 * 
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
import { ModalHeader } from "../../../../components/common/ModalHeader";
import {
  RestaurantDetails,
  TourDetails,
  ModalItemImage,
  ModalActionButtons,
} from "./components";
import { RecommendedItem } from "../../../../../../hooks/queries";
import type { Restaurant } from "../../../../../../services/googlePlaces.service";
import type { AmadeusActivity } from "../../../../../../services/amadeus/types";

interface RecommendedItemModalProps {
  item: RecommendedItem | null;
  isOpen: boolean;
  onClose: () => void;
  hideActionButtons?: boolean;
  restaurant?: Restaurant | null;
  tour?: AmadeusActivity | null;
}

export const RecommendedItemModal = ({
  item,
  isOpen,
  onClose,
  hideActionButtons = false,
  restaurant,
  tour,
}: RecommendedItemModalProps) => {
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

  if (!isOpen || !item) {
    return null;
  }

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
        {/* Header */}
        <ModalHeader title={item.title} onClose={onClose} />

        {/* Modal Content */}
        <div className="p-3">
          {/* Image Section */}
          <ModalItemImage
            imageUrl={item.imageUrl}
            title={item.title}
            category={item.category || "Item"}
            price={item.price}
            getCategoryStyle={getCategoryStyle}
          />

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>

          {/* Description */}
          {item.description ? (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Description
              </h4>
              <div
                className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-gray-500 italic">
                No description available.
              </p>
            </div>
          )}

          {/* Restaurant Details */}
          {restaurant && <RestaurantDetails restaurant={restaurant} />}

          {/* Tour Details */}
          {tour && <TourDetails tour={tour} />}

          {/* Action Buttons */}
          <ModalActionButtons
            itemType={item.type}
            hideActionButtons={hideActionButtons}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
