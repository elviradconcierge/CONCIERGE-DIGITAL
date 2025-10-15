/**
 * Shop Cart Bottom Sheet
 *
 * Bottom sheet component for displaying and managing shop cart
 * Allows guests to review items, adjust quantities, and checkout
 *
 * Features:
 * - Cart items list with images
 * - Quantity adjustment
 * - Remove items
 * - Delivery date/time picker
 * - Special instructions
 * - Order total calculation
 * - Checkout functionality
 */

import { useState } from "react";
import { Trash2, Calendar, Clock, ShoppingBag } from "lucide-react";
import { BottomSheet } from "../common/BottomSheet";
import { SuccessModal } from "../common/SuccessModal";
import { useCart } from "../../../../contexts/CartContext";
import { useGuestHotelId } from "../../hooks";
import { getGuestSession } from "../../../../services/guestAuth.service";
import { useCreateGuestShopOrder } from "../../../../hooks/queries/guests";
import type { ShopOrderCreationData } from "../../../../hooks/queries/hotel-management/shop-orders/shop-order.types";
import { sendOrderNotificationEmail } from "../../../../services/orderEmailNotification.service";

interface ShopCartBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutSuccess?: () => void;
}

export const ShopCartBottomSheet = ({
  isOpen,
  onClose,
  onCheckoutSuccess,
}: ShopCartBottomSheetProps) => {
  const {
    items,
    updateQuantity,
    removeItem,
    getTotalPriceByType,
    clearCartByType,
  } = useCart();
  const hotelId = useGuestHotelId();
  const session = getGuestSession();
  const guestId = session?.guestData?.id;

  // Mutation hook for creating orders
  const createOrderMutation = useCreateGuestShopOrder();

  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter only product items
  const productItems = items.filter((item) => item.type === "product");
  const totalPrice = getTotalPriceByType("product");
  const isEmpty = productItems.length === 0;

  // Get tomorrow's date as minimum delivery date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!guestId || !deliveryDate) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare order data
      const orderData: ShopOrderCreationData = {
        order: {
          hotel_id: hotelId,
          guest_id: guestId,
          total_price: totalPrice,
          delivery_date: deliveryDate,
          delivery_time: deliveryTime || null,
          special_instructions: specialInstructions || null,
          status: "pending",
        },
        items: productItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price_at_order: item.price,
        })),
      };

      // Create order with stock deduction
      const result = await createOrderMutation.mutateAsync(orderData);

      // Send email notification
      try {
        // Extract guest email from personal data
        const guestPersonalData = session?.guestData?.guest_personal_data;
        const guestEmail = Array.isArray(guestPersonalData)
          ? guestPersonalData[0]?.guest_email || ""
          : guestPersonalData?.guest_email || "";

        const emailData = {
          orderType: "shop" as const,
          guestName: session?.guestData?.guest_name || "Guest",
          guestEmail,
          roomNumber: session?.guestData?.room_number || "",
          hotelName: session?.hotelData?.name || "Hotel",
          orderId: result?.id || "N/A",
          orderStatus: "pending",
          orderDetails: {
            shopItems: productItems.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            shopTotalPrice: totalPrice,
            shopDeliveryDate: deliveryDate,
            shopDeliveryTime: deliveryTime || undefined,
            specialInstructions: specialInstructions || undefined,
          },
        };

        await sendOrderNotificationEmail(emailData);
      } catch (emailError) {
        // Log email error but don't block order success
        console.error("⚠️ [Cart] Email notification failed:", emailError);
      }

      // Clear cart and show confirmation
      clearCartByType("product");
      setShowConfirmation(true);

      // Reset form
      setDeliveryDate("");
      setDeliveryTime("");
      setSpecialInstructions("");

      // Call success callback
      onCheckoutSuccess?.();

      // Close confirmation after 2 seconds
      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("❌ [Cart] Failed to create order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to place order";
      setError(errorMessage);

      // TODO: Show error toast notification
      alert(
        `Order failed: ${errorMessage}\nPlease try again or contact reception.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Main Cart Bottom Sheet */}
      <BottomSheet
        isOpen={isOpen && !showConfirmation}
        onClose={onClose}
        title="Shopping Cart"
        fullHeight={false}
      >
        {isEmpty ? (
          // Empty State
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Add some products to get started
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col max-h-[75vh]">
            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {productItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-white border border-gray-200 rounded-lg p-3"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image_url || "https://via.placeholder.com/80"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-2">
                      ${item.price.toFixed(2)} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Details Form */}
            <div className="border-t border-gray-200 px-4 py-4 space-y-3 bg-gray-50">
              {/* Delivery Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4" />
                  Delivery Date *
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={minDate}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Delivery Time (Optional) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4" />
                  Delivery Time (Optional)
                </label>
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests or delivery notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer - Total & Checkout - Sticky */}
            <div className="sticky bottom-0 border-t border-gray-200 px-4 py-4 bg-white shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isSubmitting || !deliveryDate}
                className="
                    w-full py-3 px-4
                    bg-blue-600 text-white font-semibold rounded-lg
                    hover:bg-blue-700 active:bg-blue-800
                    disabled:bg-gray-300 disabled:cursor-not-allowed
                    transition-colors
                  "
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showConfirmation}
        title="Order Placed!"
        message={`Your order has been submitted successfully. We'll deliver it on ${deliveryDate}${
          deliveryTime ? ` at ${deliveryTime}` : ""
        }.`}
      />
    </>
  );
};
