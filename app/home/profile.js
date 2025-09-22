// // app/home/profile.js
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   TouchableOpacity,
//   RefreshControl,
//   ActivityIndicator,
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import { logoutUser } from "../../src/redux/slices/authSlice";
// import {
//   setWarehouses,
//   setSelectedWarehouse,
//   setWarehouseLoading,
//   setWarehouseError,
// } from "../../src/redux/slices/warehouseSlice";
// import { useRouter } from "expo-router";
// import { getWarehouseMappings } from "../../src/services/warehouseService";
// import {
//   getTodaysMenuItems,
//   addStock,
//   getInventoryData,
// } from "../../src/services/menuService";
// import CustomAlert from "../../src/components/alert/CUstomAlert";
// import { checkExistingSession } from "../../src/services/authService";

// // Import the new components
// import ProfileHeader from "../../src/components/profile/ProfileHeader";
// import ProfileCard from "../../src/components/profile/ProfileCard";
// import ActionItems from "../../src/components/profile/ActionItems";
// import InventoryModal from "../../src/components/profile/InventoryModal";
// import CouponModal from "../../src/components/profile/CouponModal";

// export default function ProfileScreen() {
//   const dispatch = useDispatch();
//   const router = useRouter();

//   // --- REDUX STATE ---
//   const {
//     warehouses,
//     selectedWarehouse,
//     status: warehouseStatus,
//     error: warehouseError,
//   } = useSelector((state) => state.warehouse);
//   // --- END REDUX STATE ---

//   const [modalVisible, setModalVisible] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(true);
//   const [profile, setProfile] = useState({
//     name: "",
//     email: "",
//     phone: "",
//   });

//   const [alertState, setAlertState] = useState({
//     visible: false,
//     title: "",
//     message: "",
//     type: "success",
//   });

//   // Inventory Modal State
//   const [inventoryItems, setInventoryItems] = useState([]);
//   const [inventoryLoading, setInventoryLoading] = useState(false);
//   const [inventoryError, setInventoryError] = useState(null);

//   const showAlert = (title, message, type = "success") => {
//     setAlertState({
//       visible: true,
//       title,
//       message,
//       type,
//     });
//   };

//   const fetchUserProfile = useCallback(async () => {
//     try {
//       setLoadingProfile(true);
//       const userData = await checkExistingSession();

//       if (userData) {
//         setProfile({
//           name: userData.name || "User",
//           email: userData.email || "",
//           phone: userData.mobile ? `+91-${userData.mobile}` : "",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//       showAlert("Error", "Failed to load user profile", "error");
//     } finally {
//       setLoadingProfile(false);
//     }
//   }, []);

//   const fetchWarehouseData = useCallback(async () => {
//     setRefreshing(true);
//     dispatch(setWarehouseLoading());

//     try {
//       const warehouseResult = await getWarehouseMappings();
//       if (
//         warehouseResult.status === "success" &&
//         warehouseResult.data.length > 0
//       ) {
//         dispatch(setWarehouses(warehouseResult.data));

//         let currentSelected = selectedWarehouse;
//         if (
//           !currentSelected ||
//           !warehouseResult.data.some(
//             (wh) => wh.corporate_code === currentSelected.corporate_code
//           )
//         ) {
//           const defaultWarehouse =
//             warehouseResult.data.find((wh) => wh.is_default === 1) ||
//             warehouseResult.data[0];
//           dispatch(setSelectedWarehouse(defaultWarehouse));
//         }
//       } else {
//         console.error(
//           "Failed to fetch warehouse mappings or no data:",
//           warehouseResult.message
//         );
//         dispatch(setWarehouses([]));
//         dispatch(
//           setSelectedWarehouse({
//             warehouse: "No Warehouse",
//             corporate_code: "",
//           })
//         );
//         showAlert(
//           "Error",
//           warehouseResult.message || "Failed to fetch warehouse data.",
//           "error"
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching warehouse mappings:", error);
//       dispatch(setWarehouseError(error.message));
//       dispatch(
//         setSelectedWarehouse({ warehouse: "Error Loading", corporate_code: "" })
//       );
//       showAlert(
//         "Error",
//         "Network error. Failed to load warehouse data.",
//         "error"
//       );
//     } finally {
//       setRefreshing(false);
//     }
//   }, [selectedWarehouse, dispatch]);

