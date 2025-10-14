/**
 * Dine In Page
 *
 * Room service and restaurant menu - displays menu items in Uber Eats style
 */

import { useMemo } from "react";
import { MenuItemCard } from "../../components/MenuItemCard";
import {
  useRestaurantMenuItems,
  filterAvailableMenuItems,
  groupMenuItemsByCategory,
  type MenuItem,
} from "../../../../hooks/queries/hotel-management/restaurants";
import { getGuestSession } from "../../../../services/guestAuth.service";

export const DineInPage = () => {
  // Get hotel ID from guest session
  const session = getGuestSession();
  const hotelId = session?.guestData?.hotel_id || "";

  // Fetch all menu items for the hotel
  const { data: menuItems = [], isLoading } = useRestaurantMenuItems(hotelId);

  console.log("🍽️ [DineInPage] Fetched menu items:", menuItems.length);

  // Group all items by category (showing both available and unavailable)
  const categorizedMenu = useMemo(() => {
    const available = filterAvailableMenuItems(menuItems);
    console.log("✅ [DineInPage] Available menu items:", available.length);
    console.log("📊 [DineInPage] Total menu items:", menuItems.length);

    // If no available items, show all items
    const itemsToShow = available.length > 0 ? available : menuItems;
    console.log("🍽️ [DineInPage] Showing items:", itemsToShow.length);

    return groupMenuItemsByCategory(itemsToShow);
  }, [menuItems]);

  const handleCardClick = (item: MenuItem) => {
    console.log("🍽️ [DineInPage] Menu item clicked:", item.name);
    // TODO: Open modal or navigate to item details
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dine In</h1>
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

  if (menuItems.length === 0) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dine In</h1>
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-600 mb-2">No menu items available</p>
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
      <div className="px-4 py-6 bg-gradient-to-br from-blue-50 to-purple-50 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Restaurant Menu
        </h1>
        <p className="text-gray-600">
          Order delicious meals from our hotel restaurants
        </p>
      </div>

      {/* Menu Items grouped by category */}
      <div className="px-4">
        {Object.entries(categorizedMenu).map(([category, items]) => (
          <div key={category} className="mb-6">
            {/* Category Header */}
            <div className="flex items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900">{category}</h2>
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {items.length}
              </span>
            </div>

            {/* Vertical List of Compact Cards */}
            <div className="space-y-3">
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  id={item.id}
                  title={item.name}
                  description={item.description || undefined}
                  imageUrl={item.image_url || undefined}
                  price={`$${item.price.toFixed(2)}`}
                  tags={[
                    ...(item.service_type || []),
                    ...(item.special_type || []),
                  ]}
                  isAvailable={item.is_available}
                  onClick={() => handleCardClick(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
