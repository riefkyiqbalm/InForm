#!/usr/bin/env node

/**
 * Database Clear Data Script
 * 
 * This script deletes all data from the database while preserving the schema.
 * Use this for development to start with a clean database (keeps schema intact).
 * 
 * Run: npm run db:clear
 */

import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function main() {
  try {
    console.log('🔄 Starting database data clear...')
    console.log('⚠️  This will DELETE ALL DATA from the database (schema preserved)')

    // Delete in correct order to respect foreign key constraints
    // Since Message -> ChatSession and ChatSession -> User have onDelete: Cascade,
    // we need to delete in reverse order of dependencies

    console.log('🗑️  Deleting messages...')
    await prisma.message.deleteMany({})
    const messageCount = await prisma.message.count()
    console.log(`✓ Messages deleted (${messageCount} remaining)`)

    console.log('🗑️  Deleting chat sessions...')
    await prisma.chatSession.deleteMany({})
    const sessionCount = await prisma.chatSession.count()
    console.log(`✓ Chat sessions deleted (${sessionCount} remaining)`)

    console.log('🗑️  Deleting users...')
    await prisma.user.deleteMany({})
    const userCount = await prisma.user.count()
    console.log(`✓ Users deleted (${userCount} remaining)`)

    console.log('\n✨ Database cleared successfully!')
    console.log('📊 Database Statistics:')
    console.log(`   Total Users: ${userCount}`)
    console.log(`   Total Chat Sessions: ${sessionCount}`)
    console.log(`   Total Messages: ${messageCount}`)

  } catch (error) {
    console.error('❌ Error clearing database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
