import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const ScanButton = ({ onPress }) => {
  return (
    <View className="items-center mb-10">
      <TouchableOpacity
        onPress={onPress}
        className="
          px-6 py-3 rounded-xl flex-row items-center justify-center 
          w-1/2 max-w-xs shadow-sm bg-white border border-emerald-500
        "
      >
        <Ionicons
          name="qr-code"
          size={24}
          color="#059669" // Tailwind emerald-600
        />
        <Text
          className="
            text-lg font-semibold ml-3 text-emerald-700
          "
        >
          Scan to Deliver
        </Text>
      </TouchableOpacity>

      <Text className="text-sm mt-2 text-gray-500">
        Press to scan delivery QR code
      </Text>
    </View>
  );
};
