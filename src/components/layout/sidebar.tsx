'use client'

import { MessageSquare, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface ConversationItem {
  _id: string
  title: string
  updatedAt: string
}

interface SidebarProps {
  conversations: ConversationItem[]
  currentConversationId: string | null
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
}

export function Sidebar({
  conversations,
  currentConversationId,
  isOpen,
  onClose,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="会話履歴サイドバー"
        role="navigation"
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <h2 className="font-semibold">会話履歴</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
            aria-label="サイドバーを閉じる"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-3.5rem)]">
          <div className="p-2">
            {conversations.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                会話履歴がありません
              </p>
            ) : (
              <ul className="space-y-1" role="list" aria-label="会話一覧">
                {conversations.map((conversation) => (
                  <li key={conversation._id}>
                    <button
                      onClick={() => onSelectConversation(conversation._id)}
                      className={cn(
                        'group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring',
                        currentConversationId === conversation._id && 'bg-accent'
                      )}
                      aria-current={currentConversationId === conversation._id ? 'true' : undefined}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="flex-1 truncate">{conversation.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteConversation(conversation._id)
                        }}
                        aria-label={`${conversation.title} を削除`}
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}
