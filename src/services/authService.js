// src/services/authService.js
import apiClient from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const sendOtp = async (mobileNumber) => {
  try {
    const response = await apiClient.post("webshop.api.send_otp", {
      mobile: mobileNumber,
      purpose: "login",
    });

    if (response.data.message.status === "success") {
      return {
        status: "success",
        message: response.data.message.message,
        otp: response.data.message.otp, // Note: In production, you wouldn't receive the actual OTP
      };
    }

    return {
      status: "error",
      message: response.data.message.message || "Failed to send OTP",
    };
  } catch (error) {
    console.error("OTP Send Error:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message?.message ||
        "Network error. Please try again.",
    };
  }
};

// export const verifyOtp = async (mobileNumber, otp) => {
//   try {
//     const response = await apiClient.post("webshop.api.login", {
//       mobile: mobileNumber,
//       otp: otp,
//     });

//     const responseData = response.data;

//     if (responseData.message.status === "success") {
//       // Save user data in AsyncStorage
//       await AsyncStorage.setItem(
//         "user",
//         JSON.stringify({
//           mobile: mobileNumber,
//           ...responseData.message.user, // if there's additional user data
//         })
//       );

//       return {
//         status: "success",
//         user: responseData.message.user,
//       };
//     }

//     return {
//       status: "error",
//       message: responseData.message.message,
//       errorCode: responseData.message.error_code,
//     };
//   } catch (error) {
//     console.error("Login Error:", error);
//     return {
//       status: "error",
//       message:
//         error.response?.data?.message?.message ||
//         "Network error. Please try again.",
//     };
//   }
// };

export const verifyOtp = async (mobileNumber, otp) => {
  try {
    const response = await apiClient.post("webshop.api.login", {
      mobile: mobileNumber,
      otp: otp,
    });

    const responseData = response.data;

    if (responseData.message.status === "success") {
      // Save user data in AsyncStorage with full response
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          mobile: mobileNumber,
          name: responseData.full_name, // Add name from response
          email: responseData.message.user, // Add email from response
          // Save the entire response for future use if needed
          responseData: responseData,
        })
      );

      return {
        status: "success",
        user: {
          mobile: mobileNumber,
          name: responseData.full_name,
          email: responseData.message.user,
        },
        fullResponse: responseData,
      };
    }

    return {
      status: "error",
      message: responseData.message.message,
      errorCode: responseData.message.error_code,
    };
  } catch (error) {
    console.error("Login Error:", error);
    return {
      status: "error",
      message:
        error.response?.data?.message?.message ||
        "Network error. Please try again.",
    };
  }
};
export const checkExistingSession = async () => {
  try {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Session Check Error:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    // Clear AsyncStorage
    await AsyncStorage.removeItem("user");

    // If your backend has a logout endpoint, you can call it here
    // await apiClient.post('webshop.api.logout');

    return { status: "success" };
  } catch (error) {
    console.error("Logout Error:", error);
    return { status: "error", message: "Logout failed" };
  }
};