//   const fetchTodaysItems = useCallback(async () => {
//     if (!selectedWarehouse?.warehouse) return;

//     try {
//       setInventoryLoading(true);
//       setInventoryError(null);

//       const [menuResult, inventoryResult] = await Promise.all([
//         getTodaysMenuItems(selectedWarehouse.warehouse),
//         getInventoryData(selectedWarehouse.warehouse),
//       ]);

//       if (menuResult.status === "success") {
//         const inventoryMap = {};
//         if (inventoryResult.message) {
//           inventoryResult.message.forEach((item) => {
//             inventoryMap[item.item_code] = item.actual_qty;
//           });
//         }

//         const itemsWithQuantity = menuResult.data.map((item) => ({
//           ...item,
//           quantity: "0",
//           actual_qty: inventoryMap[item.item_code] || 0,
//           isUpdating: false,
//           updateError: null,
//         }));

//         setInventoryItems(itemsWithQuantity);
//       } else {
//         setInventoryError(menuResult.message || "Failed to fetch items");
//       }
//     } catch (err) {
//       setInventoryError("Network error. Please try again.");
//       console.error("Fetch error:", err);
//     } finally {
//       setInventoryLoading(false);
//     }
//   }, [selectedWarehouse]);

//   const handleQuantityChange = (itemId, text) => {
//     const numericValue = text.replace(/[^0-9]/g, "");

//     setInventoryItems((prevItems) =>
//       prevItems.map((item) =>
//         item.id === itemId
//           ? { ...item, quantity: numericValue, updateError: null }
//           : item
//       )
//     );
//   };

//   const updateItemStock = async (item) => {
//     try {
//       setInventoryItems((prevItems) =>
//         prevItems.map((i) =>
//           i.id === item.id ? { ...i, isUpdating: true, updateError: null } : i
//         )
//       );

//       const result = await addStock(
//         item.item_code,
//         selectedWarehouse.warehouse,
//         item.quantity
//       );

//       if (result.status !== "success") {
//         throw new Error(result.message || "Failed to update stock");
//       }

//       return result;
//     } catch (error) {
//       setInventoryItems((prevItems) =>
//         prevItems.map((i) =>
//           i.id === item.id ? { ...i, updateError: error.message } : i
//         )
//       );
//       throw error;
//     } finally {
//       setInventoryItems((prevItems) =>
//         prevItems.map((i) =>
//           i.id === item.id ? { ...i, isUpdating: false } : i
//         )
//       );
//     }
//   };

//   const handleUpdateInventory = async () => {
//     try {
//       setInventoryLoading(true);
//       setInventoryError(null);

//       const itemsToUpdate = inventoryItems.filter(
//         (item) => item.quantity && parseInt(item.quantity) > 0
//       );

//       if (itemsToUpdate.length === 0) {
//         setInventoryError("Please enter quantities for at least one item");
//         return;
//       }

//       const results = [];
//       for (const item of itemsToUpdate) {
//         try {
//           const result = await updateItemStock(item);
//           results.push(result);
//           await new Promise((resolve) => setTimeout(resolve, 300));
//         } catch (error) {
//           results.push({ status: "error", message: error.message });
//         }
//       }

//       const failedUpdates = results.filter((r) => r.status !== "success");
//       if (failedUpdates.length > 0) {
//         const errorMessages = failedUpdates.map((r) => r.message).join("\n• ");
//         setInventoryError(`Some updates failed:\n• ${errorMessages}`);
//       } else {
//         showAlert(
//           "Success",
//           "All inventory items updated successfully",
//           "success"
//         );
//         fetchTodaysItems();
//         setModalVisible(null);
//       }
//     } catch (error) {
//       setInventoryError("Failed to update inventory. Please try again.");
//       console.error("Update error:", error);
//     } finally {
//       setInventoryLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (modalVisible === "inventory") {
//       fetchTodaysItems();
//     }
//   }, [modalVisible, fetchTodaysItems]);

