'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent, AIAgentResponse } from '@/lib/aiAgent'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { RiLoader4Line, RiBarChartGroupedLine, RiUserSearchLine } from 'react-icons/ri'

import Sidebar from './sections/Sidebar'
import AnalysisForm from './sections/AnalysisForm'
import AnalysisResults from './sections/AnalysisResults'
import LeadFinder from './sections/LeadFinder'

// --- Types ---

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

interface HistoryEntry {
  id: string
  date: string
  segments: string[]
  result: AnalysisReport
}

// --- Constants ---

const MANAGER_AGENT_ID = '69a4b46f64d6d0fa3ce147b7'
const STORAGE_KEY = 'client_analysis_history'

const SEGMENT_NAMES: Record<string, string> = {
  smb: 'Малый и средний бизнес (МСБ)',
  enterprise: 'Корпорации',
  ecommerce: 'E-commerce',
  healthcare: 'Здравоохранение и фитнес',
}

const LEAD_FINDER_AGENT_ID = '69a4b8e21bfdb0e56e23eb8b'

const AGENTS = [
  { id: MANAGER_AGENT_ID, name: 'Client Analysis Coordinator', role: 'Координатор анализа' },
  { id: '69a4b457458020b954058c0b', name: 'SMB Segment Analyst', role: 'Аналитик МСБ' },
  { id: '69a4b45722134cb66bff872f', name: 'Enterprise Segment Analyst', role: 'Аналитик корпораций' },
  { id: '69a4b457236539586dca1e7e', name: 'E-commerce Segment Analyst', role: 'Аналитик E-commerce' },
  { id: '69a4b45822134cb66bff8731', name: 'Healthcare Segment Analyst', role: 'Аналитик здравоохранения' },
  { id: LEAD_FINDER_AGENT_ID, name: 'Lead Finder', role: 'Поиск лидов (Perplexity)' },
]

// --- Sample Data ---

