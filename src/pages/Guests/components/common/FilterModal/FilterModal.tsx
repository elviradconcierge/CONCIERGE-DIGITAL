/**
 * Filter Modal Component
 *
 * Reusable filter modal for guest pages (Shop, DineIn, Services)
 * Features:
 * - Full-screen mobile-optimized modal
 * - Category multi-select
 * - Price range slider (Airbnb-style dual handle)
 * - Hotel recommended toggle
 * - Apply/Reset functionality
 */

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import type { FilterOptions, FilterModalProps } from "./types";

export const FilterModal = ({
  isOpen,
  onClose,
  onApply,
  categories,
  maxPrice,
  currentFilters,
  restaurants,
  serviceTypes,
}: FilterModalProps) => {
  // Local filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentFilters.selectedCategories
  );
  const [priceRange, setPriceRange] = useState(currentFilters.priceRange);
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(
    currentFilters.showOnlyRecommended
  );
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>(
    currentFilters.selectedRestaurants || []
  );
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(
    currentFilters.selectedServiceTypes || []
  );

  // Reset local state when modal opens or currentFilters change
  useEffect(() => {
    setSelectedCategories(currentFilters.selectedCategories);
    setPriceRange(currentFilters.priceRange);
    setShowOnlyRecommended(currentFilters.showOnlyRecommended);
    setSelectedRestaurants(currentFilters.selectedRestaurants || []);
    setSelectedServiceTypes(currentFilters.selectedServiceTypes || []);
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle category toggle
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Handle restaurant toggle
  const toggleRestaurant = (restaurantId: string) => {
    setSelectedRestaurants((prev) =>
      prev.includes(restaurantId)
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  // Handle service type toggle
  const toggleServiceType = (serviceType: string) => {
    setSelectedServiceTypes((prev) =>
      prev.includes(serviceType)
        ? prev.filter((type) => type !== serviceType)
        : [...prev, serviceType]
    );
  };

  // Handle apply filters
  const handleApply = () => {
    onApply({
      selectedCategories,
      priceRange,
      showOnlyRecommended,
      selectedRestaurants: restaurants ? selectedRestaurants : undefined,
      selectedServiceTypes: serviceTypes ? selectedServiceTypes : undefined,
    });
    onClose();
  };

  // Handle reset filters
  const handleReset = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: maxPrice });
    setShowOnlyRecommended(false);
    setSelectedRestaurants([]);
    setSelectedServiceTypes([]);
  };

  // Count active filters
  const activeFilterCount =
    selectedCategories.length +
    (priceRange.min > 0 || priceRange.max < maxPrice ? 1 : 0) +
    (showOnlyRecommended ? 1 : 0) +
    selectedRestaurants.length +
    selectedServiceTypes.length;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Modal Container - Slides up on mobile */}
      <div className="bg-white w-full sm:max-w-lg sm:rounded-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-b-lg animate-in slide-in-from-bottom duration-300 sm:animate-in sm:fade-in">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Price Range Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Price Range
              </h3>
              <span className="text-sm text-gray-600">
                ${priceRange.min} - ${priceRange.max}
              </span>
            </div>
            <div className="relative pt-1 pb-4">
              {/* Track */}
              <div className="relative h-2 bg-gray-200 rounded-lg">
                {/* Active range highlight */}
                <div
                  className="absolute h-2 bg-blue-600 rounded-lg"
                  style={{
                    left: `${(priceRange.min / maxPrice) * 100}%`,
                    right: `${100 - (priceRange.max / maxPrice) * 100}%`,
                  }}
                />
              </div>

              {/* Min slider */}
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    min: Math.min(Number(e.target.value), prev.max),
                  }))
                }
                className="absolute w-full top-1 h-2 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                style={{ zIndex: priceRange.min > maxPrice - 100 ? 5 : 3 }}
              />

              {/* Max slider */}
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    max: Math.max(Number(e.target.value), prev.min),
                  }))
                }
                className="absolute w-full top-1 h-2 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                style={{ zIndex: 4 }}
              />
            </div>
          </div>

          {/* Hotel Recommended Toggle */}
          <div>
            <label className="flex items-center justify-between cursor-pointer touch-manipulation group">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Hotel Recommended
                </div>
                <div className="text-xs text-gray-500">
                  Show recommended items only
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showOnlyRecommended}
                  onChange={(e) => setShowOnlyRecommended(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>

          {/* Restaurants Section (DineIn only) */}
          {restaurants && restaurants.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Restaurants
              </h3>
              <div className="flex flex-wrap gap-2">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => toggleRestaurant(restaurant.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors touch-manipulation ${
                      selectedRestaurants.includes(restaurant.id)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {restaurant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Service Types Section (DineIn only) */}
          {serviceTypes && serviceTypes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Service Type
              </h3>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map((serviceType) => (
                  <button
                    key={serviceType}
                    onClick={() => toggleServiceType(serviceType)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors touch-manipulation capitalize ${
                      selectedServiceTypes.includes(serviceType)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {serviceType}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories Section - Moved to end */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors touch-manipulation ${
                      selectedCategories.includes(category)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors touch-manipulation"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
