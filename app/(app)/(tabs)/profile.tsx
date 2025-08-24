import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { Tabs } from "expo-router";
import { LogOutIcon } from "lucide-nativewind";
import { SafeAreaView, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center gap-4 p-4">
      <Tabs.Screen
        options={{
          header: () => {
            return (
              <SafeAreaView>
                <View className="flex-row items-center gap-2 pt-2 px-4 pl-6">
                  <Text className="text-2xl font-semibold flex-1">Profile</Text>
                  <Button variant="destructive" onPress={() => supabase.auth.signOut()}>
                    <Text>Log out</Text>
                    <LogOutIcon size={16} className="text-primary" />
                  </Button>
                </View>
              </SafeAreaView>
            );
          },
        }}
      />
    </View>
  );
}
