// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   Switch,
//   Alert,
// } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";

// export default function MenuItemCard({
//   item,
//   context,
//   toggleVisibility,
//   handleEdit,
//   handleDelete,
// }) {
//   const confirmDelete = () => {
//     Alert.alert(
//       "Delete Item",
//       `Are you sure you want to delete "${item.name}"?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () => handleDelete(item.id, context),
//         },
//       ]
//     );
//   };

//   return (
//     <View className="mb-4 bg-white rounded-lg p-4 shadow-sm">
//       <View className="flex-row justify-between items-start">
//         <View className="flex-row flex-1 pr-2">
//           <Image
//             source={{ uri: item.image }}
//             className="w-16 h-16 rounded-full mr-3"
//           />
//           <View className="flex-1">
//             <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
//             <Text className="text-green-600 font-bold mt-1">{item.price}</Text>
//             {item.discount && (
//               <Text className="text-blue-500 text-sm mt-1">
//                 Discount: {item.discount}%
//               </Text>
//             )}
//             <Text className="text-gray-600 mt-2 whitespace-pre-line">
//               {item.description.replace(/<[^>]+>/g, "")}
//             </Text>
//           </View>
//         </View>

//         <View className="items-center">
//           <Switch
//             value={item.isVisible}
//             // Pass the entire item object to toggleVisibility
//             onValueChange={() => toggleVisibility(item, context)}
//             trackColor={{ false: "#ddd", true: "#A7F3D0" }}
//             thumbColor={item.isVisible ? "#10B981" : "#f4f3f4"}
//           />
//           <Text
//             className={`text-xs mt-0.5 ${
//               item.isVisible ? "text-green-700" : "text-gray-400"
//             }`}
//           >
//             {item.isVisible ? "Visible" : "Hidden"}
//           </Text>

//           <View className="flex-row mt-2">
//             {/* <TouchableOpacity
//               onPress={() => handleEdit(item, context)}
//               className="mr-3"
//             >
//               <Ionicons name="pencil" size={20} color="#4B5563" />
//             </TouchableOpacity> */}

//             <TouchableOpacity onPress={confirmDelete}>
//               <Ionicons name="trash" size={20} color="#EF4444" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// }
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function MenuItemCard({
  item,
  context,
  toggleVisibility,
  handleEdit,
  handleDelete,
}) {
  const confirmDelete = () => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(item.id, context),
        },
      ]
    );
  };

  return (
    <View className="mb-4 bg-white rounded-lg p-4 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-row flex-1 pr-2">
          <Image
            source={{ uri: item.image }}
            className="w-16 h-16 rounded-full mr-3"
          />
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
            <Text className="text-yellow-600 font-bold mt-1">{item.item_group}</Text>
            <Text className="text-green-600 font-bold mt-1">{item.price}</Text>
            {item.discount && (
              <Text className="text-blue-500 text-sm mt-1">
                Discount: {item.discount}%
              </Text>
            )}
            <Text className="text-gray-600 mt-2 whitespace-pre-line">
              {item.description.replace(/<[^>]+>/g, "")}
            </Text>
          </View>
        </View>

        <View className="items-center">
          <Switch
            value={item.isVisible}
            // Pass the entire item object to toggleVisibility
            onValueChange={() => toggleVisibility(item, context)}
            trackColor={{ false: "#ddd", true: "#A7F3D0" }}
            thumbColor={item.isVisible ? "#10B981" : "#f4f3f4"}
          />
          {/* <Text
            className={`text-xs mt-0.5 ${
              item.isVisible ? "text-green-700" : "text-gray-400"
            }`}
          >
            {item.isVisible ? "Visible" : "Hidden"}
          </Text> */}

          <View className="flex-row mt-2">
            {/* <TouchableOpacity
              onPress={() => handleEdit(item, context)}
              className="mr-3"
            >
              <Ionicons name="pencil" size={20} color="#4B5563" />
            </TouchableOpacity> */}

            {/* <TouchableOpacity onPress={confirmDelete}>
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </View>
  );
}
