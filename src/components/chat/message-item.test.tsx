import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock react-syntax-highlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: string }) => <pre>{children}</pre>,
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

// Import after mocking
import { MessageItem } from './message-item'

// Mock clipboard API
const mockWriteText = vi.fn()
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
})

describe('MessageItem', () => {
  beforeEach(() => {
    mockWriteText.mockClear()
  })

  it('renders user message correctly', () => {
    render(<MessageItem role="user" content="Hello, AI!" />)

    expect(screen.getByText('あなた')).toBeInTheDocument()
    expect(screen.getByText('Hello, AI!')).toBeInTheDocument()
  })

  it('renders assistant message correctly', () => {
    render(<MessageItem role="assistant" content="Hello, human!" />)

    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('Hello, human!')).toBeInTheDocument()
  })

  it('has a copy button', () => {
    render(<MessageItem role="user" content="Test message" />)

    const copyButton = screen.getByRole('button')
    expect(copyButton).toBeInTheDocument()
  })

  it('renders user message with whitespace-pre-wrap class', () => {
    const content = 'Line 1\nLine 2\nLine 3'
    render(<MessageItem role="user" content={content} />)

    const paragraph = screen.getAllByText((_, element) => {
      return element?.textContent === content
    }).find(el => el.tagName === 'P')

    expect(paragraph).toHaveClass('whitespace-pre-wrap')
  })
})
