import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nfzryzmnebmvlrjqiyxc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5menJ5em1uZWJtdmxyanFpeXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzA4MzIsImV4cCI6MjA5NDUwNjgzMn0.8Z-rtCuybwOklkgYfbQlCp5H_4hukpGI4TfXUCXEnak";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
