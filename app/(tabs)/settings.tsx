import { useAuth } from "@clerk/expo";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabHeader } from "@/components/TabHeader";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function Settings() {
    const { signOut } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader title="Settings" />
            <View className="flex-1 justify-between px-5 pb-6">
                <Text className="text-muted-foreground">Preferences go here.</Text>
                <Button variant="outline" onPress={() => signOut()}>
                    <Text>Sign out</Text>
                </Button>
            </View>
        </SafeAreaView>
    );
}
