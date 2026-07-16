import {useAuth} from "@clerk/expo";
import {useMutation, useQuery} from "convex/react";
import {useCallback, useEffect, useState} from "react";
import {FlatList, Pressable, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {api} from "@/convex/_generated/api";
import {TabHeader} from "@/components/TabHeader";
import {Button} from "@/components/ui/button";
import {Text} from "@/components/ui/text";
import {PlusCircle, X} from 'lucide-react-native'
import {useFocusEffect} from "expo-router/react-navigation";
import {Input} from "@/components/ui/input";
import {Link} from "expo-router";

interface BehaviourClass {
    id: string;
    title: string;
    subclasses?: string[];
}

export default function Settings() {
    const {signOut} = useAuth();
    const settings = useQuery(api.settings.get);
    const ensureSettings = useMutation(api.settings.ensure);
    const createBehaviourClass = useMutation(api.behaviourClasses.create);
    const [showAddClass, setShowAddClass] = useState(false);
    const [classTitle, setClassTitle] = useState<string>("");
    const [classes, setClasses] = useState<BehaviourClass[]>([]);
    useEffect(() => {
        if (settings === null) {
            ensureSettings();
        }
    }, [settings, ensureSettings]);

    useFocusEffect(
        useCallback(() => {
            setShowAddClass(false);
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader title="Settings"/>
            <View className="flex-1 justify-between pb-6">
                <View>
                    <View className="my-4 gap-3">

                        <FlatList
                            ListHeaderComponent={() => <>
                                <View className={`bg-accent px-5 py-2 mb-2 ${showAddClass ? "h-[100]" : ""}`}>
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
                            data={classes}
                            contentContainerClassName="gap-3"
                            ListEmptyComponent={
                                <View className="flex-row items-center justify-center">
                                    <Text>No classes added yet...</Text>
                                </View>
                            }
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            renderItem={
                                ({item}) => (
                                    <Pressable className="p-4 border-2 rounded-md border-gray-400">
                                        <Text>{item.title}</Text>
                                        {
                                            item.subclasses && item.subclasses.length > 0
                                                ? <View></View>
                                                : <Pressable></Pressable>
                                        }
                                    </Pressable>
                                )
                            }
                            keyExtractor={(item) => item.id}
                        />
                    </View>
                </View>
                <Button variant="outline" onPress={() => signOut()}>
                    <Text>Sign out</Text>
                </Button>
            </View>
        </SafeAreaView>
    );
}
