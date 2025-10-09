import apiClient from "./apiClient";

export const getUsersByWarehouses = async () => {
  try {
    const response = await apiClient.get(
      "/api/method/coriander_shop.item.get_users_by_warehouses"
    );
    
    if (response.data.message.status === "success") {
      return {
        status: "success",
        data: response.data.message.data,
      };
    } else {
      return {
        status: "error",
        message: response.data.message.message || "Failed to fetch users data",
      };
    }
  } catch (error) {
    console.error("Get Users by Warehouses Error:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message?.message ||
        "Network error. Failed to fetch users data.",
    };
  }
};