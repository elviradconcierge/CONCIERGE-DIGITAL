/**
 * Services Page
 *
 * Hotel amenities and services - displays amenities in a compact mobile-friendly format
 */

import { useMemo, useState } from "react";
import { MenuItemCard } from "../../components/MenuItemCard";
import { RecommendedItemModal } from "../Home/components/RecommendedSection/RecommendedItemModal";
import {
  useAmenities,
  filterActiveAmenities,
  groupAmenitiesByCategory,
  type Amenity,
} from "../../../../hooks/queries/hotel-management/amenities";
import type { RecommendedItem } from "../../../../hooks/queries";
import { getGuestSession } from "../../../../services/guestAuth.service";

export const ServicesPage = () => {
  // Modal state
  const [selectedItem, setSelectedItem] = useState<RecommendedItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get hotel ID from guest session
  const session = getGuestSession();
  const hotelId = session?.guestData?.hotel_id || "";

  // Fetch all amenities for the hotel
  const { data: amenities = [], isLoading } = useAmenities(hotelId);

  console.log("🏊 [ServicesPage] Fetched amenities:", amenities.length);

  // Group amenities by category (showing both active and inactive)
  const categorizedAmenities = useMemo(() => {
    const active = filterActiveAmenities(amenities);
    console.log("✅ [ServicesPage] Active amenities:", active.length);
    console.log("📊 [ServicesPage] Total amenities:", amenities.length);

    // If no active amenities, show all amenities
    const amenitiesToShow = active.length > 0 ? active : amenities;
    console.log("🏊 [ServicesPage] Showing amenities:", amenitiesToShow.length);

    return groupAmenitiesByCategory(amenitiesToShow);
  }, [amenities]);

  const handleCardClick = (amenity: Amenity) => {
    console.log("🏊 [ServicesPage] Amenity clicked:", amenity.name);

    // Transform Amenity to RecommendedItem for modal
    const recommendedItem: RecommendedItem = {
      id: amenity.id,
      type: "amenity",
      title: amenity.name,
      description: amenity.description || undefined,
      price: amenity.price > 0 ? amenity.price : undefined,
      imageUrl: amenity.image_url || undefined,
      category: amenity.category,
    };

    setSelectedItem(recommendedItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h1>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex gap-3 h-24 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (amenities.length === 0) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h1>
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">🏊</div>
          <p className="text-gray-600 mb-2">No amenities available</p>
          <p className="text-sm text-gray-500">
            Please check back later or contact the front desk
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Page Header */}
      <div className="px-4 py-3 bg-gradient-to-br from-green-50 to-blue-50 mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Hotel Amenities
        </h1>
        <p className="text-sm text-gray-600">
          Discover our facilities and services
        </p>
      </div>

      {/* Amenities grouped by category */}
      <div className="px-4">
        {Object.entries(categorizedAmenities).map(([category, items]) => (
          <div key={category} className="mb-6">
            {/* Category Header */}
            <div className="flex items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900 capitalize">
                {category}
              </h2>
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                {items.length}
              </span>
            </div>

            {/* Vertical List of Compact Cards */}
            <div className="space-y-3">
              {items.map((amenity) => (
                <MenuItemCard
                  key={amenity.id}
                  id={amenity.id}
                  title={amenity.name}
                  description={amenity.description || undefined}
                  imageUrl={amenity.image_url || undefined}
                  price={
                    amenity.price && amenity.price > 0
                      ? `$${amenity.price.toFixed(2)}`
                      : "Free"
                  }
                  tags={[]}
                  isAvailable={amenity.is_active}
                  isRecommended={amenity.hotel_recommended || false}
                  onClick={() => handleCardClick(amenity)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <RecommendedItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};
