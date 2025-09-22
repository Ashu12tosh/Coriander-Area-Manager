module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#065F46", // Your primary green color
        },
      },
    },
  },
  plugins: [],
};

// module.exports = {
//   content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
//   presets: [require("nativewind/preset")],
//   theme: {
//     extend: {
//       colors: { // Key must be "colors" (not "color")
//         button: "#4CAF50", // Add commas after each property
//         background: "#FFFFFF",
//         // Add more custom colors here
//       },
//     },
//   },
//   plugins: [],
// };
