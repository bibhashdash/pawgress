import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabHeader } from "@/components/TabHeader";
import { Text } from "@/components/ui/text";

export default function Home() {
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader title="Home" />
            <View className="flex-1 items-center justify-center px-5">
                <Text className="text-center text-muted-foreground">
                    Today&#39;s training overview goes here.
                </Text>
            </View>
        </SafeAreaView>
    );
}
// probe-1784026708
