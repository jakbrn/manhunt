// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    // Create two clients: one for auth with user token, one for database operations with service role
    const userSupabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? "",
        },
      },
    });

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      data: { user },
      error: userError,
    } = await userSupabase.auth.getUser();
    console.log(user);

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          message: "Unauthorized",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 401,
        }
      );
    }

    const { gameCode, name } = await req.json();
    if (!gameCode) {
      return new Response(
        JSON.stringify({
          message: "Game code is required",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 400,
        }
      );
    }

    if (!name) {
      return new Response(
        JSON.stringify({
          message: "Name is required",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 400,
        }
      );
    }

    // Check if game exists using admin client
    const { data: gameData, error: gameError } = await adminSupabase
      .from("games")
      .select("*")
      .eq("code", gameCode)
      .single();

    if (gameError || !gameData) {
      return new Response(
        JSON.stringify({
          message: "Game not found",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 404,
        }
      );
    }

    // Check if user is already in the game using admin client
    const { data: existingPlayer, error: playerCheckError } = await adminSupabase
      .from("players")
      .select("id")
      .eq("game_id", gameData.id)
      .eq("user_id", user.id)
      .single();

    if (playerCheckError && playerCheckError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is what we expect if player doesn't exist
      throw playerCheckError;
    }

    if (existingPlayer) {
      return new Response(
        JSON.stringify({
          message: "User is already in this game",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 409,
        }
      );
    }

    // Add user to the game using admin client
    const { error: insertError } = await adminSupabase.from("players").insert({
      game_id: gameData.id,
      user_id: user.id,
      role: "hunter",
      name: name,
    });

    if (insertError) {
      return new Response(
        JSON.stringify({
          message: insertError.message,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Successfully joined the game",
        game: gameData,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: err instanceof Error ? err.message : String(err),
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/join-game' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"gameId": 1}'

*/
