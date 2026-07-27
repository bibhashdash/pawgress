import {ScrollView, View} from "react-native";
import {Text} from "@/components/ui/text";
import {SafeAreaView} from "react-native-safe-area-context";
import {TabHeader} from "@/components/TabHeader";
import {useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {PlusCircle} from "lucide-react-native";
import {Link} from "expo-router";
import {isTimestampForCurrentDay} from "@/lib/utils";
import {Id} from "@/convex/_generated/dataModel";

export default function Home() {
    const allLogs = useQuery(api.logEntries.list)
    const tags = useQuery(api.tags.list)

    if (!allLogs || !tags) return null;
    const todayLogs = allLogs
        .filter(log => isTimestampForCurrentDay(log.timestamp))

    const seeded = tags?.reduce<Record<Id<"tags">, number>>((acc, tag) => {
        acc[tag._id] = 0;
        return acc;
    }, {} as Record<Id<"tags">, number>);
    const breakdownByTags: Record<Id<"tags">, number> = todayLogs
        .reduce((acc, log) => {
            acc[log.tagId] = (acc[log.tagId] ?? 0) + 1;
            return acc;
        }, seeded as Record<Id<"tags">, number>)

    const findTag = (tagId: Id<"tags">) => {
        return tags?.find(item => item._id === tagId)
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader
                title="Home"
                right={
                    <Link href={"/(tabs)/logAdd"}>
                        <PlusCircle color="#EB5E28"/>
                    </Link>
                }
            />
            <ScrollView className="my-4 gap-3 px-5">
                <View>
                    <Text>Today's log count</Text>
                    <Text className="text-6xl mt-2">{todayLogs.length}</Text>
                    <View className="flex-row gap-4 items-center flex-wrap">
                        {
                            Object.entries(breakdownByTags).map(([key, value]) => (
                                <View key={key} className="gap-1 items-center">
                                    <Text className="text-sm">
                                        {
                                            findTag(key as Id<"tags">)?.name.toLocaleUpperCase()
                                        }
                                    </Text>
                                    <Text className="text-sm font-bold" style={{
                                        color: findTag(key as Id<"tags">)?.color
                                    }}>{value}</Text>
                                </View>
                            ))
                        }
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
