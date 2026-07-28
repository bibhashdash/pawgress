import {Pressable, ScrollView, View, useWindowDimensions} from "react-native";
import {Text} from "@/components/ui/text";
import {SafeAreaView} from "react-native-safe-area-context";
import {TabHeader} from "@/components/TabHeader";
import {useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {PlusCircle, Circle as CircleIcon} from "lucide-react-native";
import {Link, router} from "expo-router";
import {formatDateTime, isTimestampForCurrentDay} from "@/lib/utils";
import {Id} from "@/convex/_generated/dataModel";
import {Fragment} from "react";
import Svg, {Circle, Polyline} from "react-native-svg";

function isSameDay(timestamp: number, date: Date) {
    const other = new Date(timestamp);
    return other.getDate() === date.getDate()
        && other.getMonth() === date.getMonth()
        && other.getFullYear() === date.getFullYear();
}

function dayKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Consecutive days (ending today) with at least one log. If today has no
// log yet, still counts the streak through yesterday — today just hasn't
// "broken" it yet.
function calculateStreak(logs: {timestamp: number}[]): number {
    const daysWithLogs = new Set(logs.map(log => dayKey(new Date(log.timestamp))));
    const cursor = new Date();
    if (!daysWithLogs.has(dayKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
        if (!daysWithLogs.has(dayKey(cursor))) return 0;
    }
    let streak = 0;
    while (daysWithLogs.has(dayKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
}

export default function Home() {
    const {width: screenWidth} = useWindowDimensions();
    const allLogs = useQuery(api.logEntries.list)
    const tags = useQuery(api.tags.list)
    const classes = useQuery(api.behaviourClasses.list)
    const subclasses = useQuery(api.subclasses.listAll)

    if (!allLogs || !tags || !classes || !subclasses) return null;
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

    // allLogs is already ordered desc by timestamp (see logEntries.list).
    const recentLogs = allLogs.slice(0, 5);

    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
    });

    const streak = calculateStreak(allLogs);

    const thisWeekLogs = allLogs.filter(log => last7Days.some(date => isSameDay(log.timestamp, date)));
    const classCounts = thisWeekLogs.reduce<Record<Id<"behaviourClasses">, number>>((acc, log) => {
        acc[log.behaviourClassId] = (acc[log.behaviourClassId] ?? 0) + 1;
        return acc;
    }, {} as Record<Id<"behaviourClasses">, number>);
    const [mostActiveClassId, mostActiveCount] =
        Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
    const mostActiveClass = classes.find(item => item._id === mostActiveClassId);

    const tagLineDataSets = tags.map(tag => ({
        color: tag.color,
        values: last7Days.map(date =>
            allLogs.filter(log => log.tagId === tag._id && isSameDay(log.timestamp, date)).length
        ),
    }));

    const chartWidth = screenWidth - 40;
    const chartHeight = 200;
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
                    <View className="flex-row gap-4 items-center flex-wrap mt-3">
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

                <View className="flex-row gap-4 mt-6">
                    <View className="flex-1 border border-input rounded-md p-4 bg-white">
                        <Text className="text-xs text-muted-foreground">Streak</Text>
                        <Text className="text-2xl font-semibold mt-1">
                            {streak} {streak === 1 ? "day" : "days"}
                        </Text>
                    </View>
                    <View className="flex-1 border border-input rounded-md p-4 bg-white">
                        <Text className="text-xs text-muted-foreground">Most active</Text>
                        <Text className="text-base font-semibold mt-1" numberOfLines={1}>
                            {mostActiveClass?.title ?? "—"}
                        </Text>
                        {mostActiveClass && (
                            <Text className="text-xs text-muted-foreground">
                                {mostActiveCount} {mostActiveCount === 1 ? "log" : "logs"} this week
                            </Text>
                        )}
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

                <View className="mt-6">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-semibold">Recent logs</Text>
                        <Pressable onPress={() => router.push("/(tabs)/log")}>
                            <Text className="text-sm text-accent font-semibold">View all</Text>
                        </Pressable>
                    </View>
                    <View className="gap-2">
                        {recentLogs.length === 0 ? (
                            <Text className="text-muted-foreground">No logs yet.</Text>
                        ) : (
                            recentLogs.map((log) => {
                                const tag = findTag(log.tagId);
                                const subclass = subclasses.find(item => item._id === log.subclassId);
                                const behaviourClass = classes.find(item => item._id === log.behaviourClassId);
                                return (
                                    <Pressable
                                        key={log._id}
                                        onPress={() => router.push({pathname: "/(tabs)/logDetails/[id]", params: {id: log._id}})}
                                        className="rounded-md border border-input bg-white p-4 flex-row items-center gap-3"
                                    >
                                        <CircleIcon size={10} color={tag?.color ?? "#8C8983"} fill={tag?.color ?? "#8C8983"} />
                                        <View className="flex-1">
                                            <Text className="font-semibold">{subclass?.name ?? "Unknown"}</Text>
                                            <Text className="text-sm text-muted-foreground">{behaviourClass?.title ?? "Unknown"}</Text>
                                        </View>
                                        <Text className="text-xs text-muted-foreground">{formatDateTime(new Date(log.timestamp))}</Text>
                                    </Pressable>
                                );
                            })
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
