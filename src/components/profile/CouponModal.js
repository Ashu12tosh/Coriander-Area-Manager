// // src/components/profile/CouponModal.js
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Modal,
//   ScrollView,
// } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";

// const CouponModal = ({ visible, onClose, onShowAlert }) => {
//   const [orderStatus, setOrderStatus] = useState("delivered");

//   return (
//     <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
//       <View className="flex-1 bg-white">
//         <View className="bg-green-500 px-4 py-4 flex-row items-center">
//           <TouchableOpacity onPress={onClose} className="mr-3">
//             <Ionicons name="arrow-back" size={24} color="white" />
//           </TouchableOpacity>
//           <Text className="text-white text-lg font-bold">
//             Coupon Management
//           </Text>
//         </View>

//         <ScrollView className="flex-1 px-4 py-4">
//           <Text className="mb-1 font-medium text-base">Order ID</Text>
//           <View className="flex-row mb-6">
//             <TextInput
//               placeholder="1234567890"
//               className="bg-gray-100 border px-4 py-3 rounded-lg flex-1 mr-2 text-base"
//             />
//             <TouchableOpacity className="bg-green-500 px-5 py-3 rounded-lg justify-center">
//               <Text className="text-white font-semibold">Search</Text>
//             </TouchableOpacity>
//           </View>

//           <Text className="text-lg font-bold text-green-700 mb-4">
//             Update Details
//           </Text>

//           <View className="space-y-3 mb-6">
//             {["delivered", "not-delivered"].map((status) => (
//               <TouchableOpacity
//                 key={status}
//                 className="flex-row items-center py-2"
//                 onPress={() => setOrderStatus(status)}
//               >
//                 <Ionicons
//                   name={
//                     orderStatus === status
//                       ? "radio-button-on"
//                       : "radio-button-off"
//                   }
//                   size={20}
//                   color={orderStatus === status ? "#16a34a" : "#9ca3af"}
//                   className="mr-3"
//                 />
//                 <Text className="text-base">
//                   Order {status === "delivered" ? "Delivered" : "Not Delivered"}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
//             <View className="flex-row justify-between">
//               <Text className="text-gray-600">Ordered By:</Text>
//               <Text className="font-semibold">Harshit Sharma</Text>
//             </View>
//             <View className="flex-row justify-between">
//               <Text className="text-gray-600">Ordered On:</Text>
//               <Text className="font-semibold">21 May 2025</Text>
//             </View>
//             <View className="flex-row justify-between">
//               <Text className="text-gray-600">Order Amount:</Text>
//               <Text className="font-semibold">INR 250</Text>
//             </View>
//           </View>

//           <View className="flex-row justify-between items-center mb-6 bg-gray-50 p-4 rounded-lg">
//             <Text className="text-gray-600">Refund Amount:</Text>
//             <View className="flex-row items-center">
//               <TextInput
//                 placeholder="0"
//                 className="bg-white border px-3 py-2 rounded w-24 text-center text-base"
//                 keyboardType="numeric"
//               />
//               <Text className="ml-2 font-medium">INR</Text>
//             </View>
//           </View>

//           <TouchableOpacity
//             className="bg-green-500 py-4 rounded-lg mt-4 mb-8"
//             onPress={() => {
//               onShowAlert(
//                 "Success",
//                 "Coupon generated successfully",
//                 "success"
//               );
//               onClose();
//             }}
//           >
//             <Text className="text-white text-center font-semibold text-base">
//               Generate & Share Coupon Code
//             </Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>
//     </Modal>
//   );
// };

// export default CouponModal;
