// src/redux/slices/warehouseSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  warehouses: [],
  selectedWarehouse: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const warehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    setWarehouses: (state, action) => {
      state.warehouses = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    setSelectedWarehouse: (state, action) => {
      state.selectedWarehouse = action.payload;
    },
    // You might add a 'loading' state if you're fetching warehouses within an async thunk here
    // For now, components will manage loading until dispatching setWarehouses
    setWarehouseLoading: (state) => {
      state.status = "loading";
    },
    setWarehouseError: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const {
  setWarehouses,
  setSelectedWarehouse,
  setWarehouseLoading,
  setWarehouseError,
} = warehouseSlice.actions;

export default warehouseSlice.reducer;
