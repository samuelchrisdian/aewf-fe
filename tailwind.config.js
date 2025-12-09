/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1a56db",     // Example vivid blue
                secondary: "#7e22ce",   // Example purple
                danger: "#dc2626",      // Red for alerts
                warning: "#d97706",     // Amber for warnings
                success: "#16a34a",     // Green for success
            }
        },
    },
    plugins: [],
}
