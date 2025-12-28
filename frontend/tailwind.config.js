export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#F97316",
                secondary: "#1E293B",
                background: "#F8FAFC",
                card: "#FFFFFF",
                accent: "#14B8A6",
                textPrimary: "#0F172A",
                textMuted: "#64748B",
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
};
