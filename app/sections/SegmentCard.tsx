'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { RiBuilding2Line, RiBuildingLine, RiShoppingCartLine, RiHeartPulseLine, RiUserLine, RiLightbulbLine, RiAlertLine, RiMoneyDollarCircleLine, RiMegaphoneLine, RiRocketLine, RiStarLine } from 'react-icons/ri'

interface SegmentData {
  segment_name: string
  client_profile: string
  typical_needs: string
  pain_points: string
  budget_range: string
  acquisition_channels: string
  entry_strategy: string
  recommendations: string
  summary: string
}

interface SegmentCardProps {
  segment: SegmentData
  index: number
}

function getSegmentStyle(name: string): { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string } {
  const lower = (name ?? '').toLowerCase()
  if (lower.includes('мсб') || lower.includes('smb') || lower.includes('малый') || lower.includes('средн')) {
    return { icon: RiBuilding2Line, color: 'hsl(12 76% 61%)', bgColor: 'hsl(12 76% 61% / 0.12)' }
  }
  if (lower.includes('корпорат') || lower.includes('enterprise') || lower.includes('крупн')) {
    return { icon: RiBuildingLine, color: 'hsl(173 58% 39%)', bgColor: 'hsl(173 58% 39% / 0.12)' }
  }
  if (lower.includes('commerce') || lower.includes('коммерц') || lower.includes('торговл') || lower.includes('e-com')) {
    return { icon: RiShoppingCartLine, color: 'hsl(197 37% 24%)', bgColor: 'hsl(197 37% 24% / 0.12)' }
  }
  if (lower.includes('здравоохран') || lower.includes('health') || lower.includes('фитнес') || lower.includes('медицин')) {
    return { icon: RiHeartPulseLine, color: 'hsl(43 74% 66%)', bgColor: 'hsl(43 74% 66% / 0.15)' }
  }
  return { icon: RiBuilding2Line, color: 'hsl(215 16% 47%)', bgColor: 'hsl(215 16% 47% / 0.12)' }
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const parts = line.slice(2).split(/\*\*(.*?)\*\*/g)
          return (
            <li key={i} className="ml-4 list-disc text-sm leading-relaxed">
              {parts.length === 1 ? line.slice(2) : parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="font-semibold">{p}</strong> : p)}
            </li>
          )
        }
        if (/^\d+\.\s/.test(line)) {
          const content = line.replace(/^\d+\.\s/, '')
          const parts = content.split(/\*\*(.*?)\*\*/g)
          return (
            <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">
              {parts.length === 1 ? content : parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="font-semibold">{p}</strong> : p)}
            </li>
          )
        }
        if (!line.trim()) return <div key={i} className="h-1" />
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} className="text-sm leading-relaxed">
            {parts.length === 1 ? line : parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="font-semibold">{p}</strong> : p)}
          </p>
        )
      })}
    </div>
  )
}

const ACCORDION_SECTIONS = [
  { key: 'client_profile', label: 'Профиль клиента', icon: RiUserLine },
  { key: 'typical_needs', label: 'Типичные потребности', icon: RiLightbulbLine },
  { key: 'pain_points', label: 'Боли и проблемы', icon: RiAlertLine },
  { key: 'budget_range', label: 'Бюджетный диапазон', icon: RiMoneyDollarCircleLine },
  { key: 'acquisition_channels', label: 'Каналы привлечения', icon: RiMegaphoneLine },
  { key: 'entry_strategy', label: 'Стратегия входа', icon: RiRocketLine },
  { key: 'recommendations', label: 'Рекомендации', icon: RiStarLine },
] as const

export default function SegmentCard({ segment, index }: SegmentCardProps) {
  const style = getSegmentStyle(segment?.segment_name ?? '')
  const Icon = style.icon

  return (
    <Card className="overflow-hidden bg-white/75 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300" style={{ borderColor: 'hsl(214 32% 91%)', borderRadius: '0.875rem' }}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: style.bgColor, color: style.color }}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-medium" style={{ borderColor: style.color, color: style.color }}>
                #{index + 1}
              </Badge>
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'hsl(222 47% 11%)', letterSpacing: '-0.01em' }}>
              {segment?.segment_name ?? 'Сегмент'}
            </h3>
          </div>
        </div>

        {/* Summary */}
        {segment?.summary && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: 'hsl(210 40% 96%)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(222 47% 11%)', lineHeight: '1.55' }}>
              {segment.summary}
            </p>
          </div>
        )}

        {/* Accordion Details */}
        <Accordion type="multiple" className="w-full">
          {ACCORDION_SECTIONS.map((section) => {
            const value = segment?.[section.key as keyof SegmentData] as string | undefined
            if (!value) return null
            const SectionIcon = section.icon
            return (
              <AccordionItem key={section.key} value={section.key} className="border-b-0 mb-1">
                <AccordionTrigger className="py-2.5 px-3 rounded-lg hover:no-underline hover:bg-gray-50 text-sm font-medium transition-colors" style={{ color: 'hsl(222 47% 11%)' }}>
                  <div className="flex items-center gap-2">
                    <SectionIcon className="w-4 h-4 flex-shrink-0" style={{ color: style.color }} />
                    {section.label}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div style={{ color: 'hsl(222 47% 11%)' }}>
                    {renderMarkdown(value)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}
