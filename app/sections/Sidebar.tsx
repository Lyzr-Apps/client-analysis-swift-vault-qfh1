'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { RiDashboardLine, RiMenuFoldLine, RiMenuUnfoldLine, RiAddLine, RiTimeLine, RiDeleteBinLine } from 'react-icons/ri'

interface HistoryEntry {
  id: string
  date: string
  segments: string[]
  result: any
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  history: HistoryEntry[]
  onSelectHistory: (entry: HistoryEntry) => void
  onNewAnalysis: () => void
  onClearHistory: () => void
  activeHistoryId: string | null
}

const SEGMENT_LABELS: Record<string, string> = {
  smb: 'МСБ',
  enterprise: 'Корп.',
  ecommerce: 'E-com',
  healthcare: 'Здрав.',
}

export default function Sidebar({
  isOpen,
  onToggle,
  history,
  onSelectHistory,
  onNewAnalysis,
  onClearHistory,
  activeHistoryId,
}: SidebarProps) {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div
      className={cn(
        'h-screen flex flex-col border-r transition-all duration-300 ease-in-out flex-shrink-0',
        isOpen ? 'w-[260px]' : 'w-[52px]'
      )}
      style={{
        background: 'hsl(210 40% 97%)',
        borderColor: 'hsl(214 32% 91%)',
      }}
    >
      <div className="flex items-center justify-between p-3 flex-shrink-0">
        {isOpen && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(222 47% 11%)' }}>
              <RiDashboardLine className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm truncate" style={{ color: 'hsl(222 47% 11%)' }}>
              Client Analysis Hub
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 flex-shrink-0"
        >
          {isOpen ? (
            <RiMenuFoldLine className="w-4 h-4" />
          ) : (
            <RiMenuUnfoldLine className="w-4 h-4" />
          )}
        </Button>
      </div>

      {isOpen && (
        <>
          <div className="px-3 pb-2 flex-shrink-0">
            <Button
              onClick={onNewAnalysis}
              className="w-full justify-start gap-2 text-sm"
              size="sm"
            >
              <RiAddLine className="w-4 h-4" />
              Новый анализ
            </Button>
          </div>

          <Separator />

          <div className="px-3 pt-3 pb-1 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(215 16% 47%)' }}>
                История
              </span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ color: 'hsl(215 16% 47%)' }}
                >
                  <RiDeleteBinLine className="w-3 h-3" />
                  Очистить
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 px-2">
            {history.length === 0 ? (
              <div className="px-2 py-8 text-center">
                <RiTimeLine className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(215 16% 47%)' }} />
                <p className="text-xs" style={{ color: 'hsl(215 16% 47%)' }}>
                  Здесь будет история ваших анализов
                </p>
              </div>
            ) : (
              <div className="space-y-1 pb-4">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => onSelectHistory(entry)}
                    className={cn(
                      'w-full text-left rounded-lg p-2.5 transition-all duration-200 hover:bg-white/60',
                      activeHistoryId === entry.id
                        ? 'bg-white shadow-sm border'
                        : 'bg-transparent'
                    )}
                    style={{
                      borderColor: activeHistoryId === entry.id ? 'hsl(214 32% 91%)' : 'transparent',
                    }}
                  >
                    <div className="text-xs font-medium mb-1.5" style={{ color: 'hsl(222 47% 11%)' }}>
                      {formatDate(entry.date)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(entry.segments) &&
                        entry.segments.map((seg) => (
                          <Badge
                            key={seg}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {SEGMENT_LABELS[seg] ?? seg}
                          </Badge>
                        ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </div>
  )
}
