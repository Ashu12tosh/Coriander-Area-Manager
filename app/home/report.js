// import React, { useState } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   TouchableOpacity,
//   Dimensions,
// } from "react-native";
// import { useDispatch } from "react-redux";
// import { logoutUser } from "../../src/redux/slices/authSlice";
// import { Header } from "../../src/components/header/Header";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { BarChart } from "react-native-chart-kit";

// const mockDashboardData = {
//   companyInfo: {
//     name: "White House, United States America",
//     address: "B-401, Sec-10, Noida",
//   },
// };

// const tabs = ["Today", "This Week", "This Month", "Custom"];

// const reports = [
//   "Daily ordering report",
//   "Frequently ordered items",
//   "Cancellation Report",
//   "Person wise orders",
//   "View the feedback food rating",
//   "Item performance Report",
//   "Wastage Report",
// ];

// const chartData = {
//   labels: ["Hot Coffee", "Cold Coffee", "Veg Thali"],
//   datasets: [
//     {
//       data: [45, 50, 80],
//     },
//   ],
// };

// const screenWidth = Dimensions.get("window").width;

// export default function ReportsScreen() {
//   const dispatch = useDispatch();
//   const [activeTab, setActiveTab] = useState("Today");
//   const [selectedReport, setSelectedReport] = useState(null);

//   const handleTabChange = (tab) => setActiveTab(tab);

//   const handleLogout = () => {
//     dispatch(logoutUser());
//     console.log("User logged out");
//   };

//   const handleReportSelect = (report) => {
//     if (selectedReport === report) {
//       setSelectedReport(null);
//     } else {
//       setSelectedReport(report);
//       console.log(`Selected report: ${report}`);
//     }
//   };

//   return (
//     <ScrollView className="flex-1 px-4 pt-4 bg-green-50">
//       <Header
//         companyInfo={mockDashboardData.companyInfo}
//         onLogout={handleLogout}
//       />

//       <View className="flex-row items-center mb-4">
//         <Ionicons name="analytics" size={24} color="#1F2937" />
//         <Text className="text-2xl font-extrabold text-green-900 ml-2">
//           Reports
//         </Text>
//       </View>

//       {/* Tabs */}
//       <View className="mb-4 bg-white rounded-lg shadow-sm p-1 flex-row">
//         {tabs.map((tab) => (
//           <TouchableOpacity
//             key={tab}
//             className={`flex-1 py-2 items-center rounded-md ${
//               activeTab === tab ? "bg-green-100" : ""
//             }`}
//             onPress={() => handleTabChange(tab)}
//           >
//             <Text
//               className={`font-medium ${
//                 activeTab === tab ? "text-green-700" : "text-gray-500"
//               }`}
//             >
//               {tab}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Reports */}
//       {reports.map((report, idx) => (
//         <View key={idx}>
//           <TouchableOpacity
//             onPress={() => handleReportSelect(report)}
//             activeOpacity={0.8}
//           >
//             <View
//               className={`rounded-xl px-4 py-3 mb-3 flex-row justify-between items-center shadow-sm ${
//                 selectedReport === report
//                   ? "bg-green-100 border-2 border-green-500"
//                   : "bg-white"
//               }`}
//             >
//               <Text
//                 className={`text-base ${
//                   selectedReport === report
//                     ? "text-green-800 font-semibold"
//                     : "text-gray-700"
//                 }`}
//               >
//                 {report}
//               </Text>
//               <Ionicons
//                 name={selectedReport === report ? "chevron-up" : "chevron-down"}
//                 size={20}
//                 color={selectedReport === report ? "#166534" : "#6B7280"}
//               />
//             </View>
//           </TouchableOpacity>

//           {/* Bar Chart */}
//           {selectedReport === report && (
//             <View className="mb-6">
//               <BarChart
//                 data={chartData}
//                 width={screenWidth - 32} // minus px-4
//                 height={220}
//                 yAxisLabel=""
//                 yAxisSuffix=" pcs"
//                 chartConfig={{
//                   backgroundColor: "#ffffff", // white background
//                   backgroundGradientFrom: "#ffffff", // white gradient start
//                   backgroundGradientTo: "#ffffff", // white gradient end
//                   decimalPlaces: 0,
//                   color: (opacity = 1) => `rgba(21, 128, 61, ${opacity})`, // green bars
//                   labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`, // dark grey labels
//                   barPercentage: 0.6,
//                   propsForBackgroundLines: {
//                     strokeWidth: 0, // hide grid lines
//                   },
//                 }}
//                 style={{
//                   marginVertical: 8,
//                   borderRadius: 8,
//                   alignSelf: "center",
//                 }}
//               />
//             </View>
//           )}
//         </View>
//       ))}
//     </ScrollView>
//   );
// }

