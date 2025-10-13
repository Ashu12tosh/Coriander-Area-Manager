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
import { getUsersByWarehouses } from "../../src/services/userService"; // Add this import
import { SafeAreaView } from "react-native-safe-area-context"; // Add this import
// Import components
import ProfileHeader from "../../src/components/profile/ProfileHeader";
import ProfileCard from "../../src/components/profile/ProfileCard";
import ActionItems from "../../src/components/profile/ActionItems";
import CustomAlert from "../../src/components/alert/CUstomAlert";
import NotificationModal from "../../src/components/profile/NotificationModal";
import SubmanagersModal from "../../src/components/profile/SubmanagersModal"; // Add this import

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
    userType: "submanager_only",
    message: "",
  });

  // Submanagers Modal State
  const [submanagersData, setSubmanagersData] = useState(null);
  const [loadingSubmanagers, setLoadingSubmanagers] = useState(false);

  const showAlert = (title, message, type = "success") => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
    });
  };

  // Fetch submanagers data
  const fetchSubmanagersData = useCallback(async () => {
    if (modalVisible !== "submanagers") return;
    
    setLoadingSubmanagers(true);
    try {
      const result = await getUsersByWarehouses();
      if (result.status === "success") {
        setSubmanagersData(result.data);
      } else {
        showAlert("Error", result.message || "Failed to fetch submanagers", "error");
        setSubmanagersData([]);
      }
    } catch (error) {
      console.error("Error fetching submanagers:", error);
      showAlert("Error", "Network error. Failed to load submanagers.", "error");
      setSubmanagersData([]);
    } finally {
      setLoadingSubmanagers(false);
    }
  }, [modalVisible]);

  // Fetch user profile
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

  // Fetch warehouse data
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

  // Handle send notification
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

  // Handle modal visibility changes
  useEffect(() => {
    if (modalVisible === "submanagers") {
      fetchSubmanagersData();
    }
  }, [modalVisible, fetchSubmanagersData]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fcf8' }}>
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
            userType: "submanager_only",
            message: "",
          });
          setModalVisible("notification");
        }}
        onSubmangerPress={() => {
          setSubmanagersData(null);
          setModalVisible("submanagers");
        }}
      />

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-green-500 rounded-xl py-3 shadow-md mt-4"
      >
        <Text className="text-center text-white font-semibold">Log Out</Text>
      </TouchableOpacity>

      {/* Notification Modal */}
      <NotificationModal
        visible={modalVisible === "notification"}
        onClose={() => setModalVisible(null)}
        notificationData={notificationData}
        setNotificationData={setNotificationData}
        onSendNotification={handleSendNotification}
      />

      {/* Submanagers Modal */}
      <SubmanagersModal
        visible={modalVisible === "submanagers"}
        onClose={() => setModalVisible(null)}
        submanagersData={submanagersData}
        loading={loadingSubmanagers}
        selectedWarehouse={selectedWarehouse}
      />

      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState({ ...alertState, visible: false })}
      />
    </ScrollView>
    </SafeAreaView>
  );
}