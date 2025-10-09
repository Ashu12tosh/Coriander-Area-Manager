import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://coriander.mozility.com",
  withCredentials: true, // Required for session-based authentication
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Optional: Set a timeout for mobile network conditions
});

export default apiClient;
