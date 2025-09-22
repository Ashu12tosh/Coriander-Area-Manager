import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#f8fcf8",
          borderTopColor: "#e7f4e7",
          paddingTop: 4,
          paddingBottom: 16,
          height: 60,
        },
        tabBarActiveTintColor: "#499c49",
        tabBarInactiveTintColor: "#0d1c0d",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="home" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="cutlery" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="file-text" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="user" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="couponManagement"
        options={{
          title: "Coupon",
          href: null,
          tabBarStyle: { display: "none" }, // hide tab bar for this screen
        }}
      />
    </Tabs>
  );
}
