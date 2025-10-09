// import apiClient from "./apiClient";

// /**
//  * Fetches all ordered items for a given date range and warehouse
//  */
// export const getAllOrderedItems = async (fromDate, toDate, warehouse) => {
//   try {
//     const response = await apiClient.post("/api/method/coriander_shop.item.get_all_ordered_items", {
//       from_date: fromDate,
//       to_date: toDate,
//       warehouse: warehouse,
//     });

//     if (response.data.message.message) {
//       return {
//         status: "success",
//         data: response.data.message.message,
//       };
//     }

//     return {
//       status: "error",
//       message: "No data found",
//       data: [],
//     };
//   } catch (error) {
//     console.error("Get All Ordered Items Error:", error);
//     return {
//       status: "error",
//       message:
//         error.response?.data?.message ||
//         "Network error. Please try again.",
//       data: [],
//     };
//   }
// };

// /**
//  * Fetches daily wastage report for a given date range and warehouse
//  */
// export const getDailyWastageReport = async (fromDate, toDate, warehouse) => {
//   try {
//     const response = await apiClient.post(
//       "/api/method/coriander_shop.item.get_daily_wastage_report",
//       {
//         from_date: fromDate,
//         to_date: toDate,
//         warehouse: warehouse,
//       }
//     );

//     if (response.data.message) {
//       return {
//         status: "success",
//         data: response.data.message,
//       };
//     }

//     return {
//       status: "error",
//       message: "No data found",
//       data: [],
//     };
//   } catch (error) {
//     console.error("Get Daily Wastage Report Error:", error);
//     return {
//       status: "error",
//       message:
//         error.response?.data?.message ||
//         "Network error. Please try again.",
//       data: [],
//     };
//   }
// };

// /**
//  * Fetches canceled items by warehouse for a given date range
//  */
// export const getCanceledItems = async (fromDate, toDate, warehouse) => {
//   try {
//     const response = await apiClient.post(
//       "/api/method/coriander_shop.item.get_canceled_items_by_warehouse",
//       {
//         from_date: fromDate,
//         to_date: toDate,
//         warehouse: warehouse,
//       }
//     );

//     if (response.data.message) {
//       return {
//         status: "success",
//         data: response.data.message,
//       };
//     }

//     return {
//       status: "error",
//       message: "No data found",
//       data: [],
//     };
//   } catch (error) {
//     console.error("Get Canceled Items Error:", error);
//     return {
//       status: "error",
//       message:
//         error.response?.data?.message ||
//         "Network error. Please try again.",
//       data: [],
//     };
//   }
// };


import apiClient from "./apiClient";

/**
 * Fetches all ordered items for a given date range and warehouse(s)
 * Supports both single warehouse and multiple warehouses (comma-separated)
 */
export const getAllOrderedItems = async (fromDate, toDate, warehouse) => {
  try {
    const response = await apiClient.post("/api/method/coriander_shop.item.get_all_ordered_items", {
      from_date: fromDate,
      to_date: toDate,
      warehouse: warehouse,
    });

    if (response.data.message && response.data.message.message) {
      return {
        status: "success",
        data: response.data.message.message,
      };
    }

    return {
      status: "error",
      message: "No data found",
      data: [],
    };
  } catch (error) {
    console.error("Get All Ordered Items Error:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message ||
        "Network error. Please try again.",
      data: [],
    };
  }
};

/**
 * Fetches daily wastage report for a given date range and warehouse(s)
 * Supports both single warehouse and multiple warehouses (comma-separated)
 */
export const getDailyWastageReport = async (fromDate, toDate, warehouse) => {
  try {
    const response = await apiClient.post(
      "/api/method/coriander_shop.item.get_daily_wastage_report",
      {
        from_date: fromDate,
        to_date: toDate,
        warehouse: warehouse,
      }
    );

    if (response.data && response.data.message) {
      return {
        status: "success",
        data: response.data.message,
      };
    }

    return {
      status: "error",
      message: "No data found",
      data: [],
    };
  } catch (error) {
    console.error("Get Daily Wastage Report Error:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message ||
        "Network error. Please try again.",
      data: [],
    };
  }
};

/**
 * Fetches canceled items by warehouse(s) for a given date range
 * Supports both single warehouse and multiple warehouses (comma-separated)
 */
export const getCanceledItems = async (fromDate, toDate, warehouse) => {
  try {
    const response = await apiClient.post(
      "/api/method/coriander_shop.item.get_canceled_items_by_warehouse",
      {
        from_date: fromDate,
        to_date: toDate,
        warehouse: warehouse,
      }
    );

    if (response.data && response.data.message) {
      return {
        status: "success",
        data: response.data.message,
      };
    }

    return {
      status: "error",
      message: "No data found",
      data: [],
    };
  } catch (error) {
    console.error("Get Canceled Items Error:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message ||
        "Network error. Please try again.",
      data: [],
    };
  }
};