import {Modal, Pressable, View} from "react-native";
import {Text} from "@/components/ui/text";
import {cn} from "@/lib/utils";
import {Circle, CircleDot} from "lucide-react-native";
import {Button} from "@/components/ui/button";
import {useState} from "react";

export const PremiumModal = ({showPremiumModal, setShowPremiumModal, subdeck}: {showPremiumModal: boolean, setShowPremiumModal: (isShowing: boolean) => void, subdeck?: string}) => {
    const [premiumPlan, setPremiumPlan] = useState<string>("annual")

    return (
        <Modal
            visible={showPremiumModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowPremiumModal(false)}
        >
            <Pressable
                className="flex-1 bg-black/40 justify-end"
                onPress={() => setShowPremiumModal(false)}
            >
                {/* No-op onPress so taps inside the sheet don't fall through to the backdrop above and close it */}
                <Pressable onPress={() => {}} className="bg-background rounded-t-xl p-5 pb-12 gap-4">
                    <Text className="text-3xl font-semibold text-center">Go premium</Text>
                    <View>
                        <Text>{subdeck}</Text>
                        <Pressable onPress={() => setPremiumPlan("annual")} className="flex-row gap-3 items-center mt-3">
                            <View className={cn(
                                "flex-row justify-between rounded-md border border-input flex-1 p-4 items-center",
                                premiumPlan === "annual" && "border-2 border-accent"
                            )}>
                                <View className="flex-row items-center gap-4">
                                    {premiumPlan === "annual" ? (
                                        <CircleDot size={24} color="#EB5E28" />
                                    ) : (
                                        <Circle size={24} color="#8C8983" />
                                    )}
                                    <View>
                                        <Text>Annual</Text>
                                        <Text className="text-muted-foreground">$89.99/year</Text>
                                    </View>
                                </View>
                                <View className="rounded-lg border border-accent px-3 py-2 bg-accent">
                                    <Text className="text-white">Save 25%</Text>
                                </View>
                            </View>
                        </Pressable>
                        <Pressable onPress={() => setPremiumPlan("monthly")} className="flex-row gap-3 items-center mt-3">
                            <View className={cn(
                                "flex-row justify-between rounded-md border border-input flex-1 p-4 items-center",
                                premiumPlan === "monthly" && "border-2 border-accent"
                            )}>
                                <View className="flex-row items-center gap-4">
                                    {premiumPlan === "monthly" ? (
                                        <CircleDot size={24} color="#EB5E28" />
                                    ) : (
                                        <Circle size={24} color="#8C8983" />
                                    )}
                                    <View>
                                        <Text>Monthly</Text>
                                        <Text className="text-muted-foreground">$9.99/month</Text>
                                    </View>
                                </View>
                            </View>
                        </Pressable>
                        <Text className="mt-2 mb-2">No commitments, cancel anytime.</Text>

                    </View>

                    <View className="flex-row gap-3">
                        <Button
                            onPress={() => setShowPremiumModal(false)}
                            // disabled={isDeleting}
                            variant="outline" className="flex-1">
                            <Text>Cancel</Text>
                        </Button>
                        <Button
                            // onPress={confirmDeleteLog}
                            // loading={isDeleting}
                            // disabled={isDeleting}
                            variant="fun" className="flex-1">
                            <Text className="text-white">Go premium!</Text>
                        </Button>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}