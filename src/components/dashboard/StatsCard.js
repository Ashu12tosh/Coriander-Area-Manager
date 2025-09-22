// import { View, Text } from "react-native";

// export const StatsCard = ({ label, value }) => {
//   return (
//     <View
//       className="
//         flex-1 m-2 rounded-xl bg-white shadow-sm
//         border border-emerald-500 p-4 min-h-[120px] justify-center
//       "
//     >
//       <Text className="text-5xl font-extrabold text-emerald-600 text-center">
//         {value}
//       </Text>
//       <View className="mt-2 flex-row justify-center">
//         <Text
//           className="
//             px-3 py-1 rounded-full text-xs
//             bg-emerald-100 text-emerald-700
//           "
//         >
//           {label}
//         </Text>
//       </View>
//     </View>
//   );
// };

import { View, Text, ActivityIndicator } from "react-native";

export const StatsCard = ({ label, value, loading = false }) => {
  return (
    <View
      className="
        flex-1 m-2 rounded-xl bg-white shadow-sm 
        border border-emerald-500 p-4 min-h-[120px] justify-center
      "
    >
      {loading ? (
        <ActivityIndicator size="large" color="#10b981" />
      ) : (
        <>
          <Text className="text-5xl font-extrabold text-emerald-600 text-center">
            {value}
          </Text>
          <View className="mt-2 flex-row justify-center">
            <Text
              className="
                px-3 py-1 rounded-full text-xs 
                bg-emerald-100 text-emerald-700
              "
            >
              {label}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};
