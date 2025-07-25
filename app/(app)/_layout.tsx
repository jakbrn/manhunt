import { Stack } from "expo-router";
import { useSession } from "~/lib/auth-context";

export default function AppLayout() {
  const { session } = useSession();

  return <Stack></Stack>;
}