const SAMPLE_REPORT: AnalysisReport = {
  analysis_title: 'Комплексный анализ клиентских сегментов для разработчика мобильных приложений',
  segments: [
    {
      segment_name: 'Малый и средний бизнес (МСБ)',
      client_profile: 'Компании с штатом 10-250 сотрудников, годовой оборот 50-500 млн руб. Часто не имеют собственного IT-отдела. Принятие решений сосредоточено у владельца или генерального директора.',
      typical_needs: '- Мобильные приложения для автоматизации продаж\n- CRM-системы с мобильным доступом\n- Приложения для управления заказами\n- Простые каталоги товаров и услуг',
      pain_points: '- Ограниченный бюджет на IT\n- Недостаток технической экспертизы\n- Долгие сроки разработки\n- Сложность оценки качества подрядчика',
      budget_range: '500 000 - 3 000 000 руб. за проект. Предпочитают фиксированную стоимость.',
      acquisition_channels: '- Контент-маркетинг и SEO\n- Вебинары и образовательные мероприятия\n- Партнерские программы с бизнес-инкубаторами\n- Таргетированная реклама в социальных сетях',
      entry_strategy: 'Предложить MVP за 2-3 месяца с фиксированной ценой. Использовать кейсы похожих компаний. Предоставить бесплатный аудит текущих бизнес-процессов.',
      recommendations: '- Создать пакетные предложения (Старт, Бизнес, Премиум)\n- Разработать шаблонные решения для снижения стоимости\n- Внедрить подписочную модель обслуживания',
      summary: 'МСБ -- массовый сегмент с высоким потенциалом. Ключ к успеху -- стандартизация решений и доступные цены при сохранении качества.',
    },
    {
      segment_name: 'Корпорации',
      client_profile: 'Крупные компании с штатом 250+ сотрудников. Имеют IT-отдел и сложные процессы закупок.',
      typical_needs: '- Корпоративные мобильные порталы\n- Интеграция с ERP/SAP системами\n- Мобильные решения для полевых сотрудников',
      pain_points: '- Длительные циклы согласования\n- Высокие требования к безопасности\n- Необходимость интеграции с legacy-системами',
      budget_range: '5 000 000 - 50 000 000+ руб. Готовы к Time & Material модели.',
      acquisition_channels: '- Отраслевые конференции и выставки\n- Прямые продажи через account managers\n- Тендерные площадки',
      entry_strategy: 'Начать с пилотного проекта для одного подразделения. Продемонстрировать экспертизу в безопасности и масштабировании.',
      recommendations: '- Инвестировать в получение корпоративных сертификаций\n- Создать выделенную команду для enterprise-проектов\n- Партнериться с системными интеграторами',
      summary: 'Корпоративный сегмент обеспечивает высокую маржинальность и долгосрочные контракты.',
    },
    {
      segment_name: 'E-commerce',
      client_profile: 'Онлайн-ритейлеры и маркетплейсы с оборотом от 100 млн руб. Технически продвинутые.',
      typical_needs: '- Мобильные приложения для покупателей\n- Приложения для курьеров и доставки\n- Интеграция с платежными системами',
      pain_points: '- Высокая конкуренция за пользователей\n- Необходимость постоянного обновления\n- Требования к высокой производительности',
      budget_range: '2 000 000 - 15 000 000 руб. за первую версию.',
      acquisition_channels: '- Контент-маркетинг с кейсами роста конверсии\n- Присутствие на e-commerce конференциях\n- Партнерства с платежными агрегаторами',
      entry_strategy: 'Предложить аудит существующего приложения с конкретными метриками улучшения. Показать ROI.',
      recommendations: '- Специализироваться на UX/UI для e-commerce\n- Создать готовые модули (каталог, корзина, оплата)\n- Предложить модель revenue share для стартапов',
      summary: 'E-commerce -- быстрорастущий сегмент с высокой технической требовательностью.',
    },
    {
      segment_name: 'Здравоохранение и фитнес',
      client_profile: 'Медицинские клиники, фитнес-сети, wellness-платформы. Регулируемая отрасль.',
      typical_needs: '- Телемедицинские платформы\n- Приложения для записи к врачу\n- Фитнес-трекеры и wellness-приложения',
      pain_points: '- Строгие требования к защите персональных данных (ФЗ-152)\n- Необходимость интеграции с медицинским оборудованием\n- Сертификация медицинских изделий',
      budget_range: '3 000 000 - 20 000 000 руб. Готовность к долгосрочным проектам.',
      acquisition_channels: '- Медицинские конференции и форумы\n- Партнерства с медицинскими ассоциациями\n- Прямые продажи через специализированных менеджеров',
      entry_strategy: 'Получить экспертизу в ФЗ-152 и медицинском законодательстве. Создать референсный проект.',
      recommendations: '- Инвестировать в compliance-экспертизу\n- Разработать платформенное решение для телемедицины\n- Нанять специалистов с медицинским бэкграундом',
      summary: 'Здравоохранение -- высокомаржинальный сегмент с высоким барьером входа.',
    },
  ],
  cross_segment_comparison: '**МСБ** предлагает наибольший объем рынка, но с низкой средней стоимостью проекта. **Корпорации** обеспечивают максимальную выручку на клиента. **E-commerce** сочетает средний чек с высокой частотой повторных заказов. **Здравоохранение** имеет наивысший барьер входа, но и наименьшую конкуренцию.',
  priority_ranking: '1. **E-commerce** -- оптимальное соотношение входных затрат и потенциальной выручки\n2. **МСБ** -- массовый рынок, быстрый старт при наличии шаблонных решений\n3. **Здравоохранение** -- высокая маржинальность при наличии compliance-экспертизы\n4. **Корпорации** -- требует значительных инвестиций в продажи',
  overall_recommendations: '- Начать с параллельного развития **E-commerce** и **МСБ** сегментов\n- Инвестировать в создание платформенных решений\n- Постепенно наращивать компетенции для выхода в **здравоохранение**\n- **Корпоративный сегмент** развивать через партнерства с интеграторами\n- Создать портфолио из 3-5 успешных кейсов для каждого сегмента',
}

