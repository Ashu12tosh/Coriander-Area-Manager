// import React from "react";
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// export default function CustomAlert({
//   visible,
//   title,
//   message,
//   onClose,
//   type = "success",
//   showIcon = true,
//   buttonText = "OK",
// }) {
//   if (!visible) return null;

//   const isSuccess = type === "success";
//   const isError = type === "error";
//   const isLoading = type === "loading";
//   const iconName = isSuccess ? "checkmark-circle" : "close-circle";
//   const iconColor = isSuccess ? "#22c55e" : "#ef4444";
//   const buttonColor = isSuccess ? "bg-green-500" : "bg-red-500";

//   const normalizedTitle =
//     typeof title === "string" ? title : title?.toString?.() ?? "";
//   const normalizedMessage =
//     typeof message === "string"
//       ? message
//       : message?.message ?? JSON.stringify(message ?? "");

//   return (
//     <Modal transparent animationType="fade">
//       <View className="flex-1 justify-center items-center bg-black/50">
//         <View className="bg-white rounded-2xl p-6 w-4/5 shadow-lg">
//           <View className="items-center mb-4">
//             {isLoading ? (
//               <ActivityIndicator size="large" color="#22c55e" />
//             ) : showIcon ? (
//               <Ionicons name={iconName} size={48} color={iconColor} />
//             ) : null}
//             <Text className="text-xl font-bold mt-2">{normalizedTitle}</Text>
//           </View>
//           <Text className="text-center text-gray-700 mb-6">
//             {normalizedMessage}
//           </Text>
//           {!isLoading && (
//             <TouchableOpacity
//               onPress={onClose}
//               className={`${buttonColor} py-3 rounded-xl`}
//             >
//               <Text className="text-white text-center font-medium">
//                 {buttonText}
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// }

import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CustomAlert({
  visible,
  title,
  message,
  onClose,
  type = "success",
  showIcon = true,
  buttonText = "OK",
  autoDismiss = true, // New prop to control auto-dismiss
  dismissTime = 4500, // New prop to set dismiss time (3 seconds default)
}) {
  useEffect(() => {
    if (visible && autoDismiss && type !== "loading") {
      const timer = setTimeout(() => {
        onClose();
      }, dismissTime);

      return () => clearTimeout(timer); // Cleanup on unmount or when visible changes
    }
  }, [visible, autoDismiss, type, dismissTime, onClose]);

  if (!visible) return null;

  const isSuccess = type === "success";
  const isError = type === "error";
  const isLoading = type === "loading";
  const iconName = isSuccess ? "checkmark-circle" : "close-circle";
  const iconColor = isSuccess ? "#22c55e" : "#ef4444";
  const buttonColor = isSuccess ? "bg-green-500" : "bg-red-500";

  const normalizedTitle =
    typeof title === "string" ? title : title?.toString?.() ?? "";
  const normalizedMessage =
    typeof message === "string"
      ? message
      : message?.message ?? JSON.stringify(message ?? "");

  return (
    <Modal transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 w-4/5 shadow-lg">
          <View className="items-center mb-4">
            {isLoading ? (
              <ActivityIndicator size="large" color="#22c55e" />
            ) : showIcon ? (
              <Ionicons name={iconName} size={48} color={iconColor} />
            ) : null}
            <Text className="text-xl font-bold mt-2">{normalizedTitle}</Text>
          </View>
          <Text className="text-center text-gray-700 mb-6">
            {normalizedMessage}
          </Text>
          {!isLoading && (
            <TouchableOpacity
              onPress={onClose}
              className={`${buttonColor} py-3 rounded-xl`}
            >
              <Text className="text-white text-center font-medium">
                {buttonText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
