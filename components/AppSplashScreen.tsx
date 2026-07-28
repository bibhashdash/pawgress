import {View, ActivityIndicator} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Text} from "@/components/ui/text";
import {PawPrint} from "lucide-react-native";

// Custom loading screen shown while we're deciding where a signed-in user
// goes (onboarding vs. tabs) — rendered only once fonts have loaded, so
// text always shows in Fredoka rather than flashing the system font.
export function AppSplashScreen() {
    return (
        <LinearGradient colors={["#FDEDE5", "#ffebe0"]} style={{flex: 1}}>
            <View className="flex-1 items-center justify-center gap-4">
                <View className="items-center justify-center">
                    <PawPrint size={120} color="#EB5E28" fill="#EB5E28" />
                    <Text className="text-4xl font-semibold text-accent">Pawgress</Text>
                </View>

                <View className="items-center mt-2">
                    <Text className="text-sm text-muted-foreground mt-1" style={{letterSpacing: 2}}>
                        BETTER BONDS, HAPPIER DOGS
                    </Text>
                </View>
            </View>

            <View className="px-10 pb-16 gap-4">
                <View className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <View className="h-full rounded-full bg-accent" style={{width: "35%"}} />
                </View>
                <View className="flex-row items-center justify-center gap-2">
                    <ActivityIndicator size="small" color="#8C8983" />
                    <Text className="text-muted-foreground">Loading your journey...</Text>
                </View>
            </View>
        </LinearGradient>
    );
}
