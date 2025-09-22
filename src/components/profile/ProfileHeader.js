// src/components/profile/ProfileHeader.js
import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Header } from "../header/Header";

const ProfileHeader = ({
  warehouses,
  selectedWarehouse,
  onWarehouseSelect,
  onLogout,
  loading,
  error,
}) => {
  if (loading || !selectedWarehouse) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="text-gray-600 mt-4 text-base">Loading Header...</Text>
      </View>
    );
  }

  if (
    error ||
    (warehouses.length === 0 && !selectedWarehouse?.corporate_code)
  ) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Ionicons name="warning-outline" size={50} color="#EF4444" />
        <Text className="text-xl font-bold text-red-600 mt-4 text-center">
          Failed to Load Warehouse Data
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          {error || "Please check your internet connection or try again later."}
        </Text>
        <TouchableOpacity
          onPress={onRetry}
          className="bg-blue-500 py-3 px-6 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onLogout}
          className="bg-red-500 py-3 px-6 rounded-lg mt-4"
        >
          <Text className="text-white font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Header
      companyInfo={{
        name: selectedWarehouse.warehouse,
        address: selectedWarehouse.corporate_code,
      }}
      warehouses={warehouses}
      selectedWarehouse={selectedWarehouse}
      onWarehouseSelect={onWarehouseSelect}
      onLogout={onLogout}
    />
  );
};

export default ProfileHeader;
