import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Newspaper, Video, MessageSquare, Phone, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useStore } from '@/store/useStore'
import type { SentimentItem, HighFreqQuestion } from '@/types'

type Channel = '媒体报道' | '短视频评论' | '社区论坛' | '投诉热线'

const channelConfig: { key: Channel; icon: typeof Newspaper; label: string }[] = [
  { key: '媒体报道', icon: Newspaper, label: '媒体报道' },
  { key: '短视频评论', icon: Video, label: '短视频评论' },
  { key: '社区论坛', icon: MessageSquare, label: '社区论坛' },
  { key: '投诉热线', icon: Phone, label: '投诉热线' },
]

const tendencyStyle: Record<string, string> = {
  '客观': 'bg-blue-100 text-blue-700',
  '质疑': 'bg-amber-100 text-amber-700',
  '煽动': 'bg-red-100 text-red-700',
}

function emotionColor(level: number) {
  if (level <= 2) return '#16A34A'
  if (level === 3) return '#F59E0B'
  return '#DC2626'
}

function emotionDots(level: number) {
  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: i < level ? emotionColor(level) : '#E5E7EB' }}
        />
      ))}
    </span>
  )
}

function MediaCard({ item }: { item: SentimentItem }) {
  return (
    <div className="bg-white card-shadow rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{item.source}</span>
        <div className="flex items-center gap-1 text-xs">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="font-semibold text-orange-500">{item.heat}</span>
        </div>
      </div>
      <h4 className="font-medium text-gray-900 mb-1.5">{item.title}</h4>
      <p className="text-sm text-gray-500 mb-3 leading-relaxed">{item.summary}</p>
      <div className="flex items-center justify-between">
        {item.tendency && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tendencyStyle[item.tendency]}`}>
            {item.tendency}
          </span>
        )}
        <span className="text-xs text-gray-400">{item.timestamp}</span>
      </div>
    </div>
  )
}

function ShortVideoContent({ items }: { items: SentimentItem[] }) {
  const keywords: { text: string; intensity: number }[] = [
    { text: '瞒报', intensity: 5 },
    { text: '救援迟缓', intensity: 4 },
    { text: '有毒', intensity: 5 },
    { text: '老人孩子', intensity: 3 },
    { text: '消防员', intensity: 2 },
    { text: '隐患', intensity: 4 },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="bg-white card-shadow rounded-xl p-5 mb-4">
        <h4 className="font-serif text-sm font-semibold text-gray-700 mb-4">高频词云</h4>
        <div className="flex flex-wrap items-center justify-center gap-4 py-4">
          {keywords.map((kw) => (
            <span
              key={kw.text}
              className="inline-block font-medium"
              style={{
                fontSize: `${0.875 + kw.intensity * 0.25}rem`,
                opacity: 0.4 + kw.intensity * 0.12,
                color: emotionColor(kw.intensity >= 4 ? 5 : kw.intensity >= 3 ? 3 : 1),
              }}
            >
              {kw.text}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white card-shadow rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{item.title}</h4>
              <div className="flex items-center gap-1 text-xs">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-semibold text-orange-500">{item.heat}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">{item.summary}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">情绪等级</span>
              {emotionDots(item.emotionLevel)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ForumContent({ items }: { items: SentimentItem[] }) {
  const sorted = [...items].sort((a, b) => b.heat - a.heat)
  return (
    <div className="animate-fade-in-up space-y-3">
      {sorted.map((item, idx) => (
        <div key={item.id} className="bg-white card-shadow rounded-xl p-5 flex gap-4">
          <div className="flex flex-col items-center justify-center w-14 flex-shrink-0">
            <span className="text-2xl font-bold" style={{ color: emotionColor(item.emotionLevel) }}>
              {item.heat}
            </span>
            <div className="w-10 h-1.5 rounded-full bg-gray-100 mt-1 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${item.heat}%`,
                  backgroundColor: emotionColor(item.emotionLevel),
                }}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
            <p className="text-sm text-gray-500">{item.summary}</p>
            <div className="flex items-center gap-2 mt-2">
              {emotionDots(item.emotionLevel)}
              <span className="text-xs text-gray-400">{item.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function HotlineContent({ items }: { items: SentimentItem[] }) {
  const pieData = [
    { name: '空气质量咨询', value: 52 },
    { name: '人员伤亡询问', value: 38 },
    { name: '疏散安置诉求', value: 31 },
    { name: '企业责任追究', value: 22 },
    { name: '其他', value: 13 },
  ]
  const colors = ['#2563EB', '#F59E0B', '#16A34A', '#DC2626', '#9CA3AF']

  return (
    <div className="animate-fade-in-up">
      <div className="bg-white card-shadow rounded-xl p-5 mb-4">
        <h4 className="font-serif text-sm font-semibold text-gray-700 mb-2">投诉分类占比</h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine fontSize={11}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white card-shadow rounded-xl p-5">
            <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
            <p className="text-sm text-gray-500 leading-relaxed">{item.summary}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-orange-500 font-semibold">{item.heat}</span>
              </div>
              <span>{item.timestamp}</span>
              {emotionDots(item.emotionLevel)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuestionBoard({ questions }: { questions: HighFreqQuestion[] }) {
  return (
    <div className="mt-8">
      <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4">高频质疑看板</h3>
      <div className="grid grid-cols-3 gap-4">
        {questions.map((q) => (
          <div
            key={q.id}
            className="bg-white card-shadow rounded-xl p-5"
            style={{ borderLeft: `4px solid ${emotionColor(q.emotionLevel)}` }}
          >
            <h4 className="font-medium text-gray-900 mb-2">{q.content}</h4>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${q.frequency}%`, backgroundColor: emotionColor(q.emotionLevel) }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {emotionDots(q.emotionLevel)}
                <span className="text-xs text-gray-400">频次 {q.frequency}</span>
              </div>
              <div className="flex gap-1">
                {q.channels.map((ch) => (
                  <span key={ch} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SentimentScan() {
  const [activeChannel, setActiveChannel] = useState<Channel>('媒体报道')
  const sentiments = useStore((s) => s.sentiments)
  const questions = useStore((s) => s.questions)
  const setCurrentStep = useStore((s) => s.setCurrentStep)
  const navigate = useNavigate()

  const filtered = sentiments.filter((s) => s.channel === activeChannel)
  const channelCounts: Record<Channel, number> = {
    '媒体报道': sentiments.filter((s) => s.channel === '媒体报道').length,
    '短视频评论': sentiments.filter((s) => s.channel === '短视频评论').length,
    '社区论坛': sentiments.filter((s) => s.channel === '社区论坛').length,
    '投诉热线': sentiments.filter((s) => s.channel === '投诉热线').length,
  }

  function handleNext() {
    setCurrentStep(2)
    navigate('/response-draft')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="font-serif text-2xl font-semibold text-gray-800 mb-6">舆情快扫</h2>

      <div className="flex border-b border-gray-200 mb-6">
        {channelConfig.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveChannel(key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeChannel === key
                ? 'border-amber text-amber'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeChannel === key ? 'bg-amber/10 text-amber' : 'bg-gray-100 text-gray-400'
            }`}>
              {channelCounts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="animate-fade-in-up">
        {activeChannel === '媒体报道' && (
          <div className="grid gap-4">
            {filtered.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        )}
        {activeChannel === '短视频评论' && <ShortVideoContent items={filtered} />}
        {activeChannel === '社区论坛' && <ForumContent items={filtered} />}
        {activeChannel === '投诉热线' && <HotlineContent items={filtered} />}
      </div>

      <QuestionBoard questions={questions} />

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-amber text-navy-900 font-semibold rounded-lg hover:bg-amber-dark transition-colors"
        >
          下一步：回应草稿
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
