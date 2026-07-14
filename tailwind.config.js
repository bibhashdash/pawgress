/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                background: "#FFFCF2",
                foreground: "#403D39",
                card: "#FFFCF2",
                "card-foreground": "#403D39",
                popover: "#FFFCF2",
                "popover-foreground": "#403D39",
                primary: "#252422",
                "primary-foreground": "#FFFCF2",
                secondary: "#CCC5B9",
                "secondary-foreground": "#403D39",
                muted: "#CCC5B9",
                "muted-foreground": "#8C8983",
                accent: "#EB5E28",
                "accent-foreground": "#FFFCF2",
                destructive: "#dc2626",
                "destructive-foreground": "#FFFCF2",
                success: "#16a34a",
                border: "#E2DFD6",
                input: "#E2DFD6",
                ring: "#EB5E28",
            },
            borderRadius: {
                sm: "8px",
                md: "12px",
                lg: "16px",
                xl: "24px",
            },
        },
    },
    plugins: [],
};
