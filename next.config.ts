import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {},
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aphtmswzpfkbjgskwxsw.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaHRtc3d6cGZrYmpnc2t3eHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNDM2ODQsImV4cCI6MjA1MzcxOTY4NH0.eyjpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaHRtc3d6cGZrYmpnc2t3eHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNDM2ODQsImV4cCI6MjA1MzcxOTY4NH0',
  },
};

export default nextConfig;
