import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useMyPlayers() {
  const queryClient = useQueryClient();
  const { session } = useSession();

  function invalidatePlayers() {
    queryClient.invalidateQueries({ queryKey: ["players", session?.user.id] });
  }

  useEffect(() => {
    if (!session) return;

    const channelName = `my-players-${session.user.id}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "players" }, () => invalidatePlayers());
    channel.on("postgres_changes", { event: "DELETE", schema: "public", table: "players" }, () => invalidatePlayers());
    channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "players" }, () => invalidatePlayers());

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return useQuery({
    queryKey: ["players", session?.user.id],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      if (!session) return [];
      const { data } = await supabase.from("players").select("*").eq("user_id", session.user.id);
      return data || [];
    },
  });
}
