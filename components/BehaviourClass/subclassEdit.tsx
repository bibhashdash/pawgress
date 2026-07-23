import {TextInput, View, Text} from "react-native";
import {useCallback, useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {CheckIcon, Trash2Icon, X} from "lucide-react-native";
import {Input} from "@/components/ui/input";
import {useFocusEffect} from "expo-router/react-navigation";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import type {Id} from "@/convex/_generated/dataModel";

export const SubclassEdit = ({subclass, subclasses, behaviour, onResult}: {
    subclass: string,
    subclasses: string[],
    behaviour: {
        _id: Id<"behaviourClasses">
        _creationTime: number
        subclasses?: string[] | undefined
        ownerId: string
        title: string
    } | null | undefined
    onResult: (result: { label: string, message: string }) => void

}) => {
    const updateBehaviourClass = useMutation(api.behaviourClasses.update)
    const removeBehaviourClass = useMutation(api.behaviourClasses.remove)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)
    const [deleteMode, setDeleteMode] = useState<boolean>(false)
    const [newSubclassName, setNewSubclassName] = useState<string>(subclass)
    const inputRef = useRef<TextInput>(null)

    useFocusEffect(
        useCallback(() => {
            setEditMode(false);
            setNewSubclassName(subclass);
        }, [])
    );

    useEffect(() => {
        setNewSubclassName(subclass)
    }, [subclass]);

    const saveSubclass = () => {
        setIsLoading(true)
        if (subclasses && behaviour && behaviour.subclasses) {
            let newArray;
            const index = behaviour.subclasses.indexOf(subclass)
            if (index > -1) {
                newArray = behaviour.subclasses.toSpliced(index, 1, newSubclassName)
                updateBehaviourClass({
                    id: behaviour._id as Id<"behaviourClasses">,
                    title: behaviour.title,
                    subclasses: newArray && newArray.length > 0 ? newArray : undefined,
                }).then(() => {
                    onResult({
                        label: "Success",
                        message: "Subclass successfully updated"
                    })
                })
                    .catch(() => {
                        onResult({
                            label: "Error",
                            message: "There was an error updating the Subclass"
                        })

                    })
                    .finally(() => {
                    setIsLoading(false)
                    setEditMode(false)
                })
            }
        }
    }

    const deleteSubclass = () => {
        setIsDeleting(true)
        if (subclasses && behaviour && behaviour.subclasses) {
            let newArray;
            const index = behaviour.subclasses.indexOf(subclass)
            if (index > -1) {
                newArray = behaviour.subclasses.toSpliced(index, 1)
                updateBehaviourClass({
                    id: behaviour._id as Id<"behaviourClasses">,
                    title: behaviour.title,
                    subclasses: newArray,
                }).then(() => {
                    onResult({
                        label: "Success",
                        message: "Subclass successfully deleted"
                    })
                })
                    .catch(() => {
                        onResult({
                            label: "Error",
                            message: "There was an error deleting the Subclass"
                        })

                    })
                    .finally(() => {
                        setIsDeleting(false)
                        setDeleteMode(false)
                    })
            }
        }

    }

    return (
        <View className="gap-2">
            <View className="flex-row gap-3 items-center">
                <View
                    className="flex-1 ml-20">
                    <Input
                        ref={inputRef}
                        onFocus={() => {
                            if (!deleteMode) setEditMode(true)
                        }}
                        className={`rounded-md h-[50] w-full border border-input bg-white`}
                        value={newSubclassName} onChangeText={setNewSubclassName}
                        readOnly={isLoading || isDeleting}
                        onSubmitEditing={() => saveSubclass()}
                    />
                </View>
                <View className="flex-row gap-3">
                    <Button
                        loading={isLoading}
                        disabled={isLoading || isDeleting || !editMode}
                        onPress={() => saveSubclass() } variant="icon" size="sm" className="p-0">
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
                && <View className="items-end gap-2">
                    <Text>Remove subclass?</Text>
                    <View className="flex-row gap-2">
                        <Button onPress={() => setDeleteMode(false)} variant="outline">
                            <Text>Cancel</Text>
                        </Button>
                        <Button loading={isDeleting} disabled={isDeleting} onPress={() => deleteSubclass()} variant="destructive">
                            <Text className="text-white">Confirm</Text>
                        </Button>
                    </View>
                </View>
            }
        </View>
    )
}