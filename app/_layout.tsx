import "@/global.css";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { convex } from "@/lib/convex";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
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
