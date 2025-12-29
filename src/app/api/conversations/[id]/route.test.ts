import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock database connection
vi.mock('@/lib/db/connection', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}))

// Helper to create a chainable Query-like mock
function createQueryMock(value: unknown) {
  const query = {
    lean: () => Promise.resolve(value),
    then: (resolve: (v: unknown) => void) => Promise.resolve(value).then(resolve),
  }
  return query
}

// Mock Conversation model - inline values due to hoisting
vi.mock('@/models/conversation', () => ({
  default: {
    findById: vi.fn().mockImplementation((id: string) => {
      if (id === 'notfound') {
        return createQueryMock(null)
      }
      const doc = {
        _id: 'conv123',
        sessionId: 'session123',
        title: 'Test Conversation',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }
      return createQueryMock(doc)
    }),
    findByIdAndDelete: vi.fn().mockResolvedValue({ _id: 'conv123' }),
    findByIdAndUpdate: vi.fn().mockImplementation((id: string, update: { title: string }) => {
      if (id === 'notfound') {
        return { lean: vi.fn().mockResolvedValue(null) }
      }
      return {
        lean: vi.fn().mockResolvedValue({
          _id: 'conv123',
          title: update.title,
        }),
      }
    }),
  },
}))

// Mock Message model
vi.mock('@/models/message', () => ({
  default: {
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            { _id: 'msg1', role: 'user', content: 'Hello', createdAt: new Date() },
            { _id: 'msg2', role: 'assistant', content: 'Hi there!', createdAt: new Date() },
          ]),
        }),
      }),
    }),
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 2 }),
  },
}))

// Import after mocking
import { GET, DELETE, PATCH } from './route'

describe('Conversations [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/conversations/[id]', () => {
    it('returns conversation with messages', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/conv123')
      const params = Promise.resolve({ id: 'conv123' })

      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.title).toBe('Test Conversation')
      expect(data.messages).toHaveLength(2)
    })

    it('returns 404 if conversation not found', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/notfound')
      const params = Promise.resolve({ id: 'notfound' })

      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('会話が見つかりません')
    })
  })

  describe('DELETE /api/conversations/[id]', () => {
    it('deletes conversation and messages', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/conv123', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: 'conv123' })

      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('returns 404 if conversation not found', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/notfound', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: 'notfound' })

      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('会話が見つかりません')
    })
  })

  describe('PATCH /api/conversations/[id]', () => {
    it('updates conversation title', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/conv123', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated Title' }),
      })
      const params = Promise.resolve({ id: 'conv123' })

      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.title).toBe('Updated Title')
    })

    it('returns 400 if title is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/conv123', {
        method: 'PATCH',
        body: JSON.stringify({}),
      })
      const params = Promise.resolve({ id: 'conv123' })

      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('title は必須です')
    })

    it('returns 404 if conversation not found', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/notfound', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'New Title' }),
      })
      const params = Promise.resolve({ id: 'notfound' })

      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('会話が見つかりません')
    })
  })
})
