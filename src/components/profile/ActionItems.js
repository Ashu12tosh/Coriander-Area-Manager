// src/components/profile/ActionItems.js
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const ActionItems = ({ onNotificationPress, onSubmangerPress }) => {
  return (
    <View className="bg-white rounded-xl shadow-sm mb-4">
      <TouchableOpacity
        onPress={onNotificationPress }
        className="flex-row justify-between items-center px-4 py-4 border-b border-gray-100"
      >
        <Text className="text-gray-800 font-medium">Send Personalized Notifications</Text>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={onSubmangerPress }
        className="flex-row justify-between items-center px-4 py-4 border-b border-gray-100"
      >
        <Text className="text-gray-800 font-medium">Submanagers</Text>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
};

export default ActionItems;
