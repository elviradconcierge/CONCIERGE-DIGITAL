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
import {
  X,
  MapPin,
  Phone,
  Globe,
  Star,
  Clock,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { RecommendedItem } from "../../../../../../hooks/queries";
import type { Restaurant } from "../../../../../../services/googlePlaces.service";
import type { AmadeusActivity } from "../../../../../../services/amadeus/types";

interface RecommendedItemModalProps {
  item: RecommendedItem | null;
  isOpen: boolean;
  onClose: () => void;
  hideActionButtons?: boolean; // Optional prop to hide booking buttons
  restaurant?: Restaurant | null; // Full restaurant data
  tour?: AmadeusActivity | null; // Full tour data
}

export const RecommendedItemModal = ({
  item,
  isOpen,
  onClose,
  hideActionButtons = false,
  restaurant,
  tour,
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
          {restaurant && (
            <div className="mb-4 space-y-4">
              {console.log("🍽️ [RecommendedItemModal] Restaurant data:", {
                hasRestaurant: !!restaurant,
                name: restaurant.name,
                place_id: restaurant.place_id,
                formatted_address: restaurant.formatted_address,
                vicinity: restaurant.vicinity,
                rating: restaurant.rating,
                user_ratings_total: restaurant.user_ratings_total,
                price_level: restaurant.price_level,
                formatted_phone_number: restaurant.formatted_phone_number,
                website: restaurant.website,
                hasOpeningHours: !!restaurant.opening_hours,
                weekdayText: restaurant.opening_hours?.weekday_text,
                hasReviews: !!restaurant.reviews,
                reviewsCount: restaurant.reviews?.length,
              })}

              {/* Rating & Price Level */}
              {(restaurant.rating || restaurant.price_level) && (
                <div className="flex items-center gap-4">
                  {restaurant.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {restaurant.rating}
                      </span>
                      {restaurant.user_ratings_total && (
                        <span className="text-xs text-gray-500">
                          ({restaurant.user_ratings_total} reviews)
                        </span>
                      )}
                    </div>
                  )}
                  {restaurant.price_level && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">
                        {"$".repeat(restaurant.price_level)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-2">
                {console.log("🗺️ [RecommendedItemModal] Address check:", {
                  hasFormattedAddress: !!restaurant.formatted_address,
                  formatted_address: restaurant.formatted_address,
                  hasVicinity: !!restaurant.vicinity,
                  vicinity: restaurant.vicinity,
                })}

                {(restaurant.formatted_address || restaurant.vicinity) && (
                  <div className="flex items-start gap-2">
                    {console.log(
                      "✅ [RecommendedItemModal] Rendering address with Maps button"
                    )}
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <span className="text-sm text-gray-700">
                        {restaurant.formatted_address || restaurant.vicinity}
                      </span>
                      {console.log(
                        "🔗 [RecommendedItemModal] Google Maps URL:",
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          restaurant.name +
                            " " +
                            (restaurant.formatted_address ||
                              restaurant.vicinity)
                        )}&query_place_id=${restaurant.place_id}`
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          restaurant.name +
                            " " +
                            (restaurant.formatted_address ||
                              restaurant.vicinity)
                        )}&query_place_id=${restaurant.place_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title="Open in Google Maps"
                        onClick={() =>
                          console.log(
                            "🗺️ [RecommendedItemModal] Maps button clicked!"
                          )
                        }
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {!(restaurant.formatted_address || restaurant.vicinity) &&
                  console.log(
                    "❌ [RecommendedItemModal] No address available - Maps button not rendered"
                  )}
                {restaurant.formatted_phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <a
                      href={`tel:${restaurant.formatted_phone_number}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {restaurant.formatted_phone_number}
                    </a>
                  </div>
                )}
                {restaurant.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Opening Hours */}
              {restaurant.opening_hours?.weekday_text && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Opening Hours
                  </h4>
                  <div className="space-y-1">
                    {restaurant.opening_hours.weekday_text.map((day, idx) => (
                      <p key={idx} className="text-xs text-gray-700">
                        {day}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {restaurant.reviews && restaurant.reviews.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Recent Reviews
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {restaurant.reviews.slice(0, 3).map((review, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {review.author_name}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 line-clamp-3">
                          {review.text}
                        </p>
                        {review.relative_time_description && (
                          <span className="text-xs text-gray-500">
                            {review.relative_time_description}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tour Details */}
          {tour && (
            <div className="mb-4 space-y-3">
              {tour.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">
                    {tour.rating}
                  </span>
                </div>
              )}
              {tour.bookingLink && (
                <a
                  href={tour.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Book this tour →
                </a>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-4">
            {!hideActionButtons && (
              <>
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
              </>
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
