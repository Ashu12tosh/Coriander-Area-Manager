// // src/components/menu/EditMenuModal.js
// import React from "react";
// import {
//   Modal,
//   View,
//   Text,
//   TextInput,
//   Pressable,
//   Alert,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import * as ImagePicker from "expo-image-picker";
// import {
//   // createMenuItem, // Removed as per new requirement
//   ITEM_GROUPS,
//   // validateItemCode, // Removed as per new requirement
//   updateMenuItem, // We'll assume this exists or create it next if needed
// } from "../../services/menuService";

// export default function EditMenuModal({
//   visible,
//   editingItem, // This will always be an existing item now
//   editForm,
//   setEditForm,
//   onSave, // This prop now receives the updated item object
//   onClose,
// }) {
//   const [loading, setLoading] = React.useState(false);

//   // Helper to get raw price from formatted string
//   const getRawPrice = (priceString) => parseFloat(priceString.replace("₹", ""));

//   const pickImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert(
//         "Permission Required",
//         "Please allow access to your gallery."
//       );
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.7,
//       allowsEditing: true,
//       aspect: [1, 1],
//     });

//     if (!result.canceled && result.assets?.length > 0) {
//       setEditForm({ ...editForm, image: result.assets[0].uri });
//     }
//   };

//   const handleSave = async () => {
//     // Validation for editing
//     if (!editForm.name.trim()) {
//       Alert.alert("Error", "Please enter item name");
//       return;
//     }
//     const parsedPrice = parseFloat(editForm.price);
//     if (isNaN(parsedPrice) || parsedPrice <= 0) {
//       Alert.alert("Error", "Please enter a valid positive price");
//       return;
//     }
//     if (!editForm.description.trim()) {
//       Alert.alert("Error", "Please enter description");
//       return;
//     }
//     // item_group and item_code are not editable for existing items,
//     // so no validation needed here.

//     setLoading(true);
//     try {
//       // Prepare data for updateMenuItem API
//       const updatedData = {
//         item_name: editForm.name.trim(),
//         description: editForm.description.trim(),
//         standard_rate: parsedPrice,
//         image: editForm.image, // Pass the image URI. The backend should handle existing images vs new uploads.
//         // Add other fields you want to update via API if applicable
//       };

//       // Call the API to update the item
//       const result = await updateMenuItem(editingItem.item_code, updatedData);

//       if (result.status === "success") {
//         Alert.alert("Success", "Menu item updated successfully!");
//         // Construct the updated item object to pass back to onSave
//         const updatedItem = {
//           ...editingItem, // Keep existing properties
//           name: editForm.name,
//           price: `₹${parsedPrice.toFixed(2)}`,
//           description: editForm.description,
//           discount: editForm.discount || null, // Ensure discount is updated
//           image: result.image || editForm.image, // Use backend's updated image path if provided
//         };
//         onSave(updatedItem); // Pass the updated item back to MenuScreen
//       } else {
//         Alert.alert("Error", result.message);
//       }
//     } catch (error) {
//       console.error("Error during item update:", error);
//       Alert.alert("Error", "Failed to update menu item. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <View className="flex-1 justify-center items-center bg-black/30">
//         <View className="bg-white rounded-2xl p-5 w-11/12 max-h-5/6 shadow-lg">
//           <ScrollView showsVerticalScrollIndicator={false}>
//             <View className="items-center mb-3">
//               <Ionicons name="create-outline" size={36} color="#4CAF50" />
//               <Text className="text-xl font-bold text-gray-800 mt-2">
//                 Edit Menu Item
//               </Text>
//               {/* Display item code for reference */}
//               {editingItem?.item_code && (
//                 <Text className="text-sm text-gray-500 mt-1">
//                   Code: {editingItem.item_code}
//                 </Text>
//               )}
//             </View>

//             {/* Item Code - REMOVED for new items, now just display if available */}
//             {/* Item Code and Item Group are not editable as per new flow, so they are not inputs */}

