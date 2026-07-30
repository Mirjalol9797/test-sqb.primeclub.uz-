/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        f7f7f7: "#f7f7f7",
        ff8945: "#ff8945",
        "00b08c": "#00b08c",
        "1d98dc": "#1d98dc",
        d5d8df: "#d5d8df",
        ececec: "#ececec",
        "336fee": "#336fee",
        "007bff": "#007bff",
        666: "#666",
        "12B76A": "#12B76A",
        "6B7280": "#6B7280",
        "1F2A37": "#1F2A37",
        F3F4F6: "#F3F4F6",
        f4af00: "#f4af00",
        ffd531: "#ffd531",
        "111D28": "#111d28",
        ffdf8f: "#ffdf8f",
      },
    },
    screens: {
      400: { max: "400px" },
      420: { max: "420px" },
      480: { max: "480px" },
      640: { max: "640px" },
      768: { max: "768px" },
      960: { max: "960px" },
      1024: { max: "1024px" },
      1200: { max: "1200px" },
      1400: { max: "1400px" },
    },
  },
  plugins: [],
};
