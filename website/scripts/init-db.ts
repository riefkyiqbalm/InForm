#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script initializes the PostgreSQL database with:
 * - User and ChatSession tables
 * - A test user for development
 * 
 * Run: npm run db:init
 */

import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcrypt'

async function main() {
  try {
    console.log('🚀 Starting database initialization...')

    // Check if test user exists
    const existingUser = await prisma.user.findFirst({
      where: { username: 'testuser' }
    })

    if (existingUser) {
      console.log('✅ Test user already exists')
    } else {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10)
      const user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: hashedPassword
        }
      })
      console.log('✅ Created test user:', user.username)
    }

    // Create default chat session for test user if it doesn't exist
    const user = await prisma.user.findFirst({
      where: { username: 'testuser' },
      include: { chatSessions: true }
    })

    if (user && user.chatSessions.length === 0) {
      const session = await prisma.chatSession.create({
        data: {
          userId: user.id,
          title: 'Welcome Chat'
        }
      })
      console.log('✅ Created default chat session:', session.title)
    }

    // Display database statistics
    const userCount = await prisma.user.count()
    const sessionCount = await prisma.chatSession.count()

    console.log('\n📊 Database Statistics:')
    console.log(`   Total Users: ${userCount}`)
    console.log(`   Total Chat Sessions: ${sessionCount}`)

    console.log('\n✨ Database initialization complete!')
    console.log('\n🔐 Test Credentials:')
    console.log(`   Username: testuser`)
    console.log(`   Password: password123`)

  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()