// --- Response Parser ---

function parseAnalysisResponse(result: AIAgentResponse): AnalysisReport | null {
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
    analysis_title: data?.analysis_title ?? 'Анализ клиентских сегментов',
    segments: Array.isArray(data?.segments) ? data.segments : [],
    cross_segment_comparison: data?.cross_segment_comparison ?? '',
    priority_ranking: data?.priority_ranking ?? '',
    overall_recommendations: data?.overall_recommendations ?? '',
  }
}

// --- Error Boundary ---

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// --- Theme ---

const THEME_VARS: React.CSSProperties = {
  '--background': '0 0% 100%',
  '--foreground': '222 47% 11%',
  '--card': '0 0% 98%',
  '--card-foreground': '222 47% 11%',
  '--primary': '222 47% 11%',
  '--primary-foreground': '210 40% 98%',
  '--secondary': '210 40% 96%',
  '--secondary-foreground': '222 47% 11%',
  '--accent': '210 40% 92%',
  '--accent-foreground': '222 47% 11%',
  '--destructive': '0 84% 60%',
  '--muted': '210 40% 94%',
  '--muted-foreground': '215 16% 47%',
  '--border': '214 32% 91%',
  '--input': '214 32% 85%',
  '--ring': '222 47% 11%',
  '--radius': '0.875rem',
} as React.CSSProperties

// --- Agent Status ---

