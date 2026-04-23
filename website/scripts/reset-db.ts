#!/usr/bin/env node

/**
 * Database Drop & Recreate Script
 * 
 * This script completely drops the database and recreates it with the current schema.
 * Use this when you need to reset everything including the schema migrations.
 * 
 * Run: npm run db:drop
 */

import 'dotenv/config'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  try {
    console.log('⚠️  WARNING: This will completely DROP the database and recreate it!')
    console.log('🔄 This will delete all data and reset the schema\n')

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set')
      process.exit(1)
    }

    console.log('📁 Running Prisma migrate reset...')
    console.log('─'.repeat(50))

    // Use Prisma's built-in migrate reset
    // This command:
    // 1. Drops the database
    // 2. Creates a new database
    // 3. Applies all migrations
    try {
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
      console.log('\n✨ Database successfully dropped and recreated!')
      console.log('📊 Schema has been applied from migrations')
    } catch (error) {
      throw new Error('Failed to run prisma migrate reset')
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()

