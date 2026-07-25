import {SafeAreaView} from "react-native-safe-area-context";
import {Alert, FlatList, Modal, Platform, Pressable, View} from "react-native";
import {Text} from "@/components/ui/text";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import type {Id} from "@/convex/_generated/dataModel";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ChevronDown, ChevronLeft, Circle, Pencil, PlusCircle, Trash2Icon, Upload} from "lucide-react-native";
import {useCallback, useState} from "react";
import {cn, formatDateTime} from "@/lib/utils";
import {useFocusEffect} from "expo-router/react-navigation";
import {Link, router, useLocalSearchParams} from "expo-router";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import DateTimePicker, {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import {TabHeader} from "@/components/TabHeader";

export default function LogDetails() {
    const {id} = useLocalSearchParams<{ id: Id<"logEntries"> }>()
    const logEntry = useQuery(api.logEntries.get, {id: id as Id<"logEntries">})
    const classes = useQuery(api.behaviourClasses.list)
    const tags = useQuery(api.tags.list)
    const updateLogEntry = useMutation(api.logEntries.update);
    const removeLogEntry = useMutation(api.logEntries.remove);

    const [categoryId, setCategoryId] = useState<Id<"behaviourClasses"> | null>(logEntry?.behaviourClassId ?? null);
    const subclasses = useQuery(api.subclasses.list, categoryId ? {behaviourClassId: categoryId} : "skip")
    const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

    const [subclassId, setSubclassId] = useState<Id<"subclasses"> | null>(logEntry?.subclassId ?? null);
    const [subclassPickerOpen, setSubclassPickerOpen] = useState(false);

    const [tagId, setTagId] = useState<Id<"tags"> | null>(logEntry?.tagId ?? null);
    const [tagPickerOpen, setTagPickerOpen] = useState(false);

    const [description, setDescription] = useState<string>(logEntry?.description ?? "");

    const [date, setDate] = useState(logEntry ? new Date(logEntry.timestamp) : new Date())

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const openAndroidDateTimePicker = () => {
        DateTimePickerAndroid.open({
            value: date,
            mode: "date",
            onValueChange: (_event, selectedDate) => {
                if (!selectedDate) return;
                DateTimePickerAndroid.open({
                    value: selectedDate,
                    mode: "time",
                    onValueChange: (_timeEvent, selectedTime) => {
                        if (!selectedTime) return;
                        setDate(selectedTime);
                    },
                });
            },
        });
    };

    const selectedCategory = classes?.find(item => item._id === categoryId);
    const selectedSubclass = subclasses?.find(item => item._id === subclassId);
    const selectedTag = tags?.find(item => item._id === tagId);

    const resetFormFields = () => {
        if (!logEntry) return;
        setCategoryId(logEntry.behaviourClassId);
        setSubclassId(logEntry.subclassId);
        setTagId(logEntry.tagId)
        setDate(new Date(logEntry.timestamp));
        setDescription(logEntry.description ?? "");
    }

    useFocusEffect(
        useCallback(() => {
            resetFormFields()
            setEditMode(false)
        }, [logEntry])
    );

    const handleSubmit = () => {
        setIsSubmitting(true)
        if (selectedCategory && selectedTag && selectedSubclass) {
            updateLogEntry({
                id: id as Id<"logEntries">,
                behaviourClassId: selectedCategory._id,
                subclassId: selectedSubclass._id,
                timestamp: date.getTime(),
                description: description ?? "",
                tagId: selectedTag._id,
            }).then(() => {
                setEditMode(false);
                Alert.alert(
                    "Success",
                    "Entry successfully updated",
                    [
                        {
                            text: 'Ok',
                            style: 'default',
                        }
                    ]
                );
            }).catch(() => {
                Alert.alert(
                    "Error",
                    "There was an error updating this entry",
                    [
                        {
                            text: 'Ok',
                            style: 'cancel',
                        }
                    ]
                );
            }).finally(() => {
                setIsSubmitting(false)
            })
        }
    }

    const handleDeleteLog = () => {
        Alert.alert(
            "Delete this log?",
            "This action cannot be undone.",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        removeLogEntry({id})
                            .then(() => router.navigate("/(tabs)/log"))
                            .catch(() => {
                            Alert.alert("Error", "There was an error deleting this entry.");
                        });
                    },
                },
            ]
        );
    };

    if (!logEntry) return null;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader
                title="Entry"
                right={
                    <View className="flex-row gap-4 items-center">
                        {!editMode && (
                            <Pressable onPress={() => setEditMode(true)}>
                                <Pencil color="#403D39" size={20} />
                            </Pressable>
                        )}
                        <Link href={"/(tabs)/logAdd"}>
                            <PlusCircle color="#EB5E28"/>
                        </Link>
                        <Button onPress={handleDeleteLog} variant="icon" className="m-0 p-0">
                            <Trash2Icon />
                        </Button>
                    </View>
                }
                left={
                    <Pressable onPress={() => router.navigate("/(tabs)/log")} className="pr-2">
                        <ChevronLeft color="#403D39" size={24} />
                    </Pressable>
                }
            />
            <KeyboardAwareScrollView
                className="px-5 mt-5"
                bottomOffset={20}
                keyboardShouldPersistTaps="handled"
            >
                <View>
                    <Text className="mb-2">Category</Text>
                    {editMode ? (
                        <Pressable
                            disabled={!classes || isSubmitting}
                            onPress={() => setCategoryPickerOpen(true)}
                            className="rounded-md h-[50] w-full border border-input bg-white px-4 flex-row items-center justify-between"
                        >
                            <Text className={cn(!selectedCategory && "text-muted-foreground")}>
                                {selectedCategory?.title ?? "Select a category"}
                            </Text>
                            <ChevronDown size={18} color="#8C8983" />
                        </Pressable>
                    ) : (
                        <View className="rounded-md h-[50] w-full border border-input bg-white px-4 flex-row items-center">
                            <Text>{selectedCategory?.title ?? "—"}</Text>
                        </View>
                    )}
                </View>

                <View className="mt-4">
                    <Text className="mb-2">Behaviour</Text>
                    {editMode ? (
                        <Pressable
                            disabled={!subclasses || isSubmitting }
                            onPress={() => setSubclassPickerOpen(true)}
                            className="rounded-md h-[50] w-full border border-input bg-white px-4 flex-row items-center justify-between"
                        >
                            <Text className={cn(!selectedSubclass && "text-muted-foreground")}>
                                {selectedSubclass?.name ?? "Select a subclass"}
                            </Text>
                            <ChevronDown size={18} color="#8C8983" />
                        </Pressable>
                    ) : (
                        <View className="rounded-md h-[50] w-full border border-input bg-white px-4 flex-row items-center">
                            <Text>{selectedSubclass?.name ?? "—"}</Text>
                        </View>
                    )}
                </View>

                <View className="mt-4">
                    <Text className="mb-2">Tag</Text>
                    {editMode ? (
                        <Pressable
                            disabled={!tags || isSubmitting}
                            onPress={() => setTagPickerOpen(true)}
                            className="rounded-md h-[50] w-full border border-input bg-white px-4 flex-row items-center justify-between"
                        >
                            <Text className={cn(!selectedTag && "text-muted-foreground")}>
                                {selectedTag?.name.toUpperCase() ?? "Select a tag"}
                            </Text>
                            <ChevronDown size={18} color="#8C8983" />
                        </Pressable>
                    ) : (
                        <View className="rounded-md h-[50] w-full border border-input bg-white px-4 flex-row items-center justify-between">
                            <Text>{selectedTag?.name.toUpperCase() ?? "—"}</Text>
                            {selectedTag && <Circle color={selectedTag.color} fill={selectedTag.color} />}
                        </View>
                    )}
                </View>

                <View className="mt-4">
                    <Text className="mb-2">Date</Text>
                    {editMode ? (
                        Platform.OS === "ios" ? (
                            <DateTimePicker
                                disabled={isSubmitting}
                                value={date}
                                mode="datetime"
                                display="compact"
                                onValueChange={(_event, selectedDate) => selectedDate && setDate(selectedDate)}
                            />
                        ) : (
                            <Pressable
                                disabled={isSubmitting}
                                onPress={openAndroidDateTimePicker}
                                className="rounded-md h-[50] w-full border border-input bg-white px-4 flex-row items-center justify-between"
                            >
                                <Text>{formatDateTime(date)}</Text>
                                <ChevronDown size={18} color="#8C8983" />
                            </Pressable>
                        )
                    ) : (
                        <View className="rounded-md h-[50] w-full border border-input bg-white px-4 flex-row items-center">
                            <Text>{formatDateTime(date)}</Text>
                        </View>
                    )}
                </View>



                <View className="mt-4">
                    <Text className="mb-2">Description</Text>
                    {editMode ? (
                        <Input
                            readOnly={isSubmitting}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className="rounded-md h-[100] w-full border border-input bg-white px-4 py-3"
                        />
                    ) : (
                        <View className="rounded-md h-[100] w-full border border-input bg-white px-4 py-3">
                            <Text className={cn(!description && "text-muted-foreground")}>
                                {description || "No description"}
                            </Text>
                        </View>
                    )}
                </View>

                {editMode && (
                    <View className="flex-row gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-md"
                            disabled={isSubmitting}
                            onPress={() => {
                                resetFormFields();
                                setEditMode(false);
                            }}
                        >
                            <Text>Cancel</Text>
                        </Button>
                        <Button
                            disabled={
                                !selectedCategory
                                || !selectedSubclass
                                || !selectedTag
                                || isSubmitting
                            }
                            loading={isSubmitting}
                            onPress={() => handleSubmit()}
                            variant="primary" className="flex-1 rounded-md">
                            <Text>Save</Text>
                        </Button>
                    </View>
                )}
            </KeyboardAwareScrollView>

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
                        <Text className="text-lg font-semibold px-5 py-4">Select a category</Text>
                        <FlatList
                            data={classes ?? []}
                            keyExtractor={(item) => item._id}
                            ItemSeparatorComponent={() => <View className="h-px bg-border" />}
                            ListEmptyComponent={
                                <Text className="px-5 py-4 text-muted-foreground">No categories yet.</Text>
                            }
                            renderItem={({item}) => (
                                <Pressable
                                    onPress={() => {
                                        setCategoryId(item._id);
                                        setCategoryPickerOpen(false);
                                    }}
                                    className="px-5 py-4"
                                >
                                    <Text className={cn(item._id === categoryId && "text-accent font-semibold")}>
                                        {item.title}
                                    </Text>
                                </Pressable>
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                visible={subclassPickerOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setSubclassPickerOpen(false)}
            >
                <Pressable
                    className="flex-1 bg-black/40 justify-end"
                    onPress={() => setSubclassPickerOpen(false)}
                >
                    {/* No-op onPress so taps inside the sheet don't fall through to the backdrop above and close it */}
                    <Pressable onPress={() => {}} className="bg-background rounded-t-xl max-h-[70%] pb-6">
                        <Text className="text-lg font-semibold px-5 py-4">Select a subclass</Text>
                        <FlatList
                            data={subclasses ?? []}
                            keyExtractor={(item) => item._id}
                            ItemSeparatorComponent={() => <View className="h-px bg-border" />}
                            ListEmptyComponent={
                                <Text className="px-5 py-4 text-muted-foreground">No categories yet.</Text>
                            }
                            renderItem={({item}) => (
                                <Pressable
                                    onPress={() => {
                                        setSubclassId(item._id);
                                        setSubclassPickerOpen(false);
                                    }}
                                    className="px-5 py-4"
                                >
                                    <Text className={cn(item._id === subclassId && "text-accent font-semibold")}>
                                        {item.name}
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
                        <Text className="text-lg font-semibold px-5 py-4">Select a tag</Text>
                        <FlatList
                            data={tags ?? []}
                            keyExtractor={(item) => item._id}
                            ItemSeparatorComponent={() => <View className="h-px bg-border" />}
                            ListEmptyComponent={
                                <Text className="px-5 py-4 text-muted-foreground">No categories yet.</Text>
                            }
                            renderItem={({item}) => (
                                <Pressable
                                    onPress={() => {
                                        setTagId(item._id);
                                        setTagPickerOpen(false);
                                    }}
                                    className="px-5 py-4"
                                >
                                    <View className="flex-row justify-between">
                                        <Text className={cn(item._id === tagId && "text-accent font-semibold")}>
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
        </SafeAreaView>
    )
}
