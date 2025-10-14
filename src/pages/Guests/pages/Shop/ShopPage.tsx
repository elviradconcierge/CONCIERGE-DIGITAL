/**
 * Shop Page
 *
 * Hotel merchandise and products - displays products in a compact mobile-friendly format
 */

import { useMemo, useState } from "react";
import { MenuItemCard } from "../../components/MenuItemCard";
import { RecommendedItemModal } from "../Home/components/RecommendedSection/RecommendedItemModal";
import {
  useProducts,
  filterActiveProducts,
  groupProductsByCategory,
  type Product,
} from "../../../../hooks/queries/hotel-management/products";
import type { RecommendedItem } from "../../../../hooks/queries";
import { getGuestSession } from "../../../../services/guestAuth.service";

export const ShopPage = () => {
  // Modal state
  const [selectedItem, setSelectedItem] = useState<RecommendedItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get hotel ID from guest session
  const session = getGuestSession();
  const hotelId = session?.guestData?.hotel_id || "";

  // Fetch all products for the hotel
  const { data: products = [], isLoading } = useProducts(hotelId);

  console.log("🛍️ [ShopPage] Fetched products:", products.length);

  // Group products by category (showing both active and inactive)
  const categorizedProducts = useMemo(() => {
    const active = filterActiveProducts(products);
    console.log("✅ [ShopPage] Active products:", active.length);
    console.log("📊 [ShopPage] Total products:", products.length);

    // If no active products, show all products
    const productsToShow = active.length > 0 ? active : products;
    console.log("🛍️ [ShopPage] Showing products:", productsToShow.length);

    return groupProductsByCategory(productsToShow);
  }, [products]);

  const handleCardClick = (product: Product) => {
    console.log("🛍️ [ShopPage] Product clicked:", product.name);

    // Transform Product to RecommendedItem for modal
    const recommendedItem: RecommendedItem = {
      id: product.id,
      type: "product",
      title: product.name,
      description: product.description || undefined,
      price: product.price,
      imageUrl: product.image_url || undefined,
      category: product.category,
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Hotel Shop</h1>
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

  if (products.length === 0) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Hotel Shop</h1>
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="text-gray-600 mb-2">No products available</p>
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
      <div className="px-4 py-3 bg-gradient-to-br from-purple-50 to-pink-50 mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Hotel Shop</h1>
        <p className="text-sm text-gray-600">
          Browse our exclusive merchandise and products
        </p>
      </div>

      {/* Products grouped by category */}
      <div className="px-4">
        {Object.entries(categorizedProducts).map(([category, items]) => (
          <div key={category} className="mb-6">
            {/* Category Header */}
            <div className="flex items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900 capitalize">
                {category}
              </h2>
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                {items.length}
              </span>
            </div>

            {/* Vertical List of Compact Cards */}
            <div className="space-y-3">
              {items.map((product) => (
                <MenuItemCard
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  description={product.description || undefined}
                  imageUrl={product.image_url || undefined}
                  price={`$${product.price.toFixed(2)}`}
                  tags={
                    product.stock_quantity
                      ? [`Stock: ${product.stock_quantity}`]
                      : []
                  }
                  isAvailable={
                    product.is_active && (product.stock_quantity || 0) > 0
                  }
                  isRecommended={product.hotel_recommended || false}
                  onClick={() => handleCardClick(product)}
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