//   useEffect(() => {
//     fetchWarehouseData();
//   }, [fetchWarehouseData]);

//   useEffect(() => {
//     fetchUserProfile();
//   }, [fetchUserProfile]);

//   const handleLogout = async () => {
//     try {
//       const result = await dispatch(logoutUser()).unwrap();
//       if (result) {
//         router.replace("/login");
//       }
//     } catch (error) {
//       showAlert("Logout Failed", error.message || "Could not log out", "error");
//     }
//   };

//   const handleWarehouseSelect = (warehouse) => {
//     dispatch(setSelectedWarehouse(warehouse));
//   };

//   if (loadingProfile) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#4CAF50" />
//         <Text className="text-gray-600 mt-4 text-base">Loading Profile...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       className="flex-1 bg-green-50 px-4 pt-4"
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={() => {
//             fetchWarehouseData();
//             fetchUserProfile();
//           }}
//         />
//       }
//     >
//       <ProfileHeader
//         warehouses={warehouses}
//         selectedWarehouse={selectedWarehouse}
//         onWarehouseSelect={handleWarehouseSelect}
//         onLogout={handleLogout}
//         loading={warehouseStatus === "loading" || !selectedWarehouse}
//         error={warehouseStatus === "failed" ? warehouseError : null}
//         onRetry={fetchWarehouseData}
//       />

//       <ProfileCard profile={profile} />

//       <ActionItems
//         onCouponPress={() => router.push("/home/couponManagement")}
//         onInventoryPress={() => setModalVisible("inventory")}
//       />

//       <TouchableOpacity
//         onPress={handleLogout}
//         className="bg-green-500 rounded-xl py-3 shadow-md"
//       >
//         <Text className="text-center text-white font-semibold">Log Out</Text>
//       </TouchableOpacity>

//       {/* <CouponModal
//         visible={modalVisible === "coupon"}
//         onClose={() => setModalVisible(null)}
//         onShowAlert={showAlert}
//       /> */}

//       <InventoryModal
//         visible={modalVisible === "inventory"}
//         onClose={() => setModalVisible(null)}
//         selectedWarehouse={selectedWarehouse}
//         inventoryItems={inventoryItems}
//         inventoryLoading={inventoryLoading}
//         inventoryError={inventoryError}
//         onQuantityChange={handleQuantityChange}
//         onUpdateInventory={handleUpdateInventory}
//       />

//       <CustomAlert
//         visible={alertState.visible}
//         title={alertState.title}
//         message={alertState.message}
//         type={alertState.type}
//         onClose={() => setAlertState({ ...alertState, visible: false })}
//       />
//     </ScrollView>
//   );
// }


// app/home/profile.js
import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../src/redux/slices/authSlice";
import {
  setWarehouses,
  setSelectedWarehouse,
  setWarehouseLoading,
  setWarehouseError,
} from "../../src/redux/slices/warehouseSlice";
import { useRouter } from "expo-router";
import { getWarehouseMappings } from "../../src/services/warehouseService";
import { checkExistingSession } from "../../src/services/authService";
import { sendNotification } from "../../src/services/notificationService";

// Import the new components
import ProfileHeader from "../../src/components/profile/ProfileHeader";
import ProfileCard from "../../src/components/profile/ProfileCard";
import ActionItems from "../../src/components/profile/ActionItems";
import CustomAlert from "../../src/components/alert/CUstomAlert";

// Import the new NotificationModal component
import NotificationModal from "../../src/components/profile/NotificationModal";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  // --- REDUX STATE ---
  const {
    warehouses,
    selectedWarehouse,
    status: warehouseStatus,
    error: warehouseError,
  } = useSelector((state) => state.warehouse);
  // --- END REDUX STATE ---

  const [modalVisible, setModalVisible] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [alertState, setAlertState] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  // Notification Modal State
  const [notificationData, setNotificationData] = useState({
    userType: "submanager_only", // Default selection
    message: "",
  });

  const showAlert = (title, message, type = "success") => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
    });
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const userData = await checkExistingSession();

      if (userData) {
        setProfile({
          name: userData.name || "User",
          email: userData.email || "",
          phone: userData.mobile ? `+91-${userData.mobile}` : "",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      showAlert("Error", "Failed to load user profile", "error");
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchWarehouseData = useCallback(async () => {
    setRefreshing(true);
    dispatch(setWarehouseLoading());

    try {
      const warehouseResult = await getWarehouseMappings();
      if (
        warehouseResult.status === "success" &&
        warehouseResult.data.length > 0
      ) {
        dispatch(setWarehouses(warehouseResult.data));

        let currentSelected = selectedWarehouse;
        if (
          !currentSelected ||
          !warehouseResult.data.some(
            (wh) => wh.corporate_code === currentSelected.corporate_code
          )
        ) {
          const defaultWarehouse =
            warehouseResult.data.find((wh) => wh.is_default === 1) ||
            warehouseResult.data[0];
          dispatch(setSelectedWarehouse(defaultWarehouse));
        }
      } else {
        console.error(
          "Failed to fetch warehouse mappings or no data:",
          warehouseResult.message
        );
        dispatch(setWarehouses([]));
        dispatch(
          setSelectedWarehouse({
            warehouse: "No Warehouse",
            corporate_code: "",
          })
        );
        showAlert(
          "Error",
          warehouseResult.message || "Failed to fetch warehouse data.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching warehouse mappings:", error);
      dispatch(setWarehouseError(error.message));
      dispatch(
        setSelectedWarehouse({ warehouse: "Error Loading", corporate_code: "" })
      );
      showAlert(
        "Error",
        "Network error. Failed to load warehouse data.",
        "error"
      );
    } finally {
      setRefreshing(false);
    }
  }, [selectedWarehouse, dispatch]);

  const handleSendNotification = async () => {
  try {
    const result = await sendNotification({
      warehouse: selectedWarehouse?.warehouse, 
      userType: notificationData.userType,
      message: notificationData.message,
    });

    if (result.status === "success") {
      showAlert("Success", "Notification sent successfully!", "success");
    } else {
      showAlert("Error", result.message, "error");
    }
  } catch (error) {
    console.error("Send Notification Error:", error);
    showAlert("Error", "Something went wrong", "error");
  } finally {
    setModalVisible(null);
    setNotificationData({ userType: "", message: "" });
  }
};

  useEffect(() => {
    fetchWarehouseData();
  }, [fetchWarehouseData]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutUser()).unwrap();
      if (result) {
        router.replace("/login");
      }
    } catch (error) {
      showAlert("Logout Failed", error.message || "Could not log out", "error");
    }
  };

  const handleWarehouseSelect = (warehouse) => {
    dispatch(setSelectedWarehouse(warehouse));
  };

  if (loadingProfile) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="text-gray-600 mt-4 text-base">Loading Profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-green-50 px-4 pt-4"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            fetchWarehouseData();
            fetchUserProfile();
          }}
        />
      }
    >
      <ProfileHeader
        warehouses={warehouses}
        selectedWarehouse={selectedWarehouse}
        onWarehouseSelect={handleWarehouseSelect}
        onLogout={handleLogout}
        loading={warehouseStatus === "loading" || !selectedWarehouse}
        error={warehouseStatus === "failed" ? warehouseError : null}
        onRetry={fetchWarehouseData}
      />

      <ProfileCard profile={profile} />

      <ActionItems
  onNotificationPress={() => {
    setNotificationData({
      userType: "",
      message: "",
    });
    setModalVisible("notification");
  }}
/>


      <TouchableOpacity
        onPress={handleLogout}
        className="bg-green-500 rounded-xl py-3 shadow-md mt-4"
      >
        <Text className="text-center text-white font-semibold">Log Out</Text>
      </TouchableOpacity>

      <NotificationModal
        visible={modalVisible === "notification"}
        onClose={() => setModalVisible(null)}
        notificationData={notificationData}
        setNotificationData={setNotificationData}
        onSendNotification={handleSendNotification}
      />

      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState({ ...alertState, visible: false })}
      />
    </ScrollView>
  );
}