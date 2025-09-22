// src/components/profile/ProfileCard.js
import React from "react";
import { View, Text } from "react-native";

const ProfileCard = ({ profile }) => {
  return (
    <View className="bg-green-600 rounded-2xl p-4 mb-4 shadow-md">
      <View className="flex-row items-center">
        <View className="w-14 h-14 rounded-full bg-white justify-center items-center">
          <Text className="text-xl font-bold text-green-700">
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-white text-lg font-semibold">
            {profile.name}
          </Text>
          <Text className="text-green-100">{profile.email}</Text>
          <Text className="text-green-100">{profile.phone}</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileCard;
