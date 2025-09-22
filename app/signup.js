import React, { useState } from "react";
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
import { Link } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSignup = () => {
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      return;
    }
    setEmailError("");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <ImageBackground
      source={require("../assets/loginBg.jpg")} // Direct path
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      {/* Dark overlay */}
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center px-6"
        >
          <View className="mb-10">
            <Text className="text-amber-400 text-4xl font-bold mb-2">
              Join Us!
            </Text>
            <Text className="text-amber-300 text-lg font-semibold">
              Create your foodie account
            </Text>
          </View>

          {/* Name Input */}
          <View className="flex-row items-center bg-black/70 rounded-xl px-4 py-3 mb-4 border border-amber-400/30">
            <Ionicons name="person-outline" size={22} color="#fbbf24" />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#d1d5db"
              value={name}
              onChangeText={setName}
              className="text-amber-50 ml-3 flex-1 text-lg"
            />
          </View>

          {/* Email Input */}
          <View className="flex-row items-center bg-black/70 rounded-xl px-4 py-3 mb-1 border border-amber-400/30">
            <Ionicons name="mail-outline" size={22} color="#fbbf24" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#d1d5db"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              className="text-amber-50 ml-3 flex-1 text-lg"
            />
          </View>
          {emailError && (
            <Text className="text-red-400 text-sm mb-3 ml-2">{emailError}</Text>
          )}

          {/* Password Input */}
          <View className="flex-row items-center bg-black/70 rounded-xl px-4 py-3 mb-6 border border-amber-400/30">
            <Feather name="lock" size={22} color="#fbbf24" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#d1d5db"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              className="text-amber-50 ml-3 flex-1 text-lg"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="#fbbf24"
              />
            </TouchableOpacity>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            className="bg-amber-500 py-4 rounded-xl mb-6 active:bg-amber-600"
            onPress={handleSignup}
          >
            <Text className="text-white text-center font-bold text-lg">
              Create Account
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-amber-400/30" />
            <Text className="text-amber-300 mx-3 text-sm">or</Text>
            <View className="flex-1 h-px bg-amber-400/30" />
          </View>

          <Text className="text-center text-amber-200">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-400 font-bold">
              Login
            </Link>
          </Text>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

export default Signup;
