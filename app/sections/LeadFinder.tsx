'use client'

import React, { useState } from 'react'
import { callAIAgent, AIAgentResponse } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  RiSearchLine,
  RiLoader4Line,
  RiExternalLinkLine,
  RiPhoneLine,
  RiBuilding2Line,
  RiBriefcaseLine,
  RiAlertLine,
  RiRefreshLine,
  RiStarLine,
  RiGroupLine,
} from 'react-icons/ri'

// --- Types ---

interface LeadCompany {
  company_name: string
  industry: string
  description: string
  why_they_need_app: string
  website: string
  contact_info: string
  potential_score: number
  estimated_budget: string
  recommended_approach: string
}

interface LeadFinderResponse {
  segment: string
  region: string
  total_leads: number
  leads: LeadCompany[]
  search_summary: string
}

interface LeadFinderProps {
  activeAgentId: string | null
  onAgentActive: (id: string | null) => void
}

// --- Constants ---

const LEAD_FINDER_AGENT_ID = '69a4b8e21bfdb0e56e23eb8b'

const segmentNames: Record<string, string> = {
  smb: 'Малый и средний бизнес (МСБ)',
  enterprise: 'Корпорации',
  ecommerce: 'E-commerce',
  healthcare: 'Здравоохранение и фитнес',
}

// --- Response Parser ---

function parseLeadResponse(result: AIAgentResponse): LeadFinderResponse | null {
  if (!result?.success) return null
  let data: any = result?.response?.result
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      return null
    }
  }
  if (data?.result && typeof data.result === 'object') {
    data = data.result
  }
  if (!data || typeof data !== 'object') return null
  return {
    segment: data?.segment ?? '',
    region: data?.region ?? '',
    total_leads: typeof data?.total_leads === 'number' ? data.total_leads : 0,
    leads: Array.isArray(data?.leads) ? data.leads : [],
    search_summary: data?.search_summary ?? '',
  }
}

// --- Helpers ---

function getScoreColor(score: number): string {
  if (score >= 8) return 'hsl(142 71% 45%)'
  if (score >= 5) return 'hsl(45 93% 47%)'
  return 'hsl(0 84% 60%)'
}

function getScoreBg(score: number): string {
  if (score >= 8) return 'hsl(142 71% 45% / 0.12)'
  if (score >= 5) return 'hsl(45 93% 47% / 0.12)'
  return 'hsl(0 84% 60% / 0.12)'
}

function getBudgetStyle(budget: string): { color: string; bg: string } {
  const lower = (budget ?? '').toLowerCase()
  if (lower.includes('enterprise') || lower.includes('корпоративн')) {
    return { color: 'hsl(270 67% 47%)', bg: 'hsl(270 67% 47% / 0.12)' }
  }
  if (lower.includes('high') || lower.includes('высок')) {
    return { color: 'hsl(142 71% 35%)', bg: 'hsl(142 71% 35% / 0.12)' }
  }
  if (lower.includes('medium') || lower.includes('средн')) {
    return { color: 'hsl(217 91% 50%)', bg: 'hsl(217 91% 50% / 0.12)' }
  }
  return { color: 'hsl(215 16% 47%)', bg: 'hsl(215 16% 47% / 0.1)' }
}

// --- Markdown Renderer ---

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

// --- Skeleton Loader ---

function LeadSkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="bg-white/75 backdrop-blur-md" style={{ borderColor: 'hsl(214 32% 91%)', borderRadius: '0.875rem' }}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// --- Lead Card ---

