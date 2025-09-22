// src/services/menuService.js
import apiClient from "./apiClient";

export const createMenuItem = async (menuItemData, imageUri) => {
  try {
    // Create FormData for multipart request
    const formData = new FormData();

    // Add text fields
    formData.append("item_code", menuItemData.item_code);
    formData.append("item_name", menuItemData.item_name);
    formData.append("item_group", menuItemData.item_group);
    formData.append("stock_uom", "Nos"); // Default unit
    formData.append("description", menuItemData.description);
    formData.append("standard_rate", menuItemData.standard_rate);

    // Add image file if provided
    if (imageUri) {
      const filename = `item_${Date.now()}.jpg`;
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: filename,
      });
    }

    const response = await apiClient.post(
      "webshop.item.create_item",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // Increased timeout for file upload
      }
    );

    if (response.data.message.status === "success") {
      return {
        status: "success",
        message: response.data.message.message,
        item: response.data.message.item,
        image: response.data.message.image,
      };
    }

    return {
      status: "error",
      message: response.data.message.message || "Failed to create menu item",
    };
  } catch (error) {
    console.error("Create Menu Item Error:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message?.message ||
        "Network error. Please try again.",
    };
  }
};

// This is the new function to publish/unpublish items for a specific warehouse
export const updateItemPublishStatus = async (
  itemCodes,
  warehouseName,
  isPublish
) => {
  try {
    const payload = {
      item_codes: itemCodes,
      warehouse_name: warehouseName,
      is_publish: isPublish ? "1" : "0", // Frappe API expects "0" or "1" as a string
    };

    // The Frappe backend URL is already in apiClient's baseURL, so we just append the method path
    const response = await apiClient.post(
      "webshop.item.update_item_publish_status",
      payload
    );

    // The backend response is wrapped in a 'message' key
    const result = response.data.message;
    return result;
  } catch (error) {
    console.error("API error in updateItemPublishStatus:", error);
    const errorMessage =
      axios.isAxiosError(error) && error.response
        ? error.response.data.message
        : "Network or server error. Please try again.";
    return { status: "error", message: errorMessage };
  }
};

// --- NEW FUNCTION TO REMOVE ITEM FROM WAREHOUSE MENU ---
export const deleteMenuItem = async (itemCode, warehouseName) => {
  try {
    const response = await apiClient.post(
      "webshop.item.remove_item_from_warehouse_menu",

      {
        item_codes: [itemCode], // The API expects a list of item codes

        warehouse_name: warehouseName,
      }
    );

    if (response.data.message.status === "success") {
      return {
        status: "success",

        message: response.data.message.message,
      };
    }

    return {
      status: "error",

      message:
        response.data.message.message ||
        "Failed to remove item from warehouse menu",
    };
  } catch (error) {
    console.error("Remove Item from Warehouse Menu Error:", error);

    return {
      status: "error",

      message:
        error.response?.data?.message?.message ||
        "Network error. Please try again.",
    };
  }
};

export const getMenuItems = async () => {
  try {
    const response = await apiClient.get("webshop.item.get_item_details");

    if (response.data.message.status === "success") {
      // FIX: The backend now returns the data in an 'items' array, not 'data'.
      const mappedItems = response.data.message.items.map((item) => ({
        id: item.name, // Use item.name (which is the item_code) as a unique ID
        name: item.item_name, // Display name
        price: `₹${item.standard_rate.toFixed(2)}`, // Format price to 2 decimal places
        description: item.description,
        discount: null, // Default or fetch if available from API
        image: item.image
          ? `https://coriander.mozility.com${item.image}`
          : null, // Full image URL
        isVisible: true, // Default to visible when adding to Today's Menu
        item_code: item.name, // The actual item code (e.g., "PASTA")
        item_group: item.item_group,
      }));
      return {
        status: "success",
        message: response.data.message.message,
        data: mappedItems,
      };
    }

    console.error(
      "getMenuItems API returned non-success status:",
      response.data.message
    );
    return {
      status: "error",
      message:
        response.data.message.message ||
        "Failed to retrieve menu items (backend reported error)",
    };
  } catch (error) {
    console.error("Caught error in getMenuItems:", error); // Log the full error object

    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
      console.error("Error Response Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error Request (No response received):", error.request);
    } else {
      console.error("Error Message (Request setup issue):", error.message);
    }

    return {
      status: "error",
      message:
        error.response?.data?.message?.message ||
        error.message || // Fallback to network error message
        "Network error. Please try again.",
    };
  }
};

export const updateMenuItem = async (itemCode, updatedData) => {
  try {
    console.log(
      `Simulating update for item ${itemCode} with data:`,
      updatedData
    );

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate a successful response
    return {
      status: "success",
      message: "Item updated successfully (simulated).",
      // If your API returns the updated item or new image path, include it here
      image: updatedData.image, // Return the image back for local update
    };
  } catch (error) {
    console.error("Update Menu Item Error:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message?.message ||
        "Network error. Please try again.",
    };
  }
};

