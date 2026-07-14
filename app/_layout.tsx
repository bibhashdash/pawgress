import "@/global.css";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { convex } from "@/lib/convex";

export default function RootLayout() {
    return (
        <ClerkProvider
            tokenCache={tokenCache}
            publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }} />
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
