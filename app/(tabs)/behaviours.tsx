import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabHeader } from "@/components/TabHeader";
import { Text } from "@/components/ui/text";

export default function Behaviours() {
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader title="Behaviours" />
            <View className="flex-1 items-center justify-center px-5">
                <Text className="text-center text-muted-foreground">
                    Behaviours and sub-behaviours will be managed here.
                </Text>
            </View>
        </SafeAreaView>
    );
}
