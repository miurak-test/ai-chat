import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock database connection
vi.mock('@/lib/db/connection', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}))

// Mock Conversation model - use inline values (not variables) due to hoisting
vi.mock('@/models/conversation', () => ({
  default: {
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              _id: 'conv1',
              title: 'Test Conversation 1',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-02'),
            },
            {
              _id: 'conv2',
              title: 'Test Conversation 2',
              createdAt: new Date('2024-01-03'),
              updatedAt: new Date('2024-01-04'),
            },
          ]),
        }),
      }),
    }),
  },
}))

// Import after mocking
import { GET } from './route'

describe('Conversations API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/conversations', () => {
    it('returns 400 if sessionId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('sessionId は必須です')
    })

    it('returns conversations for valid sessionId', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/conversations?sessionId=test-session-123'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2)
      expect(data[0].title).toBe('Test Conversation 1')
    })
  })
})