// NEW API CALL FUNCTION: Add items to warehouse menu

export const addItemsToWarehouseMenu = async (
  itemCodes,
  warehouseName,
  date
) => {
  try {
    const payload = {
      item_codes: itemCodes,
      warehouse_name: warehouseName,
      date, // take date from argument
    };
 
    const response = await apiClient.post(
      "webshop.item.add_items_to_warehouse_menu",
      payload
    );
    return response.data.message;
  } catch (error) {
    return {
      status: "error",
      message:
        error.response?.data?.message?.message ||
        "Failed to add items to warehouse menu. Network error.",
    };
  }
};

export const getTodaysMenuItems = async (warehouseName) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    console.log(
      `Fetching today's items for warehouse: ${warehouseName} on ${today}`
    );

    const response = await apiClient.post(
      "webshop.item.get_item_mappings_weekly",
      { company: warehouseName } // Now using warehouse name directly
    );

    if (response.data.message) {
      const todaysItems = response.data.message
        .filter((item) => item.Date === today)
        .map((item) => ({
          id: item.mapping_id,
          name: item.item_name,
          price: `₹${item.standard_rate.toFixed(2)}`,
          description: item.description,
          image: item.image
            ? `https://coriander.mozility.com${item.image}`
            : null,
          isVisible: item.is_publish === 1,
          item_code: item.item_code,
          item_group: item.item_group,
          date: item.Date,
        }));

      return {
        status: "success",
        data: todaysItems,
      };
    }

    return {
      status: "success",
      data: [],
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error.response?.data?.message || "Failed to fetch today's menu items",
    };
  }
};

// Add this function to menuService.js
export const getWeeklyMenuItems = async (warehouseName) => {
  try {
    const response = await apiClient.post(
      "webshop.item.get_item_mappings_weekly",
      { company: warehouseName }
    );

    if (response.data.message) {
      return {
        status: "success",
        data: response.data.message,
      };
    }

    return {
      status: "success",
      data: [],
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error.response?.data?.message || "Failed to fetch weekly menu items",
    };
  }
};

export const addStock = async (itemCode, targetWarehouse, quantity) => {
  try {
    const response = await apiClient.post("webshop.item.add_stock", {
      item_code: itemCode,
      target_warehouse: targetWarehouse,
      qty: parseFloat(quantity), // Ensure it's sent as a number
    });

    if (response.data.message.status === "success") {
      return {
        status: "success",
        message: response.data.message.message,
        stockEntry: response.data.message.stock_entry,
      };
    }

    return {
      status: "error",
      message: response.data.message.message || "Failed to update stock",
    };
  } catch (error) {
    console.error("Add Stock Error:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message?.message ||
        "Network error. Please try again.",
    };
  }
};

// Add this to your services/menuService.js
export const getInventoryData = async (warehouse) => {
  try {
    const response = await apiClient.get(
      `webshop.item.get_bin_data_by_warehouse`,
      { params: { warehouse } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDailyOrders = async (warehouse) => {
  try {
    const response = await apiClient.get(`webshop.item.get_daily_order`, {
      params: { warehouse },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getWeeklyOrders = async (warehouse) => {
  try {
    const response = await apiClient.get(`webshop.item.get_weekly_order`, {
      params: { warehouse },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMonthlyOrders = async (warehouse) => {
  try {
    const response = await apiClient.get(`webshop.item.get_monthly_orders`, {
      params: { warehouse },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDateRangeOrders = async (warehouse, fromDate, toDate) => {
  try {
    const response = await apiClient.get(
      `webshop.item.get_orders_by_date_range`,
      { params: { warehouse, from_date: fromDate, to_date: toDate } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getItemsByWarehouse = async (warehouse, fromDate, toDate) => {
  try {
    const response = await apiClient.get(
      "webshop.item.get_items_by_warehouse",
      {
        params: { warehouse, from_date: fromDate, to_date: toDate },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Item groups for dropdown
export const ITEM_GROUPS = [
  { label: "Breakfast", value: "Breakfast" },
  { label: "Lunch", value: "Lunch" },
  { label: "Dinner", value: "Dinner" },
];

// Validate item code format (optional helper)
export const validateItemCode = (itemCode) => {
  if (!itemCode || !itemCode.trim()) {
    return { valid: false, message: "Item code is required" };
  }

  if (itemCode.length < 2) {
    return { valid: false, message: "Item code must be at least 2 characters" };
  }

  // Check for special characters (optional)
  if (!/^[A-Z0-9_-]+$/i.test(itemCode)) {
    return {
      valid: false,
      message:
        "Item code can only contain letters, numbers, hyphens and underscores",
    };
  }

  return { valid: true };
};
