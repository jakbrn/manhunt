import LocationManager from "@/components/location-manager";
import { Stack, Tabs } from "expo-router";
import { GamepadIcon, UserIcon } from "lucide-nativewind";

export default function TabsLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: "Games",
            tabBarIcon: ({ focused }) => (
              <GamepadIcon size={24} className={focused ? "text-foreground" : "text-muted-foreground"} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <UserIcon size={24} className={focused ? "text-foreground" : "text-muted-foreground"} />
            ),
          }}
        />
      </Tabs>
      <LocationManager />
    </>
  );
}
