
// import { Slot } from "expo-router";
// import { Provider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";
// import { store, persistor } from "../src/redux/store";
// import ProtectedRoute from "../src/routes/ProctectesRoute";

// export default function RootLayout() {
//   return (
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <ProtectedRoute>
//           <Slot />
//         </ProtectedRoute>
//       </PersistGate>
//     </Provider>
//   );
// }

import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../src/redux/store";
import ProtectedRoute from "../src/routes/ProctectesRoute";

// ✅ Add this import
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    // ✅ Wrap everything with SafeAreaProvider
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ProtectedRoute>
            <Slot />
          </ProtectedRoute>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}