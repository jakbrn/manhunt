import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import { Database } from "../database.types";

const supabaseUrl = "https://nqpmxxwrrqwwefcatlur.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcG14eHdycnF3d2VmY2F0bHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTcwODYsImV4cCI6MjA2ODgzMzA4Nn0.7xNYdSQsLFPZMjYdmK9TSYV_kYqTiBDCbhN7OrJH3UU";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
