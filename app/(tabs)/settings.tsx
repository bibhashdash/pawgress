import { useAuth } from "@clerk/expo";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/convex/_generated/api";
import { TabHeader } from "@/components/TabHeader";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function Settings() {
    const { signOut } = useAuth();
    const settings = useQuery(api.settings.get);
    const ensureSettings = useMutation(api.settings.ensure);

    useEffect(() => {
        if (settings === null) {
            ensureSettings();
        }
    }, [settings, ensureSettings]);

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader title="Settings" />
            <View className="flex-1 justify-between px-5 pb-6">
                <Text className="text-muted-foreground">
                    {settings === undefined
                        ? "Loading settings..."
                        : `Preferences go here. (settings row: ${settings?._id ?? "creating..."})`}
                </Text>
                <Button variant="outline" onPress={() => signOut()}>
                    <Text>Sign out</Text>
                </Button>
            </View>
        </SafeAreaView>
    );
}
