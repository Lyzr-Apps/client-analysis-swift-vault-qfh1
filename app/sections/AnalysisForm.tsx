'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { RiBuilding2Line, RiBuildingLine, RiShoppingCartLine, RiHeartPulseLine, RiSearchLine, RiSparklingLine } from 'react-icons/ri'

interface AnalysisFormProps {
  selectedSegments: string[]
  onToggleSegment: (segment: string) => void
  additionalContext: string
  onContextChange: (value: string) => void
  onSubmit: () => void
  loading: boolean
  error: string | null
  onRetry: () => void
  useSampleData: boolean
  onToggleSampleData: () => void
}

const SEGMENTS = [
  { id: 'smb', label: 'МСБ (Малый и средний бизнес)', icon: RiBuilding2Line, color: 'hsl(12 76% 61%)' },
  { id: 'enterprise', label: 'Корпорации', icon: RiBuildingLine, color: 'hsl(173 58% 39%)' },
  { id: 'ecommerce', label: 'E-commerce', icon: RiShoppingCartLine, color: 'hsl(197 37% 24%)' },
  { id: 'healthcare', label: 'Здравоохранение / Фитнес', icon: RiHeartPulseLine, color: 'hsl(43 74% 66%)' },
]

function SkeletonCards() {
  return (
    <div className="space-y-4 mt-8 max-w-[720px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-48" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="space-y-2 mt-4 pt-4 border-t" style={{ borderColor: 'hsl(214 32% 91%)' }}>
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AnalysisForm({
  selectedSegments,
  onToggleSegment,
  additionalContext,
  onContextChange,
  onSubmit,
  loading,
  error,
  onRetry,
  useSampleData,
  onToggleSampleData,
}: AnalysisFormProps) {
  if (loading) {
    return <SkeletonCards />
  }

  const hasSelection = selectedSegments.length > 0

  return (
    <div className="max-w-[720px] mx-auto w-full">
      {/* Sample Data Toggle */}
      <div className="flex items-center justify-end gap-2 mb-6">
        <span className="text-xs font-medium" style={{ color: 'hsl(215 16% 47%)' }}>
          Sample Data
        </span>
        <Switch checked={useSampleData} onCheckedChange={onToggleSampleData} />
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: 'hsl(210 40% 94%)', color: 'hsl(222 47% 11%)' }}>
          <RiSparklingLine className="w-3.5 h-3.5" />
          AI-powered
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3" style={{ color: 'hsl(222 47% 11%)', letterSpacing: '-0.01em' }}>
          Анализ клиентских сегментов
        </h1>
        <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: 'hsl(215 16% 47%)', lineHeight: '1.55' }}>
          Комплексный анализ целевых клиентских сегментов для компании-разработчика мобильных приложений. Выберите сегменты и получите стратегию привлечения.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="outline" size="sm" onClick={onRetry} className="ml-4 flex-shrink-0">
              Повторить
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Segment Selection */}
      <div className="mb-8">
        <label className="text-sm font-medium mb-3 block" style={{ color: 'hsl(222 47% 11%)' }}>
          Выберите сегменты для анализа
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SEGMENTS.map((seg) => {
            const isSelected = selectedSegments.includes(seg.id)
            const Icon = seg.icon
            return (
              <button
                key={seg.id}
                onClick={() => onToggleSegment(seg.id)}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200',
                  isSelected
                    ? 'bg-white shadow-md border-current'
                    : 'bg-white/50 border-transparent hover:bg-white/80 hover:shadow-sm'
                )}
                style={{
                  borderColor: isSelected ? seg.color : 'transparent',
                  borderWidth: '2px',
                }}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
                    isSelected ? 'opacity-100' : 'opacity-60'
                  )}
                  style={{ background: `${seg.color}20`, color: seg.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-medium block" style={{ color: 'hsl(222 47% 11%)' }}>
                    {seg.label}
                  </span>
                </div>
                <div
                  className={cn(
                    'ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
                    isSelected ? 'border-current' : 'border-gray-300'
                  )}
                  style={{ borderColor: isSelected ? seg.color : undefined }}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Additional Context */}
      <div className="mb-8">
        <label className="text-sm font-medium mb-2 block" style={{ color: 'hsl(222 47% 11%)' }}>
          Дополнительный контекст (необязательно)
        </label>
        <Textarea
          placeholder="Укажите специализацию, регион, бюджет клиентов..."
          value={additionalContext}
          onChange={(e) => onContextChange(e.target.value)}
          rows={3}
          className="resize-none rounded-xl"
          style={{ borderColor: 'hsl(214 32% 91%)' }}
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={!hasSelection || loading}
        className="w-full h-12 text-base font-medium rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
        style={{
          background: hasSelection ? 'hsl(222 47% 11%)' : undefined,
          letterSpacing: '-0.01em',
        }}
      >
        <RiSearchLine className="w-5 h-5 mr-2" />
        Запустить анализ
      </Button>
    </div>
  )
}
