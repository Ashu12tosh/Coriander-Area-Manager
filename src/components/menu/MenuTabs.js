import { View, Text, TouchableOpacity } from "react-native";

export default function MenuTabs({ activeTab, setActiveTab }) {
  return (
    <View className="mb-4 bg-white rounded-lg shadow-sm p-1 flex-row">
      {["Today's Menu", "Weekly Menu"].map((tab) => (
        <TouchableOpacity
          key={tab}
          className={`flex-1 py-2 items-center rounded-md ${
            activeTab === tab ? "bg-green-100" : ""
          }`}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            className={`font-medium ${
              activeTab === tab ? "text-green-700" : "text-gray-500"
            }`}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
