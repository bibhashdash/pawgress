import {useMutation, useQuery} from "convex/react";
import {useCallback, useState} from "react";
import {FlatList, Pressable, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {api} from "@/convex/_generated/api";
import {TabHeader} from "@/components/TabHeader";
import {Text} from "@/components/ui/text";
import {CornerDownRight, PlusCircle} from 'lucide-react-native'
import {useFocusEffect} from "expo-router/react-navigation";
import {Input} from "@/components/ui/input";
import {Link, router} from "expo-router";
import {isEmptyArray} from "@/lib/utils";

interface BehaviourClass {
    id: string;
    title: string;
    subclasses?: string[];
}

export default function Behaviours() {
    const behaviours = useQuery(api.behaviourClasses.list)
    const createBehaviourClass = useMutation(api.behaviourClasses.create);
    const [showAddClass, setShowAddClass] = useState(false);
    const [classTitle, setClassTitle] = useState<string>("");
    const [classes, setClasses] = useState<BehaviourClass[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    useFocusEffect(
        useCallback(() => {
            behaviours;
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader title="Behaviours"/>
            <View className="my-4 gap-3">

                <FlatList
                    ListHeaderComponent={() => <>
                        <View className="bg-accent px-5 py-2 mb-2">
                            <View className="flex-row justify-between">
                                <Text className="text-lg text-white">Behaviour classes</Text>
                                <Link href={"/(tabs)/behaviourClassAdd"}>
                                    <PlusCircle color="#fff"/>
                                </Link>
                            </View>
                            {
                                showAddClass
                                && <View className="pt-2">
                                    <Input onSubmitEditing={event => {
                                        if (event.nativeEvent.text !== null) {
                                            setClasses(prevState => [...prevState, {
                                                id: Date.now().toString(),
                                                title: event.nativeEvent.text
                                            }])
                                            createBehaviourClass({title: event.nativeEvent.text});
                                        }
                                    }} onChangeText={setClassTitle}
                                           className="border-blue border-1 rounded-md h-[50]" value={classTitle}/>
                                </View>
                            }
                        </View>
                        <Text className="mb-2 px-5">Add, rename, or remove the categories and behaviors you log
                            against. Renaming relabels
                            matching past logs (and re-syncs them); removing keeps the logs but drops the class
                            from the
                            picker.
                        </Text>
                    </>}
                    data={behaviours}
                    contentContainerClassName="gap-3"
                    ListEmptyComponent={
                        <View className="flex-row items-center justify-center">
                            <Text>No behaviours added yet...</Text>
                        </View>
                    }
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    renderItem={
                        ({item}) => (
                                <Pressable
                                    onPress={() => router.navigate({
                                        pathname: "/(tabs)/behaviourClassDetails/[id]",
                                        params: { id: item._id}
                                    })}
                                    className="p-4 border border-white rounded-md bg-white mx-5 flex-row items-center justify-between">
                                    <Text>{item.title}</Text>
                                    {
                                        item.subclasses && !isEmptyArray(item.subclasses)
                                        && <View className="flex-row gap-2">
                                            <CornerDownRight size="18" />
                                            <Text className="font-bold">
                                                {item.subclasses.length}
                                            </Text>
                                        </View>
                                    }
                                </Pressable>
                        )
                    }
                    keyExtractor={(item) => item._id}
                />
            </View>
        </SafeAreaView>
    );
}