function AgentStatus({ activeAgentId }: { activeAgentId: string | null }) {
  return (
    <Card className="bg-white/75 backdrop-blur-md" style={{ borderColor: 'hsl(214 32% 91%)', borderRadius: '0.875rem' }}>
      <CardContent className="p-4">
        <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'hsl(215 16% 47%)' }}>
          AI Agents
        </h3>
        <div className="space-y-1.5">
          {AGENTS.map((agent) => {
            const isActive = activeAgentId === agent.id
            return (
              <div key={agent.id} className="flex items-center gap-2 py-1">
                <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300')} />
                <span className="text-xs truncate" style={{ color: isActive ? 'hsl(222 47% 11%)' : 'hsl(215 16% 47%)' }}>
                  {agent.role}
                </span>
                {isActive && (
                  <RiLoader4Line className="w-3 h-3 animate-spin ml-auto flex-shrink-0" style={{ color: 'hsl(222 47% 11%)' }} />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Page ---

export default function Page() {
  const [view, setView] = useState<'form' | 'results' | 'loading'>('form')
  const [selectedSegments, setSelectedSegments] = useState<string[]>(['smb', 'enterprise', 'ecommerce', 'healthcare'])
  const [additionalContext, setAdditionalContext] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisReport | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [useSampleData, setUseSampleData] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'leads'>('analysis')

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setHistory(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Save history to localStorage
  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      // ignore
    }
  }, [])

  // Handle sample data toggle
  const handleToggleSampleData = useCallback(() => {
    setUseSampleData((prev) => {
      const next = !prev
      if (next) {
        setAnalysisResult(SAMPLE_REPORT)
        setView('results')
        setActiveHistoryId(null)
      } else {
        setAnalysisResult(null)
        setView('form')
      }
      return next
    })
  }, [])

  // Toggle segment selection
  const handleToggleSegment = useCallback((segment: string) => {
    setSelectedSegments((prev) =>
      prev.includes(segment)
        ? prev.filter((s) => s !== segment)
        : [...prev, segment]
    )
  }, [])

  // Run analysis
  const handleSubmit = useCallback(async () => {
    if (selectedSegments.length === 0) return

    setLoading(true)
    setError(null)
    setView('loading')
    setActiveAgentId(MANAGER_AGENT_ID)
    setUseSampleData(false)

    try {
      const selectedNames = selectedSegments.map((s) => SEGMENT_NAMES[s] ?? s).join(', ')
      const message = `Проведи комплексный анализ следующих клиентских сегментов для компании-разработчика мобильных приложений: ${selectedNames}. ${additionalContext ? `Дополнительный контекст: ${additionalContext}` : ''} Для каждого сегмента проанализируй: профиль клиента, типичные потребности, боли и проблемы, бюджетный диапазон, каналы привлечения, стратегию входа и рекомендации. Также предоставь сравнительный анализ сегментов, приоритетный рейтинг и общие стратегические рекомендации.`

      const result = await callAIAgent(message, MANAGER_AGENT_ID)
      const parsed = parseAnalysisResponse(result)

      if (parsed) {
        setAnalysisResult(parsed)

        const entry: HistoryEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          segments: [...selectedSegments],
          result: parsed,
        }
        saveHistory([entry, ...history].slice(0, 20))
        setActiveHistoryId(entry.id)
        setView('results')
      } else {
        setError('Не удалось обработать ответ. Попробуйте повторить запрос.')
        setView('form')
      }
    } catch (err: any) {
      setError(err?.message ?? 'Произошла ошибка при выполнении анализа.')
      setView('form')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [selectedSegments, additionalContext, history, saveHistory])

  // Select history entry
  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setAnalysisResult(entry.result)
    setActiveHistoryId(entry.id)
    setView('results')
    setUseSampleData(false)
    setError(null)
  }, [])

  // New analysis
  const handleNewAnalysis = useCallback(() => {
    setView('form')
    setAnalysisResult(null)
    setActiveHistoryId(null)
    setError(null)
    setUseSampleData(false)
  }, [])

  // Clear history
  const handleClearHistory = useCallback(() => {
    saveHistory([])
    setActiveHistoryId(null)
  }, [saveHistory])

  return (
    <ErrorBoundary>
      <div
        style={{
          ...THEME_VARS,
          background: 'linear-gradient(135deg, hsl(210 20% 97%) 0%, hsl(220 25% 95%) 35%, hsl(200 20% 96%) 70%, hsl(230 15% 97%) 100%)',
        }}
        className="min-h-screen flex"
      >
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((p) => !p)}
          history={history}
          onSelectHistory={handleSelectHistory}
          onNewAnalysis={handleNewAnalysis}
          onClearHistory={handleClearHistory}
          activeHistoryId={activeHistoryId}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto min-h-screen">
          <div className="px-6 py-8 md:px-12 md:py-10">
            {/* Tab Navigation */}
            <div className="max-w-[800px] mx-auto mb-8">
              <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'hsl(210 40% 94%)' }}>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === 'analysis' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                  )}
                  style={{ color: 'hsl(222 47% 11%)' }}
                >
                  <RiBarChartGroupedLine className="w-4 h-4" />
                  Анализ сегментов
                </button>
                <button
                  onClick={() => setActiveTab('leads')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === 'leads' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                  )}
                  style={{ color: 'hsl(222 47% 11%)' }}
                >
                  <RiUserSearchLine className="w-4 h-4" />
                  Поиск лидов
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'analysis' && (
              <>
                {view === 'form' || view === 'loading' ? (
                  <AnalysisForm
                    selectedSegments={selectedSegments}
                    onToggleSegment={handleToggleSegment}
                    additionalContext={additionalContext}
                    onContextChange={setAdditionalContext}
                    onSubmit={handleSubmit}
                    loading={view === 'loading'}
                    error={error}
                    onRetry={handleSubmit}
                    useSampleData={useSampleData}
                    onToggleSampleData={handleToggleSampleData}
                  />
                ) : view === 'results' && analysisResult ? (
                  <AnalysisResults
                    report={analysisResult}
                    onNewAnalysis={handleNewAnalysis}
                  />
                ) : null}
              </>
            )}

            {activeTab === 'leads' && (
              <LeadFinder
                activeAgentId={activeAgentId}
                onAgentActive={setActiveAgentId}
              />
            )}

            {/* Agent Status Footer */}
            <div className="max-w-[720px] mx-auto mt-12">
              <Separator className="mb-6" />
              <AgentStatus activeAgentId={activeAgentId} />
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
