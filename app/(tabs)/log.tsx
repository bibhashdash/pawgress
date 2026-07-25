import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabHeader } from "@/components/TabHeader";
import { Text } from "@/components/ui/text";

export default function Log() {
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader title="Logs" />
            <View className="flex-1 items-center justify-center px-5">
                <Text className="text-center text-muted-foreground">
                    Recorded training sessions will show up here.
                </Text>
            </View>
        </SafeAreaView>
    );
}
