import {useRef, useState} from "react";
import {NativeScrollEvent, NativeSyntheticEvent, ScrollView, useWindowDimensions, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Text} from "@/components/ui/text";
import {Button} from "@/components/ui/button";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {router} from "expo-router";
import Toast from "react-native-toast-message";
import {TagAdd} from "@/components/Tags/tagAdd";
import {BehaviourClassAddForm} from "@/components/BehaviourClass/behaviourClassAddForm";
import {Dog, PawPrint} from "lucide-react-native";

const SLIDE_COUNT = 3;

export default function Onboarding() {
    const {width} = useWindowDimensions();
    const scrollRef = useRef<ScrollView>(null);
    const [index, setIndex] = useState(0);
    const [addCategoryOpen, setAddCategoryOpen] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const completeOnboarding = useMutation(api.settings.completeOnboarding);
    const tags = useQuery(api.tags.list)
    const categories = useQuery(api.behaviourClasses.list)

    const goToSlide = (nextIndex: number) => {
        scrollRef.current?.scrollTo({x: nextIndex * width, animated: true});
        setIndex(nextIndex);
    };

    const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    };

    const handleFinish = () => {
        setIsFinishing(true);
        completeOnboarding({})
            .then(() => router.replace("/(tabs)"))
            .catch(() => {
                Toast.show({type: "error", text1: "There was an error finishing setup"});
                setIsFinishing(false);
            });
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScrollEnd}
            >
                <View style={{width}} className="flex-1 px-6 justify-center items-center gap-3">
                    <Text className="text-2xl font-semibold text-center">Welcome to Pawgress</Text>
                    <Text className="text-base text-muted-foreground text-center">
                        Your best friend's friendly training tracker. Let's get you set up with a few simple steps.
                    </Text>
                </View>

                <View style={{width}} className="flex-1 px-6 pt-16 gap-3">
                    <Text className="text-2xl font-semibold">Tags</Text>
                    <Text className="text-base text-muted-foreground">
                        Tags help us quickly analyse where your furry friend's training is heading. You can add
                        up to 4 tags on the free plan. Go ahead and set one up now - you can always update or add more via the "Settings" tab.
                    </Text>
                    {
                        tags && tags.length > 0
                        ? <View className="items-center mt-4 gap-4">
                                <Dog size={124} color="#EB5E28" />
                                <Text className="text-center">Woof! Great stuff, now for some categories.</Text>
                            </View>

                            : <TagAdd
                                onResult={(result) => Toast.show({type: result.label, text1: result.message})}
                            />
                    }
                </View>

                <View style={{width}} className="flex-1 px-6 pt-16 gap-3">
                    <Text className="text-2xl font-semibold">Behaviour classes</Text>
                    <Text className="text-base text-muted-foreground">
                        Behaviour classes and subclasses are at the core of Pawgress. You can add up to 5 categories and up to 4 subclasses per category on the free plan. Add your first category
                        here — you can always update or add more via the "Behaviours" tab.
                    </Text>
                    {
                        categories && categories.length > 0
                        ? <View className="items-center mt-4 gap-4">
                                <PawPrint size={124} color="#EB5E28" />
                                <Text>Arf! Now we're ready to bark and roll.</Text>
                            </View>
                            : <BehaviourClassAddForm
                                onCreated={() => {
                                    Toast.show({type: "success", text1: "Class successfully created"});
                                }}
                                onError={() => Toast.show({type: "error", text1: "There was an error creating this class"})}
                            />
                    }

                </View>
            </ScrollView>

            <View className="flex-row justify-center items-center gap-2 py-4">
                {Array.from({length: SLIDE_COUNT}, (_, i) => (
                    <View
                        key={i}
                        className="rounded-full"
                        style={{
                            width: i === index ? 20 : 8,
                            height: 8,
                            backgroundColor: i === index ? "#EB5E28" : "#CCC5B9",
                        }}
                    />
                ))}
            </View>

            {(index === 0 || index === 1) && (
                <View className="px-6 pb-6">
                    <Button onPress={() => goToSlide(index + 1)} variant="fun" className="rounded-md">
                        <Text>Next</Text>
                    </Button>
                </View>
            )}
            {
                index === 2 && (
                    <View className="px-6 pb-6">
                        <Button
                            onPress={handleFinish}
                            loading={isFinishing}
                            disabled={isFinishing || (tags?.length === 0 || categories?.length === 0)}
                            variant="fun" className="rounded-md">
                            <Text>Get Started</Text>
                        </Button>
                    </View>
                )
            }
        </SafeAreaView>
    );
}
