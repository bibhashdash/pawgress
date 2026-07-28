import {useQuery} from "convex/react";
import {useCallback} from "react";
import {FlatList, Pressable, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {api} from "@/convex/_generated/api";
import {TabHeader} from "@/components/TabHeader";
import {Text} from "@/components/ui/text";
import {CornerDownRight, PlusCircle} from 'lucide-react-native'
import {useFocusEffect} from "expo-router/react-navigation";
import {Link, router} from "expo-router";

export default function Behaviours() {
    const behaviours = useQuery(api.behaviourClasses.list)

    useFocusEffect(
        useCallback(() => {
            behaviours;
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader
                title="Behaviours"
                right={<Link href={"/(tabs)/behaviourClassAdd"}>
                    <PlusCircle color="#EB5E28"/>
                </Link>}
            />
            <View className="my-4 gap-3">

                <FlatList
                    ListHeaderComponent={() => <>
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
                                    className="p-4 border border-input rounded-md bg-white mx-5 flex-row items-center justify-between">
                                    <Text>{item.title}</Text>
                                    {
                                        (item.subclassCount ?? 0) > 0
                                        && <View className="flex-row gap-2">
                                            <CornerDownRight size="18" />
                                            <Text className="font-bold text-sm">
                                                {item.subclassCount}
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
