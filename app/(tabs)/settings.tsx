import {SafeAreaView} from "react-native-safe-area-context";
import {api} from "@/convex/_generated/api";
import {TabHeader} from "@/components/TabHeader";

interface BehaviourClass {
    id: string;
    title: string;
    subclasses?: string[];
}

export default function Settings() {


    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader title="Settings"/>

        </SafeAreaView>
    );
}
