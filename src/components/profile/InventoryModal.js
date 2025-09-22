// src/components/profile/InventoryModal.js
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";

const InventoryModal = ({
  visible,
  onClose,
  selectedWarehouse,
  inventoryItems,
  inventoryLoading,
  inventoryError,
  onQuantityChange,
  onUpdateInventory,
  updatingItems,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white p-5 rounded-xl w-full max-w-md shadow-lg relative">
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-3 right-3 z-10"
          >
            <Text className="text-gray-500 text-xl">✕</Text>
          </TouchableOpacity>

          <Text className="text-lg font-bold text-green-800 mb-4 pr-6">
            Daily Inventory - {selectedWarehouse?.warehouse || "Warehouse"}
          </Text>

          {inventoryLoading && !inventoryError && (
            <View className="py-4">
              <ActivityIndicator size="small" color="#16a34a" />
              <Text className="text-center mt-2">Loading menu items...</Text>
            </View>
          )}

          {inventoryError && (
            <Text className="text-red-500 mb-4 text-center">
              {inventoryError}
            </Text>
          )}

          {!inventoryLoading && inventoryItems.length > 0
            ? inventoryItems.map((item) => (
                <View
                  key={item.id}
                  className="flex-row justify-between items-center mb-3"
                >
                  <View className="flex-1">
                    <Text className="font-medium">{item.name}</Text>
                    <Text className="text-gray-500 text-xs">
                      {item.item_group}
                    </Text>
                    {item.updateError && (
                      <Text className="text-red-500 text-xs mt-1">
                        {item.updateError}
                      </Text>
                    )}
                  </View>

                  <View className="flex-row items-center space-x-2">
                    <View className="bg-gray-100 px-2 py-1 rounded w-20">
                      <Text className="text-center">
                        {item.actual_qty !== undefined
                          ? item.actual_qty
                          : "N/A"}
                      </Text>
                    </View>

                    {item.isUpdating && (
                      <ActivityIndicator
                        size="small"
                        color="#16a34a"
                        className="mr-2"
                      />
                    )}
                    <TextInput
                      placeholder="0"
                      value={item.quantity}
                      onChangeText={(text) => onQuantityChange(item.id, text)}
                      className="border px-2 py-1 rounded w-20 text-center"
                      keyboardType="numeric"
                      selectTextOnFocus
                      editable={!item.isUpdating}
                    />
                  </View>
                </View>
              ))
            : !inventoryLoading && (
                <Text className="text-gray-500 text-center py-4">
                  No items found for today's menu
                </Text>
              )}

          <View className="flex-row mt-2">
            <TouchableOpacity
              className={`flex-1 bg-green-600 py-3 rounded-lg mr-2 ${
                inventoryLoading ? "opacity-50" : ""
              }`}
              onPress={onUpdateInventory}
              disabled={inventoryLoading}
            >
              <Text className="text-center text-white font-semibold">
                {inventoryLoading ? "Updating..." : "Update Inventory"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-red-100 py-3 rounded-lg ml-2"
              onPress={onClose}
              disabled={inventoryLoading}
            >
              <Text className="text-center text-red-600 font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InventoryModal;
