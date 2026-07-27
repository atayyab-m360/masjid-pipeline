import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rmsqpddfclqxtymmluzn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtc3FwZGRmY2xxeHR5bW1sdXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTUzNjksImV4cCI6MjA5Njg3MTM2OX0.sQZ39At5pEGM2oWzDqwM9T0mUtlOkIKAFlKSZkGbU_8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
