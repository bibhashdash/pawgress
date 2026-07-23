import {useLocalSearchParams} from "expo-router/build/hooks";
import {SafeAreaView} from "react-native-safe-area-context";
import {FlatList, Text, View} from "react-native";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import type {Id} from "@/convex/_generated/dataModel";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {CheckIcon, Trash2Icon, X} from "lucide-react-native";
import {SubclassEdit} from "@/components/BehaviourClass/subclassEdit";
import {useEffect, useState} from "react";

export default function BehaviourClassDetails() {
    const {id} = useLocalSearchParams<{ id: string }>()
    const behaviour = useQuery(api.behaviourClasses.get, {id: id as Id<"behaviourClasses">})
    const updateBehaviourClass = useMutation(api.behaviourClasses.update)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<boolean>(false)
    const [title, setTitle] = useState<string>(behaviour?.title ?? "")
    const [editMode, setEditMode] = useState<boolean>(false)

    useEffect(() => {
        setTitle(behaviour?.title ?? "")
    }, [behaviour?.title]);

    if (!behaviour) return null;

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
                                <View className="flex-row items-center">
                                    <Input
                                        className="rounded-md h-[50] flex-1"
                                        onFocus={() => setEditMode(true)}
                                        value={title}
                                        onChangeText={setTitle}
                                    />
                                    <View className="flex-row gap-3">
                                        <Button
                                            disabled={isLoading || !editMode}
                                            onPress={() => {
                                                setIsLoading(true)
                                                updateBehaviourClass({
                                                    id: behaviour._id,
                                                    title: title,
                                                    subclasses: behaviour.subclasses,
                                                }).then(() => {
                                                    //     some sort of success toast
                                                })
                                                    .catch(() => {
                                                        setErrorMessage(true)
                                                    }).finally(() => setIsLoading(false))
                                                setEditMode(false)
                                            }} variant="icon" size="sm" className="p-0">
                                            <CheckIcon color="#16a34a"/>
                                        </Button>

                                        {
                                            editMode
                                                ? <Button
                                                    variant="icon" size="sm" className="p-0"
                                                    onPress={() => {
                                                        setTitle(behaviour.title)
                                                        setEditMode(false)
                                                    }}>
                                                    <X />
                                                </Button>
                                                : <Button onPress={() => {}} variant="icon" size="sm" className="p-0">
                                                    <Trash2Icon/>
                                                </Button>
                                        }
                                    </View>
                                </View>
                            </View>
                        </View>
                    }
                    data={behaviour.subclasses}
                    renderItem={
                        ({ item }) => <SubclassEdit
                            behaviour={behaviour}
                            subclasses={behaviour.subclasses ?? []}
                            subclass={item}
                            onDeletePress={text => {} }
                        />
                    }
                    keyExtractor={(item) => item}
                />
            </View>
        </SafeAreaView>
    )
}