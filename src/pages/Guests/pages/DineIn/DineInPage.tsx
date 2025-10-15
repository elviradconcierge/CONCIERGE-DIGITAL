/**
 * Dine In Page
 *
 * Room service and restaurant menu - displays menu items in Uber Eats style
 */

import { useMemo, useState } from "react";
import { FilterableListPage } from "../../components/FilterableListPage";
import { useGuestHotelId } from "../../hooks";
import {
  useRestaurantMenuItems,
  useRestaurants,
  getUniqueCategories,
  type MenuItem,
} from "../../../../hooks/queries/hotel-management/restaurants";
import type { RecommendedItem } from "../../../../hooks/queries";
import type { FilterOptions } from "../../components/common";

export const DineInPage = () => {
  const [cartItemCount] = useState(0); // TODO: Connect to cart state
  const hotelId = useGuestHotelId();

  // Fetch data
  const { data: menuItems = [], isLoading } = useRestaurantMenuItems(hotelId);
  const { data: restaurants = [] } = useRestaurants(hotelId);

  // Calculate filter options
  const categories = useMemo(() => getUniqueCategories(menuItems), [menuItems]);

  const serviceTypes = useMemo(() => {
    const types = new Set<string>();
    menuItems.forEach((item) => {
      if (item.service_type) {
        item.service_type.forEach((type) => types.add(type));
      }
    });
    return Array.from(types).sort();
  }, [menuItems]);

  // Transform MenuItem to RecommendedItem
  const transformMenuItem = (item: MenuItem): RecommendedItem => ({
    id: item.id,
    type: "menu_item",
    title: item.name,
    description: item.description || undefined,
    price: item.price,
    imageUrl: item.image_url || undefined,
    category: item.category,
  });

  // Custom filtering logic for restaurants and service types
  const customFilterItems = (
    items: MenuItem[],
    filters: FilterOptions,
    searchQuery: string
  ): MenuItem[] => {
    let filtered = [...items];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        filters.selectedCategories.includes(item.category)
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (item) =>
        item.price >= filters.priceRange.min &&
        item.price <= filters.priceRange.max
    );

    // Restaurant filter
    if (filters.selectedRestaurants && filters.selectedRestaurants.length > 0) {
      filtered = filtered.filter((item) =>
        filters.selectedRestaurants!.some((restId) =>
          item.restaurant_ids.includes(restId)
        )
      );
    }

    // Service type filter
    if (
      filters.selectedServiceTypes &&
      filters.selectedServiceTypes.length > 0
    ) {
      filtered = filtered.filter((item) =>
        item.service_type?.some((type) =>
          filters.selectedServiceTypes!.includes(type)
        )
      );
    }

    return filtered;
  };

  return (
    <FilterableListPage
      searchPlaceholder="Search menu items..."
      emptyStateConfig={{
        emoji: "",
        title: "No menu items available",
        message: "Please check back later or contact the front desk",
      }}
      items={menuItems}
      isLoading={isLoading}
      categories={categories}
      cartItemCount={cartItemCount}
      onCartClick={() => console.log("Navigate to cart")}
      showCart={true}
      transformToRecommendedItem={transformMenuItem}
      filterItems={customFilterItems}
      additionalFilterOptions={{
        restaurants: restaurants,
        serviceTypes: serviceTypes,
      }}
    />
  );
};
