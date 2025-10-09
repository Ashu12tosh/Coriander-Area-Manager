import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const SubmanagersModal = ({
  visible,
  onClose,
  submanagersData,
  loading,
  selectedWarehouse,
}) => {
  // Filter submanagers for the selected warehouse
  const getSubmanagersForSelectedWarehouse = () => {
    if (!submanagersData || !selectedWarehouse) return [];
    
    const warehouseData = submanagersData.find(
      (wh) => wh.corporate_code === selectedWarehouse.corporate_code
    );
    
    return warehouseData?.users || [];
  };

  // Function to handle phone number press
  const handlePhonePress = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert("No Phone Number", "This submanager doesn't have a phone number registered.");
      return;
    }

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const phoneUrl = `tel:${cleanNumber}`;

    Alert.alert(
      "Call Submanager",
      `Do you want to call ${cleanNumber}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Call",
          onPress: () => Linking.openURL(phoneUrl)
        }
      ]
    );
  };

  // Function to handle email press
  const handleEmailPress = (email, name) => {
    if (!email) {
      Alert.alert("No Email", "This submanager doesn't have an email address registered.");
      return;
    }

    const emailUrl = `mailto:${email}`;

    Alert.alert(
      "Email Submanager",
      `Do you want to email ${name || 'this submanager'} at ${email}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Email",
          onPress: () => Linking.openURL(emailUrl)
        }
      ]
    );
  };

  const submanagers = getSubmanagersForSelectedWarehouse();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white p-5 rounded-xl w-full max-w-md shadow-lg max-h-[80%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-green-800">
              Submanagers
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Selected Warehouse Info */}
          <View className="bg-green-50 p-3 rounded-lg mb-4">
            <Text className="text-green-800 font-semibold">
              {selectedWarehouse?.warehouse || "No Warehouse Selected"}
            </Text>
            <Text className="text-green-600 text-sm">
              Corporate Code: {selectedWarehouse?.corporate_code || "N/A"}
            </Text>
          </View>

          {/* Content */}
          {loading ? (
            <View className="py-8">
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text className="text-center text-gray-600 mt-2">
                Loading submanagers...
              </Text>
            </View>
          ) : submanagers.length === 0 ? (
            <View className="py-8">
              <Ionicons name="people-outline" size={48} color="#9CA3AF" className="text-center" />
              <Text className="text-center text-gray-500 mt-2">
                No submanagers found for this warehouse
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-gray-600 mb-3">
                {submanagers.length} submanager(s) found
              </Text>
              
              {submanagers.map((submanager, index) => (
                <View
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200"
                >
                  {/* Name */}
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="person" size={16} color="#4B5563" />
                    <Text className="text-gray-800 font-semibold ml-2 text-base">
                      {submanager.full_name || "N/A"}
                    </Text>
                  </View>

                  {/* Email - Now clickable */}
                  <TouchableOpacity 
                    onPress={() => handleEmailPress(submanager.email, submanager.full_name)}
                    disabled={!submanager.email}
                    className="flex-row items-center mb-2"
                  >
                    <Ionicons 
                      name="mail" 
                      size={14} 
                      color={submanager.email ? "#007AFF" : "#9CA3AF"} 
                    />
                    <Text 
                      className={`text-sm ml-2 ${
                        submanager.email 
                          ? "text-blue-600 font-medium" 
                          : "text-gray-400"
                      }`}
                    >
                      {submanager.email || "N/A"}
                      {submanager.email && (
                        <Text className="text-blue-500 text-xs ml-1"></Text>
                      )}
                    </Text>
                  </TouchableOpacity>

                  {/* Mobile Number - Clickable */}
                  <TouchableOpacity 
                    onPress={() => handlePhonePress(submanager.mobile_no)}
                    disabled={!submanager.mobile_no}
                    className="flex-row items-center mb-2"
                  >
                    <Ionicons 
                      name="call" 
                      size={14} 
                      color={submanager.mobile_no ? "#4CAF50" : "#9CA3AF"} 
                    />
                    <Text 
                      className={`text-sm ml-2 ${
                        submanager.mobile_no 
                          ? "text-green-600 font-medium" 
                          : "text-gray-400"
                      }`}
                    >
                      {submanager.mobile_no ? `+91-${submanager.mobile_no}` : "N/A"}
                      {submanager.mobile_no && (
                        <Text className="text-blue-500 text-xs ml-1"></Text>
                      )}
                    </Text>
                  </TouchableOpacity>

                  {/* User Type */}
                  {/* <View className="flex-row items-center mb-1">
                    <Ionicons name="briefcase" size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-sm ml-2">
                      {submanager.user_type}
                    </Text>
                  </View> */}

                  {/* Status Badge */}
                  <View className={`absolute top-3 right-3 px-2 py-1 rounded-full ${
                    submanager.enabled ? "bg-green-100" : "bg-red-100"
                  }`}>
                    <Text className={`text-xs font-medium ${
                      submanager.enabled ? "text-green-800" : "text-red-800"
                    }`}>
                      {submanager.enabled ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="bg-green-600 py-3 rounded-lg mt-4"
          >
            <Text className="text-center text-white font-semibold">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SubmanagersModal;