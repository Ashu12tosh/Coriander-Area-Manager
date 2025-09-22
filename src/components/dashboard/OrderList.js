import { View, Text } from "react-native";
import { OrderItem } from "./OrderItem";

export const OrderList = ({ items }) => {
  return (
    <View className="rounded-xl p-4 m-2 bg-white shadow-sm border border-emerald-300 relative">
      {/* Header */}
      <View className="flex-row justify-between pb-3 border-b border-emerald-200">
        <Text className="font-medium text-sm text-emerald-700">Item</Text>
        <Text className="font-medium text-sm text-emerald-700">Ordered</Text>
      </View>

      {/* Items */}
      {items.map((item) => (
        <OrderItem key={item.item_code} {...item} />
      ))}
    </View>
  );
};