function LeadCard({ lead }: { lead: LeadCompany }) {
  const score = typeof lead?.potential_score === 'number' ? Math.min(10, Math.max(0, lead.potential_score)) : 0
  const budgetStyle = getBudgetStyle(lead?.estimated_budget ?? '')
  const scoreColor = getScoreColor(score)
  const scoreBg = getScoreBg(score)

  return (
    <Card className="bg-white/75 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden" style={{ borderColor: 'hsl(214 32% 91%)', borderRadius: '0.875rem' }}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(222 47% 11% / 0.08)', color: 'hsl(222 47% 11%)' }}>
            <RiBuilding2Line className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm leading-tight mb-1" style={{ color: 'hsl(222 47% 11%)' }}>
              {lead?.company_name ?? 'Компания'}
            </h3>
            <Badge variant="outline" className="text-[10px] font-medium" style={{ borderColor: 'hsl(214 32% 91%)', color: 'hsl(215 16% 47%)' }}>
              {lead?.industry ?? 'N/A'}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {lead?.description && (
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'hsl(215 16% 47%)', lineHeight: '1.55' }}>
            {lead.description}
          </p>
        )}

        {/* Why they need app */}
        {lead?.why_they_need_app && (
          <div className="mb-3 p-2.5 rounded-lg" style={{ background: 'hsl(210 40% 96%)' }}>
            <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'hsl(215 16% 47%)' }}>
              Почему нужно приложение
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'hsl(222 47% 11%)', lineHeight: '1.55' }}>
              {lead.why_they_need_app}
            </p>
          </div>
        )}

        {/* Score Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'hsl(215 16% 47%)' }}>
              Потенциал
            </span>
            <span className="text-xs font-bold" style={{ color: scoreColor }}>
              {score}/10
            </span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'hsl(214 32% 91%)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${score * 10}%`, background: scoreColor }}
            />
          </div>
        </div>

        {/* Budget Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className="text-[10px] font-medium border-0" style={{ background: budgetStyle.bg, color: budgetStyle.color }}>
            <RiBriefcaseLine className="w-3 h-3 mr-1" />
            {lead?.estimated_budget ?? 'N/A'}
          </Badge>
        </div>

        {/* Website Link */}
        {lead?.website && (
          <a
            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium mb-3 hover:underline transition-colors"
            style={{ color: 'hsl(217 91% 50%)' }}
          >
            <RiExternalLinkLine className="w-3.5 h-3.5" />
            {lead.website}
          </a>
        )}

        {/* Contact Info */}
        {lead?.contact_info && (
          <div className="flex items-start gap-1.5 mb-3">
            <RiPhoneLine className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(215 16% 47%)' }} />
            <p className="text-xs" style={{ color: 'hsl(215 16% 47%)' }}>
              {lead.contact_info}
            </p>
          </div>
        )}

        {/* Recommended Approach (Expandable) */}
        {lead?.recommended_approach && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="approach" className="border-b-0">
              <AccordionTrigger className="py-2 px-2.5 rounded-lg hover:no-underline hover:bg-gray-50 text-xs font-medium transition-colors" style={{ color: 'hsl(222 47% 11%)' }}>
                <div className="flex items-center gap-1.5">
                  <RiStarLine className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'hsl(43 74% 66%)' }} />
                  Рекомендуемый подход
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2.5 pb-2">
                <div style={{ color: 'hsl(222 47% 11%)' }}>
                  {renderMarkdown(lead.recommended_approach)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}

// --- Main Component ---

