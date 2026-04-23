import "dotenv/config";           // ← Add this (important!)
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  schema: "prisma/schema.prisma",   // ← Recommended to add this

  datasource: {
    url: env("DATABASE_URL"),       // or use process.env.DATABASE_URL
  },
});