import {FlatList, Modal, Pressable, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {TabHeader} from "@/components/TabHeader";
import {Text} from "@/components/ui/text";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {useState} from "react";
import {Link, router} from "expo-router";
import {Circle, PlusCircle, Trash2, Upload} from "lucide-react-native";
import {cn, formatDateTime, isTimestampForCurrentDay, isTimestampWithinLastDays} from "@/lib/utils";
import type {Id} from "@/convex/_generated/dataModel";
import {Button} from "@/components/ui/button";
import Toast from "react-native-toast-message";

type DateRangeFilter = "today" | "week" | "all";

const DATE_RANGE_OPTIONS: {value: DateRangeFilter; label: string}[] = [
    {value: "today", label: "Today"},
    {value: "week", label: "Last 7 days"},
    {value: "all", label: "All time"},
];

export default function Log() {
    const logs = useQuery(api.logEntries.list);
    const classes = useQuery(api.behaviourClasses.list);
    const subclasses = useQuery(api.subclasses.listAll);
    const tags = useQuery(api.tags.list);
    const removeLogEntry = useMutation(api.logEntries.remove);

    const [categoryFilter, setCategoryFilter] = useState<Id<"behaviourClasses"> | null>(null);
    const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

    const [tagFilter, setTagFilter] = useState<Id<"tags"> | null>(null);
    const [tagPickerOpen, setTagPickerOpen] = useState(false);

    const [dateRange, setDateRange] = useState<DateRangeFilter>("all");

    const [pendingDeleteId, setPendingDeleteId] = useState<Id<"logEntries"> | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!logs || !classes || !subclasses || !tags) return null;

    const classById = new Map(classes.map((item) => [item._id, item]));
    const subclassById = new Map(subclasses.map((item) => [item._id, item]));
    const tagById = new Map(tags.map((item) => [item._id, item]));

    const selectedCategory = categoryFilter ? classById.get(categoryFilter) : undefined;
    const selectedTag = tagFilter ? tagById.get(tagFilter) : undefined;

    const filteredLogs = logs.filter((log) => {
        if (categoryFilter && log.behaviourClassId !== categoryFilter) return false;
        if (tagFilter && log.tagId !== tagFilter) return false;
        if (dateRange === "today" && !isTimestampForCurrentDay(log.timestamp)) return false;
        return !(dateRange === "week" && !isTimestampWithinLastDays(log.timestamp, 7));

    });

    const confirmDeleteLog = () => {
        if (!pendingDeleteId) return;
        setIsDeleting(true);
        removeLogEntry({id: pendingDeleteId})
            .catch(() => {
                Toast.show({type: "error", text1: "There was an error deleting this entry."});
            })
            .finally(() => {
                setIsDeleting(false);
                setPendingDeleteId(null);
            });
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader
                title="Logs"
                right={
                    <View className="flex-row gap-4 items-center">
                        <Link href={"/(tabs)/logAdd"}>
                            <PlusCircle color="#EB5E28"/>
                        </Link>
                        <Button className="p-0" variant="icon">
                            <Upload />
                        </Button>
                    </View>
                }
            />

            <View className="flex-row flex-wrap gap-2 px-5 pb-3 my-4">
                <Pressable
                    onPress={() => setCategoryPickerOpen(true)}
                    className={cn(
                        "rounded-full px-3 py-1.5 border border-input bg-white",
                        selectedCategory && "border-accent"
                    )}
                >
                    <Text className={cn("text-sm", selectedCategory && "text-accent font-semibold")}>
                        {selectedCategory?.title ?? "Category"}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => setTagPickerOpen(true)}
                    className={cn(
                        "rounded-full px-3 py-1.5 border border-input bg-white flex-row items-center gap-1.5",
                        selectedTag && "border-accent"
                    )}
                >
                    {selectedTag && <Circle size={8} color={selectedTag.color} fill={selectedTag.color} />}
                    <Text className={cn("text-sm", selectedTag && "text-accent font-semibold")}>
                        {selectedTag?.name.toUpperCase() ?? "Tag"}
                    </Text>
                </Pressable>

                {DATE_RANGE_OPTIONS.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => setDateRange(option.value)}
                        className={cn(
                            "rounded-full px-3 py-1.5 border border-input",
                            dateRange === option.value ? "bg-accent border-accent" : "bg-white"
                        )}
                    >
                        <Text className={cn("text-sm", dateRange === option.value && "text-accent-foreground font-semibold")}>
                            {option.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <FlatList
                className="px-5"
                data={filteredLogs}
                keyExtractor={(item) => item._id}
                ItemSeparatorComponent={() => <View className="h-2" />}
                ListEmptyComponent={
                    <Text className="text-center text-muted-foreground mt-10">
                        No logs match these filters.
                    </Text>
                }
                renderItem={({item}) => {
                    const tag = tagById.get(item.tagId);
                    const subclass = subclassById.get(item.subclassId);
                    const behaviourClass = classById.get(item.behaviourClassId);
                    return (
                        <Pressable
                            onPress={() => router.push({pathname: "/(tabs)/logDetails/[id]", params: {id: item._id}})}
                            className="rounded-md border border-input bg-white p-4 flex-row items-center gap-3"
                        >
                            <Circle size={10} color={tag?.color ?? "#8C8983"} fill={tag?.color ?? "#8C8983"} />
                            <View className="flex-1">
                                <Text className="font-semibold">{subclass?.name ?? "Unknown"}</Text>
                                <Text className="text-sm text-muted-foreground">{behaviourClass?.title ?? "Unknown"}</Text>
                            </View>
                            <View className="items-end gap-2">
                                <Text className="text-xs text-muted-foreground">{formatDateTime(new Date(item.timestamp))}</Text>
                                <Pressable onPress={() => setPendingDeleteId(item._id)} hitSlop={8}>
                                    <Trash2 size={16} color="#8C8983" />
                                </Pressable>
                            </View>
                        </Pressable>
                    );
                }}
            />

            <Modal
                visible={categoryPickerOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setCategoryPickerOpen(false)}
            >
                <Pressable
                    className="flex-1 bg-black/40 justify-end"
                    onPress={() => setCategoryPickerOpen(false)}
                >
                    {/* No-op onPress so taps inside the sheet don't fall through to the backdrop above and close it */}
                    <Pressable onPress={() => {}} className="bg-background rounded-t-xl max-h-[70%] pb-6">
                        <Text className="text-lg font-semibold px-5 py-4">Filter by category</Text>
                        <FlatList
                            data={classes}
                            keyExtractor={(item) => item._id}
                            ItemSeparatorComponent={() => <View className="h-px bg-border" />}
                            ListHeaderComponent={
                                <Pressable
                                    onPress={() => {
                                        setCategoryFilter(null);
                                        setCategoryPickerOpen(false);
                                    }}
                                    className="px-5 py-4"
                                >
                                    <Text className={cn(!categoryFilter && "text-accent font-semibold")}>
                                        All categories
                                    </Text>
                                </Pressable>
                            }
                            renderItem={({item}) => (
                                <Pressable
                                    onPress={() => {
                                        setCategoryFilter(item._id);
                                        setCategoryPickerOpen(false);
                                    }}
                                    className="px-5 py-4"
                                >
                                    <Text className={cn(item._id === categoryFilter && "text-accent font-semibold")}>
                                        {item.title}
                                    </Text>
                                </Pressable>
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                visible={tagPickerOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setTagPickerOpen(false)}
            >
                <Pressable
                    className="flex-1 bg-black/40 justify-end"
                    onPress={() => setTagPickerOpen(false)}
                >
                    {/* No-op onPress so taps inside the sheet don't fall through to the backdrop above and close it */}
                    <Pressable onPress={() => {}} className="bg-background rounded-t-xl max-h-[70%] pb-6">
                        <Text className="text-lg font-semibold px-5 py-4">Filter by tag</Text>
                        <FlatList
                            data={tags}
                            keyExtractor={(item) => item._id}
                            ItemSeparatorComponent={() => <View className="h-px bg-border" />}
                            ListHeaderComponent={
                                <Pressable
                                    onPress={() => {
                                        setTagFilter(null);
                                        setTagPickerOpen(false);
                                    }}
                                    className="px-5 py-4"
                                >
                                    <Text className={cn(!tagFilter && "text-accent font-semibold")}>
                                        All tags
                                    </Text>
                                </Pressable>
                            }
                            renderItem={({item}) => (
                                <Pressable
                                    onPress={() => {
                                        setTagFilter(item._id);
                                        setTagPickerOpen(false);
                                    }}
                                    className="px-5 py-4"
                                >
                                    <View className="flex-row justify-between items-center">
                                        <Text className={cn(item._id === tagFilter && "text-accent font-semibold")}>
                                            {item.name.toUpperCase()}
                                        </Text>
                                        <Circle color={item.color} fill={item.color} />
                                    </View>
                                </Pressable>
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                visible={pendingDeleteId !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setPendingDeleteId(null)}
            >
                <Pressable
                    className="flex-1 bg-black/40 justify-end"
                    onPress={() => setPendingDeleteId(null)}
                >
                    {/* No-op onPress so taps inside the sheet don't fall through to the backdrop above and close it */}
                    <Pressable onPress={() => {}} className="bg-background rounded-t-xl p-5 pb-12 gap-4">
                        <Text className="text-lg font-semibold">Delete this log?</Text>
                        <Text className="text-muted-foreground">This action cannot be undone.</Text>
                        <View className="flex-row gap-3">
                            <Button
                                onPress={() => setPendingDeleteId(null)}
                                disabled={isDeleting}
                                variant="outline" className="flex-1">
                                <Text>Cancel</Text>
                            </Button>
                            <Button
                                onPress={confirmDeleteLog}
                                loading={isDeleting}
                                disabled={isDeleting}
                                variant="destructive" className="flex-1">
                                <Text className="text-white">Delete</Text>
                            </Button>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
