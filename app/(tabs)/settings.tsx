import {SafeAreaView} from "react-native-safe-area-context";
import {api} from "@/convex/_generated/api";
import {TabHeader} from "@/components/TabHeader";
import {useAuth, useUser} from "@clerk/expo";

export default function Settings() {
    const {user} = useUser();

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader title="Settings"/>

        </SafeAreaView>
    );
}
