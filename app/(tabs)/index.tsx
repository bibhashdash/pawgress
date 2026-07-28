import {ScrollView, View, useWindowDimensions} from "react-native";
import {Text} from "@/components/ui/text";
import {SafeAreaView} from "react-native-safe-area-context";
import {TabHeader} from "@/components/TabHeader";
import {useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {PlusCircle} from "lucide-react-native";
import {Link} from "expo-router";
import {isTimestampForCurrentDay} from "@/lib/utils";
import {Id} from "@/convex/_generated/dataModel";
import {Fragment} from "react";
import Svg, {Circle, Polyline} from "react-native-svg";
import Toast from "react-native-toast-message";

function isSameDay(timestamp: number, date: Date) {
    const other = new Date(timestamp);
    return other.getDate() === date.getDate()
        && other.getMonth() === date.getMonth()
        && other.getFullYear() === date.getFullYear();
}

export default function Home() {
    const {width: screenWidth} = useWindowDimensions();
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

    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
    });

    const tagLineDataSets = tags.map(tag => ({
        color: tag.color,
        values: last7Days.map(date =>
            allLogs.filter(log => log.tagId === tag._id && isSameDay(log.timestamp, date)).length
        ),
    }));

    const chartWidth = screenWidth - 40;
    const chartHeight = 120;
    const chartPaddingX = 15;
    const chartPaddingTop = 10;
    const plotWidth = chartWidth - chartPaddingX * 2;
    const xStep = plotWidth / 6;
    const maxValue = Math.max(1, ...tagLineDataSets.flatMap(set => set.values));

    const getX = (i: number) => chartPaddingX + i * xStep;
    const getY = (value: number) => chartHeight - (value / maxValue) * (chartHeight - chartPaddingTop);

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

                <View className="mt-6">
                    <Text className="mb-2">Last 7 days</Text>
                    <Svg width={chartWidth} height={chartHeight}>
                        {tagLineDataSets.map((set, setIndex) => (
                            <Fragment key={setIndex}>
                                <Polyline
                                    points={set.values.map((value, i) => `${getX(i)},${getY(value)}`).join(" ")}
                                    fill="none"
                                    stroke={set.color}
                                    strokeWidth={2}
                                />
                                {set.values.map((value, i) => (
                                    <Circle key={i} cx={getX(i)} cy={getY(value)} r={3} fill={set.color} />
                                ))}
                            </Fragment>
                        ))}
                    </Svg>
                    <View style={{width: chartWidth, height: 16}}>
                        {last7Days.map((date, i) => (
                            <Text
                                key={i}
                                className="text-xs text-muted-foreground text-center absolute"
                                style={{left: getX(i) - 15, width: 30}}
                            >
                                {date.toLocaleDateString(undefined, {weekday: "short"})}
                            </Text>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
