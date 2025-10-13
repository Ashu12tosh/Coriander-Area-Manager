import { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../src/redux/slices/authSlice";
import {
  setWarehouses,
  setSelectedWarehouse,
  setWarehouseLoading,
  setWarehouseError,
} from "../../src/redux/slices/warehouseSlice";
import { Header } from "../../src/components/header/Header";
import { Ionicons } from "@expo/vector-icons";

import { getWarehouseMappings } from "../../src/services/warehouseService";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuTabs from "../../src/components/menu/MenuTabs";
import MenuList from "../../src/components/menu/MenuList";
import ManageWeeklyModal from "../../src/components/menu/ManageWeeklyModal";
import EditMenuModal from "../../src/components/menu/EditMenuModal";
import AddItemsModal from "../../src/components/menu/AddItemsModal"; // Import the new modal
import {
  createMenuItem, // Will be used only in EditMenuModal for new item creation there (if you re-add it)
  ITEM_GROUPS,
  validateItemCode,
  toggleItemStatus,
  updateMenuItem, // Ensure this is imported for handleSave
  deleteMenuItem,
  // New import for the updated API call
  updateItemPublishStatus,
  getTodaysMenuItems,
  getWeeklyMenuItems,
} from "../../src/services/menuService";
import WeeklyAddItemsModal from "../../src/components/menu/WeeklyAddItemsModal";

import CustomAlert from "../../src/components/alert/CUstomAlert";

export default function MenuScreen() {
  const dispatch = useDispatch();

  const {
    warehouses,
    selectedWarehouse,
    status: warehouseStatus,
    error: warehouseError,
  } = useSelector((state) => state.warehouse);

  const [activeTab, setActiveTab] = useState("Today's Menu");
  const [menuItems, setMenuItems] = useState([]); // Today's menu items
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [loadingMenuItems, setLoadingMenuItems] = useState(false);

  // Add this state
  const [loadingWeeklyItems, setLoadingWeeklyItems] = useState(false);

  // Then in your component, add the state for this modal:
  const [showWeeklyAddItemsModal, setShowWeeklyAddItemsModal] = useState(false);

  // New state for AddItemsModal visibility
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  // NEW: State to track which day of the week to add items to
  const [activeWeeklyDayIndex, setActiveWeeklyDayIndex] = useState(null);

  // Add this state with your other state declarations
  const [alertState, setAlertState] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  // Add this function near your other helper functions
  const showAlert = (title, message, type = "success") => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
    });
  };

  const today = new Date();
  const getDayName = (date) =>
    date.toLocaleDateString("en-US", { weekday: "long" });

  const [weeklyMenu, setWeeklyMenu] = useState(
    Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() + idx);

      return {
        day: getDayName(date),
        date: date.toISOString().split("T")[0],
        items: [], // Weekly menu items remain empty or populated by upload
      };
    })
  );

  const [editingItem, setEditingItem] = useState(null);
  const [editingContext, setEditingContext] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    description: "",
    discount: "",
    image: "",
    item_group: "",
    item_code: "",
  });
  const [showManageModal, setShowManageModal] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    // router.replace("/login"); // If you're using expo-router
  };

  // Add this function
  const fetchTodaysMenuItems = async (warehouseName) => {
    setLoadingMenuItems(true);
    try {
      const result = await getTodaysMenuItems(warehouseName);
      if (result.status === "success") {
        setMenuItems(result.data);
      } else {
        showAlert("Info", result.message || "No items found for today", "info");
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("Error", "Failed to load today's menu", "error");

      setMenuItems([]);
    } finally {
      setLoadingMenuItems(false);
    }
  };

  // Add this function
  const fetchWeeklyItems = useCallback(async (warehouseName) => {
    setLoadingWeeklyItems(true);
    try {
      const result = await getWeeklyMenuItems(warehouseName);
      if (result.status === "success") {
        // Group items by date
        const itemsByDate = result.data.reduce((acc, item) => {
          if (!acc[item.Date]) acc[item.Date] = [];
          acc[item.Date].push({
            id: item.mapping_id,
            name: item.item_name,
            price: `₹${item.standard_rate.toFixed(2)}`,
            description: item.description,
            image: item.image
              ? `https://coriander.mozility.com${item.image}`
              : null,
            isVisible: item.is_publish === 1,
            item_code: item.item_code,
            item_group: item.item_group,
            date: item.Date,
          });
          return acc;
        }, {});

        // Update weekly menu with items for each date
        setWeeklyMenu((prev) =>
          prev.map((day) => ({
            ...day,
            items: itemsByDate[day.date] || [],
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching weekly items:", error);
    } finally {
      setLoadingWeeklyItems(false);
    }
  }, []);

  // Update fetchAllScreenData
  const fetchAllScreenData = useCallback(async () => {
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
          currentSelected =
            warehouseResult.data.find((wh) => wh.is_default === 1) ||
            warehouseResult.data[0];
          dispatch(setSelectedWarehouse(currentSelected));
        }

        if (currentSelected) {
          await fetchTodaysMenuItems(currentSelected.warehouse);
          if (activeTab === "Weekly Menu") {
            await fetchWeeklyItems(currentSelected.warehouse);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedWarehouse, dispatch, activeTab]);

  useEffect(() => {
    fetchAllScreenData();
  }, [fetchAllScreenData]);

  const toggleVisibility = async (itemToToggle, context) => {
    // Make sure a warehouse is selected before proceeding
    if (!selectedWarehouse?.warehouse) {
      showAlert("Error", "Please select a warehouse first.", "error");

      return;
    }

    const originalVisibility = itemToToggle.isVisible;
    const newVisibility = !originalVisibility;
    const warehouseName = selectedWarehouse.warehouse;

    // Optimistic UI update: update the state first for a faster user experience
    const updater = (items) =>
      items.map((item) =>
        item.id === itemToToggle.id
          ? { ...item, isVisible: newVisibility }
          : item
      );

    let previousState;

    if (context === "today") {
      previousState = menuItems;
      setMenuItems(updater(menuItems));
    } else {
      previousState = weeklyMenu;
      const updatedWeekly = [...weeklyMenu];
      updatedWeekly[context].items = updater(updatedWeekly[context].items);
      setWeeklyMenu(updatedWeekly);
    }

    try {
      // Call the NEW API to update the publish status.
      // We pass the item_code in an array as required by the backend API.
      const result = await updateItemPublishStatus(
        [itemToToggle.item_code], // Pass item_code as an array
        warehouseName,
        newVisibility // The new visibility is the publish status
      );

      if (result.status === "success") {
        showAlert(
          "Success",
          `Item "${itemToToggle.name}" is now ${
            newVisibility ? "published" : "unpublished"
          } for ${warehouseName}.`,
          "success"
        );

        // If the API call is successful, our optimistic UI update holds. No action needed.
      } else {
        // If the API call fails, revert the state to its original value.
        showAlert(
          "Error",
          result.message || "Failed to update item status. Reverting change.",
          "error"
        );
        if (context === "today") {
          setMenuItems(previousState);
        } else {
          setWeeklyMenu(previousState);
        }
      }
    } catch (error) {
      console.error("Error toggling item publish status:", error);
      showAlert(
        "Error",
        "Network error. Failed to update item status. Please try again.",
        "error"
      );
      // Revert the state on network error.
      if (context === "today") {
        setMenuItems(previousState);
      } else {
        setWeeklyMenu(previousState);
      }
    }
  };

  const handleEdit = (item, context) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      price: item.price.replace("₹", ""), // Remove ₹ for editing
      description: item.description,
      discount: item.discount || "",
      image: item.image || "",
      item_group: item.item_group || "",
      item_code: item.item_code || "",
    });
    setEditingContext(context);
  };

  const handleDelete = async (itemId, context) => {
    if (!selectedWarehouse?.warehouse) {
      showAlert("Error", "Please select a warehouse first.", "error");

      return;
    }
    let itemToDelete = null;
    if (context === "today") {
      itemToDelete = menuItems.find((item) => item.id === itemId);
    } else {
      weeklyMenu.forEach((day) => {
        if (!itemToDelete) {
          itemToDelete = day.items.find((item) => item.id === itemId);
        }
      });
    }
    if (!itemToDelete || !itemToDelete.item_code) {
      showAlert("Error", "Could not find item code for deletion.", "error");
      return;
    }
    setDeleting(true);
    try {
      // Fix: Pass both itemCode and warehouseName
      const result = await deleteMenuItem(
        itemToDelete.item_code,
        selectedWarehouse.warehouse
      );
      if (result.status === "success") {
        showAlert("Success", result.message, "success");
        const filterOut = (items) => items.filter((item) => item.id !== itemId);
        if (context === "today") {
          setMenuItems(filterOut(menuItems));
        } else {
          const updatedWeekly = [...weeklyMenu];
          updatedWeekly[context].items = filterOut(
            updatedWeekly[context].items
          );
          setWeeklyMenu(updatedWeekly);
        }
      } else {
        showAlert("Error", result.message || "Failed to delete item.", "error");
      }
    } catch (error) {
      console.error("Error during item deletion:", error);
      showAlert(
        "Error",
        "Network error. Failed to delete item. Please try again.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Modified handleSave to only update existing items in the MenuScreen
  const handleSave = async (updatedItemFromModal) => {
    // This function receives the updated item object from EditMenuModal
    // It's responsible for updating the local state and calling the API.

    // Optimistic UI update (update state first, revert on error)
    const originalMenuItems = [...menuItems];
    const originalWeeklyMenu = [...weeklyMenu];

    const updater = (items) =>
      items.map((item) =>
        item.id === updatedItemFromModal.id ? updatedItemFromModal : item
      );

    // Determine which list to update based on context
    if (editingContext === "today") {
      setMenuItems(updater(menuItems));
    } else {
      const updatedWeekly = [...weeklyMenu];
      updatedWeekly[editingContext].items = updater(
        updatedWeekly[editingContext].items
      );
      setWeeklyMenu(updatedWeekly);
    }

    try {
      // The actual updateMenuItem API call is now handled inside EditMenuModal's handleSave.
      // This `onSave` in MenuScreen is just for updating local UI after modal's API call.
      // If you want to handle the API call here, you would move the `updateMenuItem` call from EditMenuModal to here.
      // For now, assuming EditMenuModal handles the API.

      showAlert("Success", "Menu item updated successfully!", "success");
    } catch (error) {
      console.error("Error updating menu item:", error);
      showAlert(
        "Error",
        error.message || "Failed to update menu item. Reverting changes.",
        "error"
      );
      // Revert UI on error
      if (editingContext === "today") {
        setMenuItems(originalMenuItems);
      } else {
        setWeeklyMenu(originalWeeklyMenu);
      }
    } finally {
      setEditingItem(null); // Close the modal
      setEditForm({
        // Reset the form
        name: "",
        price: "",
        description: "",
        discount: "",
        image: "",
        item_group: "",
        item_code: "",
      });
    }
  };

  // UPDATED: Now handles both Today's Menu and Weekly Menu additions
  const handleAddItemsFromModal = (newItems) => {
    // First, check if we're adding to the weekly menu
    if (activeWeeklyDayIndex !== null) {
      const updatedWeekly = [...weeklyMenu];
      const currentDayItems = updatedWeekly[activeWeeklyDayIndex].items;

      // Filter out items already present in the current day's menu
      const existingItemCodes = new Set(
        currentDayItems.map((item) => item.item_code)
      );
      const uniqueNewItems = newItems.filter(
        (item) => !existingItemCodes.has(item.item_code)
      );

      // Add unique new items to the specific day's menu
      updatedWeekly[activeWeeklyDayIndex].items = [
        ...currentDayItems,
        ...uniqueNewItems,
      ];

      setWeeklyMenu(updatedWeekly);

      // Cleanup
      setActiveWeeklyDayIndex(null);
      if (uniqueNewItems.length > 0) {
        showAlert(
          "Added",
          `${uniqueNewItems.length} item(s) added to the menu for ${updatedWeekly[activeWeeklyDayIndex].day}.`,
          "success"
        );
      } else {
        showAlert(
          "Info",
          "No new items selected or all selected items are already on this day's menu.",
          "info"
        );
      }
    } else {
      // Existing logic for Today's Menu
      const existingItemCodes = new Set(
        menuItems.map((item) => item.item_code)
      );
      const uniqueNewItems = newItems.filter(
        (item) => !existingItemCodes.has(item.item_code)
      );

      setMenuItems((prevItems) => [...prevItems, ...uniqueNewItems]);

      if (uniqueNewItems.length > 0) {
        showAlert(
          "Added",
          `${uniqueNewItems.length} item(s) added to Today's Menu.`,
          "success"
        );
      } else {
        showAlert(
          "Info",
          "No new items selected or all selected items are already on the menu.",
          "info"
        );
      }
    }
  };

  const handleUploadWeeklyMenu = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (res.type === "cancel") return;
    if (!res.name.endsWith(".xls")) {
      showAlert("Invalid file", "Please upload a .xls file", "error");

      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: res.uri,
      name: res.name,
      type: "application/vnd.ms-excel",
    });

    try {
      const response = await fetch("https://your-backend/upload-weekly-menu", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.ok) {
        showAlert("Success", "Weekly menu uploaded", "success");
      } else {
        showAlert("Error", "Failed to upload weekly menu", "error");
      }
    } catch (error) {
      showAlert("Error", "Failed to upload weekly menu", "error");
    }

    setShowManageModal(false);
  };

  // const handleWarehouseSelect = (warehouse) => {
  //   dispatch(setSelectedWarehouse(warehouse));
  //   console.log("Selected warehouse on Menu screen:", warehouse.warehouse);
  //   // If your "Today's Menu" items are warehouse-specific, you would re-fetch them here
  //   // e.g., fetchTodayMenuItems(warehouse.corporate_code);
  // };

  // Update your handleWarehouseSelect

  // Update handleWarehouseSelect
  const handleWarehouseSelect = async (warehouse) => {
    dispatch(setSelectedWarehouse(warehouse));
    await fetchTodaysMenuItems(warehouse.warehouse);
    if (activeTab === "Weekly Menu") {
      await fetchWeeklyItems(warehouse.warehouse);
    }
  };

  // Add this useEffect for tab changes
  useEffect(() => {
    if (activeTab === "Weekly Menu" && selectedWarehouse) {
      fetchWeeklyItems(selectedWarehouse.warehouse);
    }
  }, [activeTab, selectedWarehouse, fetchWeeklyItems]);

  // Primary loading indicator (only for warehouse data now)
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
          onPress={fetchAllScreenData}
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
          onRefresh={fetchAllScreenData}
        />
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
      <MenuTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {deleting ? (
        <View className="flex-1 justify-center items-center py-10">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="text-gray-600 mt-4 text-base">Deleting Item...</Text>
        </View>
      ) : (
        <>
          {activeTab === "Today's Menu" && (
            <>
              {/* <TouchableOpacity
                onPress={() => {
                  setShowAddItemsModal(true);
                  setActiveWeeklyDayIndex(null);
                }}
                className="bg-green-500 py-3 px-6 rounded-lg mb-4 self-center flex-row items-center shadow-md"
                activeOpacity={0.8}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-semibold text-base">
                  Add to Today's Menu
                </Text>
              </TouchableOpacity> */}

              {loadingMenuItems ? (
                <View className="flex-1 justify-center items-center py-10">
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text className="text-gray-600 mt-4 text-base">
                    Loading today's menu...
                  </Text>
                </View>
              ) : menuItems.length === 0 ? (
                <View className="flex-1 items-center justify-center py-10">
                  <Text className="text-gray-500 text-lg">
                    No menu items available for today.
                  </Text>
                  <Text className="text-gray-400 text-md mt-2">
                    Tap above to add items.
                  </Text>
                </View>
              ) : (
                <MenuList
                  items={menuItems}
                  context="today"
                  toggleVisibility={toggleVisibility}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
              )}
            </>
          )}

          {activeTab === "Weekly Menu" && (
            <>
              {loadingWeeklyItems ? (
                <View className="flex-1 justify-center items-center py-10">
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text className="text-gray-600 mt-4 text-base">
                    Loading weekly menu...
                  </Text>
                </View>
              ) : (
                weeklyMenu.map((day, index) => (
                  <View key={`${day.day}-${day.date}`} className="mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-lg font-bold text-gray-800">
                        {day.day} ({day.date})
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowWeeklyAddItemsModal(true);
                          setActiveWeeklyDayIndex(index);
                        }}
                        className="bg-green-500 flex-row items-center py-1 px-3 rounded-lg"
                      >
                        <Ionicons
                          name="add-circle-outline"
                          size={16}
                          color="white"
                        />
                        <Text className="text-white ml-1 text-sm">
                          Add Items
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {day.items.length === 0 ? (
                      <Text className="text-gray-400 text-sm py-2">
                        No items added for this day
                      </Text>
                    ) : (
                      <MenuList
                        items={day.items}
                        context={index}
                        toggleVisibility={toggleVisibility}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                      />
                    )}
                  </View>
                ))
              )}
            </>
          )}
        </>
      )}
      <ManageWeeklyModal
        visible={showManageModal}
        onClose={() => setShowManageModal(false)}
        onUpload={handleUploadWeeklyMenu}
        // MODIFIED: ManageWeeklyModal onAdd also now sets the active day
        onAdd={() => {
          setShowAddItemsModal(true);
          setActiveWeeklyDayIndex(null); // Assuming this modal leads to adding to Today's menu
        }}
      />
      <EditMenuModal
        visible={!!editingItem}
        editingItem={editingItem}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSave} // This handleSave will now only update existing items
        onClose={() => {
          setEditingItem(null);
          setEditForm({
            name: "",
            price: "",
            description: "",
            discount: "",
            image: "",
            item_group: "",
            item_code: "",
          });
        }}
      />
      {/* Add the new modal component at the bottom with the other modals: */}
      <WeeklyAddItemsModal
        visible={showWeeklyAddItemsModal}
        onClose={() => {
          setShowWeeklyAddItemsModal(false);
          setActiveWeeklyDayIndex(null);
        }}
        onAddItems={handleAddItemsFromModal}
        selectedDayDate={
          activeWeeklyDayIndex !== null
            ? weeklyMenu[activeWeeklyDayIndex].date
            : null
        }
      />
      {/* The new AddItemsModal */}
      <AddItemsModal
        visible={showAddItemsModal}
        onClose={() => {
          setShowAddItemsModal(false);
          setActiveWeeklyDayIndex(null); // Resetting the index on close
        }}
        onAddItems={handleAddItemsFromModal}
      />

      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState({ ...alertState, visible: false })}
      />
    </ScrollView>
    </SafeAreaView>
  );
}