//             {/* Item Name */}
//             <TextInput
//               className="border rounded px-3 py-2 mb-3"
//               placeholder="Item Name"
//               value={editForm.name}
//               onChangeText={(text) => setEditForm({ ...editForm, name: text })}
//             />

//             {/* Price */}
//             <TextInput
//               className="border rounded px-3 py-2 mb-3"
//               placeholder="Price (₹)"
//               value={editForm.price}
//               onChangeText={(text) => setEditForm({ ...editForm, price: text })}
//               keyboardType="numeric"
//             />

//             {/* Item Group Display (not editable) */}
//             {editingItem?.item_group && (
//               <View className="border rounded px-3 py-2 mb-3 bg-gray-100">
//                 <Text className="text-gray-700">
//                   Item Group: {editingItem.item_group}
//                 </Text>
//               </View>
//             )}

//             {/* Discount */}
//             <TextInput
//               className="border rounded px-3 py-2 mb-3"
//               placeholder="Discount (%)"
//               value={editForm.discount}
//               onChangeText={(text) =>
//                 setEditForm({ ...editForm, discount: text })
//               }
//               keyboardType="numeric"
//             />

//             {/* Description */}
//             <TextInput
//               className="border rounded px-3 py-2 mb-3 h-20"
//               placeholder="Description"
//               value={editForm.description}
//               onChangeText={(text) =>
//                 setEditForm({ ...editForm, description: text })
//               }
//               multiline
//               textAlignVertical="top"
//             />

//             {/* Image Picker */}
//             <View className="mb-3">
//               {editForm.image ? (
//                 <Image
//                   source={{ uri: editForm.image }}
//                   style={{
//                     width: 100,
//                     height: 100,
//                     borderRadius: 8,
//                     alignSelf: "center",
//                     marginBottom: 8,
//                   }}
//                 />
//               ) : null}

//               <TouchableOpacity
//                 onPress={pickImage}
//                 className="bg-blue-500 py-2 px-4 rounded self-center"
//                 disabled={loading}
//               >
//                 <Text className="text-white font-semibold">
//                   {editForm.image ? "Change Image" : "Upload Image"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>

//           {/* Buttons */}
//           <View className="flex-row justify-end mt-4">
//             <Pressable
//               className="px-4 py-2 bg-gray-300 rounded mr-2"
//               onPress={onClose}
//               disabled={loading}
//             >
//               <Text>Cancel</Text>
//             </Pressable>
//             <Pressable
//               className="px-4 py-2 bg-green-500 rounded flex-row items-center"
//               onPress={handleSave}
//               disabled={loading}
//             >
//               {loading && (
//                 <ActivityIndicator
//                   size="small"
//                   color="white"
//                   className="mr-2"
//                 />
//               )}
//               <Text className="text-white">
//                 {loading ? "Saving..." : "Save"}
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// src/components/menu/EditMenuModal.js
import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import {
  // createMenuItem, // Removed as per new requirement
  ITEM_GROUPS,
  // validateItemCode, // Removed as per new requirement
  updateMenuItem, // This function is now used here
} from "../../services/menuService";

