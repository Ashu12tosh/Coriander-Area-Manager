// src/components/menu/WeeklyAddItemsModal.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  getMenuItems,
  addItemsToWarehouseMenu,
} from "../../services/menuService";
import { useSelector } from "react-redux";
import CustomAlert from "../alert/CUstomAlert";

export default function WeeklyAddItemsModal({
  visible,
  onClose,
  onAddItems,
  selectedDayDate, // This will be the date from the weekly menu (YYYY-MM-DD format)
}) {
  const [allAvailableItems, setAllAvailableItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddingToBackend, setIsAddingToBackend] = useState(false);
  // Add this state with your other state declarations
  const [alertState, setAlertState] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });
  const selectedWarehouse = useSelector(
    (state) => state.warehouse.selectedWarehouse
  );
  // Add this function near your other helper functions
  const showAlert = (title, message, type = "success") => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
    });
  };
  const fetchAllItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMenuItems();
      if (result.status === "success") {
        setAllAvailableItems(result.data);
        setFilteredItems(result.data);
      } else {
        setError(result.message);
        showAlert("Error", result.message, "error");
      }
    } catch (err) {
      setError("Failed to fetch menu items. Network error.");
      showAlert(
        "Error",
        "Failed to fetch menu items. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchAllItems();
      setSearchQuery("");
      setSelectedItems({});
    }
  }, [visible, fetchAllItems]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredItems(allAvailableItems);
    } else {
      const lower = text.toLowerCase();
      const filtered = allAvailableItems.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(lower)) ||
          (item.item_name && item.item_name.toLowerCase().includes(lower)) ||
          (item.item_group && item.item_group.toLowerCase().includes(lower)) ||
          (item.description &&
            item.description.toLowerCase().includes(lower)) ||
          (item.item_code && item.item_code.toLowerCase().includes(lower))
      );
      setFilteredItems(filtered);
    }
  };

  const toggleSelectItem = (item) => {
    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      if (newSelected[item.id]) delete newSelected[item.id];
      else newSelected[item.id] = item;
      return newSelected;
    });
  };

  const handleAddSelected = async () => {
    const itemsToAdd = Object.values(selectedItems);
    if (itemsToAdd.length === 0) {
      showAlert("Info", "Please select at least one item.", "info");
      return;
    }

    if (!selectedWarehouse || !selectedWarehouse.warehouse) {
      showAlert(
        "Error",
        "No warehouse selected. Please select a warehouse first.",
        "error"
      );
      return;
    }

    if (!selectedDayDate) {
      showAlert("Error", "No date selected for the weekly menu.", "error");
      return;
    }

    setIsAddingToBackend(true);

    try {
      const itemCodes = itemsToAdd.map((item) => item.item_code);
      const warehouseName = selectedWarehouse.warehouse;

      const apiResult = await addItemsToWarehouseMenu(
        itemCodes,
        warehouseName,
        selectedDayDate // Using the passed date instead of today's date
      );

      if (apiResult.status === "success" || apiResult.status === "info") {
        showAlert("Success", apiResult.message, "success");
        onAddItems(itemsToAdd);
        onClose();
      } else {
        showAlert(
          "Error",
          apiResult.message || "Failed to add items to backend.",
          "error"
        );
      }
    } catch (apiError) {
      showAlert(
        "Error",
        "Network error or failed to connect to backend.",
        "error"
      );
    } finally {
      setIsAddingToBackend(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllItems();
    setRefreshing(false);
  }, [fetchAllItems]);

  const renderItem = ({ item }) => {
    const isSelected = selectedItems[item.id];
    return (
      <TouchableOpacity
        className={`flex-row items-center p-4 mb-3 rounded-xl ${
          isSelected
            ? "bg-green-100 border-2 border-green-500"
            : "bg-white border border-gray-200"
        }`}
        onPress={() => toggleSelectItem(item)}
        activeOpacity={0.7}
      >
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            className="w-16 h-16 rounded-lg mr-4"
          />
        ) : (
          <View className="w-16 h-16 rounded-lg mr-4 bg-gray-200 justify-center items-center">
            <Ionicons name="image" size={30} color="#6B7280" />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
          <Text className="text-sm text-green-700 font-semibold mt-1">
            {item.price} - {item.item_group}
          </Text>
        </View>
        <Ionicons
          name={isSelected ? "checkmark-circle" : "add-circle-outline"}
          size={28}
          color={isSelected ? "#10B981" : "#9CA3AF"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white w-11/12 max-h-[90%] rounded-3xl p-6 shadow-xl relative">
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-3 top-3 p-1 rounded-full bg-gray-100 z-50"
          >
            <Ionicons name="close-circle" size={30} color="#EF4444" />
          </TouchableOpacity>

          <Text className="text-2xl font-extrabold text-green-800 text-center mb-6">
            Add Items to {selectedDayDate}
          </Text>

          {/* Search */}
          <View className="flex-row items-center border border-green-300 rounded-xl px-3 py-2 mb-4 bg-green-50">
            <Ionicons name="search" size={20} color="#10B981" />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-700"
              placeholder="Search menu items..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Item List */}
          <View className="min-h-[250px] max-h-[350px] bg-gray-50 rounded-xl border border-gray-200 p-2">
            {loading ? (
              <View className="flex-1 justify-center items-center py-10">
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="text-gray-600 mt-3">Loading items...</Text>
              </View>
            ) : error ? (
              <View className="flex-1 justify-center items-center py-10">
                <Ionicons name="warning-outline" size={48} color="#EF4444" />
                <Text className="text-red-600 font-semibold mt-3">{error}</Text>
                <TouchableOpacity
                  onPress={fetchAllItems}
                  className="mt-4 bg-blue-500 py-2 px-4 rounded-lg"
                >
                  <Text className="text-white font-semibold">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : filteredItems.length === 0 ? (
              <View className="flex-1 justify-center items-center py-10">
                <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 font-medium mt-3">
                  No items found
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#10B981"
                  />
                }
                contentContainerStyle={{ paddingBottom: 10 }}
              />
            )}
          </View>

          {/* Add Button */}
          <TouchableOpacity
            onPress={handleAddSelected}
            className="bg-green-600 py-4 rounded-full mt-5 flex-row justify-center items-center"
            disabled={loading || isAddingToBackend}
          >
            {isAddingToBackend ? (
              <ActivityIndicator
                size="small"
                color="white"
                style={{ marginRight: 8 }}
              />
            ) : (
              <Ionicons
                name="add-circle"
                size={24}
                color="white"
                style={{ marginRight: 8 }}
              />
            )}
            <Text className="text-white font-bold text-lg">
              {isAddingToBackend
                ? "Adding..."
                : `Add ${Object.keys(selectedItems).length || ""} Item(s)`}
            </Text>
          </TouchableOpacity>
        </View>
        <CustomAlert
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          type={alertState.type}
          onClose={() => setAlertState({ ...alertState, visible: false })}
        />
      </View>
    </Modal>
  );
}
