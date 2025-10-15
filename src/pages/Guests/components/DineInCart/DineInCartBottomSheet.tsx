/**
 * DineIn Cart Bottom Sheet
 *
 * Bottom sheet component for displaying and managing dine-in cart
 * Supports two order types: restaurant_booking and room_service
 *
 * Business Rules:
 * - Service type is automatically detected from first item added
 * - Visual warning shown if cart has mixed service types
 * - Checkout blocked until cart has only one service type
 *
 * Features:
 * - Cart items list with images
 * - Quantity adjustment
 * - Remove items
 * - Auto-detected service type
 * - Dynamic form fields based on service type
 * - Reservation/delivery date/time picker
 * - Special instructions
 * - Order total calculation
 * - Checkout functionality
 */

import { useState, useMemo } from "react";
import {
  Trash2,
  Calendar,
  Clock,
  UtensilsCrossed,
  Users,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { BottomSheet } from "../common/BottomSheet";
import { SuccessModal } from "../common/SuccessModal";
import { useCart } from "../../../../contexts/CartContext";
import { useGuestHotelId } from "../../hooks";
import { getGuestSession } from "../../../../services/guestAuth.service";
import { useCreateGuestDineInOrder } from "../../../../hooks/queries/guests/dineIn/useGuestDineInOrderMutations";
import { sendOrderNotificationEmail } from "../../../../services/orderEmailNotification.service";

interface DineInCartBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutSuccess?: () => void;
}

