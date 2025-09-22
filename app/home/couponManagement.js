// // app/home/couponManagement.js
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   SafeAreaView,
//   Modal,
//   ActivityIndicator,
//   RefreshControl,
// } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useRouter } from "expo-router";
// import { useDispatch, useSelector } from "react-redux";
// import { setSelectedWarehouse } from "../../src/redux/slices/warehouseSlice";
// import CustomAlert from "../../src/components/alert/CUstomAlert";
// import { CameraView, useCameraPermissions } from "expo-camera";
// import {
//   getSalesInvoiceItems,
//   makeDeliveryOrCoupon,
//   createCoupon,
//   checkCouponForInvoice,
// } from "../../src/services/salesInvoiceService";

// export default function CouponManagementScreen() {
//   const router = useRouter();
//   const dispatch = useDispatch();

//   // ✅ Helper function to format date and time
//   const formatDateTime = (dateTimeString) => {
//     if (!dateTimeString) return "Unknown Date";

//     try {
//       const date = new Date(dateTimeString);

//       // Format date as "22 Aug 2025"
//       const formattedDate = date.toLocaleDateString("en-US", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       });

//       // Format time as "12:59 PM"
//       const formattedTime = date.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       });

//       return `${formattedDate} at ${formattedTime}`;
//     } catch (error) {
//       console.error("Error formatting date:", error);
//       return dateTimeString; // Return original if parsing fails
//     }
//   };

//   // ✅ Hooks should be here
//   const [alertState, setAlertState] = useState({
//     visible: false,
//     title: "",
//     message: "",
//     type: "success",
//   });

//   // ✅ QR Scanner State
//   const [cameraPermission, requestPermission] = useCameraPermissions();
//   const [scanning, setScanning] = useState(false);

//   // Get warehouse data from Redux
//   const { warehouses, selectedWarehouse } = useSelector(
//     (state) => state.warehouse
//   );

//   const [refundAmount, setRefundAmount] = useState("");
//   const [orderStatus, setOrderStatus] = useState("delivered");
//   const [orderId, setOrderId] = useState("");
//   const [invoiceItems, setInvoiceItems] = useState([]);
//   const [invoiceLoading, setInvoiceLoading] = useState(false);
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [generatingCoupon, setGeneratingCoupon] = useState(false); // Loading state for coupon generation

//   // Calculate subtotal from invoice items
//   // ✅ Calculate subtotal according to Bill Summary
//   const calculateSubtotal = () => {
//     const total = invoiceItems.reduce((sum, i) => sum + i.rate * i.qty, 0);

//     const discount = invoiceItems.reduce(
//       (sum, i) => sum + (i.distributed_discount_amount || 0),
//       0
//     );

//     const tax = 0; // Hardcoded for now

//     return total - discount + tax;
//   };

//   const showAlert = (title, message, type = "success") => {
//     setAlertState({
//       visible: true,
//       title,
//       message,
//       type,
//     });
//   };

//   // Function to clear all data
//   const clearData = () => {
//     setOrderId("");
//     setInvoiceItems([]);
//     setOrderDetails(null);
//     setRefundAmount("");
//   };

//   // Pull to refresh handler
//   const onRefresh = () => {
//     setRefreshing(true);
//     clearData();
//     setRefreshing(false);
//   };

//   const handleWarehouseSelect = (warehouse) => {
//     dispatch(setSelectedWarehouse(warehouse));
//   };

//   const handleGenerateCoupon = async () => {
//     if (!orderId) {
//       showAlert("Error", "Please scan or enter an order ID first", "error");
//       return;
//     }

//     if (!refundAmount || parseFloat(refundAmount) <= 0) {
//       showAlert("Error", "Please enter a valid refund amount", "error");
//       return;
//     }

//     setGeneratingCoupon(true);

//     try {
//       let result;

//       if (orderStatus === "delivered") {
//         // Use the new API for delivered orders
//         result = await createCoupon(orderId, parseFloat(refundAmount));

//         if (result.status === "success") {
//           showAlert(
//             "Success",
//             `Coupon created successfully for ₹${refundAmount}: ${result.coupon}`,
//             "success"
//           );
//         } else if (result.status === "already_generated") {
//           showAlert(
//             "Coupon Already Created",
//             `A coupon was already created for this invoice: ${result.message}`,
//             "info"
//           );
//         } else {
//           showAlert(
//             "Error",
//             "Failed to create coupon cause order delivered is selected for not delivered order",
//             "error"
//           );
//         }
//       } else {
//         // Use the existing API for not delivered orders
//         result = await makeDeliveryOrCoupon(orderId, parseFloat(refundAmount));

//         if (result.status === "success") {
//           showAlert(
//             "Success",
//             `Coupon generated successfully for ₹${refundAmount}: ${
//               result.coupon || result.message
//             }`,
//             "success"
//           );
//         } else if (result.status === "already_generated") {
//           showAlert(
//             "Coupon Already Generated",
//             `A coupon was already generated for this invoice: ${result.coupon}`,
//             "info"
//           );
//         } else {
//           showAlert(
//             "Error",
//             "Failed to generate coupon cause order not delivered is selected for delivered order",
//             "error"
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Error generating coupon:", error);
//       showAlert(
//         "Error",
//         "An unexpected error occurred while generating coupon",
//         "error"
//       );
//     } finally {
//       setGeneratingCoupon(false);
//     }
//   };

