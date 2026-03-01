'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RiArrowLeftLine, RiBarChartGroupedLine, RiTrophyLine, RiLightbulbLine } from 'react-icons/ri'
import SegmentCard from './SegmentCard'

interface SegmentAnalysis {
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

interface AnalysisReport {
  analysis_title: string
  segments: SegmentAnalysis[]
  cross_segment_comparison: string
  priority_ranking: string
  overall_recommendations: string
}

interface AnalysisResultsProps {
  report: AnalysisReport
  onNewAnalysis: () => void
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

export default function AnalysisResults({ report, onNewAnalysis }: AnalysisResultsProps) {
  const segments = Array.isArray(report?.segments) ? report.segments : []

  return (
    <div className="max-w-[800px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" size="sm" onClick={onNewAnalysis} className="mb-2 -ml-2">
            <RiArrowLeftLine className="w-4 h-4 mr-1.5" />
            Новый анализ
          </Button>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'hsl(222 47% 11%)', letterSpacing: '-0.01em' }}>
            {report?.analysis_title ?? 'Результаты анализа'}
          </h1>
        </div>
      </div>

      {/* Segment Cards */}
      {segments.length > 0 && (
        <div className="space-y-4 mb-8">
          {segments.map((segment, idx) => (
            <SegmentCard key={segment?.segment_name ?? idx} segment={segment} index={idx} />
          ))}
        </div>
      )}

      <Separator className="my-8" />

      {/* Cross-Segment Comparison */}
      {report?.cross_segment_comparison && (
        <Card className="mb-4 bg-white/75 backdrop-blur-md" style={{ borderColor: 'hsl(214 32% 91%)', borderRadius: '0.875rem' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: 'hsl(222 47% 11%)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(173 58% 39% / 0.12)', color: 'hsl(173 58% 39%)' }}>
                <RiBarChartGroupedLine className="w-4 h-4" />
              </div>
              Сравнительный анализ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ color: 'hsl(222 47% 11%)' }}>
              {renderMarkdown(report.cross_segment_comparison)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priority Ranking */}
      {report?.priority_ranking && (
        <Card className="mb-4 bg-white/75 backdrop-blur-md" style={{ borderColor: 'hsl(214 32% 91%)', borderRadius: '0.875rem' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: 'hsl(222 47% 11%)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(43 74% 66% / 0.15)', color: 'hsl(43 74% 66%)' }}>
                <RiTrophyLine className="w-4 h-4" />
              </div>
              Приоритетный рейтинг
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ color: 'hsl(222 47% 11%)' }}>
              {renderMarkdown(report.priority_ranking)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Recommendations */}
      {report?.overall_recommendations && (
        <Card className="mb-8 bg-white/75 backdrop-blur-md" style={{ borderColor: 'hsl(214 32% 91%)', borderRadius: '0.875rem' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: 'hsl(222 47% 11%)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(12 76% 61% / 0.12)', color: 'hsl(12 76% 61%)' }}>
                <RiLightbulbLine className="w-4 h-4" />
              </div>
              Общие рекомендации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ color: 'hsl(222 47% 11%)' }}>
              {renderMarkdown(report.overall_recommendations)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Action */}
      <div className="text-center pb-8">
        <Button onClick={onNewAnalysis} variant="outline" className="rounded-xl" style={{ borderColor: 'hsl(214 32% 91%)' }}>
          <RiArrowLeftLine className="w-4 h-4 mr-2" />
          Запустить новый анализ
        </Button>
      </div>
    </div>
  )
}
