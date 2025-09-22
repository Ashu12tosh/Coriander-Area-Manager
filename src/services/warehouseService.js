import apiClient from "./apiClient";

export const getWarehouseMappings = async () => {
  try {
    const response = await apiClient.get("webshop.api.get_child_warehouses", {
      params: {
        parent_warehouse: "Coriander Warehouse - CFPL",
      },
    });

    if (response.data.message.status === "success") {
      return {
        status: "success",
        data: response.data.message.data,
      };
    }

    return {
      status: "error",
      message:
        response.data.message.message || "Failed to fetch warehouse mappings",
    };
  } catch (error) {
    console.error("Get Warehouse Mappings Error:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message?.message ||
        "Network error. Please try again.",
    };
  }
};
