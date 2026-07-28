import {useLocalSearchParams} from "expo-router/build/hooks";
import {SafeAreaView} from "react-native-safe-area-context";
import {FlatList, View} from "react-native";
import {Text} from "@/components/ui/text";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import type {Id} from "@/convex/_generated/dataModel";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {CheckIcon, CirclePlus, Trash2Icon, X} from "lucide-react-native";
import {SubclassEdit} from "@/components/BehaviourClass/subclassEdit";
import {useCallback, useEffect, useState} from "react";
import {isStringBlank} from "@/lib/utils";
import {useFocusEffect} from "expo-router/react-navigation";
import {router} from "expo-router";
import Toast from 'react-native-toast-message';

export default function BehaviourClassDetails() {
    const {id} = useLocalSearchParams<{ id: string }>()
    const behaviour = useQuery(api.behaviourClasses.get, {id: id as Id<"behaviourClasses">})
    const subclasses = useQuery(api.subclasses.list, behaviour ? {behaviourClassId: behaviour._id} : "skip")
    const updateBehaviourClass = useMutation(api.behaviourClasses.update)
    const removeBehaviourClass = useMutation(api.behaviourClasses.remove)
    const createSubclass = useMutation(api.subclasses.create)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [isAddingNewSubclass, setIsAddingNewSubclass] = useState(false)
    const [title, setTitle] = useState<string>(behaviour?.title ?? "")
    const [editMode, setEditMode] = useState<boolean>(false)
    const [deleteMode, setDeleteMode] = useState<boolean>(false)

    const [newSubclass, setNewSubclass] = useState<string>("")
    const [result, setResult] = useState<{
        label: string,
        message: string
    } | null>(null)

    useEffect(() => {
        setTitle(behaviour?.title ?? "")
    }, [behaviour?.title]);

    useEffect(() => {
        if (result !== null) {
            Toast.show({
                type: result.label,
                text1: result.message,
            })
        }
    }, [result]);
    useFocusEffect(
        useCallback(() => {
            setNewSubclass("")
        }, [])
    );
    if (!behaviour) return null;

    const saveTitle = (): void => {
        setIsLoading(true)
        updateBehaviourClass({
            id: behaviour._id,
            title: title,
        })
            .then(() => {
            setResult({
                label: "success",
                message: "Title successfully updated"
            })
        })
            .catch(() => {
                setResult({
                    label: "error",
                    message: "There was an error updating the title"
                })
            })
            .finally(() => {
            setEditMode(false)
            setIsLoading(false)
        })
    }

    const deleteClass = (): void => {
        setIsDeleting(true)
        removeBehaviourClass({ id: behaviour._id })
            .then(() => {
                router.push("/(tabs)/behaviours")
            })
            .catch(() => {
                setResult({
                    label: "error",
                    message: "There was an error deleting this class"
                })
            })
            .finally(() => {
                setIsDeleting(false)
                setDeleteMode(false)
            })
    }

    const addNewSubclass = (): void => {
        setIsAddingNewSubclass(true)
        createSubclass({
            behaviourClassId: behaviour._id,
            name: newSubclass,
        }).then(
            () => setResult({
                label: "success",
                message: "Subclass successfully added"
            })
        ). catch(
            () => setResult({
                label: "error",
                message: "There was an error adding this Subclass"
            })
        ).finally(() => {
            setIsAddingNewSubclass(false)
            setNewSubclass("")
        })
        setNewSubclass("")
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["bottom", "left", "right"]}>

            <View className="px-5 mt-5">
                <FlatList
                    contentContainerClassName="gap-2"
                    ListHeaderComponent={
                        <View>
                            <Text className="mb-5">Update the category and subclasses you log against. Renaming re-labels
                                matching past logs (and re-syncs them); removing keeps the logs but drops the class from
                                the picker.
                            </Text>
                            <View className="mt-5">
                                <Text className="mb-2">Name</Text>
                                <View className="flex-row items-center gap-3">
                                    <Input
                                        className="rounded-md h-[50] flex-1"
                                        onFocus={() => {
                                            if (!deleteMode) setEditMode(true)
                                        }}
                                        readOnly={isDeleting}
                                        value={title}
                                        onChangeText={setTitle}
                                        onSubmitEditing={ () => saveTitle() }
                                    />
                                    <View className="flex-row gap-3">
                                        <Button
                                            disabled={isLoading || isDeleting || !editMode}
                                            onPress={() => saveTitle() }
                                            variant="icon" size="sm" className="p-0">
                                            <CheckIcon color="#16a34a"/>
                                        </Button>

                                        {
                                            (editMode || deleteMode)
                                                ? <Button
                                                    variant="icon" size="sm" className="p-0"
                                                    onPress={() => {
                                                        if (editMode) {
                                                            setTitle(behaviour.title)
                                                            setEditMode(false)
                                                        } else if (deleteMode) {
                                                            setDeleteMode(false)
                                                        }
                                                    }}>
                                                    <X />
                                                </Button>
                                                : <Button onPress={() => setDeleteMode(true)} variant="icon" size="sm" className="p-0">
                                                    <Trash2Icon/>
                                                </Button>
                                        }
                                    </View>
                                </View>
                                {
                                    deleteMode
                                    && <View className="items-end gap-2 mt-3">
                                        <Text>Remove this behaviour class?</Text>
                                        <View className="flex-row gap-2">
                                            <Button onPress={() => setDeleteMode(false)} variant="outline">
                                                <Text>Cancel</Text>
                                            </Button>
                                            <Button loading={isDeleting} disabled={isDeleting} onPress={() => deleteClass()} variant="destructive">
                                                <Text className="text-white">Confirm</Text>
                                            </Button>
                                        </View>
                                    </View>
                                }
                            </View>
                            <Text className="mb-2 mt-3">Subclasses</Text>
                            <View className="flex-row items-center gap-3">
                                <Input
                                    onSubmitEditing={() => addNewSubclass()} placeholder="Add a subclass" className="flex-1 rounded-md h-[50]" value={newSubclass} onChangeText={setNewSubclass} />
                                <View className="flex-row gap-3 items-center">
                                    <Button loading={isAddingNewSubclass} onPress={() => addNewSubclass()} className="p-0" variant="icon" disabled={isStringBlank(newSubclass)}>
                                        <CirclePlus />
                                    </Button>
                                    <Button
                                        disabled={newSubclass === ""}
                                        variant="icon" size="sm" className="p-0"
                                        onPress={() => {
                                            setNewSubclass("")
                                        }}>
                                        <X />
                                    </Button>
                                </View>
                            </View>
                        </View>
                    }
                    data={subclasses}
                    renderItem={
                        ({ item }) => <SubclassEdit
                            subclass={item}
                            onResult={setResult}
                        />
                    }
                    keyExtractor={(item) => item._id}
                />
            </View>
        </SafeAreaView>
    )
}
