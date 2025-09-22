// src/components/profile/NotificationModal.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";

const NotificationModal = ({
  visible,
  onClose,
  notificationData,
  setNotificationData,
  onSendNotification,
  sending,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const userTypeOptions = [
    { value: "submanager_only", label: "Submanager Only" },
    { value: "submanager_enduser", label: "Submanager and End User" },
    { value: "enduser_only", label: "End User Only" },
  ];

  // Default to empty string if no selection has been made
  const selectedOptionLabel = notificationData.userType 
    ? userTypeOptions.find(option => option.value === notificationData.userType)?.label 
    : "Select";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white p-5 rounded-xl w-full max-w-md shadow-lg relative">
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-3 right-3 z-10"
          >
            <Text className="text-gray-500 text-xl">✕</Text>
          </TouchableOpacity>

          <Text className="text-lg font-bold text-green-800 mb-4 pr-6">
            Send Personalized Notifications
          </Text>

          <View className="mb-4">
            <Text className="font-medium mb-2">Users:</Text>
            
            {/* Dropdown trigger */}
            <TouchableOpacity
              onPress={() => setShowDropdown(!showDropdown)}
              className="border border-gray-300 rounded-lg p-3 bg-white flex-row justify-between items-center"
            >
              <Text className={!notificationData.userType ? "text-gray-400" : ""}>
                {selectedOptionLabel}
              </Text>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
            
            {/* Dropdown options */}
            {showDropdown && (
              <View className="border border-gray-300 rounded-lg mt-1 bg-white absolute top-full left-0 right-0 z-10">
                {userTypeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setNotificationData({
                        ...notificationData,
                        userType: option.value,
                      });
                      setShowDropdown(false);
                    }}
                    className="p-3 border-b border-gray-200 last:border-b-0"
                  >
                    <Text>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View className="mb-4">
            <Text className="font-medium mb-2">Message:</Text>
            <TextInput
              placeholder="Type your message here..."
              value={notificationData.message}
              onChangeText={(text) =>
                setNotificationData({ ...notificationData, message: text })
              }
              className="border border-gray-300 rounded-lg p-3 h-32"
              multiline
              textAlignVertical="top"
              maxLength={100}
            />
            <Text className="text-right text-gray-500 text-xs mt-1">
              {notificationData.message.length}/100
            </Text>
          </View>

          <View className="flex-row mt-2">
            <TouchableOpacity
              className={`flex-1 bg-green-600 py-3 rounded-lg mr-2 ${
                sending || !notificationData.message.trim() || !notificationData.userType
                  ? "opacity-50"
                  : ""
              }`}
              onPress={onSendNotification}
              disabled={sending || !notificationData.message.trim() || !notificationData.userType}
            >
              <Text className="text-center text-white font-semibold">
                {sending ? "Sending..." : "Send Notifications"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-red-100 py-3 rounded-lg ml-2"
              onPress={onClose}
              disabled={sending}
            >
              <Text className="text-center text-red-600 font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationModal;