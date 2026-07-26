import {SafeAreaView} from "react-native-safe-area-context";
import {api} from "@/convex/_generated/api";
import {TabHeader} from "@/components/TabHeader";
import {useAuth, useUser} from "@clerk/expo";
import {View, Image, Pressable, Text, Alert, FlatList, Modal} from "react-native";
import {Circle, EditIcon, LogOut} from "lucide-react-native";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {useQuery} from "convex/react";
import {TagEdit} from "@/components/Tags/tagEdit";

export default function Settings() {
    const {user} = useUser();
    const [editVisible, setEditVisible] = useState(false);
    const {signOut} = useAuth();
    const tags = useQuery(api.tags.list);
    const [result, setResult] = useState<{
        label: string,
        message: string
    } | null>(null)

    useEffect(() => {
        if (result !== null) {
            Alert.alert(
                result.label,
                result.message,
                [
                    {
                        text: 'Ok',
                        onPress: () => setResult(null),
                        style: 'default',
                    },
                ]
            );
        }
    }, [result]);

    const handleSignOut = () => {
        Alert.alert("Sign out", "Are you sure you want to sign out?", [
            {text: "Cancel", style: "cancel"},
            {text: "Sign out", style: "destructive", onPress: () => signOut()},
        ]);
    };
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader
                title="Settings"
                right={
                    <Button variant="icon" onPress={handleSignOut}>
                        <LogOut />
                    </Button>
                }
            />
            <View className="px-6 mt-4 gap-6">
                <FlatList
                    ListHeaderComponent={
                    <>
                        <View className="items-center">
                            <Image src={user?.imageUrl} className="rounded-full w-[96] h-[96]"/>
                        </View>

                        <View className="gap-4">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-lg font-bold text-primary">Profile</Text>
                                <Button className="p-0" variant="icon" onPress={() => setEditVisible(true)}>
                                    <EditIcon size={16} color="#22333B"/>
                                </Button>

                            </View>

                            <View className="gap-1">
                                <Text className="text-xs font-semibold text-muted-foreground">First name</Text>
                                <Text className="text-base text-primary">{user?.firstName || "—"}</Text>
                            </View>

                            <View className="gap-1">
                                <Text className="text-xs font-semibold text-muted-foreground">Last name</Text>
                                <Text className="text-base text-primary">{user?.lastName || "—"}</Text>
                            </View>

                            <View className="gap-1">
                                <Text className="text-xs font-semibold text-muted-foreground">Email</Text>
                                <Text className="text-base text-primary">{user?.primaryEmailAddress?.emailAddress}</Text>
                            </View>
                        </View>

                        <View className="gap-4 mt-4">
                            <Text className="text-lg font-bold text-primary">Tags</Text>
                        </View>
                    </>
                    }
                    data={tags}
                    contentContainerClassName="gap-3"

                    keyExtractor={(item) => item._id}
                    renderItem={({item}) => (
                        <TagEdit tag={item} onResult={setResult} />
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