export const DineInCartBottomSheet = ({
  isOpen,
  onClose,
  onCheckoutSuccess,
}: DineInCartBottomSheetProps) => {
  const {
    items,
    updateQuantity,
    removeItem,
    getTotalPriceByType,
    clearCartByType,
    getFoodServiceType,
  } = useCart();
  const hotelId = useGuestHotelId();
  const session = getGuestSession();
  const guestId = session?.guestData?.id;

  // Mutation hook for creating orders
  const createOrderMutation = useCreateGuestDineInOrder();

  // Filter only food items
  const foodItems = items.filter((item) => item.type === "food");
  const totalPrice = getTotalPriceByType("food");
  const isEmpty = foodItems.length === 0;

  // Detect service type from cart items (first item determines the type)
  const detectedServiceType = getFoodServiceType();

  // Check if cart has mixed service types (shouldn't happen with validation, but safety check)
  const hasMixedServiceTypes = useMemo(() => {
    const serviceTypes = new Set(
      foodItems
        .filter((item) => item.serviceType)
        .map((item) => item.serviceType)
    );
    return serviceTypes.size > 1;
  }, [foodItems]);

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Restaurant booking fields
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [tablePreferences, setTablePreferences] = useState("");

  // Room service fields
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  // Get today's date as minimum date
  const today = new Date().toISOString().split("T")[0];

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const validateForm = () => {
    if (!guestId) {
      alert("Guest session not found");
      return false;
    }

    // Check for mixed service types
    if (hasMixedServiceTypes) {
      alert(
        "Cart contains mixed service types. Please remove items to have only Restaurant or Room Service items."
      );
      return false;
    }

    // Check if service type is detected
    if (!detectedServiceType) {
      alert("Cannot determine order type. Please add items with service type.");
      return false;
    }

    // Validate based on detected service type
    if (detectedServiceType === "restaurant_booking") {
      if (!reservationDate || !reservationTime) {
        alert("Please select reservation date and time");
        return false;
      }
      if (numberOfGuests < 1) {
        alert("Number of guests must be at least 1");
        return false;
      }
    } else {
      if (!deliveryDate || !deliveryTime) {
        alert("Please select delivery date and time");
        return false;
      }
    }

    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Extract restaurant ID from first cart item (all should have same restaurant)
      const restaurantId = foodItems.find(
        (item) => item.restaurantId
      )?.restaurantId;

      // Prepare order data
      const orderData = {
        guestId: guestId!,
        hotelId,
        orderType: detectedServiceType!,
        items: foodItems,
        totalPrice,
        specialInstructions: specialInstructions || undefined,

        // Restaurant booking fields
        ...(detectedServiceType === "restaurant_booking" && {
          restaurantId, // Add restaurant ID for restaurant bookings
          reservationDate,
          reservationTime,
          numberOfGuests,
          tablePreferences: tablePreferences || undefined,
        }),

        // Room service fields
        ...(detectedServiceType === "room_service" && {
          deliveryDate,
          deliveryTime,
        }),
      };

      // Create order
      const result = await createOrderMutation.mutateAsync(orderData);

      // Send email notification
      try {
        // Extract guest email from personal data
        const guestPersonalData = session?.guestData?.guest_personal_data;
        const guestEmail = Array.isArray(guestPersonalData)
          ? guestPersonalData[0]?.guest_email || ""
          : guestPersonalData?.guest_email || "";

        // Get restaurant name from first item (all items should have same restaurant)
        const restaurantName = foodItems[0]?.name?.includes("Restaurant")
          ? "Restaurant"
          : "Hotel Restaurant";

        const emailData = {
          orderType: "dine_in" as const,
          guestName: session?.guestData?.guest_name || "Guest",
          guestEmail,
          roomNumber: session?.guestData?.room_number || "",
          hotelName: session?.hotelData?.name || "Hotel",
          orderId: result?.id || "N/A",
          orderStatus: "pending",
          orderDetails: {
            restaurantName,
            orderItems: foodItems.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            totalPrice,
            specialInstructions: specialInstructions || undefined,

            // Restaurant booking specific fields
            ...(detectedServiceType === "restaurant_booking" && {
              reservationDate,
              reservationTime,
              numberOfGuests,
              tablePreferences: tablePreferences || undefined,
            }),

            // Room service specific fields
            ...(detectedServiceType === "room_service" && {
              deliveryDate,
              deliveryTime,
            }),
          },
        };

        await sendOrderNotificationEmail(emailData);
      } catch (emailError) {
        // Log email error but don't block order success
        console.error("⚠️ [Cart] Email notification failed:", emailError);
      }

      // Clear cart and show confirmation
      clearCartByType("food");
      setShowConfirmation(true);

      // Reset form
      setSpecialInstructions("");
      setReservationDate("");
      setReservationTime("");
      setNumberOfGuests(2);
      setTablePreferences("");
      setDeliveryDate("");
      setDeliveryTime("");

      // Call success callback
      onCheckoutSuccess?.();

      // Close confirmation after 2 seconds
      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to place order";

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
        title="Dine-In Cart"
        fullHeight={false}
      >
        {isEmpty ? (
          // Empty State
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Add some food items to get started
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-[80vh]">
            {/* Cart Items - Scrollable with more space */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {/* Service Type Info Badge */}
              {detectedServiceType && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                  {detectedServiceType === "restaurant_booking" ? (
                    <>
                      <UtensilsCrossed className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">
                          Restaurant Reservation
                        </p>
                        <p className="text-xs text-gray-600">
                          Booking a table at our restaurant
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">
                          Room Service
                        </p>
                        <p className="text-xs text-gray-600">
                          Delivery to your room
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mixed Service Types Warning */}
              {hasMixedServiceTypes && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-red-900">
                      Mixed Order Types
                    </p>
                    <p className="text-xs text-red-600">
                      Cannot mix Restaurant and Room Service items. Please
                      remove items to have only one type.
                    </p>
                  </div>
                </div>
              )}

              {/* Food Items */}
              <div className="space-y-3">
                {foodItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 bg-white border border-gray-200 rounded-lg p-3"
                  >
                    {/* Food Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image_url || "https://via.placeholder.com/80"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Food Details */}
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
            </div>

            {/* Order Details Form - Compact with fixed height */}
            <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 space-y-2.5 bg-gray-50 max-h-[45vh] overflow-y-auto">
              {detectedServiceType === "restaurant_booking" ? (
                <>
                  {/* Reservation Date */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Reservation Date *
                    </label>
                    <input
                      type="date"
                      value={reservationDate}
                      onChange={(e) => setReservationDate(e.target.value)}
                      min={today}
                      required
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Reservation Time */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      Reservation Time *
                    </label>
                    <input
                      type="time"
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                      <Users className="w-3.5 h-3.5" />
                      Number of Guests *
                    </label>
                    <input
                      type="number"
                      value={numberOfGuests}
                      onChange={(e) =>
                        setNumberOfGuests(parseInt(e.target.value) || 1)
                      }
                      min="1"
                      max="20"
                      required
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Table Preferences */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Table Preferences (Optional)
                    </label>
                    <input
                      type="text"
                      value={tablePreferences}
                      onChange={(e) => setTablePreferences(e.target.value)}
                      placeholder="e.g., Window seat, quiet area..."
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Delivery Date */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={today}
                      required
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Delivery Time */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      Delivery Time *
                    </label>
                    <input
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Special Instructions */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Dietary restrictions, allergies, special requests..."
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer - Total & Checkout - Sticky */}
            <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 bg-white shadow-lg">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-xl font-bold text-blue-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={
                  isSubmitting || hasMixedServiceTypes || !detectedServiceType
                }
                className="
                    w-full py-3 px-4
                    bg-blue-600 text-white font-semibold rounded-lg
                    hover:bg-blue-700 active:bg-blue-800
                    disabled:bg-gray-300 disabled:cursor-not-allowed
                    transition-colors
                  "
              >
                {isSubmitting
                  ? "Placing Order..."
                  : detectedServiceType === "restaurant_booking"
                  ? "Place Reservation"
                  : "Place Room Service Order"}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showConfirmation}
        title="Order Placed!"
        message={
          detectedServiceType === "restaurant_booking"
            ? `Your table is reserved for ${reservationDate} at ${reservationTime}.`
            : `Your food will be delivered on ${deliveryDate} at ${deliveryTime}.`
        }
      />
    </>
  );
};