//   // ✅ QR Scan handler
//   const handleScanQR = async () => {
//     if (!cameraPermission || !cameraPermission.granted) {
//       const { granted } = await requestPermission();
//       if (!granted) {
//         showAlert(
//           "Permission Required",
//           "Camera access is needed to scan QR codes.",
//           "error"
//         );
//         return;
//       }
//     }
//     setScanning(true); // Open scanner modal
//   };

//   // // ✅ QR Code Scanned callback
//   // const onBarcodeScanned = async ({ type, data }) => {
//   //   setScanning(false); // Close scanner
//   //   console.log(`QR Code Type: ${type}, Data: ${data}`);

//   //   // Auto-fill the order ID field
//   //   setOrderId(data);

//   //   // Optionally, automatically search for the invoice
//   //   handleSearchInvoice(data);
//   // };

//   // ✅ QR Code Scanned callback
//   const onBarcodeScanned = async ({ type, data }) => {
//     setScanning(false); // Close scanner
//     console.log(`QR Code Type: ${type}, Data: ${data}`);

//     // Auto-fill the order ID field
//     setOrderId(data);

//     try {
//       // 🔹 Check if coupon already generated
//       const checkResult = await checkCouponForInvoice(data);

//       if (checkResult?.status === "exists") {
//         showAlert(
//           "Coupon Already Generated",
//           `Coupon ${checkResult.coupon.coupon_code} is already generated for this invoice.`,
//           "info"
//         );
//         return; // stop here, don't proceed
//       }

//       // 🔹 If not found → proceed to search invoice
//       handleSearchInvoice(data);
//     } catch (err) {
//       console.error("Error checking coupon:", err);
//       showAlert("Error", "Failed to check coupon for this invoice", "error");
//     }
//   };

//   // ✅ Search for invoice items
//   const handleSearchInvoice = async (invoiceName = orderId) => {
//     if (!invoiceName) {
//       showAlert("Error", "Please enter an order ID first", "error");
//       return;
//     }

//     setInvoiceLoading(true);
//     try {
//       const result = await getSalesInvoiceItems(invoiceName);
//       console.log("getSalesInvoiceItems result:", result);

//       // Normalize possible response shapes into an array
//       let itemsArray = [];

//       if (Array.isArray(result)) {
//         itemsArray = result;
//       } else if (
//         result &&
//         result.status === "success" &&
//         Array.isArray(result.data)
//       ) {
//         itemsArray = result.data;
//       } else if (
//         result &&
//         result.status === "success" &&
//         result.data &&
//         Array.isArray(result.data.message)
//       ) {
//         itemsArray = result.data.message;
//       } else if (result && Array.isArray(result.message)) {
//         itemsArray = result.message;
//       } else if (result && Array.isArray(result.data)) {
//         itemsArray = result.data;
//       }

//       setInvoiceItems(itemsArray);

//       // Auto-fill refund amount with subtotal
//       // Auto-fill refund amount with subtotal
//       // if (itemsArray.length > 0) {
//       //   const total = itemsArray.reduce((sum, i) => sum + i.rate * i.qty, 0);
//       //   const discount = itemsArray.reduce(
//       //     (sum, i) => sum + (i.distributed_discount_amount || 0),
//       //     0
//       //   );
//       //   const tax = 0; // Hardcoded

//       //   const subtotal = total - discount + tax;
//       //   setRefundAmount(subtotal.toFixed(2).toString());
//       // }

//       // Auto-fill refund amount with (subtotal - 1)
//       if (itemsArray.length > 0) {
//         const total = itemsArray.reduce((sum, i) => sum + i.rate * i.qty, 0);
//         const discount = itemsArray.reduce(
//           (sum, i) => sum + (i.distributed_discount_amount || 0),
//           0
//         );
//         const tax = 0; // Hardcoded

//         const subtotal = total - discount + tax;

//         // Refund default = one less than subtotal (if possible)
//         const defaultRefund = subtotal > 1 ? subtotal - 1 : subtotal;

//         setRefundAmount(defaultRefund.toFixed(2).toString());
//       }

//       // Extract order details from the first item if available
//       if (itemsArray.length > 0) {
//         const firstItem = itemsArray[0];
//         setOrderDetails({
//           orderedBy: firstItem.owner || "Unknown Customer",
//           orderedOn: formatDateTime(firstItem.creation), // Use the formatted date
//           orderAmount: `INR ${itemsArray.reduce(
//             (sum, item) => sum + item.rate * item.qty,
//             0
//           )}`,
//         });
//       } else {
//         setOrderDetails(null);
//         showAlert("No Items", "No order found with this ID", "info");
//       }
//     } catch (err) {
//       console.error("Error fetching sales invoice items:", err);
//       showAlert("Error", "Failed to fetch order details.", "error");
//       setInvoiceItems([]);
//     } finally {
//       setInvoiceLoading(false);
//     }
//   };

