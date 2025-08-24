import LocationManager from "@/components/location-manager";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <>
      <Stack />
      <LocationManager />
    </>
  );
}