import React, { useState, useEffect, useCallback } from "react"; // Import useCallback
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator, // Added for loading indicator
  RefreshControl, // Added for pull-to-refresh
  Alert, // Added for error alerts
} from "react-native";
import { useDispatch, useSelector } from "react-redux"; // Import useSelector
import { logoutUser } from "../../src/redux/slices/authSlice";
import {
  setWarehouses,
  setSelectedWarehouse,
  setWarehouseLoading,
  setWarehouseError,
} from "../../src/redux/slices/warehouseSlice"; // Import warehouse actions
import { Header } from "../../src/components/header/Header";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BarChart } from "react-native-chart-kit";
import { getWarehouseMappings } from "../../src/services/warehouseService"; // Import the new service

const tabs = ["Today", "This Week", "This Month", "Custom"];

const reports = [
  "Daily ordering report",
  "Frequently ordered items",
  "Cancellation Report",
  "Person wise orders",
  "View the feedback food rating",
  "Item performance Report",
  "Wastage Report",
];

const chartData = {
  labels: ["Hot Coffee", "Cold Coffee", "Veg Thali"],
  datasets: [
    {
      data: [45, 50, 80],
    },
  ],
};

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const dispatch = useDispatch();

  // --- REDUX STATE ---
  const {
    warehouses,
    selectedWarehouse,
    status: warehouseStatus,
    error: warehouseError,
  } = useSelector((state) => state.warehouse);
  // --- END REDUX STATE ---

  const [activeTab, setActiveTab] = useState("Today");
  const [selectedReport, setSelectedReport] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleLogout = () => {
    dispatch(logoutUser());
    console.log("User logged out");
    // In a real app, you might want to navigate to login after logout
    // For example, if using expo-router: router.replace("/login");
  };

  const handleReportSelect = (report) => {
    if (selectedReport === report) {
      setSelectedReport(null);
    } else {
      setSelectedReport(report);
      console.log(`Selected report: ${report}`);
    }
  };

  const fetchWarehouseData = useCallback(async () => {
    setRefreshing(true); // Start refreshing indicator
    dispatch(setWarehouseLoading()); // Indicate warehouse data is loading

    try {
      const warehouseResult = await getWarehouseMappings();
      if (
        warehouseResult.status === "success" &&
        warehouseResult.data.length > 0
      ) {
        dispatch(setWarehouses(warehouseResult.data)); // Dispatch to Redux

        let currentSelected = selectedWarehouse;
        // If no warehouse is currently selected in Redux OR if the previously selected one is not in the new list, set a default
        if (
          !currentSelected ||
          !warehouseResult.data.some(
            (wh) => wh.corporate_code === currentSelected.corporate_code
          )
        ) {
          const defaultWarehouse =
            warehouseResult.data.find((wh) => wh.is_default === 1) ||
            warehouseResult.data[0];
          dispatch(setSelectedWarehouse(defaultWarehouse)); // Dispatch to Redux
        }
      } else {
        console.error(
          "Failed to fetch warehouse mappings or no data:",
          warehouseResult.message
        );
        dispatch(setWarehouses([])); // Clear warehouses in Redux
        dispatch(
          setSelectedWarehouse({
            warehouse: "No Warehouse",
            corporate_code: "",
          })
        ); // Set a fallback in Redux
        Alert.alert(
          "Error",
          warehouseResult.message || "Failed to fetch warehouse data."
        );
      }
    } catch (error) {
      console.error("Error fetching warehouse mappings:", error);
      dispatch(setWarehouseError(error.message)); // Dispatch error to Redux
      dispatch(
        setSelectedWarehouse({ warehouse: "Error Loading", corporate_code: "" })
      ); // Set a fallback in Redux
      Alert.alert("Error", "Network error. Failed to load warehouse data.");
    } finally {
      setRefreshing(false); // End refreshing indicator
    }
  }, [selectedWarehouse, dispatch]); // Added dispatch as dependency

  // Fetch warehouse data on component mount
  useEffect(() => {
    fetchWarehouseData();
  }, [fetchWarehouseData]); // Empty dependency array means this runs once on mount

  const handleWarehouseSelect = (warehouse) => {
    dispatch(setSelectedWarehouse(warehouse)); // Dispatch to Redux store
    console.log("Selected warehouse on Reports screen:", warehouse.warehouse);
    // You might want to save this selected warehouse to AsyncStorage for persistence
    // and potentially re-fetch report data specific to this warehouse
  };

  // Show a loading indicator if warehouse data is not yet loaded or is currently loading
  if (warehouseStatus === "loading" || !selectedWarehouse) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="text-gray-600 mt-4 text-base">Loading Header...</Text>
      </View>
    );
  }

  // Error state for warehouse data
  if (
    warehouseStatus === "failed" ||
    (warehouses.length === 0 && !selectedWarehouse?.corporate_code)
  ) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Ionicons name="warning-outline" size={50} color="#EF4444" />
        <Text className="text-xl font-bold text-red-600 mt-4 text-center">
          Failed to Load Warehouse Data
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          {warehouseError ||
            "Please check your internet connection or try again later."}
        </Text>
        <TouchableOpacity
          onPress={fetchWarehouseData} // Retry fetching warehouse data
          className="bg-blue-500 py-3 px-6 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 py-3 px-6 rounded-lg mt-4"
        >
          <Text className="text-white font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-4 pt-4 bg-green-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchWarehouseData}
        />
      }
    >
      <Header
        companyInfo={{
          name: selectedWarehouse.warehouse, // Now dynamic from Redux state
          address: selectedWarehouse.corporate_code, // Now dynamic from Redux state
        }}
        warehouses={warehouses} // From Redux state
        selectedWarehouse={selectedWarehouse} // From Redux state
        onWarehouseSelect={handleWarehouseSelect} // Dispatches to Redux
        onLogout={handleLogout}
      />

      <View className="flex-row items-center mb-4">
        <Ionicons name="analytics" size={24} color="#1F2937" />
        <Text className="text-2xl font-extrabold text-green-900 ml-2">
          Reports
        </Text>
      </View>

      {/* Tabs */}
      <View className="mb-4 bg-white rounded-lg shadow-sm p-1 flex-row">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-2 items-center rounded-md ${
              activeTab === tab ? "bg-green-100" : ""
            }`}
            onPress={() => handleTabChange(tab)}
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

      {/* Reports */}
      {reports.map((report, idx) => (
        <View key={idx}>
          <TouchableOpacity
            onPress={() => handleReportSelect(report)}
            activeOpacity={0.8}
          >
            <View
              className={`rounded-xl px-4 py-3 mb-3 flex-row justify-between items-center shadow-sm ${
                selectedReport === report
                  ? "bg-green-100 border-2 border-green-500"
                  : "bg-white"
              }`}
            >
              <Text
                className={`text-base ${
                  selectedReport === report
                    ? "text-green-800 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {report}
              </Text>
              <Ionicons
                name={selectedReport === report ? "chevron-up" : "chevron-down"}
                size={20}
                color={selectedReport === report ? "#166534" : "#6B7280"}
              />
            </View>
          </TouchableOpacity>

          {/* Bar Chart */}
          {selectedReport === report && (
            <View className="mb-6">
              <BarChart
                data={chartData}
                width={screenWidth - 32} // minus px-4
                height={220}
                yAxisLabel=""
                yAxisSuffix=" pcs"
                chartConfig={{
                  backgroundColor: "#ffffff", // white background
                  backgroundGradientFrom: "#ffffff", // white gradient start
                  backgroundGradientTo: "#ffffff", // white gradient end
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(21, 128, 61, ${opacity})`, // green bars
                  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`, // dark grey labels
                  barPercentage: 0.6,
                  propsForBackgroundLines: {
                    strokeWidth: 0, // hide grid lines
                  },
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 8,
                  alignSelf: "center",
                }}
              />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
