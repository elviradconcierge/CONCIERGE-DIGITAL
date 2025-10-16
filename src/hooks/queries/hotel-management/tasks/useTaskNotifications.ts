/**
 * Task Notification Hook
 *
 * Sends email notifications to staff members when tasks are assigned
 */

import { supabase } from "../../../../lib/supabase";

export interface TaskNotificationResponse {
  success: boolean;
  staff: {
    staffName: string;
    staffEmail: string;
  };
  emailResult: unknown;
}

/**
 * Sends email notification for a newly created task
 *
 * @param taskId - ID of the task to send notification for
 * @returns Promise with notification result
 */
export const sendTaskNotification = async (
  taskId: string
): Promise<TaskNotificationResponse> => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 [START] Sending email notification");
  console.log("📋 Task ID:", taskId);

  try {
    // Get the current session to pass the JWT
    console.log("🔐 Getting session...");
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error("❌ No active session");
      throw new Error("No active session");
    }

    console.log("✅ Session found");
    console.log("📋 User ID:", session.user.id);
    console.log("📋 Token length:", session.access_token.length);

    // Call the edge function
    console.log("🚀 Invoking edge function: send-task-notifications-email");
    console.log("📋 Request body:", JSON.stringify({ taskId }));

    const startTime = Date.now();

    const { data, error } = await supabase.functions.invoke(
      "send-task-notifications-email",
      {
        body: { taskId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const duration = Date.now() - startTime;
    console.log(`⏱️ Response time: ${duration}ms`);

    if (error) {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ [ERROR] Edge function error:");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("Message:", error.message);
      console.error("Context:", error.context);
      console.error("Name:", error.name);
      console.error("Full error:", JSON.stringify(error, null, 2));
      throw error;
    }

    if (!data) {
      console.error("❌ No data returned from edge function");
      throw new Error("No response from email service");
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ [SUCCESS] Email sent!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Staff:", data?.staff?.staffName);
    console.log("📧 Email:", data?.staff?.staffEmail);
    console.log("📧 Result:", data?.emailResult);

    return data;
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("💥 [EXCEPTION] Task notification failed");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Error:", error);

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    throw error;
  }
};

/**
 * Hook to send task notification (can be used independently)
 *
 * @returns Function to send notification for a task
 */
export const useSendTaskNotification = () => {
  return {
    sendNotification: sendTaskNotification,
  };
};
