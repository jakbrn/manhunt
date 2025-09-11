import { Database } from "@/database.types";
import { Badge } from "../ui/badge";
import { Text } from "../ui/text";

export default function RoleBadge({
  role,
}: {
  role: Database["public"]["Enums"]["role"];
}) {
  return role === "hunter" ? (
    <Badge className="bg-red-500">
      <Text className="text-white">Hunter</Text>
    </Badge>
  ) : (
    <Badge className="bg-green-500">
      <Text className="text-white">Runner</Text>
    </Badge>
  );
}
