import React, { useState, useEffect, useCallback } from "react";
import {
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
import { getMenuItems } from "../../services/menuService";

export default function InlineAddItemsSection({ onAddItems, onCancel }) {
  const [allAvailableItems, setAllAvailableItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
        Alert.alert("Error", result.message);
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setError("Failed to fetch menu items. Network error.");
      Alert.alert("Error", "Failed to fetch menu items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllItems();
    setSearchQuery("");
    setSelectedItems({});
  }, [fetchAllItems]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
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
      const updated = { ...prev };
      if (updated[item.id]) delete updated[item.id];
      else updated[item.id] = item;
      return updated;
    });
  };

  const handleAddSelected = () => {
    const itemsToAdd = Object.values(selectedItems);
    if (itemsToAdd.length === 0) {
      Alert.alert(
        "No Items Selected",
        "Please select at least one item to add."
      );
      return;
    }
    onAddItems(itemsToAdd);
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
        onPress={() => toggleSelectItem(item)}
        activeOpacity={0.8}
        className={`flex-row items-center mb-3 rounded-2xl p-4 ${
          isSelected
            ? "bg-green-100 border-2 border-green-500"
            : "bg-white border border-gray-200"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            className="w-16 h-16 rounded-xl mr-4"
          />
        ) : (
          <View className="w-16 h-16 rounded-xl mr-4 bg-gray-200 justify-center items-center">
            <Ionicons name="image" size={30} color="#6B7280" />
          </View>
        )}

        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
          <Text className="text-sm text-green-700 font-semibold mt-1">
            {item.price} • {item.item_group}
          </Text>
        </View>

        <Ionicons
          name={isSelected ? "checkmark-circle" : "add-circle-outline"}
          size={30}
          color={isSelected ? "#10B981" : "#9CA3AF"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 mt-4">
      {/* Search Input */}
      <View
        className="flex-row items-center bg-white border border-green-300 rounded-full px-4 py-2 mb-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Ionicons
          name="search"
          size={20}
          color="#10B981"
          style={{ marginRight: 8 }}
        />
        <TextInput
          className="flex-1 text-base text-gray-700"
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

      {/* List Section */}
      <View
        className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 p-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text className="text-gray-600 mt-4 text-base">
              Loading items...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center py-10">
            <Ionicons name="warning-outline" size={48} color="#EF4444" />
            <Text className="text-red-600 font-semibold mt-4 text-center">
              {error}
            </Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="flex-1 justify-center items-center py-10">
            <Ionicons name="search-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg font-medium mt-4">
              No items found
            </Text>
            <Text className="text-gray-400 text-sm mt-2">
              Try a different keyword
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between items-center mt-4">
        <TouchableOpacity
          onPress={onCancel}
          className="bg-gray-200 py-3 px-6 rounded-full flex-row items-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Ionicons
            name="close-circle-outline"
            size={20}
            color="#4B5563"
            style={{ marginRight: 8 }}
          />
          <Text className="text-gray-800 font-medium">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAddSelected}
          disabled={loading || Object.keys(selectedItems).length === 0}
          className="py-3 px-6 rounded-full flex-row items-center"
          style={{
            backgroundColor:
              Object.keys(selectedItems).length > 0 ? "#16A34A" : "#86EFAC",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons
            name="add-circle"
            size={24}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-bold">
            Add {Object.keys(selectedItems).length || ""} Item(s)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
