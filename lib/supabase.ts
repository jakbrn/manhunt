import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { AppState, Platform } from 'react-native';
import "react-native-url-polyfill/auto";
import { Database } from "../database.types";

const supabaseUrl = "https://nqpmxxwrrqwwefcatlur.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcG14eHdycnF3d2VmY2F0bHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTcwODYsImV4cCI6MjA2ODgzMzA4Nn0.7xNYdSQsLFPZMjYdmK9TSYV_kYqTiBDCbhN7OrJH3UU";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

if (Platform.OS !== "web") {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}