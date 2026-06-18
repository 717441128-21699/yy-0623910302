import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clipboard, Heart, Shield, ChevronDown, ChevronRight, Pencil, Trash2, Eye, FileDown, Printer, X, Check, Plus, ArrowLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { exportToDoc, printDraft } from '@/utils/exportDoc'
import type { ResponseTemplate, TemplateSentence } from '@/types'

const iconMap = { clipboard: Clipboard, heart: Heart, shield: Shield } as const
const paragraphKeys = ['factStatement', 'soothingExpression', 'followUpMeasures'] as const

function ParagraphSection({ paragraphKey }: { paragraphKey: keyof ResponseTemplate }) {
  const template = useStore(s => s.responseTemplate)
  const toggleSentence = useStore(s => s.toggleSentence)
  const editSentence = useStore(s => s.editSentence)
  const addSentence = useStore(s => s.addSentence)
  const removeSentence = useStore(s => s.removeSentence)

  const [expanded, setExpanded] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [adding, setAdding] = useState(false)
  const [newContent, setNewContent] = useState('')

  if (!template) return null
  const paragraph = template[paragraphKey]
  const Icon = iconMap[paragraph.icon as keyof typeof iconMap]

  const startEdit = (s: TemplateSentence) => {
    setEditingId(s.id)
    setEditContent(s.content)
  }

  const saveEdit = () => {
    if (editingId && editContent.trim()) {
      editSentence(paragraphKey, editingId, editContent.trim())
    }
    setEditingId(null)
    setEditContent('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const saveNew = () => {
    if (newContent.trim()) {
      addSentence(paragraphKey, newContent.trim())
      setNewContent('')
      setAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 border-l-4 border-amber hover:bg-gray-50 transition-colors"
      >
        <Icon className="w-5 h-5 text-amber" />
        <span className="font-serif font-semibold text-navy-800 text-base flex-1 text-left">{paragraph.title}</span>
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-4">
          {paragraph.sentences.map((sentence) => (
            <div key={sentence.id} className="flex items-start gap-3 py-2 hover:bg-gray-50 rounded-lg px-2 group">
              <button
                onClick={() => toggleSentence(paragraphKey, sentence.id)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${sentence.selected ? 'bg-amber border-amber' : 'border-gray-300 bg-white'}`}
              >
                {sentence.selected && <Check className="w-3 h-3 text-navy-900" />}
              </button>

              <div className="flex-1 min-w-0">
                {editingId === sentence.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full border border-amber/30 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-amber"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="px-3 py-1 bg-amber text-navy-900 text-xs rounded-md font-medium hover:bg-amber-dark transition-colors">保存</button>
                      <button onClick={cancelEdit} className="px-3 py-1 border border-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-50 transition-colors">取消</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 flex-1">{sentence.content}</span>
                    {sentence.edited && (
                      <span className="text-xs bg-amber/10 text-amber px-1.5 py-0.5 rounded flex-shrink-0">已修改</span>
                    )}
                  </div>
                )}
              </div>

              {editingId !== sentence.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => startEdit(sentence)} className="p-1.5 text-gray-400 hover:text-amber transition-colors rounded-md hover:bg-amber/5">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeSentence(paragraphKey, sentence.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {adding ? (
            <div className="mt-2 ml-7 space-y-2">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full border border-amber/30 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-amber"
                rows={3}
                placeholder="输入新句子..."
              />
              <div className="flex gap-2">
                <button onClick={saveNew} className="px-3 py-1 bg-amber text-navy-900 text-xs rounded-md font-medium hover:bg-amber-dark transition-colors">添加</button>
                <button onClick={() => { setAdding(false); setNewContent('') }} className="px-3 py-1 border border-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-50 transition-colors">取消</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="mt-2 ml-7 flex items-center gap-1.5 text-sm text-amber hover:text-amber-dark transition-colors py-1"
            >
              <Plus className="w-4 h-4" />
              添加句子
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function PreviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const template = useStore(s => s.responseTemplate)
  const eventName = useStore(s => s.event.name)

  if (!open || !template) return null

  const now = new Date()
  const timeStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif font-semibold text-navy-800 text-lg">预览草稿</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-8 py-6">
          <div className="text-center mb-6">
            <h3 className="font-serif text-xl font-bold text-navy-800 mb-2">突发事件回应口径（草稿）</h3>
            <p className="text-sm text-gray-500">事件：{eventName || '未命名事件'}</p>
            <p className="text-sm text-gray-500">生成时间：{timeStr}</p>
            <div className="border-t-2 border-amber mt-4" />
          </div>
          {paragraphKeys.map((key) => {
            const p = template[key]
            const selected = p.sentences.filter(s => s.selected)
            if (selected.length === 0) return null
            return (
              <div key={key} className="mb-5">
                <h4 className="font-serif font-semibold text-navy-800 text-base mb-2">{p.title}</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{selected.map(s => s.content).join('')}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ResponseDraft() {
  const navigate = useNavigate()
  const template = useStore(s => s.responseTemplate)
  const eventName = useStore(s => s.event.name)
  const generateResponse = useStore(s => s.generateResponse)
  const setCurrentStep = useStore(s => s.setCurrentStep)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleBack = () => {
    setCurrentStep(1)
    navigate('/sentiment-scan')
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="w-20 h-20 rounded-2xl bg-amber/10 flex items-center justify-center">
          <FileText className="w-10 h-10 text-amber" />
        </div>
        <div className="text-center">
          <h2 className="font-serif text-xl font-semibold text-navy-800 mb-2">生成回应草稿</h2>
          <p className="text-sm text-gray-500">基于事件信息和舆情分析，自动生成三段式回应口径草稿</p>
        </div>
        <button
          onClick={generateResponse}
          className="px-8 py-3 bg-amber text-navy-900 font-semibold rounded-xl hover:bg-amber-dark transition-colors shadow-lg shadow-amber/20"
        >
          生成回应草稿
        </button>
        <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mt-4">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-navy-800">回应草稿</h2>
          <p className="text-sm text-gray-500 mt-1">事件：{eventName || '未命名事件'}</p>
        </div>
        <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
      </div>

      <div className="space-y-4">
        {paragraphKeys.map((key) => (
          <ParagraphSection key={key} paragraphKey={key} />
        ))}
      </div>

      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-8 py-3 flex items-center gap-3 z-40">
        <button
          onClick={() => setPreviewOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber text-navy-900 rounded-lg font-medium hover:bg-amber-dark transition-colors"
        >
          <Eye className="w-4 h-4" />
          预览
        </button>
        <button
          onClick={() => exportToDoc(template, eventName)}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          导出Word
        </button>
        <button
          onClick={() => printDraft(template, eventName)}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          打印
        </button>
      </div>

      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div>
  )
}
