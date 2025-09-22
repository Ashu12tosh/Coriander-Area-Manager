// import apiClient from "./apiClient";

// export const getSalesInvoiceItems = async (invoiceName) => {
//   try {
//     const response = await apiClient.get(
//       "webshop.item.get_sales_invoice_items", // no /api/method prefix here, apiClient should already handle it
//       {
//         params: { invoice_name: invoiceName },
//       }
//     );

//     if (response.data?.message) {
//       return {
//         status: "success",
//         data: response.data.message,
//       };
//     }

//     return {
//       status: "error",
//       message: "Failed to fetch sales invoice items",
//     };
//   } catch (error) {
//     console.error("Error fetching sales invoice items:", error);
//     return {
//       status: "error",
//       message:
//         error.response?.data?.message || "Network error. Please try again.",
//     };
//   }
// };

import apiClient from "./apiClient";

export const getSalesInvoiceItems = async (invoiceName) => {
  try {
    const response = await apiClient.get(
      "webshop.item.get_sales_invoice_items",
      {
        params: { invoice_name: invoiceName },
      }
    );

    if (response.data?.message) {
      return {
        status: "success",
        data: response.data.message,
      };
    }

    return {
      status: "error",
      message: "Failed to fetch sales invoice items",
    };
  } catch (error) {
    console.error("Error fetching sales invoice items:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message || "Network error. Please try again.",
    };
  }
};

// ✅ New API call to create delivery note
// export const deliverSalesInvoice = async (salesInvoiceName) => {
//   try {
//     const response = await apiClient.post(
//       "webshop.item.make_delivery_note_with_qty_check",
//       { sales_invoice_name: salesInvoiceName }
//     );

//     // ERPNext usually returns { message: "<Delivery Note Name>" }
//     if (response.data?.message) {
//       return {
//         status: "success",
//         deliveryNote: response.data.message,
//       };
//     }

//     return {
//       status: "error",
//       message: "Failed to create delivery note",
//     };
//   } catch (error) {
//     console.error("Error delivering sales invoice:", error);
//     return {
//       status: "error",
//       message:
//         error.response?.data?.message || "Network error. Please try again.",
//     };
//   }
// };

// ✅ Updated API call to create delivery note with both error handling
export const deliverSalesInvoice = async (salesInvoiceName) => {
  try {
    const response = await apiClient.post(
      "webshop.item.make_delivery_note_with_qty_check",
      { sales_invoice_name: salesInvoiceName }
    );

    // ERPNext usually returns { message: "<Delivery Note Name>" }
    if (response.data?.message) {
      return {
        status: "success",
        deliveryNote: response.data.message,
      };
    }

    return {
      status: "error",
      message: "Failed to create delivery note",
    };
  } catch (error) {
    console.error("Error delivering sales invoice:", error);

    // Check if it's a stock error (NegativeStockError)
    if (error.response?.data?.exc_type === "NegativeStockError") {
      return {
        status: "out_of_stock",
        message: "Insufficient stock available for this item.",
      };
    }

    // Check if it's an already delivered error (OverAllowanceError)
    if (error.response?.data?.exc_type === "OverAllowanceError") {
      return {
        status: "already_delivered",
        message: "Delivery already performed for this invoice.",
      };
    }

    // Handle other errors
    return {
      status: "error",
      message:
        error.response?.data?.message || "Network error. Please try again.",
    };
  }
};

// ✅ New API call to generate coupon
// export const makeDeliveryOrCoupon = async (salesInvoiceName) => {
//   try {
//     const response = await apiClient.post(
//       "webshop.item.make_delivery_or_coupon",
//       { sales_invoice_name: salesInvoiceName }
//     );

//     // Handle different possible response formats
//     if (response.data?.message) {
//       return {
//         status: "success",
//         message: response.data.message,
//         coupon: response.data.message,
//       };
//     }

//     return {
//       status: "error",
//       message: "Failed to generate coupon - no response data",
//     };
//   } catch (error) {
//     console.error("Error generating coupon:", error);

//     // Handle different error scenarios
//     let errorMessage = "Network error. Please try again.";

//     if (error.response?.data?.message) {
//       errorMessage = error.response.data.message;
//     } else if (error.response?.data?.exc) {
//       errorMessage = error.response.data.exc;
//     } else if (error.message) {
//       errorMessage = error.message;
//     }

//     return {
//       status: "error",
//       message: errorMessage,
//     };
//   }
// };

// ✅ Updated API call to generate coupon with refund amount
export const makeDeliveryOrCoupon = async (
  salesInvoiceName,
  discountValue = 0
) => {
  try {
    const response = await apiClient.post(
      "webshop.item.make_delivery_or_coupon",
      {
        sales_invoice_name: salesInvoiceName,
        discount_value: discountValue,
      }
    );

    // Handle different possible response formats
    if (response.data?.message) {
      // Check if coupon is already generated
      if (response.data.message.status === "already_coupon_generated") {
        return {
          status: "already_generated",
          message: "Coupon already generated for this invoice",
          coupon: response.data.message.coupon_code,
          couponDetails: response.data.message,
        };
      }

      return {
        status: "success",
        message: response.data.message,
        coupon: response.data.message,
      };
    }

    return {
      status: "error",
      message: "Failed to generate coupon - no response data",
    };
  } catch (error) {
    console.error("Error generating coupon:", error);

    // Handle 417 status code specifically
    if (error.response?.status === 417) {
      return {
        status: "error",
        message: "Failed to generate coupon",
      };
    }

    // Handle other error scenarios
    let errorMessage = "Network error. Please try again.";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.exc) {
      errorMessage = error.response.data.exc;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      status: "error",
      message: errorMessage,
    };
  }
};

// Add this function to salesInvoiceService.js
export const createCoupon = async (salesInvoiceName, discountValue = 0) => {
  try {
    const response = await apiClient.post("webshop.item.create_coupon", {
      sales_invoice_name: salesInvoiceName,
      discount_value: discountValue,
    });

    if (response.data?.message) {
      return {
        status: "success",
        coupon: response.data.message.coupon_code,
        couponDetails: response.data.message,
      };
    }

    return {
      status: "error",
      message: "Failed to create coupon - no response data",
    };
  } catch (error) {
    console.error("Error creating coupon:", error);

    // Handle coupon already exists error
    if (
      error.response?.data?.exc_type === "ValidationError" &&
      error.response?.data?.exception?.includes("Coupon already exists")
    ) {
      return {
        status: "already_generated",
        message: "Coupon already exists for this Sales Invoice",
      };
    }

    // Handle other error scenarios
    let errorMessage = "Network error. Please try again.";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.exc) {
      errorMessage = error.response.data.exc;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      status: "error",
      message: errorMessage,
    };
  }
};

export const checkCouponForInvoice = async (invoiceName) => {
  try {
    const response = await apiClient.get(
      "webshop.item.check_coupon_for_invoice",
      { params: { invoice_name: invoiceName } }
    );

    if (response.data?.message) {
      return response.data.message; // contains { status, coupon }
    }
    return { status: "error", message: "Unexpected response" };
  } catch (error) {
    console.error("Error checking coupon:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message || "Network error. Please try again.",
    };
  }
};

export const getActiveCoupons = async () => {
  try {
    const response = await apiClient.get(
      "webshop.item.get_active_coupons_submanager"
    );

    if (response.data?.message?.status === "success") {
      return {
        status: "success",
        data: response.data.message.coupons,
      };
    }

    return {
      status: "error",
      message: "Failed to fetch active coupons",
    };
  } catch (error) {
    console.error("Error fetching active coupons:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message || "Network error. Please try again.",
    };
  }
};
