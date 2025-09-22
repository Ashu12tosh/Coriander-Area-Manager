import React from "react";
import MenuItemCard from "./MenuItemCard";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MenuList({
  items,
  context,
  toggleVisibility,
  handleEdit,
  handleDelete,
}) {
  // Show empty state if no items
  if (!items || items.length === 0) {
    return (
      <View className="mb-6 bg-white rounded-lg p-8 shadow-sm items-center">
        <Ionicons name="restaurant-outline" size={48} color="#9CA3AF" />
        <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
          No menu items yet
        </Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          Add your first menu item to get started
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-6">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          context={context}
          toggleVisibility={toggleVisibility}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      ))}
    </View>
  );
}
