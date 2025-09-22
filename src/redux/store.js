// // filepath: e:\my-app\src\redux\store.js
// import { configureStore } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from "redux-persist";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import authReducer from "./slices/authSlice";

// const persistConfig = {
//   key: "root",
//   storage: AsyncStorage,
// };

// const persistedReducer = persistReducer(persistConfig, authReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
// });

// export const persistor = persistStore(store);

// filepath: e:\my-app\src\redux\store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit"; // Import combineReducers
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authReducer from "./slices/authSlice";
import warehouseReducer from "./slices/warehouseSlice"; // Import the new reducer

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "warehouse"], // Specify which slices to persist
  // If you only want to persist selectedWarehouse, you can do:
  // blacklist: ["warehouses"] // on the warehouse slice specifically
};

// Combine all your reducers
const rootReducer = combineReducers({
  auth: authReducer,
  warehouse: warehouseReducer, // Add your new warehouse reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types to prevent serialization warnings from redux-persist
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);
