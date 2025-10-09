import apiClient from "./apiClient";

export const sendNotification = async ({ warehouse, userType, message }) => {
  try {
    const response = await apiClient.post("/api/method/coriander_shop.item.send_notification", {
      warehouse,
      user_type: userType,
      message,
    });

    if (response.data.message.status === "success") {
      return {
        status: "success",
        data: response.data.message.data,
      };
    }

    return {
      status: "error",
      message: response.data.message.message || "Failed to send notification",
    };
  } catch (error) {
    console.error("Send Notification Error:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message?.message ||
        "Network error. Please try again.",
    };
  }
};
