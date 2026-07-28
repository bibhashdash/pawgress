import {Alert, FlatList, Modal, Platform, Pressable, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {SafeAreaView} from "react-native-safe-area-context";
import {Text} from "@/components/ui/text";
import {Input} from "@/components/ui/input";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {useCallback, useState} from "react";
import {ChevronDown, Circle} from "lucide-react-native";
import {cn, formatDateTime} from "@/lib/utils";
import type {Id} from "@/convex/_generated/dataModel";
import {useFocusEffect} from "expo-router/react-navigation";
import DateTimePicker, {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import {Button} from "@/components/ui/button";
import {router} from "expo-router";
import Toast from "react-native-toast-message";


export default function LogAdd() {
    const classes = useQuery(api.behaviourClasses.list)
    const tags = useQuery(api.tags.list)
    const addLogEntry = useMutation(api.logEntries.create);

    const [categoryId, setCategoryId] = useState<Id<"behaviourClasses"> | null>(null);
    const subclasses = useQuery(api.subclasses.list, categoryId ? {behaviourClassId: categoryId} : "skip")
    const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

    const [subclassId, setSubclassId] = useState<Id<"subclasses"> | null>(null);
    const [subclassPickerOpen, setSubclassPickerOpen] = useState(false);

    const [tagId, setTagId] = useState<Id<"tags"> | null>(null);
    const [tagPickerOpen, setTagPickerOpen] = useState(false);

    const [description, setDescription] = useState("");

    const [date, setDate] = useState(new Date());

    const [isSubmitting, setIsSubmitting] = useState(false);
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

    useFocusEffect(
        useCallback(() => {
            resetFormFields()
        }, [])
    );

    const resetFormFields = () => {
        setCategoryId(null);
        setSubclassId(null);
        setTagId(null)
        setDate(new Date());
        setDescription("");
    }

    const handleSubmit = () => {
        setIsSubmitting(true)

        if (selectedCategory && selectedTag && selectedSubclass) {
            addLogEntry({
                behaviourClassId: selectedCategory._id,
                subclassId: selectedSubclass._id,
                timestamp: date.getTime(),
                description: description,
                tagId: selectedTag._id,
            }).then(id => {
                Alert.alert(
                    "Success",
                    "Class successfully created",
                    [
                        {
                            text: 'Add another',
                            onPress: () => resetFormFields(),
                            style: 'default',
                        },
                        {
                            text: 'View details',
                            onPress: () => {
                                router.push({ pathname: "/(tabs)/logDetails/[id]", params: { id } });
                            },
                            style: 'cancel'
                        }
                    ]
                );
            }).catch(() => {
                Toast.show({
                    type: "error",
                    text1: "There was an error creating this entry",
                });
            }).finally(() => {
                setIsSubmitting(false)
            })
        }
    }
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["bottom", "left", "right"]}>
            <KeyboardAwareScrollView
                className="px-5 mt-5"
                bottomOffset={20}
                keyboardShouldPersistTaps="handled"
            >
                <View>
                    <Text className="mb-2">Category</Text>
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
                </View>

                <View className="mt-4">
                    <Text className="mb-2">Behaviour</Text>
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
                </View>

                <View className="mt-4">
                    <Text className="mb-2">Tag</Text>
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
                </View>

                <View className="mt-4">
                    <Text className="mb-2">Date</Text>
                    {Platform.OS === "ios" ? (
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
                    )}
                </View>



                <View className="mt-4">
                    <Text className="mb-2">Description</Text>
                    <Input
                        readOnly={isSubmitting}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        className="rounded-md h-[100] w-full border border-input bg-white px-4 py-3"
                    />
                </View>

                <Button
                    disabled={
                        !selectedCategory
                        || !selectedSubclass
                        || !selectedTag
                        || isSubmitting
                    }
                    loading={isSubmitting}
                    onPress={() => handleSubmit()}
                    variant="primary" className="rounded-md mt-4">
                    <Text>Save</Text>
                </Button>
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