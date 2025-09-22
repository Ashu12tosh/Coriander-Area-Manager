import { View, Text, TouchableOpacity } from "react-native";

const tabsList = ["Daily", "Weekly", "Monthly", "Custom"];

export const DashboardTabs = ({ activeTab, onTabChange }) => {
  return (
    <View className="mb-4 bg-white rounded-lg shadow-sm p-1">
      <View className="flex-row">
        {tabsList.map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-2 items-center rounded-md ${
              activeTab === tab ? "bg-green-100" : ""
            }`}
            onPress={() => onTabChange(tab)}
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
    </View>
  );
};