//   // Validate refund amount (can't exceed subtotal)
//   // const handleRefundAmountChange = (text) => {
//   //   // Allow only numbers and decimal point
//   //   const numericValue = text.replace(/[^0-9.]/g, "");

//   //   // Check if it's a valid number
//   //   if (numericValue === "" || numericValue === ".") {
//   //     setRefundAmount(numericValue);
//   //     return;
//   //   }

//   //   const amount = parseFloat(numericValue);
//   //   const subtotal = calculateSubtotal();

//   //   // Don't allow amount greater than subtotal
//   //   if (amount > subtotal) {
//   //     showAlert(
//   //       "Validation Error",
//   //       "Refund amount cannot exceed subtotal",
//   //       "error"
//   //     );
//   //     setRefundAmount(subtotal.toString());
//   //   } else {
//   //     setRefundAmount(numericValue);
//   //   }
//   // };
//   const handleRefundAmountChange = (text) => {
//     const numericValue = text.replace(/[^0-9.]/g, "");

//     if (numericValue === "" || numericValue === ".") {
//       setRefundAmount(numericValue);
//       return;
//     }

//     const amount = parseFloat(numericValue);
//     const subtotal = calculateSubtotal();
//     const maxRefund = subtotal > 1 ? subtotal - 1 : subtotal;

//     if (amount > maxRefund) {
//       showAlert(
//         "Validation Error",
//         `Refund amount cannot exceed ₹${maxRefund}`,
//         "error"
//       );
//       setRefundAmount(maxRefund.toFixed(2).toString());
//     } else {
//       setRefundAmount(numericValue);
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-green-50">
//       {/* Custom Header */}
//       <View className="bg-green-50 px-4 py-4 flex-row items-center shadow-sm">
//         <TouchableOpacity
//           onPress={() => router.replace("/home/profile")}
//           className="mr-3"
//         >
//           <Ionicons name="arrow-back" size={24} color="black" />
//         </TouchableOpacity>
//         <Text className="text-black text-lg font-bold">Coupon Management</Text>
//       </View>

//       {/* Scrollable Content with Refresh Control */}
//       <ScrollView
//         className="flex-1 px-4 py-4"
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {/* Order ID Search */}
//         <Text className="mb-2 font-medium text-base text-gray-700">
//           Order ID
//         </Text>
//         <View className="flex-row mb-6 items-center">
//           <TextInput
//             placeholder="Enter Order ID"
//             value={orderId}
//             onChangeText={setOrderId}
//             className="bg-white border border-gray-200 shadow-sm px-4 py-3 rounded-xl flex-1 mr-2 text-base"
//           />
//           <TouchableOpacity
//             className="bg-green-600 p-3 rounded-full mr-2 shadow"
//             onPress={() => handleSearchInvoice()}
//             disabled={invoiceLoading}
//           >
//             {invoiceLoading ? (
//               <ActivityIndicator size="small" color="white" />
//             ) : (
//               <Ionicons name="search" size={20} color="white" />
//             )}
//           </TouchableOpacity>
//           <TouchableOpacity
//             className="bg-green-600 p-3 rounded-full shadow"
//             onPress={() =>
//               showAlert("Info", "Dropdown menu would appear here", "info")
//             }
//           >
//             <Ionicons name="chevron-down" size={20} color="white" />
//           </TouchableOpacity>
//         </View>

//         {/* Update Details */}
//         <Text className="text-lg font-bold text-green-700 mb-4">
//           Update Details
//         </Text>

//         {/* Order Status */}
//         <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
//           {["delivered", "not-delivered"].map((status) => (
//             <TouchableOpacity
//               key={status}
//               className="flex-row items-center py-3 border-b border-gray-100 last:border-0"
//               onPress={() => setOrderStatus(status)}
//             >
//               <Ionicons
//                 name={
//                   orderStatus === status
//                     ? "radio-button-on"
//                     : "radio-button-off"
//                 }
//                 size={22}
//                 color={orderStatus === status ? "#16a34a" : "#9ca3af"}
//               />
//               <Text className="ml-3 text-base text-gray-700">
//                 {status === "delivered"
//                   ? "Order Delivered"
//                   : "Order Not Delivered"}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Order Details - Show only if data is available */}
//         {orderDetails && (
//           <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
//             <View className="flex-row justify-between mb-2">
//               <Text className="text-gray-500">Ordered By:</Text>
//               <Text className="font-semibold text-gray-800">
//                 {orderDetails.orderedBy}
//               </Text>
//             </View>
//             <View className="flex-row justify-between mb-2">
//               <Text className="text-gray-500">Ordered On:</Text>
//               <Text className="font-semibold text-gray-800">
//                 {orderDetails.orderedOn}
//               </Text>
//             </View>
//             <View className="flex-row justify-between">
//               <Text className="text-gray-500">Order Amount:</Text>
//               <Text className="font-semibold text-gray-800">
//                 {orderDetails.orderAmount}
//               </Text>
//             </View>
//           </View>
//         )}

