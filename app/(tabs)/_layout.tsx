import { useAuth } from "@clerk/expo";
import { Redirect, Tabs, useRouter } from "expo-router";
import { ChevronLeft, House, NotebookPen, PawPrint, Settings } from "lucide-react-native";
import { Pressable } from "react-native";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppSplashScreen } from "@/components/AppSplashScreen";

export default function TabLayout() {
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const settings = useQuery(api.settings.get, isSignedIn ? {} : "skip");
    const ensureSettings = useMutation(api.settings.ensure);

    useEffect(() => {
        if (isSignedIn) {
            ensureSettings({});
        }
    }, [isSignedIn]);

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    // Settings row doesn't exist yet (ensureSettings above is still in
    // flight) or hasn't loaded — show the branded splash rather than
    // flashing the tabs before we know whether onboarding is needed.
    if (!settings) return <AppSplashScreen />;

    if (!settings.hasCompletedOnboarding) {
        return <Redirect href="/onboarding" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                headerTitleStyle: {
                    fontFamily: "Fredoka_500Medium",
                },
                tabBarActiveTintColor: "#EB5E28",
                tabBarInactiveTintColor: "#403D39",
                tabBarLabelStyle: {
                    fontFamily: "Fredoka_500Medium",
                },
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
            <Tabs.Screen
                name="behaviourClassAdd"
                options={{
                    href: null,
                    title: "Add Behaviour Class",
                    headerShown: true,
                    headerLeft: () => (
                        <Pressable onPress={() => router.navigate("/(tabs)/behaviours")} className="pl-4 pr-2">
                            <ChevronLeft color="#403D39" size={24} />
                        </Pressable>
                    ),
                }}
            />
            <Tabs.Screen
                name="behaviourClassDetails/[id]"
                options={{
                    href: null,
                    title: "Behaviour Class",
                    headerShown: true,
                    headerLeft: () => (
                        <Pressable onPress={() => router.navigate("/(tabs)/behaviours")} className="pl-4 pr-2">
                            <ChevronLeft color="#403D39" size={24} />
                        </Pressable>
                    ),
                }}
            />
            <Tabs.Screen
                name="logAdd"
                options={{
                    href: null,
                    title: "Add Log Entry",
                    headerShown: true,
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} className="pl-4 pr-2">
                            <ChevronLeft color="#403D39" size={24} />
                        </Pressable>
                    ),
                }}
            />
            <Tabs.Screen
                name="logDetails/[id]"
                options={{
                    href: null,
                    title: "Entry",
                    // headerShown: true,
                    // headerLeft: () => (
                    //     <Pressable onPress={() => router.navigate("/(tabs)/log")} className="pl-4 pr-2">
                    //         <ChevronLeft color="#403D39" size={24} />
                    //     </Pressable>
                    // ),
                }}
            />
        </Tabs>
    );
}
