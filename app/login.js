import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { setUser } from "../src/redux/slices/authSlice";
import { Ionicons, Feather } from "@expo/vector-icons";
import {
  sendOtp,
  verifyOtp,
  checkExistingSession,
} from "../src/services/authService";
import CustomAlert from "../src/components/alert/CUstomAlert";

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
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
  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const user = await checkExistingSession();
      if (user) {
        dispatch(setUser(user));
        router.push("/home");
      }
    };
    checkSession();
  }, []);

  const handleGetOtp = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      showAlert("Oops!", "🍜 Please enter a valid 10-digit number", "error");
      return;
    }

    setIsLoading(true);

    const result = await sendOtp(mobileNumber);

    setIsLoading(false);

    if (result.status === "success") {
      showAlert(
        "OTP Sent ✅",
        `📲 OTP sent to: ${mobileNumber}\n\n🔢 Your OTP: ${result.otp}\n\n(Visible for development only)`,
        "success"
      );
      setShowOtpField(true);
    } else {
      showAlert("Error", result.message || "Failed to send OTP", "error");
    }
  };

  const handleLogin = async () => {
    if (!otp || otp.length !== 4) {
      showAlert("Hold on!", "🔢 Enter a valid 4-digit OTP", "error");
      return;
    }

    setIsLoading(true);

    const result = await verifyOtp(mobileNumber, otp);

    setIsLoading(false);

    if (result.status === "success") {
      dispatch(
        setUser({
          mobileNumber,
          ...result.user,
        })
      );
      router.push("/home");
    } else {
      let errorMessage = result.message;
      if (result.errorCode === "OTP_EXPIRED") {
        errorMessage = "⌛ OTP expired. Please request a new one.";
      } else if (result.errorCode === "INVALID_OTP") {
        errorMessage = "❌ Invalid OTP. Please try again.";
      }
      showAlert("Error", errorMessage, "error");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/LOGIN.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center px-6"
        >
          <View className="mb-10">
            <Text className="text-green-500 text-4xl font-bold mb-2">
              CORIANDER
            </Text>
            <Text className="text-green-500 text-lg font-semibold">
              Sign in to unlock food magic
            </Text>
          </View>

          {/* Mobile Input */}
          <View className="flex-row items-center bg-black/70 rounded-xl px-4 py-3 mb-4 border border-green-400/30">
            <Ionicons name="phone-portrait-outline" size={22} color="#4CAF50" />
            <TextInput
              placeholder="Mobile Number"
              placeholderTextColor="#d1d5db"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              maxLength={10}
              className="text-amber-50 ml-3 flex-1 text-lg"
              editable={!showOtpField}
            />
          </View>

          {/* Conditional OTP Flow */}
          {!showOtpField ? (
            <TouchableOpacity
              onPress={handleGetOtp}
              className="bg-green-500 py-4 rounded-xl mb-6 active:bg-green-600"
              disabled={isLoading}
            >
              <Text className="text-white text-center font-bold text-lg">
                {isLoading ? "Sending..." : "Get OTP →"}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <View className="flex-row items-center bg-black/70 rounded-xl px-4 py-3 mb-4 border border-green-400/30">
                <Feather name="lock" size={22} color="#4CAF50" />
                <TextInput
                  placeholder="Enter 4-digit OTP"
                  placeholderTextColor="#d1d5db"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={4}
                  className="text-emerald-50 ml-3 flex-1 text-lg"
                />
              </View>
              <TouchableOpacity
                onPress={handleLogin}
                className="bg-green-500 py-4 rounded-xl mb-6 active:bg-green-600"
                disabled={isLoading}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {isLoading ? "Verifying..." : "Let's Eat! 🍽️"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleGetOtp} className="mb-6">
                <Text className="text-green-300 text-center text-sm">
                  Didn't receive OTP? Resend
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-green-400/30" />
            <Text className="text-green-300 mx-3 text-sm">
              or continue with
            </Text>
            <View className="flex-1 h-px bg-amber-400/30" />
          </View>

          {/* <Text className="text-center text-green-200">
            New foodie?{" "}
            <Link href="/signup" className="text-green-400 font-bold">
              Sign up
            </Link>
          </Text> */}
        </KeyboardAvoidingView>
        <CustomAlert
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          type={alertState.type}
          onClose={() => setAlertState({ ...alertState, visible: false })}
        />
      </View>
    </ImageBackground>
  );
};

export default Login;
