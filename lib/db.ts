import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.warn('[db] DATABASE_URL not set')
}

const pool = new pg.Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
export default prisma
