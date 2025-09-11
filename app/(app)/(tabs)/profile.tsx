import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Tabs } from "expo-router";
import { LogOutIcon } from "lucide-nativewind";
import { SafeAreaView, View } from "react-native";

export default function ProfileScreen() {
  const { session } = useSession();

  return (
    <View className="flex-1 items-center gap-4 p-4">
      <Tabs.Screen
        options={{
          header: () => {
            return (
              <SafeAreaView>
                <View className="flex-row items-center gap-2 pt-2 px-4 pl-6">
                  <View className="h-10 flex-1 justify-center">
                    <Text className="text-2xl font-semibold">Profile</Text>
                  </View>
                </View>
              </SafeAreaView>
            );
          },
        }}
      />
      <View className="flex-1 h-0 overflow-auto gap-3 w-full">
        {session?.user.is_anonymous ? (
          <View className="p-4 rounded-lg border border-border w-full max-w-md mx-auto">
            <Text className="text-lg font-semibold mb-1">Guest Account</Text>
            <Text className="text-sm text-muted-foreground">
              You are currently using a guest account. Your data may be lost if you clear the app data, uninstall the
              app, or log out.
            </Text>
          </View>
        ) : (
          <View className="p-4 rounded-lg border border-border w-full max-w-md mx-auto">
            <Text className="text-lg font-semibold mb-1">Email</Text>
            <Text className="text-sm text-muted-foreground">{session?.user.email}</Text>
          </View>
        )}
        <Button variant="destructive" onPress={() => supabase.auth.signOut()}>
          <LogOutIcon size={16} className="text-white" />
          <Text>Log out</Text>
        </Button>
      </View>
    </View>
  );
}