export default function LeadFinder({ activeAgentId, onAgentActive }: LeadFinderProps) {
  const [selectedSegment, setSelectedSegment] = useState<string>('smb')
  const [region, setRegion] = useState('')
  const [filters, setFilters] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LeadFinderResponse | null>(null)

  const handleSearch = async () => {
    if (!selectedSegment) return

    setLoading(true)
    setError(null)
    onAgentActive(LEAD_FINDER_AGENT_ID)

    try {
      const message = `Найди конкретные ЧАСТНЫЕ КОММЕРЧЕСКИЕ компании -- потенциальных клиентов для разработки мобильных приложений в сегменте: ${segmentNames[selectedSegment] ?? selectedSegment}. Регион: ${region || 'Москва и Санкт-Петербург'}. ${filters ? `Дополнительные фильтры: ${filters}` : ''} ВАЖНО: Ищи ТОЛЬКО частный бизнес (ООО, АО, стартапы, частные сети, франшизы). НИКАКИХ государственных организаций. Найди МИНИМУМ 15-25 реальных частных компаний. Ищи глубоко: рейтинги компаний, стартап-медиа (vc.ru, rb.ru), бизнес-каталоги, франшизы, компании с Instagram/Telegram без своего приложения. Для каждой укажи контакты и конкретную причину, зачем им мобильное приложение.`

      const agentResult = await callAIAgent(message, LEAD_FINDER_AGENT_ID)
      const parsed = parseLeadResponse(agentResult)

      if (parsed) {
        setResult(parsed)
      } else {
        setError('Не удалось обработать ответ. Попробуйте повторить запрос.')
      }
    } catch (err: any) {
      setError(err?.message ?? 'Произошла ошибка при поиске лидов.')
    } finally {
      setLoading(false)
      onAgentActive(null)
    }
  }

  const leads = Array.isArray(result?.leads) ? result.leads : []

  return (
    <div className="max-w-[800px] mx-auto w-full">
      {/* Search Form */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: 'hsl(210 40% 94%)', color: 'hsl(222 47% 11%)' }}>
          <RiGroupLine className="w-3.5 h-3.5" />
          Perplexity-powered
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3" style={{ color: 'hsl(222 47% 11%)', letterSpacing: '-0.01em' }}>
          Поиск лидов
        </h1>
        <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: 'hsl(215 16% 47%)', lineHeight: '1.55' }}>
          Найдите конкретные компании -- потенциальных клиентов для разработки мобильных приложений с помощью AI-поиска в реальном времени.
        </p>
      </div>

      {/* Form Card */}
      <Card className="mb-6 bg-white/75 backdrop-blur-md" style={{ borderColor: 'hsl(214 32% 91%)', borderRadius: '0.875rem' }}>
        <CardContent className="p-6 space-y-4">
          {/* Segment Select */}
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'hsl(222 47% 11%)' }}>
              Сегмент
            </label>
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="rounded-xl" style={{ borderColor: 'hsl(214 32% 91%)' }}>
                <SelectValue placeholder="Выберите сегмент" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smb">МСБ (Малый и средний бизнес)</SelectItem>
                <SelectItem value="enterprise">Корпорации</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="healthcare">Здравоохранение и фитнес</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Region Input */}
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'hsl(222 47% 11%)' }}>
              Регион
            </label>
            <Input
              placeholder="Москва, Россия"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-xl"
              style={{ borderColor: 'hsl(214 32% 91%)' }}
            />
          </div>

          {/* Additional Filters */}
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'hsl(222 47% 11%)' }}>
              Дополнительные фильтры (необязательно)
            </label>
            <Input
              placeholder="IT-компании, 50-200 сотрудников..."
              value={filters}
              onChange={(e) => setFilters(e.target.value)}
              className="rounded-xl"
              style={{ borderColor: 'hsl(214 32% 91%)' }}
            />
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            disabled={loading || !selectedSegment}
            className="w-full h-12 text-base font-medium rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
            style={{ background: 'hsl(222 47% 11%)', letterSpacing: '-0.01em' }}
          >
            {loading ? (
              <>
                <RiLoader4Line className="w-5 h-5 mr-2 animate-spin" />
                Поиск лидов...
              </>
            ) : (
              <>
                <RiSearchLine className="w-5 h-5 mr-2" />
                Найти лидов
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50" style={{ borderRadius: '0.875rem' }}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiAlertLine className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch} className="ml-4 flex-shrink-0">
              <RiRefreshLine className="w-3.5 h-3.5 mr-1.5" />
              Повторить
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && <LeadSkeletons />}

      {/* Results */}
      {!loading && result && (
        <div>
          {/* Summary Card */}
          {result?.search_summary && (
            <Card className="mb-6 bg-white/75 backdrop-blur-md" style={{ borderColor: 'hsl(214 32% 91%)', borderRadius: '0.875rem' }}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base" style={{ color: 'hsl(222 47% 11%)' }}>
                  <span>Результаты поиска</span>
                  <Badge variant="outline" className="text-xs font-medium" style={{ borderColor: 'hsl(214 32% 91%)', color: 'hsl(215 16% 47%)' }}>
                    {result?.total_leads ?? leads.length} лидов
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ color: 'hsl(222 47% 11%)' }}>
                  {renderMarkdown(result.search_summary)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lead Cards Grid */}
          {leads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leads.map((lead, idx) => (
                <LeadCard key={lead?.company_name ?? idx} lead={lead} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <RiSearchLine className="w-10 h-10 mx-auto mb-3" style={{ color: 'hsl(215 16% 47%)' }} />
              <p className="text-sm" style={{ color: 'hsl(215 16% 47%)' }}>
                Лиды не найдены. Попробуйте изменить параметры поиска.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State (no search yet) */}
      {!loading && !result && !error && (
        <div className="text-center py-12">
          <RiSearchLine className="w-12 h-12 mx-auto mb-4" style={{ color: 'hsl(214 32% 91%)' }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'hsl(222 47% 11%)' }}>
            Укажите параметры поиска
          </p>
          <p className="text-xs" style={{ color: 'hsl(215 16% 47%)' }}>
            Выберите сегмент и регион, чтобы найти потенциальных клиентов
          </p>
        </div>
      )}
    </div>
  )
}
