import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { House, NotebookPen, PawPrint, Settings } from "lucide-react-native";

export default function TabLayout() {
    const { isSignedIn } = useAuth();

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#EB5E28",
                tabBarInactiveTintColor: "#403D39",
                tabBarStyle: {
                    backgroundColor: "#FFFCF2",
                    borderTopColor: "rgba(64, 61, 57, 0.15)",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="log"
                options={{
                    title: "Log",
                    tabBarIcon: ({ color, size }) => <NotebookPen color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="behaviours"
                options={{
                    title: "Behaviours",
                    tabBarIcon: ({ color, size }) => <PawPrint color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
