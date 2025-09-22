import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const Header = ({
  companyInfo,
  warehouses,
  selectedWarehouse,
  onWarehouseSelect,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingWarehouse, setPendingWarehouse] = useState(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelect = (warehouse) => {
    setPendingWarehouse(warehouse);
    setConfirmModalVisible(true); // Show confirmation modal
  };

  const confirmSelection = () => {
    if (pendingWarehouse) {
      onWarehouseSelect(pendingWarehouse);
    }
    setConfirmModalVisible(false);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  return (
    <View className="mb-6 flex-row justify-between items-center">
      <View className="flex-row items-center relative">
        <Ionicons name="location-sharp" size={22} color="green" />
        <View className="ml-3">
          {selectedWarehouse ? (
            <TouchableOpacity
              onPress={toggleDropdown}
              className="flex-row items-center"
            >
              <View>
                <Text className="text-xl font-bold text-gray-900">
                  {selectedWarehouse.warehouse}
                </Text>
              </View>
              <Ionicons
                name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color="gray"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          ) : (
            <Text className="text-xl font-bold text-gray-800">
              Loading Warehouse...
            </Text>
          )}

          {isDropdownOpen && warehouses && warehouses.length > 0 && (
            <View className="absolute top-12 left-0 z-50 bg-white rounded-2xl shadow-2xl mt-2 w-80 max-h-96 border border-gray-400 overflow-hidden">
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {warehouses.map((warehouse) => (
                  <TouchableOpacity
                    key={
                      warehouse.warehouse_mapping_name +
                      warehouse.corporate_code
                    }
                    className={`py-5 px-6 border-b border-gray-100 ${
                      selectedWarehouse?.warehouse === warehouse.warehouse &&
                      selectedWarehouse?.corporate_code ===
                        warehouse.corporate_code
                        ? "bg-green-300"
                        : "bg-green-50"
                    }`}
                    onPress={() => handleSelect(warehouse)}
                  >
                    <Text className="text-gray-900 font-semibold text-lg">
                      {warehouse.warehouse}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Switch Warehouse
              </Text>
              <TouchableOpacity onPress={() => setConfirmModalVisible(false)}>
                <Ionicons name="close" size={26} color="gray" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-700 mb-6 text-base">
              Are you sure you want to switch warehouse to{" "}
              <Text className="font-bold text-green-600">
                {pendingWarehouse?.warehouse}
              </Text>
              ?
            </Text>

            <TouchableOpacity
              onPress={confirmSelection}
              className="bg-green-600 rounded-xl py-3"
            >
              <Text className="text-center text-white font-semibold text-lg">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
