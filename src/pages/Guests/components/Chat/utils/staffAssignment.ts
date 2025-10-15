/**
 * Staff Assignment Utilities
 *
 * Find and assign suitable staff members for guest conversations
 */

import { supabase } from "../../../../../lib/supabase";

interface StaffPersonalData {
  first_name: string;
  last_name: string;
}

interface StaffQueryResult {
  id: string;
  employee_id: string;
  position: string;
  department: string;
  hotel_staff_personal_data: StaffPersonalData[] | null;
}

/**
 * Find a suitable staff member for the guest conversation
 * Priority: Manager > Reception staff
 * Returns hotel_staff.id to assign to conversation
 */
export const findAvailableStaff = async (
  hotelId: string
): Promise<string | null> => {
  // Query hotel staff with Manager or Reception department
  const { data: staffData, error } = await supabase
    .from("hotel_staff")
    .select(
      `
      id,
      employee_id,
      position,
      department,
      hotel_staff_personal_data!hotel_staff_staff_personal_data_id_fkey(
        first_name,
        last_name
      )
    `
    )
    .eq("hotel_id", hotelId)
    .in("position", ["Hotel Admin", "Hotel Staff"])
    .in("department", ["Manager", "Reception"])
    .eq("status", "active")
    .order("department", { ascending: true }) // Manager first
    .limit(1);

  if (error) {
    console.error("❌ [staffAssignment] Error finding staff:", error);
    return null;
  }

  if (staffData && staffData.length > 0) {
    const staff = staffData[0] as StaffQueryResult;

    // Return hotel_staff.id which will be assigned to guest_conversation.assigned_staff_id
    return staff.id;
  }

  return null;
};
