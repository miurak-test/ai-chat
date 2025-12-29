import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ChatInput } from './chat-input'

describe('ChatInput', () => {
  it('renders textarea and send button', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)

    expect(screen.getByPlaceholderText('メッセージを入力...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onSend when clicking send button with valid input', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)

    const textarea = screen.getByPlaceholderText('メッセージを入力...')
    await user.type(textarea, 'Hello, AI!')
    await user.click(screen.getByRole('button'))

    expect(onSend).toHaveBeenCalledWith('Hello, AI!')
  })

  it('calls onSend when pressing Enter', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)

    const textarea = screen.getByPlaceholderText('メッセージを入力...')
    await user.type(textarea, 'Hello, AI!{Enter}')

    expect(onSend).toHaveBeenCalledWith('Hello, AI!')
  })

  it('does not call onSend when pressing Shift+Enter', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)

    const textarea = screen.getByPlaceholderText('メッセージを入力...')
    await user.type(textarea, 'Hello{Shift>}{Enter}{/Shift}')

    expect(onSend).not.toHaveBeenCalled()
  })

  it('clears input after sending', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)

    const textarea = screen.getByPlaceholderText('メッセージを入力...') as HTMLTextAreaElement
    await user.type(textarea, 'Hello, AI!')
    await user.click(screen.getByRole('button'))

    expect(textarea.value).toBe('')
  })

  it('disables send button when input is empty', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('disables input and button when disabled prop is true', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} disabled={true} />)

    expect(screen.getByPlaceholderText('メッセージを入力...')).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onSend with whitespace-only input', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)

    const textarea = screen.getByPlaceholderText('メッセージを入力...')
    await user.type(textarea, '   ')

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
