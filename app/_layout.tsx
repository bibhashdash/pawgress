import "@/global.css";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { convex } from "@/lib/convex";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFonts, Fredoka_500Medium } from "@expo-google-fonts/fredoka";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Fredoka_500Medium,
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) return null;

    return (
        <ClerkProvider
            tokenCache={tokenCache}
            publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <KeyboardProvider>
                    <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }} />
                </KeyboardProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
