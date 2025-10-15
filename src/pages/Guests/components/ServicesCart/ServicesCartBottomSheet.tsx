/**
 * Services Cart Bottom Sheet
 *
 * Bottom sheet component for displaying and managing services/amenities cart
 * Used for requesting hotel amenities like spa, gym, pool, etc.
 *
 * Features:
 * - Cart items list with images
 * - Remove items (no quantity - services are one-time requests)
 * - Request date/time picker
 * - Special instructions
 * - Submit requests functionality
 */

import { useState } from "react";
import { Trash2, Calendar, Clock, Sparkles } from "lucide-react";
import { BottomSheet } from "../common/BottomSheet";
import { SuccessModal } from "../common/SuccessModal";
import { useCart } from "../../../../contexts/CartContext";
import { useGuestHotelId } from "../../hooks";
import { getGuestSession } from "../../../../services/guestAuth.service";
import { useCreateGuestAmenityRequest } from "../../../../hooks/queries/guests/amenities/useGuestAmenityRequestMutations";
import { sendOrderNotificationEmail } from "../../../../services/orderEmailNotification.service";

interface ServicesCartBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutSuccess?: () => void;
}

export const ServicesCartBottomSheet = ({
  isOpen,
  onClose,
  onCheckoutSuccess,
}: ServicesCartBottomSheetProps) => {
  const { items, removeItem, clearCartByType } = useCart();
  const hotelId = useGuestHotelId();
  const session = getGuestSession();
  const guestId = session?.guestData?.id;

  // Mutation hook for creating requests
  const createRequestMutation = useCreateGuestAmenityRequest();

  // Filter only service items
  const serviceItems = items.filter((item) => item.type === "service");
  const isEmpty = serviceItems.length === 0;

  const [requestDate, setRequestDate] = useState("");
  const [requestTime, setRequestTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get today's date as minimum date
  const today = new Date().toISOString().split("T")[0];

  const validateForm = () => {
    if (!guestId) {
      alert("Guest session not found");
      return false;
    }

    if (!requestDate) {
      alert("Please select a request date");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare request data
      const requestData = {
        guestId: guestId!,
        hotelId,
        items: serviceItems,
        requestDate,
        requestTime: requestTime || undefined,
        specialInstructions: specialInstructions || undefined,
      };

      // Create requests
      await createRequestMutation.mutateAsync(requestData);

      // Send email notifications for each amenity
      try {
        // Extract guest email from personal data
        const guestPersonalData = session?.guestData?.guest_personal_data;
        const guestEmail = Array.isArray(guestPersonalData)
          ? guestPersonalData[0]?.guest_email || ""
          : guestPersonalData?.guest_email || "";

        // Send email for each amenity request
        const emailPromises = serviceItems.map((item) => {
          return sendOrderNotificationEmail({
            orderType: "amenity" as const,
            guestName: session?.guestData?.guest_name || "Guest",
            guestEmail,
            roomNumber: session?.guestData?.room_number || "",
            hotelName: session?.hotelData?.name || "Hotel",
            orderId: "N/A", // Amenity requests don't return IDs in bulk creation
            orderStatus: "pending",
            orderDetails: {
              amenityName: item.name,
              amenityCategory: "Service",
              amenityPrice: `$${item.price.toFixed(2)}`,
              requestDate,
              requestTime: requestTime || undefined,
              specialInstructions: specialInstructions || undefined,
            },
          });
        });

        await Promise.all(emailPromises);
      } catch (emailError) {
        // Log email error but don't block request success
        console.error("⚠️ [Cart] Email notification failed:", emailError);
      }

      // Clear cart and show confirmation
      clearCartByType("service");
      setShowConfirmation(true);

      // Reset form
      setSpecialInstructions("");
      setRequestDate("");
      setRequestTime("");

      // Call success callback
      onCheckoutSuccess?.();

      // Close confirmation after 2 seconds
      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit requests";

      alert(
        `Request failed: ${errorMessage}\nPlease try again or contact reception.`
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
        title="Services Cart"
        fullHeight={false}
      >
        {isEmpty ? (
          // Empty State
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Add some services to get started
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-[80vh]">
            {/* Cart Items - Scrollable with more space */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {/* Service Items */}
              <div className="space-y-3">
                {serviceItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 bg-white border border-gray-200 rounded-lg p-3"
                  >
                    {/* Service Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image_url || "https://via.placeholder.com/80"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Service Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Details Form - Compact */}
            <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 space-y-2.5 bg-gray-50 max-h-[45vh] overflow-y-auto">
              {/* Request Date */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Request Date *
                </label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  min={today}
                  required
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Request Time */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  Preferred Time (Optional)
                </label>
                <input
                  type="time"
                  value={requestTime}
                  onChange={(e) => setRequestTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests or preferences..."
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer - Submit Button */}
            <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 bg-white shadow-lg">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isEmpty}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Submit Requests ({serviceItems.length})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showConfirmation}
        title="Requests Submitted!"
        message="Your service requests have been submitted successfully. The hotel staff will process them shortly."
      />
    </>
  );
};
