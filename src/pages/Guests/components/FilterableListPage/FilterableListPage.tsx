/**
 * FilterableListPage Component
 *
 * A unified base component for Shop, DineIn, and Services pages
 * Handles common patterns: loading, empty states, search, filters, modals, categorized lists
 */

import React, { useMemo } from "react";
import { SearchBar, FilterModal, type FilterOptions } from "../common";
import { CategoryHeader, LoadingSkeleton, EmptyState } from "../ui";
import { useItemModal, useFilterState } from "../../hooks";
import { MenuItemCard } from "../MenuItemCard";
import { RecommendedItemModal } from "../../pages/Home/components/RecommendedSection/RecommendedItemModal";
import type { RecommendedItem } from "../../../../hooks/queries";

// Generic item type that all pages must conform to
export interface FilterableItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category: string;
  is_active?: boolean;
  hotel_recommended?: boolean;
  // Page-specific fields can be added but these are required
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface FilterableListPageProps<T extends FilterableItem> {
  // Page configuration
  searchPlaceholder: string;
  emptyStateConfig: {
    emoji: string;
    title: string;
    message?: string;
  };

  // Data
  items: T[];
  isLoading: boolean;
  categories: string[];

  // Optional configurations
  cartItemCount?: number;
  onCartClick?: () => void;
  showCart?: boolean;

  // Custom filtering logic (optional)
  filterItems?: (
    items: T[],
    filters: FilterOptions,
    searchQuery: string
  ) => T[];

  // Custom grouping logic (optional)
  groupItems?: (items: T[]) => Record<string, T[]>;

  // Custom item transformation to RecommendedItem
  transformToRecommendedItem: (item: T) => RecommendedItem;

  // Custom card rendering (optional)
  renderCard?: (item: T, onClick: (item: T) => void) => React.ReactNode;

  // Additional filter options (for DineIn page with restaurants/service types)
  additionalFilterOptions?: {
    restaurants?: Array<{ id: string; name: string }>;
    serviceTypes?: string[];
  };
}

export function FilterableListPage<T extends FilterableItem>({
  searchPlaceholder,
  emptyStateConfig,
  items,
  isLoading,
  categories,
  cartItemCount,
  onCartClick,
  showCart = false,
  filterItems,
  groupItems,
  transformToRecommendedItem,
  renderCard,
  additionalFilterOptions,
}: FilterableListPageProps<T>) {
  const { selectedItem, isModalOpen, openModal, closeModal } = useItemModal();

  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    isFilterModalOpen,
    openFilterModal,
    closeFilterModal,
    maxPrice,
  } = useFilterState({ items });

  // Default filtering logic
  const defaultFilterItems = (
    itemsToFilter: T[],
    currentFilters: FilterOptions,
    query: string
  ): T[] => {
    let filtered = [...itemsToFilter];

    // Search filter
    if (query) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Category filter
    if (currentFilters.selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        currentFilters.selectedCategories.includes(item.category)
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (item) =>
        item.price >= currentFilters.priceRange.min &&
        item.price <= currentFilters.priceRange.max
    );

    // Recommended filter
    if (currentFilters.showOnlyRecommended) {
      filtered = filtered.filter((item) => item.hotel_recommended);
    }

    return filtered;
  };

  // Default grouping logic
  const defaultGroupItems = (itemsToGroup: T[]): Record<string, T[]> => {
    return itemsToGroup.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  };

  // Apply filters and group items
  const categorizedItems = useMemo(() => {
    // Filter active items first
    const activeItems = items.filter((item) => item.is_active !== false);
    const itemsToShow = activeItems.length > 0 ? activeItems : items;

    console.log(
      "🔍 [FilterableListPage] Active items:",
      activeItems.length,
      "Total items:",
      items.length
    );

    // Apply custom or default filtering
    const filtered = filterItems
      ? filterItems(itemsToShow, filters, searchQuery)
      : defaultFilterItems(itemsToShow, filters, searchQuery);

    console.log(
      "🔍 [FilterableListPage] After filtering:",
      filtered.length,
      "Search:",
      searchQuery,
      "Filters:",
      filters
    );

    // Apply custom or default grouping
    const grouped = groupItems
      ? groupItems(filtered)
      : defaultGroupItems(filtered);

    console.log(
      "🔍 [FilterableListPage] Grouped items:",
      Object.keys(grouped),
      grouped
    );

    return grouped;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filters, searchQuery, filterItems, groupItems]);

  // Handle card click
  const handleCardClick = (item: T) => {
    const recommendedItem = transformToRecommendedItem(item);
    openModal(recommendedItem);
  };

  // Default card renderer
  const defaultRenderCard = (item: T) => (
    <MenuItemCard
      key={item.id}
      id={item.id}
      title={item.name}
      description={item.description || undefined}
      imageUrl={item.image_url || undefined}
      price={`$${item.price.toFixed(2)}`}
      isAvailable={item.is_active !== false}
      isRecommended={item.hotel_recommended || false}
      onClick={() => handleCardClick(item)}
    />
  );

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton searchPlaceholder={searchPlaceholder} />;
  }

  // Empty state
  if (items.length === 0) {
    return (
      <EmptyState
        searchPlaceholder={searchPlaceholder}
        emoji={emptyStateConfig.emoji}
        title={emptyStateConfig.title}
        message={emptyStateConfig.message}
      />
    );
  }

  return (
    <div className="pb-6">
      {/* Search Bar */}
      <div className="px-4 pt-3 pb-2">
        <SearchBar
          placeholder={searchPlaceholder}
          value={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={openFilterModal}
          cartItemCount={showCart ? cartItemCount : undefined}
          onCartClick={showCart ? onCartClick : undefined}
        />
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={closeFilterModal}
        onApply={setFilters}
        categories={categories}
        maxPrice={maxPrice}
        currentFilters={filters}
        restaurants={additionalFilterOptions?.restaurants}
        serviceTypes={additionalFilterOptions?.serviceTypes}
      />

      {/* Items grouped by category */}
      <div className="px-4">
        {Object.entries(categorizedItems).map(([category, categoryItems]) => (
          <div key={category} className="mb-6">
            <CategoryHeader category={category} count={categoryItems.length} />

            <div className="space-y-3">
              {categoryItems.map((item) =>
                renderCard
                  ? renderCard(item, handleCardClick)
                  : defaultRenderCard(item)
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <RecommendedItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
