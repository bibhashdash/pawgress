import {FlatList, View, TextInput, Alert} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useCallback, useEffect, useRef, useState} from "react";
import {Text} from "@/components/ui/text";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {CheckIcon, CirclePlus, Trash2Icon, X} from "lucide-react-native";
import {isStringBlank} from "@/lib/utils";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {router} from "expo-router";
import {useFocusEffect} from "expo-router/react-navigation";

// Local-only row: no api calls here — save/delete just update the parent's
// in-memory subClasses array. The real create mutation only fires once,
// from the screen's own Save button.
function LocalSubclassRow({subclass, onSave, onDelete}: {
    subclass: string,
    onSave: (newName: string) => void,
    onDelete: () => void,
}) {
    const [editMode, setEditMode] = useState<boolean>(false)
    const [deleteMode, setDeleteMode] = useState<boolean>(false)
    const [newSubclassName, setNewSubclassName] = useState<string>(subclass)
    const inputRef = useRef<TextInput>(null)

    useEffect(() => {
        setNewSubclassName(subclass)
    }, [subclass]);

    const saveSubclass = () => {
        onSave(newSubclassName)
        setEditMode(false)
    }

    const deleteSubclass = () => {
        onDelete()
        setDeleteMode(false)
    }

    return (
        <View className="gap-2">
            <View className="flex-row gap-3 items-center">
                <View className="flex-1 ml-20">
                    <Input
                        ref={inputRef}
                        onFocus={() => {
                            if (!deleteMode) setEditMode(true)
                        }}
                        className="rounded-md h-[50] w-full border border-input bg-white"
                        value={newSubclassName}
                        onChangeText={setNewSubclassName}
                        onSubmitEditing={() => saveSubclass()}
                    />
                </View>
                <View className="flex-row gap-3">
                    <Button
                        disabled={!editMode}
                        onPress={() => saveSubclass()} variant="icon" size="sm" className="p-0">
                        <CheckIcon color="#16a34a"/>
                    </Button>

                    {
                        (editMode || deleteMode)
                            ? <Button
                                variant="icon" size="sm" className="p-0"
                                onPress={() => {
                                    if (editMode) {
                                        setNewSubclassName(subclass)
                                        setEditMode(false)
                                    } else if (deleteMode) {
                                        setDeleteMode(false)
                                    }
                                }}>
                                <X/>
                            </Button>
                            : <Button onPress={() => setDeleteMode(true)} variant="icon" size="sm" className="p-0">
                                <Trash2Icon/>
                            </Button>
                    }
                </View>
            </View>
            {
                deleteMode
                && <View className="items-end gap-2">
                    <Text>Remove subclass?</Text>
                    <View className="flex-row gap-2">
                        <Button onPress={() => setDeleteMode(false)} variant="outline">
                            <Text>Cancel</Text>
                        </Button>
                        <Button onPress={() => deleteSubclass()} variant="destructive">
                            <Text className="text-white">Confirm</Text>
                        </Button>
                    </View>
                </View>
            }
        </View>
    )
}

export default function BehaviourClassAdd () {
    const [title, setTitle] = useState<string>("");
    const [subClass, setSubClass] = useState<string>("");
    const [subClasses, setSubClasses] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const createBehaviourClass = useMutation(api.behaviourClasses.create);
    const createSubclass = useMutation(api.subclasses.create);

    const resetFormFields = () => {
        setTitle("");
        setSubClass("");
        setSubClasses([]);
        setIsLoading(false);
    }

    useFocusEffect(
        useCallback(() => {
            setTitle("");
            setSubClass("");
            setSubClasses([]);
            setIsLoading(false);
        }, [])
    );

    const handleSubmit = () => {
        setIsLoading(true);
        createBehaviourClass({ title })
            .then(async (id) => {
                await Promise.all(subClasses.map(name => createSubclass({ behaviourClassId: id, name })));
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
                                router.push({ pathname: "/(tabs)/behaviourClassDetails/[id]", params: { id } });
                            },
                            style: 'cancel'
                        }
                    ]
                );
            })
            .catch(
                err => {
                    Alert.alert(
                        "Error",
                        "There was an error creating this class",
                        [
                            {
                                text: 'Ok',
                                style: 'cancel',
                            }
                        ]
                    );
                }
            ).finally(() => setIsLoading(false))
    }
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["bottom", "left", "right"]}>

            <View className="px-5 mt-5">

                <FlatList
                    contentContainerClassName="gap-2"
                    ListHeaderComponent={
                        <>
                            <Text className="mb-2">Add a category and behaviors you log against.
                            </Text>

                            <View className="mt-5">
                                <Text className="mb-2">Name</Text>
                                <Input className="rounded-md h-[50]" value={title} onChangeText={setTitle} />
                            </View>
                            <View className="mt-3 pl-20">
                                <View className="flex-row items-center gap-2">
                                    <Input
                                        onSubmitEditing={e => {
                                            setSubClasses(prevState => [...prevState, subClass])
                                            setSubClass("")
                                        }} placeholder="Add a subclass" className="flex-1 rounded-md h-[50]" value={subClass} onChangeText={setSubClass} />
                                    <Button onPress={() => {
                                        setSubClasses(prevState => [...prevState, subClass])
                                        setSubClass("")
                                    }} className="p-0 px-1" variant="icon" disabled={isStringBlank(subClass)}>
                                        <CirclePlus />
                                    </Button>
                                    <Button
                                        disabled={subClass === ""}
                                        variant="icon" size="sm" className="p-0"
                                        onPress={() => setSubClass("")}>
                                        <X />
                                    </Button>
                                </View>
                            </View>
                        </>
                    }
                    ListFooterComponent={
                        <>
                            <View className="mt-5">
                                <Button
                                    disabled={isStringBlank(title)}
                                    onPress={() => handleSubmit()}
                                    variant="primary" className="rounded-md">
                                    <Text>Save</Text>
                                </Button>
                            </View>
                        </>
                    }
                    data={ subClasses }
                    renderItem={
                        ({ item, index }) => (
                            <LocalSubclassRow
                                subclass={item}
                                onSave={newName => setSubClasses(prev => prev.toSpliced(index, 1, newName))}
                                onDelete={() => setSubClasses(prev => prev.toSpliced(index, 1))}
                            />
                        )
                    }
                    keyExtractor={(_, index) => index.toString()}
                />
            </View>
        </SafeAreaView>
    )
}
