import { View, Text } from "react-native";

export const InventoryItem = ({ name, pending, total }) => {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-emerald-200">
      <Text className="text-sm font-medium text-gray-700">{name}</Text>
      <Text className="text-sm font-medium">
        <Text className="text-emerald-600">{Math.round(pending)}</Text>
        <Text className="text-gray-500"> / {Math.round(total)}</Text>
      </Text>
    </View>
  );
};
