import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock react-syntax-highlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: string }) => <pre data-testid="code-block">{children}</pre>,
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

// Import after mocking
import { MarkdownRenderer } from './markdown-renderer'

describe('MarkdownRenderer', () => {
  it('renders plain text', () => {
    render(<MarkdownRenderer content="Hello, World!" />)

    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })

  it('renders headings correctly', () => {
    render(<MarkdownRenderer content={`# Heading 1

## Heading 2

### Heading 3`} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading 1')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading 2')
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Heading 3')
  })

  it('renders unordered lists', () => {
    render(<MarkdownRenderer content={`- Item 1
- Item 2
- Item 3`} />)

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('renders ordered lists', () => {
    render(<MarkdownRenderer content={`1. First
2. Second
3. Third`} />)

    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(screen.getByText('First')).toBeInTheDocument()
  })

  it('renders inline code', () => {
    render(<MarkdownRenderer content="Use the `console.log` function" />)

    const code = screen.getByText('console.log')
    expect(code.tagName).toBe('CODE')
    expect(code).toHaveClass('font-mono')
  })

  it('renders code blocks with syntax highlighting', () => {
    render(<MarkdownRenderer content={`\`\`\`javascript
const x = 1;
\`\`\``} />)

    expect(screen.getByTestId('code-block')).toBeInTheDocument()
    expect(screen.getByText('const x = 1;')).toBeInTheDocument()
  })

  it('renders links with target="_blank"', () => {
    render(<MarkdownRenderer content="[Click here](https://example.com)" />)

    const link = screen.getByRole('link', { name: 'Click here' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders blockquotes', () => {
    render(<MarkdownRenderer content="> This is a quote" />)

    const blockquote = screen.getByText('This is a quote').closest('blockquote')
    expect(blockquote).toBeInTheDocument()
    expect(blockquote).toHaveClass('border-l-4')
  })

  it('renders tables', () => {
    render(<MarkdownRenderer content={`| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`} />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Header 1')).toBeInTheDocument()
    expect(screen.getByText('Cell 1')).toBeInTheDocument()
  })

  it('renders bold and italic text', () => {
    render(<MarkdownRenderer content="**bold** and *italic*" />)

    expect(screen.getByText('bold')).toBeInTheDocument()
    expect(screen.getByText('italic')).toBeInTheDocument()
  })
})
