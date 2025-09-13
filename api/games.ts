import { Tables } from "@/database.types";
import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useGames() {
  const queryClient = useQueryClient();
  const { session } = useSession();

  useEffect(() => {
    if (!session) return;

    const channel = supabase.channel("games");

    channel
      .on("broadcast", { event: "update" }, () => {
        console.log("Games updated, invalidating cache");
        queryClient.invalidateQueries({ queryKey: ["games"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return useQuery({
    queryKey: ["games"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data } = await supabase.from("games").select("*");
      return data || [];
    },
  });
}

export function useGame(gameId: number) {
  const queryClient = useQueryClient();
  const { session } = useSession();

  useEffect(() => {
    if (!session) return;

    const channel = supabase.channel(`games`);

    channel
      .on("broadcast", { event: "update" }, (payload) => {
        if (payload.payload.id !== gameId) return;
        queryClient.invalidateQueries({ queryKey: ["games", gameId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, gameId]);

  return useQuery({
    queryKey: ["games", gameId],
    queryFn: async () => {
      const { data } = await supabase.from("games").select("*").eq("id", gameId).single();
      return data || null;
    },
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation<Tables<"games">, unknown, { name: string; code: string }>({
    mutationFn: async (data) => {
      const { data: game, error } = await supabase.from("games").insert(data).select().single();
      if (error) {
        throw new Error("Failed to create game");
      }
      return game;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number>({
    mutationFn: async (gameId) => {
      const { error } = await supabase.from("games").delete().eq("id", gameId);
      if (error) {
        throw new Error("Failed to delete game");
      }
    },
    onSuccess: async (_, gameId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["games"] }),
        queryClient.invalidateQueries({ queryKey: ["players", gameId] }),
        supabase.channel(`games`).send({ type: "broadcast", event: "update", payload: {} }),
        supabase.channel(`games:${gameId}:players`).send({ type: "broadcast", event: "update", payload: {} }),
      ]);
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();

  return useMutation<Tables<"games">, unknown, { id: number } & Partial<Tables<"games">>>({
    mutationFn: async (data) => {
      const { data: game, error } = await supabase.from("games").update(data).eq("id", data.id).select().single();
      if (error) {
        throw new Error("Failed to update game");
      }
      return game;
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["games"] }),
        supabase.channel(`games`).send({ type: "broadcast", event: "update", payload: { id: data.id } }),
      ]);
    },
  });
}

export function useJoinGame() {
  const queryClient = useQueryClient();

  return useMutation<Tables<"games">, unknown, { name: string; code: string }>({
    mutationFn: async (data) => {
      const { data: action, error } = await supabase.functions.invoke("join-game", {
        body: { gameCode: data.code, name: data.name },
      });
      if (error) {
        throw new Error("Failed to join game");
      }
      return action.game;
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["games"] }),
        queryClient.invalidateQueries({ queryKey: ["players"] }),
        supabase.channel(`games:${data.id}:players`).send({ type: "broadcast", event: "update", payload: {} }),
      ]);
    },
  });
}

export function useLeaveGame() {
  const queryClient = useQueryClient();
  const { session } = useSession();

  return useMutation<void, unknown, number>({
    mutationFn: async (gameId) => {
      if (!session) throw new Error("No active session");
      const { error } = await supabase.from("players").delete().eq("user_id", session.user.id).eq("game_id", gameId);
      if (error) {
        throw new Error("Failed to leave game");
      }
    },
    onSuccess: async (_, gameId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["games"] }),
        queryClient.invalidateQueries({ queryKey: ["players"] }),
        supabase.channel(`games:${gameId}:players`).send({ type: "broadcast", event: "update", payload: {} }),
      ]);
    },
  });
}
