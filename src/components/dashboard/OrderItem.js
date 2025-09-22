import { View, Text } from "react-native";

export const OrderItem = ({ item_name, qty, stock_reserved_qty }) => {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-emerald-200">
      <Text className="text-sm font-medium text-gray-700">{item_name}</Text>
      <Text className="text-sm font-medium">
        <Text className="text-emerald-600">{Math.round(qty)}</Text>
        {/* <Text className="text-gray-500">
          {" "}
          / {Math.round(stock_reserved_qty)}
        </Text> */}
      </Text>
    </View>
  );
};
