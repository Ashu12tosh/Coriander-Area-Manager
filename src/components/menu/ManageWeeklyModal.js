import { Modal, View, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ManageWeeklyModal({
  visible,
  onClose,
  onUpload,
  onAdd, // This prop will now trigger the inline add section
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/30">
        <View className="bg-white rounded-2xl p-5 w-11/12 shadow-lg relative">
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-3 top-3 z-10"
          >
            <Ionicons name="close-circle" size={28} color="#EF4444" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-center mb-4">
            Upload Weekly Menu
          </Text>

          <TouchableOpacity
            onPress={onUpload}
            className="bg-green-500 py-2 rounded mb-2"
          >
            <Text className="text-white text-center">Upload (.xls only)</Text>
          </TouchableOpacity>

          <Text className="text-center mb-2">OR</Text>

          <TouchableOpacity
            onPress={onAdd} // This will now trigger the inline add section in MenuScreen
            className="bg-blue-500 py-2 rounded"
          >
            <Text className="text-white text-center">Add to Today’s Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