//         {/* Show invoice items if available */}
//         {invoiceItems.length > 0 && (
//           <>
//             {/* Order Items */}
//             <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
//               <Text className="text-lg font-bold text-green-700 mb-3">
//                 Order Items
//               </Text>
//               {invoiceItems.map((item, index) => (
//                 <View
//                   key={index}
//                   className="border-b border-gray-100 py-2 last:border-0"
//                 >
//                   <Text className="font-semibold text-gray-800">
//                     {item.item_name}
//                   </Text>
//                   <Text className="text-gray-600">Qty: {item.qty}</Text>
//                   <Text className="text-gray-600">
//                     Amount: ₹{item.base_amount || item.amount}
//                   </Text>
//                 </View>
//               ))}
//             </View>

//             {/* Bill Summary - Subtotal Only */}
//             {/* <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
//               <Text className="text-lg font-bold text-green-700 mb-3">
//                 Bill Summary
//               </Text>
//               <View className="flex-row justify-between py-1">
//                 <Text className="text-[#499c49]">Subtotal</Text>
//                 <Text className="text-[#0d1c0d]">
//                   ₹{invoiceItems.reduce((sum, i) => sum + i.rate * i.qty, 0)}
//                 </Text>
//               </View>
//             </View> */}
//             {/* Bill Summary - Subtotal Only */}
//             <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
//               <Text className="text-[#0d1c0d] text-lg font-bold px-4 pb-2">
//                 Bill Summary
//               </Text>
//               <View className="px-4">
//                 {/* Total */}
//                 <View className="flex flex-row justify-between py-1">
//                   <Text className="text-[#499c49]">Total</Text>
//                   <Text className="text-[#0d1c0d]">
//                     ₹
//                     {invoiceItems
//                       .reduce((sum, i) => sum + i.rate * i.qty, 0)
//                       .toFixed(2)}
//                   </Text>
//                 </View>

//                 {/* Tax (hardcoded 0) */}
//                 <View className="flex flex-row justify-between py-1">
//                   <Text className="text-[#499c49]">Tax</Text>
//                   <Text className="text-[#0d1c0d]">₹0.00</Text>
//                 </View>

//                 {/* Discount */}
//                 <View className="flex flex-row justify-between py-1">
//                   <Text className="text-[#499c49]">Discount</Text>
//                   <Text className="text-[#0d1c0d]">
//                     ₹
//                     {invoiceItems
//                       .reduce(
//                         (sum, i) => sum + (i.distributed_discount_amount || 0),
//                         0
//                       )
//                       .toFixed(2)}
//                   </Text>
//                 </View>

//                 {/* Sub Total */}
//                 <View className="flex flex-row justify-between py-1 border-t border-gray-200 mt-1 pt-1">
//                   <Text className="text-[#0d1c0d] font-semibold">
//                     Sub Total
//                   </Text>
//                   <Text className="text-[#0d1c0d] font-semibold">
//                     ₹
//                     {(
//                       invoiceItems.reduce((sum, i) => sum + i.rate * i.qty, 0) -
//                       invoiceItems.reduce(
//                         (sum, i) => sum + (i.distributed_discount_amount || 0),
//                         0
//                       )
//                     ).toFixed(2)}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </>
//         )}

//         {/* Refund Amount */}
//         <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
//           <View className="flex-row justify-between items-center mb-2">
//             <Text className="text-gray-500">Subtotal Amount:</Text>
//             <Text className="font-semibold text-gray-800">
//               ₹{calculateSubtotal()}
//             </Text>
//           </View>

//           <View className="flex-row justify-between items-center">
//             <Text className="text-gray-500">Refund Amount:</Text>
//             <View className="flex-row items-center">
//               <TextInput
//                 placeholder="0"
//                 value={refundAmount}
//                 onChangeText={handleRefundAmountChange}
//                 className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg w-24 text-center text-base"
//                 keyboardType="numeric"
//               />
//               <Text className="ml-2 font-medium text-gray-700">INR</Text>
//             </View>
//           </View>

//           {refundAmount && parseFloat(refundAmount) < calculateSubtotal() && (
//             <Text className="text-orange-600 text-xs mt-2 text-right">
//               Note: Refunding ₹{calculateSubtotal() - parseFloat(refundAmount)}{" "}
//               less than subtotal
//             </Text>
//           )}
//         </View>

//         {/* Spacer for bottom button */}
//         <View className="h-28" />
//       </ScrollView>

//       {/* Fixed Bottom Buttons - Scan QR on left, Generate on right */}
//       <View className="absolute bottom-0 left-0 right-0 p-4 flex-row justify-between">
//         <TouchableOpacity
//           className="bg-blue-600 py-3 px-4 rounded-lg shadow-md flex-1 mr-2 flex-row items-center justify-center"
//           onPress={handleScanQR}
//         >
//           <Ionicons name="qr-code" size={18} color="white" />
//           <Text className="text-white text-sm font-semibold ml-2">Scan QR</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           className="bg-green-600 py-3 px-4 rounded-lg shadow-md flex-1 ml-2 flex-row items-center justify-center"
//           onPress={handleGenerateCoupon}
//           disabled={generatingCoupon}
//         >
//           {generatingCoupon ? (
//             <ActivityIndicator size="small" color="white" />
//           ) : (
//             <>
//               <Ionicons name="gift" size={18} color="white" />
//               <Text className="text-white text-sm font-semibold ml-2">
//                 Generate Coupon
//               </Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* ✅ QR Scanner Modal */}
//       <Modal visible={scanning} animationType="slide">
//         <View style={{ flex: 1, backgroundColor: "black" }}>
//           <CameraView
//             style={{ flex: 1 }}
//             facing="back"
//             onBarcodeScanned={onBarcodeScanned}
//             barcodeScannerSettings={{
//               barcodeTypes: ["qr", "ean13", "code128"],
//             }}
//           />
//           <TouchableOpacity
//             onPress={() => setScanning(false)}
//             style={{
//               position: "absolute",
//               bottom: 40,
//               alignSelf: "center",
//               backgroundColor: "red",
//               paddingHorizontal: 20,
//               paddingVertical: 10,
//               borderRadius: 8,
//             }}
//           >
//             <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>

//       {/* Custom Alert */}
//       <CustomAlert
//         visible={alertState.visible}
//         title={alertState.title}
//         message={alertState.message}
//         type={alertState.type}
//         onClose={() => setAlertState({ ...alertState, visible: false })}
//       />
//     </SafeAreaView>
//   );
// }

// app/home/couponManagement.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedWarehouse } from "../../src/redux/slices/warehouseSlice";
import CustomAlert from "../../src/components/alert/CUstomAlert";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  getSalesInvoiceItems,
  makeDeliveryOrCoupon,
  createCoupon,
  checkCouponForInvoice,
  getActiveCoupons,
} from "../../src/services/salesInvoiceService";

export default function CouponManagementScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  // State to control whether to show the coupon creation interface
  const [showCouponInterface, setShowCouponInterface] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Helper function to format date and time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Unknown Date";

    try {
      const date = new Date(dateTimeString);

      // Format date as "22 Aug 2025"
      const formattedDate = date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // Format time as "12:59 PM"
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateTimeString; // Return original if parsing fails
    }
  };

  // ✅ Hooks should be here
  const [alertState, setAlertState] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  // ✅ QR Scanner State
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  // Get warehouse data from Redux
  const { warehouses, selectedWarehouse } = useSelector(
    (state) => state.warehouse
  );

  const [refundAmount, setRefundAmount] = useState("");
  const [orderStatus, setOrderStatus] = useState("delivered");
  const [orderId, setOrderId] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingCoupon, setGeneratingCoupon] = useState(false); // Loading state for coupon generation

  // Calculate subtotal from invoice items
  // ✅ Calculate subtotal according to Bill Summary
  const calculateSubtotal = () => {
    const total = invoiceItems.reduce((sum, i) => sum + i.rate * i.qty, 0);

    const discount = invoiceItems.reduce(
      (sum, i) => sum + (i.distributed_discount_amount || 0),
      0
    );

    const tax = 0; // Hardcoded for now

    return total - discount + tax;
  };

  const showAlert = (title, message, type = "success") => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
    });
  };

  // Function to clear all data
  const clearData = () => {
    setOrderId("");
    setInvoiceItems([]);
    setOrderDetails(null);
    setRefundAmount("");
  };

  // Pull to refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    clearData();
    setRefreshing(false);
  };

  const handleWarehouseSelect = (warehouse) => {
    dispatch(setSelectedWarehouse(warehouse));
  };

  const handleGenerateCoupon = async () => {
    if (!orderId) {
      showAlert("Error", "Please scan or enter an order ID first", "error");
      return;
    }

    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      showAlert("Error", "Please enter a valid refund amount", "error");
      return;
    }

    setGeneratingCoupon(true);

    try {
      let result;

      if (orderStatus === "delivered") {
        // Use the new API for delivered orders
        result = await createCoupon(orderId, parseFloat(refundAmount));

        if (result.status === "success") {
          showAlert(
            "Success",
            `Coupon created successfully for ₹${refundAmount}: ${result.coupon}`,
            "success"
          );
        } else if (result.status === "already_generated") {
          showAlert(
            "Coupon Already Created",
            `A coupon was already created for this invoice: ${result.message}`,
            "info"
          );
        } else {
          showAlert(
            "Error",
            "Failed to create coupon cause order delivered is selected for not delivered order",
            "error"
          );
        }
      } else {
        // Use the existing API for not delivered orders
        result = await makeDeliveryOrCoupon(orderId, parseFloat(refundAmount));

        if (result.status === "success") {
          showAlert(
            "Success",
            `Coupon generated successfully for ₹${refundAmount}: ${
              result.coupon || result.message
            }`,
            "success"
          );
        } else if (result.status === "already_generated") {
          showAlert(
            "Coupon Already Generated",
            `A coupon was already generated for this invoice: ${result.coupon}`,
            "info"
          );
        } else {
          showAlert(
            "Error",
            "Failed to generate coupon cause order not delivered is selected for delivered order",
            "error"
          );
        }
      }
    } catch (error) {
      console.error("Error generating coupon:", error);
      showAlert(
        "Error",
        "An unexpected error occurred while generating coupon",
        "error"
      );
    } finally {
      setGeneratingCoupon(false);
    }
  };

  // ✅ QR Scan handler
  const handleScanQR = async () => {
    if (!cameraPermission || !cameraPermission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        showAlert(
          "Permission Required",
          "Camera access is needed to scan QR codes.",
          "error"
        );
        return;
      }
    }
    setScanning(true); // Open scanner modal
  };

  // // ✅ QR Code Scanned callback
  // const onBarcodeScanned = async ({ type, data }) => {
  //   setScanning(false); // Close scanner
  //   console.log(`QR Code Type: ${type}, Data: ${data}`);

  //   // Auto-fill the order ID field
  //   setOrderId(data);

  //   // Optionally, automatically search for the invoice
  //   handleSearchInvoice(data);
  // };

  // ✅ QR Code Scanned callback
  const onBarcodeScanned = async ({ type, data }) => {
    setScanning(false); // Close scanner
    console.log(`QR Code Type: ${type}, Data: ${data}`);

    // Auto-fill the order ID field
    setOrderId(data);

    try {
      // 🔹 Check if coupon already generated
      const checkResult = await checkCouponForInvoice(data);

      if (checkResult?.status === "exists") {
        showAlert(
          "Coupon Already Generated",
          `Coupon ${checkResult.coupon.coupon_code} is already generated for this invoice.`,
          "info"
        );
        return; // stop here, don't proceed
      }

      // 🔹 If not found → proceed to search invoice
      handleSearchInvoice(data);
    } catch (err) {
      console.error("Error checking coupon:", err);
      showAlert("Error", "Failed to check coupon for this invoice", "error");
    }
  };

  // ✅ Search for invoice items
  const handleSearchInvoice = async (invoiceName = orderId) => {
    if (!invoiceName) {
      showAlert("Error", "Please enter an order ID first", "error");
      return;
    }

    setInvoiceLoading(true);
    try {
      const result = await getSalesInvoiceItems(invoiceName);
      console.log("getSalesInvoiceItems result:", result);

      // Normalize possible response shapes into an array
      let itemsArray = [];

      if (Array.isArray(result)) {
        itemsArray = result;
      } else if (
        result &&
        result.status === "success" &&
        Array.isArray(result.data)
      ) {
        itemsArray = result.data;
      } else if (
        result &&
        result.status === "success" &&
        result.data &&
        Array.isArray(result.data.message)
      ) {
        itemsArray = result.data.message;
      } else if (result && Array.isArray(result.message)) {
        itemsArray = result.message;
      } else if (result && Array.isArray(result.data)) {
        itemsArray = result.data;
      }

      setInvoiceItems(itemsArray);

      // Auto-fill refund amount with subtotal
      // Auto-fill refund amount with subtotal
      // if (itemsArray.length > 0) {
      //   const total = itemsArray.reduce((sum, i) => sum + i.rate * i.qty, 0);
      //   const discount = itemsArray.reduce(
      //     (sum, i) => sum + (i.distributed_discount_amount || 0),
      //     0
      //   );
      //   const tax = 0; // Hardcoded

      //   const subtotal = total - discount + tax;
      //   setRefundAmount(subtotal.toFixed(2).toString());
      // }

      // Auto-fill refund amount with (subtotal - 1)
      if (itemsArray.length > 0) {
        const total = itemsArray.reduce((sum, i) => sum + i.rate * i.qty, 0);
        const discount = itemsArray.reduce(
          (sum, i) => sum + (i.distributed_discount_amount || 0),
          0
        );
        const tax = 0; // Hardcoded

        const subtotal = total - discount + tax;

        // Refund default = one less than subtotal (if possible)
        const defaultRefund = subtotal > 1 ? subtotal - 1 : subtotal;

        setRefundAmount(defaultRefund.toFixed(2).toString());
      }

      // Extract order details from the first item if available
      if (itemsArray.length > 0) {
        const firstItem = itemsArray[0];
        setOrderDetails({
          orderedBy: firstItem.owner || "Unknown Customer",
          orderedOn: formatDateTime(firstItem.creation), // Use the formatted date
          orderAmount: `INR ${itemsArray.reduce(
            (sum, item) => sum + item.rate * item.qty,
            0
          )}`,
        });
      } else {
        setOrderDetails(null);
        showAlert("No Items", "No order found with this ID", "info");
      }
    } catch (err) {
      console.error("Error fetching sales invoice items:", err);
      showAlert("Error", "Failed to fetch order details.", "error");
      setInvoiceItems([]);
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Validate refund amount (can't exceed subtotal)
  // const handleRefundAmountChange = (text) => {
  //   // Allow only numbers and decimal point
  //   const numericValue = text.replace(/[^0-9.]/g, "");

  //   // Check if it's a valid number
  //   if (numericValue === "" || numericValue === ".") {
  //     setRefundAmount(numericValue);
  //     return;
  //   }

  //   const amount = parseFloat(numericValue);
  //   const subtotal = calculateSubtotal();

  //   // Don't allow amount greater than subtotal
  //   if (amount > subtotal) {
  //     showAlert(
  //       "Validation Error",
  //       "Refund amount cannot exceed subtotal",
  //       "error"
  //     );
  //     setRefundAmount(subtotal.toString());
  //   } else {
  //     setRefundAmount(numericValue);
  //   }
  // };
  const handleRefundAmountChange = (text) => {
    const numericValue = text.replace(/[^0-9.]/g, "");

    if (numericValue === "" || numericValue === ".") {
      setRefundAmount(numericValue);
      return;
    }

    const amount = parseFloat(numericValue);
    const subtotal = calculateSubtotal();
    const maxRefund = subtotal > 1 ? subtotal - 1 : subtotal;

    if (amount > maxRefund) {
      showAlert(
        "Validation Error",
        `Refund amount cannot exceed ₹${maxRefund}`,
        "error"
      );
      setRefundAmount(maxRefund.toFixed(2).toString());
    } else {
      setRefundAmount(numericValue);
    }
  };

  // Function to start new coupon creation
  const handleNewCoupon = () => {
    clearData();
    setShowCouponInterface(true);
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      const result = await getActiveCoupons();
      if (result.status === "success") {
        setCoupons(result.data);
      }
      setLoading(false);
    };

    fetchCoupons();
  }, []);

  // Function to go back to main view
  const handleBackToMain = () => {
    setShowCouponInterface(false);
    clearData();
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      {/* Custom Header */}
      {/* <View className="bg-green-50 px-4 py-4 flex-row items-center shadow-sm">
        <TouchableOpacity
          onPress={() => router.replace("/home/profile")}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black text-lg font-bold">Coupon Management</Text>
      </View> */}
      <View className="bg-green-50 px-4 py-4 flex-row items-center shadow-sm">
        <TouchableOpacity
          onPress={() =>
            showCouponInterface
              ? handleBackToMain()
              : router.replace("/home/profile")
          }
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black text-lg font-bold">Coupon Management</Text>
      </View>

      {!showCouponInterface ? (
        <ScrollView className="flex-1 px-4 py-4">
          {/* New Coupon Button */}
          <TouchableOpacity
            className="bg-green-600 py-3 px-6 rounded-lg shadow-md flex-row items-center justify-center self-center w-3/4 mb-4"
            onPress={handleNewCoupon}
          >
            <Ionicons name="add-circle" size={22} color="white" />
            <Text className="text-white text-base font-semibold ml-2">
              New Coupon
            </Text>
          </TouchableOpacity>

          {/* Active Coupons Section */}
          <View className="mt-4">
            <Text className="text-gray-700 text-lg font-bold mb-3">
              Active Coupons
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#16a34a" />
            ) : coupons.length > 0 ? (
              coupons.map((coupon) => (
                <View
                  key={coupon.name}
                  className="bg-white p-4 rounded-xl shadow mb-3"
                >
                  <Text className="text-base font-bold text-green-700">
                    Code: {coupon.coupon_code}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Customer: {coupon.customer} 
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Invoice: {coupon.origin_invoice}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-500">No active coupons yet.</Text>
            )}
          </View>
        </ScrollView>
      ) : (
        // Coupon creation interface
        <>
          {/* Back button to return to main view */}
          {/* <TouchableOpacity
            onPress={handleBackToMain}
            className="px-4 py-2 flex-row items-center"
          >
            <Ionicons name="arrow-back" size={20} color="black" />
            <Text className="text-black ml-2">Back</Text>
          </TouchableOpacity> */}

          {/* Scrollable Content with Refresh Control */}
          <ScrollView
            className="flex-1 px-4 py-4"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Order ID Search */}
            <Text className="mb-2 font-medium text-base text-gray-700">
              Order ID
            </Text>
            <View className="flex-row mb-6 items-center">
              <TextInput
                placeholder="Enter Order ID"
                value={orderId}
                onChangeText={setOrderId}
                className="bg-white border border-gray-200 shadow-sm px-4 py-3 rounded-xl flex-1 mr-2 text-base"
              />
              <TouchableOpacity
                className="bg-green-600 p-3 rounded-full mr-2 shadow"
                onPress={() => handleSearchInvoice()}
                disabled={invoiceLoading}
              >
                {invoiceLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="search" size={20} color="white" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-600 p-3 rounded-full shadow"
                onPress={() =>
                  showAlert("Info", "Dropdown menu would appear here", "info")
                }
              >
                <Ionicons name="chevron-down" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Update Details */}
            <Text className="text-lg font-bold text-green-700 mb-4">
              Update Details
            </Text>

            {/* Order Status */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
              {["delivered", "not-delivered"].map((status) => (
                <TouchableOpacity
                  key={status}
                  className="flex-row items-center py-3 border-b border-gray-100 last:border-0"
                  onPress={() => setOrderStatus(status)}
                >
                  <Ionicons
                    name={
                      orderStatus === status
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={22}
                    color={orderStatus === status ? "#16a34a" : "#9ca3af"}
                  />
                  <Text className="ml-3 text-base text-gray-700">
                    {status === "delivered"
                      ? "Order Delivered"
                      : "Order Not Delivered"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Order Details - Show only if data is available */}
            {orderDetails && (
              <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500">Ordered By:</Text>
                  <Text className="font-semibold text-gray-800">
                    {orderDetails.orderedBy}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500">Ordered On:</Text>
                  <Text className="font-semibold text-gray-800">
                    {orderDetails.orderedOn}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Order Amount:</Text>
                  <Text className="font-semibold text-gray-800">
                    {orderDetails.orderAmount}
                  </Text>
                </View>
              </View>
            )}

            {/* Show invoice items if available */}
            {invoiceItems.length > 0 && (
              <>
                {/* Order Items */}
                <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
                  <Text className="text-lg font-bold text-green-700 mb-3">
                    Order Items
                  </Text>
                  {invoiceItems.map((item, index) => (
                    <View
                      key={index}
                      className="border-b border-gray-100 py-2 last:border-0"
                    >
                      <Text className="font-semibold text-gray-800">
                        {item.item_name}
                      </Text>
                      <Text className="text-gray-600">Qty: {item.qty}</Text>
                      <Text className="text-gray-600">
                        Amount: ₹{item.base_amount || item.amount}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Bill Summary - Subtotal Only */}
                {/* <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
                  <Text className="text-lg font-bold text-green-700 mb-3">
                    Bill Summary
                  </Text>
                  <View className="flex-row justify-between py-1">
                    <Text className="text-[#499c49]">Subtotal</Text>
                    <Text className="text-[#0d1c0d]">
                      ₹{invoiceItems.reduce((sum, i) => sum + i.rate * i.qty, 0)}
                    </Text>
                  </View>
                </View> */}
                {/* Bill Summary - Subtotal Only */}
                <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
                  <Text className="text-[#0d1c0d] text-lg font-bold px-4 pb-2">
                    Bill Summary
                  </Text>
                  <View className="px-4">
                    {/* Total */}
                    <View className="flex flex-row justify-between py-1">
                      <Text className="text-[#499c49]">Total</Text>
                      <Text className="text-[#0d1c0d]">
                        ₹
                        {invoiceItems
                          .reduce((sum, i) => sum + i.rate * i.qty, 0)
                          .toFixed(2)}
                      </Text>
                    </View>

                    {/* Tax (hardcoded 0) */}
                    <View className="flex flex-row justify-between py-1">
                      <Text className="text-[#499c49]">Tax</Text>
                      <Text className="text-[#0d1c0d]">₹0.00</Text>
                    </View>

                    {/* Discount */}
                    <View className="flex flex-row justify-between py-1">
                      <Text className="text-[#499c49]">Discount</Text>
                      <Text className="text-[#0d1c0d]">
                        ₹
                        {invoiceItems
                          .reduce(
                            (sum, i) =>
                              sum + (i.distributed_discount_amount || 0),
                            0
                          )
                          .toFixed(2)}
                      </Text>
                    </View>

                    {/* Sub Total */}
                    <View className="flex flex-row justify-between py-1 border-t border-gray-200 mt-1 pt-1">
                      <Text className="text-[#0d1c0d] font-semibold">
                        Sub Total
                      </Text>
                      <Text className="text-[#0d1c0d] font-semibold">
                        ₹
                        {(
                          invoiceItems.reduce(
                            (sum, i) => sum + i.rate * i.qty,
                            0
                          ) -
                          invoiceItems.reduce(
                            (sum, i) =>
                              sum + (i.distributed_discount_amount || 0),
                            0
                          )
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Refund Amount */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-500">Subtotal Amount:</Text>
                <Text className="font-semibold text-gray-800">
                  ₹{calculateSubtotal()}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Refund Amount:</Text>
                <View className="flex-row items-center">
                  <TextInput
                    placeholder="0"
                    value={refundAmount}
                    onChangeText={handleRefundAmountChange}
                    className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg w-24 text-center text-base"
                    keyboardType="numeric"
                  />
                  <Text className="ml-2 font-medium text-gray-700">INR</Text>
                </View>
              </View>

              {refundAmount &&
                parseFloat(refundAmount) < calculateSubtotal() && (
                  <Text className="text-orange-600 text-xs mt-2 text-right">
                    Note: Refunding ₹
                    {calculateSubtotal() - parseFloat(refundAmount)} less than
                    subtotal
                  </Text>
                )}
            </View>

            {/* Spacer for bottom button */}
            <View className="h-28" />
          </ScrollView>

          {/* Fixed Bottom Buttons - Scan QR on left, Generate on right */}
          <View className="absolute bottom-0 left-0 right-0 p-4 flex-row justify-between">
            <TouchableOpacity
              className="bg-blue-600 py-3 px-4 rounded-lg shadow-md flex-1 mr-2 flex-row items-center justify-center"
              onPress={handleScanQR}
            >
              <Ionicons name="qr-code" size={18} color="white" />
              <Text className="text-white text-sm font-semibold ml-2">
                Scan QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-green-600 py-3 px-4 rounded-lg shadow-md flex-1 ml-2 flex-row items-center justify-center"
              onPress={handleGenerateCoupon}
              disabled={generatingCoupon}
            >
              {generatingCoupon ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="gift" size={18} color="white" />
                  <Text className="text-white text-sm font-semibold ml-2">
                    Generate Coupon
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ✅ QR Scanner Modal */}
      <Modal visible={scanning} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={onBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "code128"],
            }}
          />
          <TouchableOpacity
            onPress={() => setScanning(false)}
            style={{
              position: "absolute",
              bottom: 40,
              alignSelf: "center",
              backgroundColor: "red",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState({ ...alertState, visible: false })}
      />
    </SafeAreaView>
  );
}
