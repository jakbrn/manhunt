import { Tables } from "@/database.types";
import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function usePlayers(gameId: number) {
  const queryClient = useQueryClient();
  const { session } = useSession();

  useEffect(() => {
    if (!session) return;

    const channel = supabase.channel(`games:${gameId}:players`);

    channel
      .on("broadcast", { event: "update" }, () => {
        queryClient.invalidateQueries({ queryKey: ["players", gameId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, gameId]);

  return useQuery({
    queryKey: ["players", gameId],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data } = await supabase.from("players").select("*").eq("game_id", gameId);
      return data || [];
    },
  });
}

export function useOwnPlayers() {
  const { session } = useSession();

  return useQuery({
    queryKey: ["players"],
    staleTime: 1000 * 60 * 5,
    enabled: !!session,
    queryFn: async () => {
      const { data } = await supabase.from("players").select("*").eq("user_id", session!.user.id);
      return data || [];
    },
  });
}

export function useSwapPlayerRole() {
  const queryClient = useQueryClient();

  return useMutation<Tables<"players">, unknown, { id: number; role: Tables<"players">["role"] }>({
    mutationFn: async (data) => {
      const { data: player, error } = await supabase
        .from("players")
        .update({ role: data.role })
        .eq("id", data.id)
        .select()
        .single();
      if (error) {
        throw new Error("Failed to update player role");
      }
      return player;
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["players", data.game_id] }),
        await supabase
          .channel(`games:${data.game_id}:players`)
          .send({ type: "broadcast", event: "update", payload: {} }),
      ]);
    },
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();

  return useMutation<Tables<"players">, unknown, { id: number }>({
    mutationFn: async ({ id }) => {
      const { data, error } = await supabase.from("players").delete().eq("id", id).select().single();
      if (error) {
        throw new Error("Failed to delete player");
      }
      return data;
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["players", data.game_id] }),
        await supabase
          .channel(`games:${data.game_id}:players`)
          .send({ type: "broadcast", event: "update", payload: {} }),
      ]);
    },
  });
}
