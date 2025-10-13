import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../src/redux/slices/authSlice";
import {
  setWarehouses,
  setSelectedWarehouse,
  setWarehouseLoading,
  setWarehouseError,
} from "../../src/redux/slices/warehouseSlice";
import { Header } from "../../src/components/header/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BarChart, PieChart } from "react-native-chart-kit";
import { getWarehouseMappings } from "../../src/services/warehouseService";
import {
  getAllOrderedItems,
  getDailyWastageReport,
  getCanceledItems,
} from "../../src/services/reportService";
import DateTimePicker from "@react-native-community/datetimepicker";

const tabs = ["Today", "Weekly", "Monthly", "Custom"];

const reports = [
  "Daily ordering report",
  "Frequently ordered items",
  "Item performance Report",
  "Cancellation Report",
  "Wastage Report",
];

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const dispatch = useDispatch();

  const {
    warehouses,
    selectedWarehouse, // Single warehouse for other screens
    status: warehouseStatus,
    error: warehouseError,
  } = useSelector((state) => state.warehouse);

  const [activeTab, setActiveTab] = useState("Today");
  const [selectedReport, setSelectedReport] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("quantity"); // 'quantity' or 'price'
  
  // Report data states
  const [reportData, setReportData] = useState({});
  const [reportLoading, setReportLoading] = useState(false);
  
  // Custom date range states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [customFromDate, setCustomFromDate] = useState(new Date());
  const [customToDate, setCustomToDate] = useState(new Date());

  // Add state for multiple warehouse selection (Reports screen only)
  const [selectedReportWarehouses, setSelectedReportWarehouses] = useState([]);

  // Calculate date ranges based on active tab
  const getDateRange = useCallback(() => {
    const today = new Date();
    let fromDate, toDate;

    switch (activeTab) {
      case "Today":
        fromDate = toDate = today.toISOString().split("T")[0];
        break;
      case "Weekly":
        toDate = today.toISOString().split("T")[0];
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        fromDate = weekAgo.toISOString().split("T")[0];
        break;
      case "Monthly":
        toDate = today.toISOString().split("T")[0];
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        fromDate = monthAgo.toISOString().split("T")[0];
        break;
      case "Custom":
        fromDate = customFromDate.toISOString().split("T")[0];
        toDate = customToDate.toISOString().split("T")[0];
        break;
      default:
        fromDate = toDate = today.toISOString().split("T")[0];
    }

    return { fromDate, toDate };
  }, [activeTab, customFromDate, customToDate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedReport(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    console.log("User logged out");
  };

  const handleReportSelect = (report) => {
    if (selectedReport === report) {
      setSelectedReport(null);
    } else {
      setSelectedReport(report);
      fetchReportData(report);
    }
  };

  // Handle warehouse selection for Reports screen (multiple selection)
  const handleReportWarehouseSelect = (warehouses) => {
    setSelectedReportWarehouses(warehouses);
    setSelectedReport(null); // Reset report when warehouse changes
    console.log("Selected warehouses for reports:", warehouses);
  };

  // Handle warehouse selection for other screens (single selection)
  const handleSingleWarehouseSelect = (warehouse) => {
    dispatch(setSelectedWarehouse(warehouse));
    setSelectedReport(null);
    console.log("Selected warehouse for other screens:", warehouse.warehouse);
  };

  // Update report fetching to handle multiple warehouses
  const fetchReportData = async (report) => {
    // Use selectedReportWarehouses for reports, fallback to selectedWarehouse for backward compatibility
    const targetWarehouses = selectedReportWarehouses.length > 0 
      ? selectedReportWarehouses 
      : [selectedWarehouse];

    if (targetWarehouses.length === 0 || !targetWarehouses[0]?.warehouse) {
      Alert.alert("Error", "Please select at least one warehouse");
      return;
    }

    setReportLoading(true);
    const { fromDate, toDate } = getDateRange();

    try {
      let result;

      // Convert warehouse array to comma-separated string for API
      const warehouseParam = targetWarehouses.map(wh => wh.warehouse).join(", ");

      switch (report) {
        case "Daily ordering report":
        case "Frequently ordered items":
        case "Item performance Report":
          result = await getAllOrderedItems(
            fromDate,
            toDate,
            warehouseParam
          );
          if (result.status === "success") {
            setReportData((prev) => ({
              ...prev,
              [report]: result.data,
            }));
          } else {
            Alert.alert("Error", result.message);
          }
          break;

        case "Wastage Report":
          result = await getDailyWastageReport(
            fromDate,
            toDate,
            warehouseParam
          );
          if (result.status === "success") {
            // Flatten wastage data for chart
            const flattenedData = result.data.flatMap((day) =>
              day.items.map((item) => ({
                ...item,
                date: day.date,
              }))
            );
            setReportData((prev) => ({
              ...prev,
              [report]: flattenedData,
            }));
          } else {
            Alert.alert("Error", result.message);
          }
          break;

        case "Cancellation Report":
          result = await getCanceledItems(
            fromDate,
            toDate,
            warehouseParam
          );
          if (result.status === "success") {
            setReportData((prev) => ({
              ...prev,
              [report]: result.data,
            }));
          } else {
            Alert.alert("Error", result.message);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      Alert.alert("Error", "Failed to fetch report data");
    } finally {
      setReportLoading(false);
    }
  };

  const fetchWarehouseData = useCallback(async () => {
    setRefreshing(true);
    dispatch(setWarehouseLoading());

    try {
      const warehouseResult = await getWarehouseMappings();
      if (
        warehouseResult.status === "success" &&
        warehouseResult.data.length > 0
      ) {
        dispatch(setWarehouses(warehouseResult.data));

        let currentSelected = selectedWarehouse;
        if (
          !currentSelected ||
          !warehouseResult.data.some(
            (wh) => wh.corporate_code === currentSelected.corporate_code
          )
        ) {
          const defaultWarehouse =
            warehouseResult.data.find((wh) => wh.is_default === 1) ||
            warehouseResult.data[0];
          dispatch(setSelectedWarehouse(defaultWarehouse));
          // Also set as default for reports multiple selection
          setSelectedReportWarehouses([defaultWarehouse]);
        } else {
          // Initialize reports selection with current warehouse
          setSelectedReportWarehouses([currentSelected]);
        }
      } else {
        console.error(
          "Failed to fetch warehouse mappings or no data:",
          warehouseResult.message
        );
        dispatch(setWarehouses([]));
        dispatch(
          setSelectedWarehouse({
            warehouse: "No Warehouse",
            corporate_code: "",
          })
        );
        setSelectedReportWarehouses([]);
        Alert.alert(
          "Error",
          warehouseResult.message || "Failed to fetch warehouse data."
        );
      }
    } catch (error) {
      console.error("Error fetching warehouse mappings:", error);
      dispatch(setWarehouseError(error.message));
      dispatch(
        setSelectedWarehouse({ warehouse: "Error Loading", corporate_code: "" })
      );
      setSelectedReportWarehouses([]);
      Alert.alert("Error", "Network error. Failed to load warehouse data.");
    } finally {
      setRefreshing(false);
    }
  }, [selectedWarehouse, dispatch]);

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  // Refresh report when tab or warehouse changes
  useEffect(() => {
    if (selectedReport) {
      fetchReportData(selectedReport);
    }
  }, [activeTab, selectedWarehouse, customFromDate, customToDate, selectedReportWarehouses]);

  // Render chart based on report type
  const renderChart = (report) => {
    const data = reportData[report];
    if (!data || data.length === 0) {
      return (
        <View className="bg-white p-4 rounded-lg items-center justify-center h-40">
          <Text className="text-gray-500">No data available</Text>
        </View>
      );
    }

    if (reportLoading) {
      return (
        <View className="bg-white p-4 rounded-lg items-center justify-center h-40">
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );
    }

    // Prepare chart data based on report type
    switch (report) {
      case "Daily ordering report":
        return renderBarChart(data, "Orders");
      case "Frequently ordered items":
        // Show top 5 items only
        const topItems = data
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);
        return renderBarChart(topItems, "Top 5 Items");
      case "Item performance Report":
        return renderPieChart(data);
      case "Cancellation Report":
        return renderBarChart(data, "Cancelled Items");
      case "Wastage Report":
        // Aggregate wastage by item
        const wastageByItem = data.reduce((acc, item) => {
          const existing = acc.find((i) => i.item_code === item.item_code);
          if (existing) {
            existing.qty += item.qty;
          } else {
            acc.push({ ...item });
          }
          return acc;
        }, []);
        return renderBarChart(wastageByItem, "Wastage");
      default:
        return null;
    }
  };

  const renderBarChart = (data, title) => {
    const chartData = {
      labels: data.slice(0, 5).map((item) => item.item_name?.substring(0, 8) || "N/A"),
      datasets: [
        {
          data: data
            .slice(0, 5)
            .map((item) => (viewMode === "quantity" ? item.qty : item.amount || 0)),
        },
      ],
    };

    return (
      <View className="mb-6">
        <Text className="text-base font-semibold text-gray-700 mb-2 text-center">
          {title}
        </Text>
        <BarChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          yAxisLabel={viewMode === "quantity" ? "" : "₹"}
          yAxisSuffix={viewMode === "quantity" ? " pcs" : ""}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(21, 128, 61, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
            barPercentage: 0.6,
            propsForBackgroundLines: {
              strokeWidth: 0,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 8,
            alignSelf: "center",
          }}
        />
      </View>
    );
  };

  const renderPieChart = (data) => {
    // Generate colors for pie chart
    const colors = [
      "#08b5dbff",
      "#024e24ff",
      "#cf1374ff",
      "#4ade80",
      "#e9f32bff",
      "#c6bbf7ff",
    ];

    const pieData = data.slice(0, 6).map((item, index) => ({
      name: item.item_name?.substring(0, 10) || "N/A",
      population: viewMode === "quantity" ? item.qty : item.amount || 0,
      color: colors[index % colors.length],
      legendFontColor: "#374151",
      legendFontSize: 12,
    }));

    return (
      <View className="mb-6">
        <Text className="text-base font-semibold text-gray-700 mb-2 text-center">
          Item Performance
        </Text>
        <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(21, 128, 61, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute={viewMode === "price"}
        />
      </View>
    );
  };

  if (warehouseStatus === "loading" || !selectedWarehouse) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="text-gray-600 mt-4 text-base">Loading Header...</Text>
      </View>
    );
  }

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
          onPress={fetchWarehouseData}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fcf8' }}>
    <ScrollView
      className="flex-1 px-4 pt-4 bg-green-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchWarehouseData}
        />
      }
    >
      {/* Use multiple selection mode for Reports screen */}
      <Header
        companyInfo={{
          name: selectedReportWarehouses.length > 0 
            ? `${selectedReportWarehouses.length} Warehouses Selected` 
            : selectedWarehouse?.warehouse,
          address: selectedWarehouse?.corporate_code,
        }}
        warehouses={warehouses}
        selectedWarehouse={selectedWarehouse} // For single selection fallback
        selectedWarehouses={selectedReportWarehouses} // For multiple selection
        onWarehouseSelect={handleReportWarehouseSelect}
        selectionMode="multiple" // Enable multiple selection
        onLogout={handleLogout}
      />

      {/* Header with toggle */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons name="analytics" size={24} color="#1F2937" />
          <Text className="text-2xl font-extrabold text-green-900 ml-2">
            Reports
          </Text>
        </View>

        {/* Price/Quantity Toggle */}
        <View className="flex-row bg-white rounded-lg shadow-sm p-1">
          <TouchableOpacity
            className={`px-3 py-2 rounded-md ${
              viewMode === "quantity" ? "bg-green-100" : ""
            }`}
            onPress={() => setViewMode("quantity")}
          >
            <Text
              className={`font-medium text-sm ${
                viewMode === "quantity" ? "text-green-700" : "text-gray-500"
              }`}
            >
              Quantity
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-3 py-2 rounded-md ${
              viewMode === "price" ? "bg-green-100" : ""
            }`}
            onPress={() => setViewMode("price")}
          >
            <Text
              className={`font-medium text-sm ${
                viewMode === "price" ? "text-green-700" : "text-gray-500"
              }`}
            >
              Price
            </Text>
          </TouchableOpacity>
        </View>
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

      {/* Custom Date Range Picker */}
      {activeTab === "Custom" && (
        <View className="mb-4 bg-white rounded-lg shadow-sm p-4">
          <Text className="text-base font-semibold text-gray-700 mb-3">
            Select Date Range
          </Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => setShowFromDatePicker(true)}
              className="flex-1 mr-2 bg-green-50 p-3 rounded-lg border border-green-200"
            >
              <Text className="text-xs text-gray-500 mb-1">From Date</Text>
              <Text className="text-sm font-medium text-gray-700">
                {customFromDate.toISOString().split("T")[0]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowToDatePicker(true)}
              className="flex-1 ml-2 bg-green-50 p-3 rounded-lg border border-green-200"
            >
              <Text className="text-xs text-gray-500 mb-1">To Date</Text>
              <Text className="text-sm font-medium text-gray-700">
                {customToDate.toISOString().split("T")[0]}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={customFromDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromDatePicker(false);
            if (selectedDate) {
              setCustomFromDate(selectedDate);
            }
          }}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={customToDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowToDatePicker(false);
            if (selectedDate) {
              setCustomToDate(selectedDate);
            }
          }}
        />
      )}

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

          {/* Chart */}
          {selectedReport === report && renderChart(report)}
        </View>
      ))}
    </ScrollView>
    </SafeAreaView>
  );
}