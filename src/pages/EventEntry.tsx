import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { Plus, Trash2, ChevronRight, ClipboardList, FileCheck, AlertTriangle, ListChecks, Save, RotateCcw, CheckCircle2 } from 'lucide-react'

const EVENT_TYPES = ['化学品泄漏', '火灾爆炸', '建筑坍塌', '交通安全', '自然灾害', '公共卫生', '其他']
const CASUALTY_LEVELS = ['无伤亡', '轻伤', '重伤', '死亡', '伤亡不明']

const priorityCls: Record<string, string> = {
  紧急: 'bg-red-50 text-red-600',
  重要: 'bg-amber-50 text-amber-600',
  一般: 'bg-gray-50 text-gray-500',
}
const statusCls: Record<string, string> = {
  待核实: 'bg-yellow-50 text-yellow-700',
  核实中: 'bg-blue-50 text-blue-700',
  已排除: 'bg-green-50 text-green-700',
}
const urgencyCls: Record<string, string> = {
  高: 'bg-red-50 text-red-600',
  中: 'bg-amber-50 text-amber-600',
  低: 'bg-gray-50 text-gray-500',
}

const inputBase = 'border border-gray-200 rounded-lg px-3 py-2 text-sm'

export default function EventEntry() {
  const navigate = useNavigate()
  const { event, setEvent, addFact, removeFact, addUncertainInfo, removeUncertainInfo, updateUncertainInfoStatus, generateChecklist, toggleChecklistItem, setCurrentStep, resetEvent } = useStore()

  const [unitsInput, setUnitsInput] = useState(event.involvedUnits.join(','))
  const [newFact, setNewFact] = useState({ content: '', source: '', confirmedAt: '' })
  const [newUncertain, setNewUncertain] = useState({ content: '', status: '待核实' as const, urgency: '中' as const })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleUnitsChange = (val: string) => {
    setUnitsInput(val)
    setEvent({ involvedUnits: val.split(',').map(s => s.trim()).filter(Boolean) })
  }

  const handleAddFact = () => {
    if (!newFact.content) return
    addFact(newFact)
    setNewFact({ content: '', source: '', confirmedAt: '' })
  }

  const handleAddUncertain = () => {
    if (!newUncertain.content) return
    addUncertainInfo(newUncertain)
    setNewUncertain({ content: '', status: '待核实', urgency: '中' })
  }

  const handleNext = () => {
    setCurrentStep(1)
    navigate('/sentiment-scan')
  }

  const titleCls = 'font-serif text-lg font-semibold text-navy-800 flex items-center gap-2 mb-4'

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-navy-800">事件录入</h2>
          <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emergency-green" /> 数据自动保存</span>
            {event.name && <span className="text-gray-300">|</span>}
            {event.name && <span>当前事件：{event.name}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-emergency-green flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 已保存</span>}
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-amber text-navy-900 rounded-lg text-sm font-medium hover:bg-amber-dark transition-colors">
            <Save className="w-4 h-4" /> 保存
          </button>
          <button onClick={() => { if (confirm('确认清空所有数据？此操作不可恢复。')) resetEvent() }} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-4 h-4" /> 重置
          </button>
        </div>
      </div>
      <section className="bg-white rounded-xl card-shadow p-5 animate-fade-in-up">
        <h2 className={titleCls}>
          <ClipboardList className="w-5 h-5 text-amber" />
          事件基本信息
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">事件名称</label>
            <input className={`${inputBase} w-full`} value={event.name} onChange={e => setEvent({ name: e.target.value })} placeholder="请输入事件名称" />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">发生地点</label>
            <input className={`${inputBase} w-full`} value={event.location} onChange={e => setEvent({ location: e.target.value })} placeholder="请输入地点" />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">发生时间</label>
            <input type="datetime-local" className={`${inputBase} w-full`} value={event.time} onChange={e => setEvent({ time: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">涉事单位</label>
            <input className={`${inputBase} w-full`} value={unitsInput} onChange={e => handleUnitsChange(e.target.value)} placeholder="多个单位用逗号分隔" />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">事件类型</label>
            <select className={`${inputBase} w-full`} value={event.eventType} onChange={e => setEvent({ eventType: e.target.value })}>
              <option value="">请选择</option>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">伤亡等级</label>
            <select className={`${inputBase} w-full`} value={event.casualtyLevel} onChange={e => setEvent({ casualtyLevel: e.target.value })}>
              <option value="">请选择</option>
              {CASUALTY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl card-shadow p-5 animate-fade-in-up">
        <h2 className={titleCls}>
          <FileCheck className="w-5 h-5 text-amber" />
          已确认事实
        </h2>
        <div className="space-y-3 mb-4">
          {event.confirmedFacts.map(f => (
            <div key={f.id} className="group relative border border-gray-100 rounded-lg p-3 hover:border-amber-200 transition-colors">
              <p className="text-sm text-navy-800">{f.content}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-400">
                <span>来源：{f.source}</span>
                <span>确认时间：{f.confirmedAt}</span>
              </div>
              <button onClick={() => removeFact(f.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className={`${inputBase} w-full`} placeholder="事实内容" value={newFact.content} onChange={e => setNewFact({ ...newFact, content: e.target.value })} />
          <input className={`${inputBase} w-full`} placeholder="信息来源" value={newFact.source} onChange={e => setNewFact({ ...newFact, source: e.target.value })} />
          <div className="flex gap-2">
            <input type="datetime-local" className={`${inputBase} flex-1`} value={newFact.confirmedAt} onChange={e => setNewFact({ ...newFact, confirmedAt: e.target.value })} />
            <button onClick={handleAddFact} className="text-amber hover:bg-amber-50 rounded-lg px-3 flex items-center gap-1 whitespace-nowrap text-sm">
              <Plus className="w-4 h-4" /> 添加
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl card-shadow p-5 animate-fade-in-up">
        <h2 className={titleCls}>
          <AlertTriangle className="w-5 h-5 text-amber" />
          待核实信息
        </h2>
        <div className="space-y-3 mb-4">
          {event.uncertainInfo.map(info => (
            <div key={info.id} className="group border border-gray-100 rounded-lg p-3 hover:border-amber-200 transition-colors">
              <div className="flex items-center gap-2">
                <p className="text-sm text-navy-800 flex-1">{info.content}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusCls[info.status]}`}>{info.status}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyCls[info.urgency]}`}>{info.urgency}</span>
                <button onClick={() => removeUncertainInfo(info.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <select className="mt-2 border border-gray-200 rounded px-2 py-0.5 text-xs" value={info.status} onChange={e => updateUncertainInfoStatus(info.id, e.target.value as '待核实' | '核实中' | '已排除')}>
                <option value="待核实">待核实</option>
                <option value="核实中">核实中</option>
                <option value="已排除">已排除</option>
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={`${inputBase} flex-1`} placeholder="待核实信息内容" value={newUncertain.content} onChange={e => setNewUncertain({ ...newUncertain, content: e.target.value })} />
          <select className={`${inputBase} w-24`} value={newUncertain.urgency} onChange={e => setNewUncertain({ ...newUncertain, urgency: e.target.value as '高' | '中' | '低' })}>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
          <button onClick={handleAddUncertain} className="text-amber hover:bg-amber-50 rounded-lg px-3 flex items-center gap-1 whitespace-nowrap text-sm">
            <Plus className="w-4 h-4" /> 添加
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl card-shadow p-5 animate-fade-in-up">
        <h2 className={titleCls}>
          <ListChecks className="w-5 h-5 text-amber" />
          处置清单
        </h2>
        {event.checklist.length > 0 ? (
          <div className="space-y-2 mb-4">
            {event.checklist.map(item => (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border border-gray-100 ${item.completed ? 'bg-gray-50' : ''}`}>
                <input type="checkbox" checked={item.completed} onChange={() => toggleChecklistItem(item.id)} className="accent-amber w-4 h-4" />
                <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-navy-800'}`}>{item.content}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityCls[item.priority]}`}>{item.priority}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{item.type}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-4">暂无清单项，请点击下方按钮生成</p>
        )}
        <button onClick={generateChecklist} className="bg-amber text-navy-900 rounded-lg px-6 py-2.5 font-medium hover:bg-amber-dark transition-colors">
          生成处置清单
        </button>
      </section>

      <div className="flex justify-end">
        <button onClick={handleNext} className="flex items-center gap-1 text-amber hover:text-amber-dark font-medium transition-colors">
          下一步：舆情快扫 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
