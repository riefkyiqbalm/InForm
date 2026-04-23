#!/usr/bin/env node

/**
 * Database Reset & Seed Script
 * 
 * This script deletes all data from the database and then re-seeds it with test data.
 * Use this for development to reset and initialize the database with sample data.
 * 
 * Run: npm run db:reset:seed
 */

import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcrypt'

async function main() {
  try {
    console.log('🔄 Starting database reset and seed...')
    console.log('⚠️  This will DELETE ALL DATA and re-populate with test data\n')

    // ===== RESET PHASE =====
    console.log('📁 RESET PHASE')
    console.log('─'.repeat(50))

    console.log('🗑️  Deleting messages...')
    await prisma.message.deleteMany({})
    console.log('✓ Messages deleted')

    console.log('🗑️  Deleting chat sessions...')
    await prisma.chatSession.deleteMany({})
    console.log('✓ Chat sessions deleted')

    console.log('🗑️  Deleting users...')
    await prisma.user.deleteMany({})
    console.log('✓ Users deleted\n')

    // ===== SEED PHASE =====
    console.log('📁 SEED PHASE')
    console.log('─'.repeat(50))

    // Create test users
    console.log('👤 Creating test users...')
    const hashedPassword1 = await bcrypt.hash('password123', 10)
    const hashedPassword2 = await bcrypt.hash('password456', 10)

    const user1 = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword1,
        contact: '08123456789',
        institution: 'Test University',
        role: 'Student'
      }
    })
    console.log(`✓ Created user: ${user1.username} (${user1.email})`)

    const user2 = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword2,
        contact: '08987654321',
        institution: 'Admin Institution',
        role: 'Admin'
      }
    })
    console.log(`✓ Created user: ${user2.username} (${user2.email})\n`)

    // Create chat sessions for test user
    console.log('💬 Creating chat sessions...')
    const session1 = await prisma.chatSession.create({
      data: {
        userId: user1.id,
        title: 'Welcome Chat'
      }
    })
    console.log(`✓ Created session: ${session1.title}`)

    const session2 = await prisma.chatSession.create({
      data: {
        userId: user1.id,
        title: 'Machine Learning Discussion'
      }
    })
    console.log(`✓ Created session: ${session2.title}\n`)

    // Create sample messages
    console.log('💭 Creating sample messages...')
    await prisma.message.create({
      data: {
        sessionId: session1.id,
        text: 'Hello! How can I help you today?',
        role: 'assistant'
      }
    })

    await prisma.message.create({
      data: {
        sessionId: session1.id,
        text: 'I need help with machine learning algorithms',
        role: 'user'
      }
    })

    await prisma.message.create({
      data: {
        sessionId: session2.id,
        text: 'What is the difference between supervised and unsupervised learning?',
        role: 'user'
      }
    })

    await prisma.message.create({
      data: {
        sessionId: session2.id,
        text: 'Supervised learning uses labeled data while unsupervised learning finds patterns in unlabeled data.',
        role: 'assistant'
      }
    })
    console.log('✓ Created sample messages\n')

    // Display statistics
    const userCount = await prisma.user.count()
    const sessionCount = await prisma.chatSession.count()
    const messageCount = await prisma.message.count()

    console.log('✨ Database reset and seed complete!')
    console.log('\n📊 Database Statistics:')
    console.log(`   Total Users: ${userCount}`)
    console.log(`   Total Chat Sessions: ${sessionCount}`)
    console.log(`   Total Messages: ${messageCount}`)

    console.log('\n🔐 Test Credentials:')
    console.log(`   User 1 - Username: testuser | Password: password123`)
    console.log(`   User 2 - Username: admin | Password: password456`)

  } catch (error) {
    console.error('❌ Error resetting and seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
