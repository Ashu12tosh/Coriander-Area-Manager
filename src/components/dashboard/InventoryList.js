import { View, Text } from "react-native";
import { InventoryItem } from "./InventoryItem";

export const InventoryList = ({ items }) => {
  return (
    <View
      className="
        rounded-xl p-4 m-2 bg-white shadow-sm 
        border border-emerald-300 relative
      "
    >
      {/* Header */}
      <View className="flex-row justify-between pb-3 border-b border-emerald-200">
        <Text className="font-medium text-sm text-emerald-700">
          Pending Orders
        </Text>
        <Text className="font-medium text-sm text-emerald-700">Available</Text>
      </View>

      {/* Items */}
      {items.map((item) => (
        <InventoryItem key={item.id} {...item} />
      ))}
    </View>
  );
};
