import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Image,
  
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
import { DashboardTabs } from "../../src/components/dashboard/DashboardTabs";
import { StatsCard } from "../../src/components/dashboard/StatsCard";
import { InventoryList } from "../../src/components/dashboard/InventoryList";
import { ScanButton } from "../../src/components/dashboard/ScanButton";
import { getWarehouseMappings } from "../../src/services/warehouseService";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getTodaysMenuItems,
  getInventoryData,
  getDailyOrders,
  getWeeklyOrders,
  getMonthlyOrders,
  getDateRangeOrders,
  getItemsByWarehouse,
} from "../../src/services/menuService";

// ✅ New imports for QR scanner + service
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  getSalesInvoiceItems,
  deliverSalesInvoice,
} from "../../src/services/salesInvoiceService"; // service may return different shapes

import { OrderList } from "../../src/components/dashboard/OrderList";

import CustomAlert from "../../src/components/alert/CUstomAlert";
// Mock data function
const getMockDashboardData = () => {
  return {
    stats: {
      receivedOrders: 77,
      pendingDelivery: 25,
    },
  };
};

export default function Home() {
  const dispatch = useDispatch();

  // --- REDUX STATE ---
  const {
    warehouses,
    selectedWarehouse,
    status: warehouseStatus,
    error: warehouseError,
  } = useSelector((state) => state.warehouse);

  // --- Local State ---
  const [activeTab, setActiveTab] = useState("Daily");
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboardData, setLoadingDashboardData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false); // 🎉 NEW

  const [showDatePicker, setShowDatePicker] = useState(null);

  // ✅ QR Scanner State
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  const [todaysMenuItems, setTodaysMenuItems] = useState([]);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);

  const [statsData, setStatsData] = useState({
    daily: { completed: 0, pending: 0 },
    weekly: { completed: 0, pending: 0 },
    monthly: { completed: 0, pending: 0 },
    custom: { completed: 0, pending: 0 },
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [dateRange, setDateRange] = useState({
    fromDate: new Date().toISOString().split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
  });

  const [orderItems, setOrderItems] = useState({
    weekly: [],
    monthly: [],
    custom: [],
  });
  const [loadingOrders, setLoadingOrders] = useState(false);

  // ✅ Invoice Results State
  const [invoiceItems, setInvoiceItems] = useState([]); // always an array
  const [resultsModal, setResultsModal] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [scannedInvoiceName, setScannedInvoiceName] = useState(""); // show the invoice code in modal header

  // ✅ Alert State
  const [alertState, setAlertState] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const BASE_URL = "https://coriander.mozility.com";

  // Helper function to show alerts
  const showAlert = (title, message, type = "success") => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
    });
  };

  const fetchOrderItems = async () => {
    if (!selectedWarehouse?.warehouse) return;

    try {
      setLoadingOrders(true);
      let result;

      switch (activeTab) {
        case "Weekly":
          result = await getItemsByWarehouse(
            selectedWarehouse.warehouse,
            getPastDate(7), // Helper function to get date 7 days ago
            new Date().toISOString().split("T")[0]
          );
          if (result.message) {
            setOrderItems((prev) => ({
              ...prev,
              weekly: result.message,
            }));
          }
          break;

        case "Monthly":
          result = await getItemsByWarehouse(
            selectedWarehouse.warehouse,
            getPastDate(30), // Helper function to get date 30 days ago
            new Date().toISOString().split("T")[0]
          );
          if (result.message) {
            setOrderItems((prev) => ({
              ...prev,
              monthly: result.message,
            }));
          }
          break;

        case "Custom":
          result = await getItemsByWarehouse(
            selectedWarehouse.warehouse,
            dateRange.fromDate,
            dateRange.toDate
          );
          if (result.message) {
            setOrderItems((prev) => ({
              ...prev,
              custom: result.message,
            }));
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} orders:`, error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Helper function to get past dates
  const getPastDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  };

  // Add these functions
  const handleDateChange = (event, selectedDate, type) => {
    setShowDatePicker(null);
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      setDateRange((prev) => ({
        ...prev,
        [type]: dateStr,
      }));
    }
  };

  const showDatepicker = (type) => {
    setShowDatePicker(type);
  };

  const fetchStats = async () => {
    if (!selectedWarehouse?.warehouse) return;

    try {
      setLoadingStats(true);
      let result;

      switch (activeTab) {
        case "Daily":
          result = await getDailyOrders(selectedWarehouse.warehouse);
          if (result.message) {
            setStatsData((prev) => ({
              ...prev,
              daily: {
                completed: result.message.completed_orders || 0,
                pending: result.message.pending_orders || 0,
              },
            }));
          }
          break;

        case "Weekly":
          result = await getWeeklyOrders(selectedWarehouse.warehouse);
          if (result.message) {
            setStatsData((prev) => ({
              ...prev,
              weekly: {
                completed: result.message.completed_orders_weekly || 0,
                pending: result.message.pending_orders_weekly || 0,
              },
            }));
          }
          break;

        case "Monthly":
          result = await getMonthlyOrders(selectedWarehouse.warehouse);
          if (result.message) {
            setStatsData((prev) => ({
              ...prev,
              monthly: {
                completed: result.message.completed_orders_monthly || 0,
                pending: result.message.pending_orders_monthly || 0,
              },
            }));
          }
          break;

        case "Custom":
          result = await getDateRangeOrders(
            selectedWarehouse.warehouse,
            dateRange.fromDate,
            dateRange.toDate
          );
          if (result.message) {
            setStatsData((prev) => ({
              ...prev,
              custom: {
                completed: result.message.completed_orders || 0,
                pending: result.message.pending_orders || 0,
              },
            }));
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} stats:`, error);
      // Fallback to mock data if needed
    } finally {
      setLoadingStats(false);
    }
  };

  // Add this function to fetch today's menu

  const fetchTodaysMenu = async () => {
    if (!selectedWarehouse?.warehouse) return;

    try {
      setLoadingMenuItems(true);
      setTodaysMenuItems([]);
      // Fetch both today's menu and inventory data in parallel
      const [menuResult, inventoryResult] = await Promise.all([
        getTodaysMenuItems(selectedWarehouse.warehouse),
        getInventoryData(selectedWarehouse.warehouse),
      ]);

      if (menuResult.status === "success") {
        // Create a map of inventory data for quick lookup
        const inventoryMap = {};
        if (inventoryResult.message && Array.isArray(inventoryResult.message)) {
          inventoryResult.message.forEach((item) => {
            inventoryMap[item.item_code] = {
              actual_qty: item.actual_qty,
              reserved_qty: item.reserved_qty,
            };
          });
        }

        // Merge menu items with inventory data
        setTodaysMenuItems(
          menuResult.data.map((item) => {
            const inventoryData = inventoryMap[item.item_code] || {
              actual_qty: 0,
              reserved_qty: 0,
            };

            return {
              id: item.item_code,
              name: item.name,
              pending: inventoryData.reserved_qty,
              total: inventoryData.actual_qty,
            };
          })
        );
      } else {
        console.error("Failed to fetch today's menu:", menuResult.message);
      }
    } catch (error) {
      console.error("Error fetching today's menu or inventory:", error);
    } finally {
      setLoadingMenuItems(false);
    }
  };

  const fetchAllData = async () => {
    setRefreshing(true);
    dispatch(setWarehouseLoading());

    try {
      const mockResult = getMockDashboardData();
      setDashboardData(mockResult);

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
          currentSelected = defaultWarehouse;
        }

        await Promise.all([
          fetchStats(), // Add this line
          fetchTodaysMenu(), // Existing menu fetch
          fetchOrderItems(), // Fetch order items based on active tab
        ]);

        setLoadingDashboardData(true);
        setLoadingDashboardData(false);
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
        showAlert(
          "Error",
          warehouseResult.message || "Failed to fetch warehouse data.",
          "error"
        );
      }
    } catch (error) {
      console.error(
        "Error loading dashboard data or warehouse mappings:",
        error
      );
      dispatch(setWarehouseError(error.message));
      dispatch(
        setSelectedWarehouse({ warehouse: "Error Loading", corporate_code: "" })
      );
      showAlert("Error", "Network error. Failed to load data.", "error");
    } finally {
      setRefreshing(false);
      setLoadingDashboardData(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedWarehouse?.warehouse) {
      fetchStats();
      fetchTodaysMenu();
      fetchOrderItems();
    }
  }, [selectedWarehouse?.warehouse, activeTab, dateRange]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // ✅ Updated QR Scan handler
  const handleScanQR = async () => {
    if (!cameraPermission || !cameraPermission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        showAlert(
          "Permission Required",
          "Camera access is needed to scan QR codes.",
          "error"
        );
        return;
      }
    }
    setScanning(true); // Open scanner modal
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchStats();
    fetchOrderItems();
    console.log(`Fetching data for: ${tab}`);
  };

  const handleWarehouseSelect = async (warehouse) => {
    dispatch(setSelectedWarehouse(warehouse));
    // Refresh data when warehouse changes
    await fetchTodaysMenu();
  };

  // ✅ QR Code Scanned callback (robust handling of service response)
  const onBarcodeScanned = async ({ type, data }) => {
    setScanning(false); // Close scanner
    console.log(`QR Code Type: ${type}, Data: ${data}`);

    // reset state & open modal immediately to show loader
    setInvoiceItems([]);
    setScannedInvoiceName(data || "");
    setResultsModal(true);
    setInvoiceLoading(true);

    try {
      const result = await getSalesInvoiceItems(data);
      console.log("getSalesInvoiceItems result:", result);

      // Normalize possible response shapes into an array
      let itemsArray = [];

      // Case 1: service returns an array directly
      if (Array.isArray(result)) {
        itemsArray = result;
      }
      // Case 2: service returns { status: 'success', data: [...] }
      else if (
        result &&
        result.status === "success" &&
        Array.isArray(result.data)
      ) {
        itemsArray = result.data;
      }
      // Case 3: service returns { status: 'success', data: { message: [...] } } (less likely)
      else if (
        result &&
        result.status === "success" &&
        result.data &&
        Array.isArray(result.data.message)
      ) {
        itemsArray = result.data.message;
      }
      // Case 4: service returns { message: [...] }
      else if (result && Array.isArray(result.message)) {
        itemsArray = result.message;
      }
      // Case 5: service returns { data: [...] }
      else if (result && Array.isArray(result.data)) {
        itemsArray = result.data;
      }
      // Fallback: empty array
      else {
        itemsArray = [];
      }

      setInvoiceItems(itemsArray);
      if (itemsArray.length === 0) {
        // optional: inform user if nothing found
        // Alert.alert("No items", `No items found for invoice ${data}`);
      }
    } catch (err) {
      console.error("Error fetching sales invoice items:", err);
      showAlert("Error", "Failed to fetch invoice items.", "error");
      setInvoiceItems([]); // ensure it's an array
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Loading state
  if (
    warehouseStatus === "loading" ||
    !dashboardData ||
    !selectedWarehouse ||
    loadingDashboardData
  ) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="text-gray-600 mt-4 text-base">
          Loading Dashboard...
        </Text>
      </View>
    );
  }

  // Error state
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
          onPress={fetchAllData}
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
    <View style={{ flex: 1 }}>
      <ScrollView
        className="flex-1 px-4 pt-4 bg-green-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAllData} />
        }
      >
        <Header
          companyInfo={{
            name: selectedWarehouse.warehouse,
            address: selectedWarehouse.corporate_code,
          }}
          warehouses={warehouses}
          selectedWarehouse={selectedWarehouse}
          onWarehouseSelect={handleWarehouseSelect}
          onLogout={handleLogout}
        />

        <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {activeTab === "Custom" && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3 text-gray-800">
              Custom Date Range
            </Text>

            <View className="flex-row justify-between mb-4">
              <TouchableOpacity
                className="bg-white p-3 rounded-lg border border-gray-200 flex-1 mr-2"
                onPress={() => showDatepicker("fromDate")}
              >
                <Text className="text-gray-700">
                  From: {dateRange.fromDate}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white p-3 rounded-lg border border-gray-200 flex-1 ml-2"
                onPress={() => showDatepicker("toDate")}
              >
                <Text className="text-gray-700">To: {dateRange.toDate}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-green-600 py-3 rounded-lg"
              onPress={fetchStats}
            >
              <Text className="text-white text-center font-semibold">
                Apply Date Range
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date(dateRange[showDatePicker])}
                mode="date"
                display="default"
                onChange={(event, date) =>
                  handleDateChange(event, date, showDatePicker)
                }
              />
            )}
          </View>
        )}

        <View className="flex-row justify-between mb-6">
          <StatsCard
            label={
              activeTab === "Monthly"
                ? "Completed (Monthly)"
                : activeTab === "Weekly"
                ? "Completed (Weekly)"
                : activeTab === "Custom"
                ? "Completed (Custom)"
                : "Completed Orders"
            }
            value={
              activeTab === "Daily"
                ? statsData.daily.completed
                : activeTab === "Weekly"
                ? statsData.weekly.completed
                : activeTab === "Monthly"
                ? statsData.monthly.completed
                : statsData.custom.completed
            }
            className="mr-3"
            loading={loadingStats}
          />

          <StatsCard
            label={
              activeTab === "Monthly"
                ? "Pending (Monthly)"
                : activeTab === "Weekly"
                ? "Pending (Weekly)"
                : activeTab === "Custom"
                ? "Pending (Custom)"
                : "Pending Orders"
            }
            value={
              activeTab === "Daily"
                ? statsData.daily.pending
                : activeTab === "Weekly"
                ? statsData.weekly.pending
                : activeTab === "Monthly"
                ? statsData.monthly.pending
                : statsData.custom.pending
            }
            className="ml-3"
            loading={loadingStats}
          />
        </View>

        {activeTab === "Daily" && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3 text-gray-800">
              Daily Inventory
            </Text>
            {loadingMenuItems ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            ) : todaysMenuItems.length > 0 ? (
              <InventoryList items={todaysMenuItems} />
            ) : (
              <Text className="text-gray-400 text-center py-4">
                No menu items found for today
              </Text>
            )}
          </View>
        )}

        {activeTab === "Weekly" && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3 text-gray-800">
              Weekly Orders
            </Text>
            {loadingOrders ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            ) : orderItems.weekly.length > 0 ? (
              <OrderList items={orderItems.weekly} />
            ) : (
              <Text className="text-gray-400 text-center py-4">
                No orders found this week
              </Text>
            )}
          </View>
        )}

        {activeTab === "Monthly" && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3 text-gray-800">
              Monthly Orders
            </Text>
            {loadingOrders ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            ) : orderItems.monthly.length > 0 ? (
              <OrderList items={orderItems.monthly} />
            ) : (
              <Text className="text-gray-400 text-center py-4">
                No orders found this month
              </Text>
            )}
          </View>
        )}

        {activeTab === "Custom" && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3 text-gray-800">
              Custom Date Range Orders
            </Text>
            {loadingOrders ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            ) : orderItems.custom.length > 0 ? (
              <OrderList items={orderItems.custom} />
            ) : (
              <Text className="text-gray-400 text-center py-4">
                No orders found in selected date range
              </Text>
            )}
          </View>
        )}

        {activeTab === "Daily" && <ScanButton onPress={handleScanQR} />}
        {/* <ScanButton onPress={handleScanQR} /> */}
      </ScrollView>

      {/* ✅ QR Scanner Modal */}
      <Modal visible={scanning} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={onBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "code128"], // QR & others
            }}
          />
          <TouchableOpacity
            onPress={() => setScanning(false)}
            style={{
              position: "absolute",
              bottom: 40,
              alignSelf: "center",
              backgroundColor: "red",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ✅ Results Modal */}

      <Modal visible={resultsModal} animationType="slide">
        <View className="flex-1 bg-[#f8fcf8]">
          {showConfetti && (
            <ConfettiCannon
              count={150}
              origin={{ x: 0, y: 0 }}
              fadeOut={true}
              autoStart={true}
            />
          )}

          <SafeAreaView className="flex-1">
            {/* Header */}
            <View className="flex flex-row items-center p-4 pb-2 justify-between">
              <TouchableOpacity
                onPress={() => setResultsModal(false)}
                className="w-12 h-12 items-center justify-center"
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="#0d1c0d"
                />
              </TouchableOpacity>
              <Text className="text-[#0d1c0d] text-lg font-bold flex-1 text-center pr-12">
                Invoice - {scannedInvoiceName || "N/A"}
              </Text>
            </View>

            {/* Scrollable content */}
            <ScrollView className="flex-1">
              {/* Warehouse Info */}
              {invoiceItems?.length > 0 && invoiceItems[0]?.warehouse ? (
                <View className="flex flex-row items-center gap-4 px-4 py-2">
                  <View className="w-12 h-12 items-center justify-center rounded-lg bg-[#e7f4e7]">
                    <MaterialCommunityIcons
                      name="storefront-outline"
                      size={24}
                      color="#0d1c0d"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#0d1c0d] font-medium">
                      {invoiceItems[0].warehouse}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Loading */}
              {invoiceLoading ? (
                <View className="flex-1 items-center justify-center py-20">
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text className="mt-2 text-gray-500">Fetching items...</Text>
                </View>
              ) : Array.isArray(invoiceItems) && invoiceItems.length > 0 ? (
                <>
                  {/* Ordered Items */}
                  <Text className="text-[#0d1c0d] text-lg font-bold px-4 pb-2 pt-4">
                    Ordered Items
                  </Text>
                  {invoiceItems.map((item, index) => (
                    <View key={index} className="p-4">
                      <View className="flex flex-row gap-4">
                        <View className="flex-1">
                          <Text className="text-[#499c49] text-sm">
                            Qty: {item.qty}
                          </Text>
                          <Text className="text-[#0d1c0d] font-bold">
                            {item.item_name}
                          </Text>
                          {item.description ? (
                            <Text className="text-[#499c49] text-sm">
                              {item.description.replace(/<\/?[^>]+(>|$)/g, "")}
                            </Text>
                          ) : null}
                          <TouchableOpacity className="mt-2 px-4 h-8 items-center justify-center rounded-full bg-[#e7f4e7]">
                            <Text className="text-[rgb(13,28,13)] text-sm">
                              ₹{item.base_amount}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {item.image ? (
                          <Image
                            source={{ uri: `${BASE_URL}${item.image}` }}
                            className="w-28 h-28 rounded-lg"
                            resizeMode="cover"
                          />
                        ) : null}
                      </View>
                    </View>
                  ))}

                  {/* Bill Summary */}
                  <Text className="text-[#0d1c0d] text-lg font-bold px-4 pb-2">
                    Bill Summary
                  </Text>
                  <View className="px-4">
                    {/* Total */}
                    <View className="flex flex-row justify-between py-1">
                      <Text className="text-[#499c49]">Total</Text>
                      <Text className="text-[#0d1c0d]">
                        ₹
                        {invoiceItems
                          .reduce((sum, i) => sum + i.rate * i.qty, 0)
                          .toFixed(2)}
                      </Text>
                    </View>

                    {/* Tax (hardcoded 0) */}
                    <View className="flex flex-row justify-between py-1">
                      <Text className="text-[#499c49]">Tax</Text>
                      <Text className="text-[#0d1c0d]">₹0.00</Text>
                    </View>

                    {/* Discount */}
                    <View className="flex flex-row justify-between py-1">
                      <Text className="text-[#499c49]">Discount</Text>
                      <Text className="text-[#0d1c0d]">
                        ₹
                        {invoiceItems
                          .reduce(
                            (sum, i) =>
                              sum + (i.distributed_discount_amount || 0),
                            0
                          )
                          .toFixed(2)}
                      </Text>
                    </View>

                    {/* Sub Total */}
                    <View className="flex flex-row justify-between py-1 border-t border-gray-200 mt-1 pt-1">
                      <Text className="text-[#0d1c0d] font-semibold">
                        Sub Total
                      </Text>
                      <Text className="text-[#0d1c0d] font-semibold">
                        ₹
                        {(
                          invoiceItems.reduce(
                            (sum, i) => sum + i.rate * i.qty,
                            0
                          ) -
                          invoiceItems.reduce(
                            (sum, i) =>
                              sum + (i.distributed_discount_amount || 0),
                            0
                          )
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text className="text-gray-400 text-center py-6">
                  No items found.
                </Text>
              )}
            </ScrollView>

            {/* Fixed Deliver Button */}
            <View className="p-4 bg-white border-t border-gray-200">
              <TouchableOpacity
                onPress={async () => {
                  if (!scannedInvoiceName) {
                    showAlert("Error", "No invoice selected.", "error");
                    return;
                  }

                  try {
                    showAlert(
                      "Processing...",
                      "Please wait while we create the delivery note.",
                      "loading"
                    );

                    const result = await deliverSalesInvoice(
                      scannedInvoiceName
                    );

                    if (result.status === "success") {
                      setShowConfetti(true); // 🎉 Show confetti
                      showAlert(
                        "✅ Success",
                        `Delivery successfull : ${result.deliveryNote}`,
                        "success"
                      );
                      setResultsModal(false);
                      setInvoiceItems([]);
                      setScannedInvoiceName("");

                      // Stop confetti after 3 seconds
                      setTimeout(() => setShowConfetti(false), 3000);
                    } else if (result.status === "out_of_stock") {
                      showAlert(
                        "❌ Out of Stock",
                        "Insufficient stock available for this item.",
                        "error"
                      );
                    } else if (result.status === "already_delivered") {
                      showAlert(
                        "❌ Already Delivered",
                        "Delivery already performed for this invoice.",
                        "error"
                      );
                    } else {
                      showAlert(
                        "❌ Error",
                        result.message || "Failed to create delivery note",
                        "error"
                      );
                    }
                  } catch (err) {
                    showAlert(
                      "❌ Error",
                      "Something went wrong while creating the delivery note.",
                      "error"
                    );
                  }
                }}
                className="bg-green-500 py-3 rounded-lg items-center shadow-md"
              >
                <Text className="text-white font-bold text-base">
                  🚚 Deliver
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
      {/* ✅ Custom Alert */}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState({ ...alertState, visible: false })}
      />
    </View>
    </SafeAreaView>
  );
}