export default function EditMenuModal({
  visible,
  editingItem, // This will always be an existing item now
  editForm,
  setEditForm,
  onSave, // This prop now receives the updated item object
  onClose,
}) {
  const [loading, setLoading] = React.useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your gallery."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets?.length > 0) {
      setEditForm({ ...editForm, image: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    // Validation for editing
    if (!editForm.name.trim()) {
      Alert.alert("Error", "Please enter item name");
      return;
    }
    const parsedPrice = parseFloat(editForm.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Error", "Please enter a valid positive price");
      return;
    }
    if (!editForm.description.trim()) {
      Alert.alert("Error", "Please enter description");
      return;
    }
    // item_group and item_code are not editable for existing items,
    // so no validation needed here for them as inputs.

    setLoading(true);
    try {
      // Prepare data for updateMenuItem API
      const updatedData = {
        item_name: editForm.name.trim(),
        description: editForm.description.trim(),
        standard_rate: parsedPrice,
        // image: editForm.image, // Pass the image URI. The backend should handle existing images vs new uploads.
      };

      // Handle image upload separately if it's a new local image
      let imageToUpload = null;
      if (editForm.image && editForm.image.startsWith("file://")) {
        imageToUpload = editForm.image;
      }

      // Call the API to update the item
      const result = await updateMenuItem(
        editingItem.item_code,
        updatedData,
        imageToUpload
      );

      if (result.status === "success") {
        Alert.alert("Success", "Menu item updated successfully!");
        // Construct the updated item object to pass back to onSave in MenuScreen
        const updatedItem = {
          ...editingItem, // Keep existing properties
          name: editForm.name,
          price: `₹${parsedPrice.toFixed(2)}`,
          description: editForm.description,
          discount: editForm.discount || null, // Ensure discount is updated
          image: result.image || editingItem.image, // Use backend's updated image path if provided, else keep old
          // isVisible is toggled via separate API, not edited here
        };
        onSave(updatedItem); // Pass the updated item back to MenuScreen
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error("Error during item update:", error);
      Alert.alert("Error", "Failed to update menu item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/30">
        <View className="bg-white rounded-2xl p-5 w-11/12 max-h-5/6 shadow-lg">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="items-center mb-3">
              <Ionicons name="create-outline" size={36} color="#4CAF50" />
              <Text className="text-xl font-bold text-gray-800 mt-2">
                Edit Menu Item
              </Text>
              {/* Display item code for reference */}
              {editingItem?.item_code && (
                <Text className="text-sm text-gray-500 mt-1">
                  Code: {editingItem.item_code}
                </Text>
              )}
            </View>

            {/* Item Name */}
            <TextInput
              className="border rounded px-3 py-2 mb-3"
              placeholder="Item Name"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            />

            {/* Price */}
            <TextInput
              className="border rounded px-3 py-2 mb-3"
              placeholder="Price (₹)"
              value={editForm.price}
              onChangeText={(text) => setEditForm({ ...editForm, price: text })}
              keyboardType="numeric"
            />

            {/* Item Group Display (not editable) */}
            {editingItem?.item_group && (
              <View className="border rounded px-3 py-2 mb-3 bg-gray-100">
                <Text className="text-gray-700">
                  Item Group: {editingItem.item_group}
                </Text>
              </View>
            )}

            {/* Discount */}
            <TextInput
              className="border rounded px-3 py-2 mb-3"
              placeholder="Discount (%)"
              value={editForm.discount}
              onChangeText={(text) =>
                setEditForm({ ...editForm, discount: text })
              }
              keyboardType="numeric"
            />

            {/* Description */}
            <TextInput
              className="border rounded px-3 py-2 mb-3 h-20"
              placeholder="Description"
              value={editForm.description}
              onChangeText={(text) =>
                setEditForm({ ...editForm, description: text })
              }
              multiline
              textAlignVertical="top"
            />

            {/* Image Picker */}
            <View className="mb-3">
              {editForm.image ? (
                <Image
                  source={{ uri: editForm.image }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    alignSelf: "center",
                    marginBottom: 8,
                  }}
                  onError={(e) =>
                    console.log(
                      "EditModal Image load error:",
                      e.nativeEvent.error,
                      "for URI:",
                      editForm.image
                    )
                  }
                />
              ) : null}

              <TouchableOpacity
                onPress={pickImage}
                className="bg-blue-500 py-2 px-4 rounded self-center"
                disabled={loading}
              >
                <Text className="text-white font-semibold">
                  {editForm.image ? "Change Image" : "Upload Image"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View className="flex-row justify-end mt-4">
            <Pressable
              className="px-4 py-2 bg-gray-300 rounded mr-2"
              onPress={onClose}
              disabled={loading}
            >
              <Text>Cancel</Text>
            </Pressable>
            <Pressable
              className="px-4 py-2 bg-green-500 rounded flex-row items-center"
              onPress={handleSave}
              disabled={loading}
            >
              {loading && (
                <ActivityIndicator
                  size="small"
                  color="white"
                  className="mr-2"
                />
              )}
              <Text className="text-white">
                {loading ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
