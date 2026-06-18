import { create } from 'zustand'
import type { EventInfo, Fact, UncertainInfo, ChecklistItem, SentimentItem, HighFreqQuestion, ResponseTemplate, TemplateParagraph, TemplateSentence } from '@/types'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

const defaultEvent: EventInfo = {
  id: '',
  name: '',
  location: '',
  time: new Date().toISOString().slice(0, 16),
  involvedUnits: [],
  eventType: '',
  casualtyLevel: '',
  confirmedFacts: [],
  uncertainInfo: [],
  checklist: [],
}

const mockSentiments: SentimentItem[] = [
  { id: 's1', channel: '媒体报道', title: '新京报：某化工厂爆炸致3人受伤', summary: '据新京报报道，今日凌晨2时许，某市化工园区内一化工厂发生爆炸，目前已造成3人受伤，周边2公里范围内居民已紧急疏散。', emotionLevel: 3, tendency: '客观', heat: 89, timestamp: '2026-06-19 02:45', source: '新京报' },
  { id: 's2', channel: '媒体报道', title: '央视新闻：应急管理部门已赶赴现场', summary: '据央视新闻报道，事故发生后，市应急管理局、消防支队已第一时间赶赴现场处置，目前火势已得到控制。', emotionLevel: 2, tendency: '客观', heat: 95, timestamp: '2026-06-19 03:10', source: '央视新闻' },
  { id: 's3', channel: '媒体报道', title: '某自媒体：爆炸真相疑被掩盖', summary: '有自媒体发文质疑官方通报伤亡数字，声称实际伤亡人数远超通报，但未提供可靠信源。', emotionLevel: 4, tendency: '煽动', heat: 72, timestamp: '2026-06-19 03:30', source: '某自媒体' },
  { id: 's4', channel: '媒体报道', title: '澎湃新闻：环保部门监测空气质量', summary: '澎湃新闻报道，市生态环境局已在事发地周边设置3个空气质量监测点，实时监测VOCs等指标。', emotionLevel: 2, tendency: '客观', heat: 67, timestamp: '2026-06-19 03:50', source: '澎湃新闻' },
  { id: 's5', channel: '短视频评论', title: '爆炸现场视频评论区', summary: '大量用户评论质疑"为什么凌晨才报道""是不是瞒报了""空气有毒为什么不说"', emotionLevel: 5, heat: 96, timestamp: '2026-06-19 03:00' },
  { id: 's6', channel: '短视频评论', title: '居民拍到的疏散画面', summary: '评论区集中在"救援太慢""半小时后才来车""老人孩子怎么办"，情绪激动', emotionLevel: 5, heat: 88, timestamp: '2026-06-19 03:20' },
  { id: 's7', channel: '短视频评论', title: '消防员灭火现场', summary: '多数评论表达对消防员的敬意，但也有部分质疑"为什么不早发现隐患"', emotionLevel: 3, heat: 75, timestamp: '2026-06-19 04:00' },
  { id: 's8', channel: '社区论坛', title: '为什么化工园区离居民区这么近？', summary: '天涯社区热帖，讨论化工园区规划问题，质疑审批流程，引发对政府监管的广泛质疑。', emotionLevel: 4, heat: 82, timestamp: '2026-06-19 03:15' },
  { id: 's9', channel: '社区论坛', title: '这次爆炸到底死了多少人？', summary: '知乎问题帖，大量回答质疑官方通报数字，要求公布完整监控视频。', emotionLevel: 5, heat: 91, timestamp: '2026-06-19 03:40' },
  { id: 's10', channel: '社区论坛', title: '化工园区安全隐患早有投诉', summary: '豆瓣帖子爆料称去年就有居民投诉异味和安全隐患，但未获回应。', emotionLevel: 4, heat: 68, timestamp: '2026-06-19 04:10' },
  { id: 's11', channel: '投诉热线', title: '12345热线投诉分类', summary: '截至04:00，12345热线共接到相关来电156通，其中：空气质量咨询52通、人员伤亡询问38通、疏散安置诉求31通、企业责任追究22通、其他13通。', emotionLevel: 3, heat: 70, timestamp: '2026-06-19 04:00' },
  { id: 's12', channel: '投诉热线', title: '紧急诉求集中点', summary: '居民主要诉求：1. 要求公开实时空气监测数据；2. 要求公布伤亡人员名单；3. 要求明确返回家园时间；4. 要求企业承担安置费用。', emotionLevel: 3, heat: 65, timestamp: '2026-06-19 04:15' },
]

const mockQuestions: HighFreqQuestion[] = [
  { id: 'q1', content: '是否瞒报伤亡人数？', frequency: 87, emotionLevel: 5, channels: ['媒体报道', '短视频评论', '社区论坛'] },
  { id: 'q2', content: '救援是否迟缓？出警时间多长？', frequency: 76, emotionLevel: 4, channels: ['短视频评论', '社区论坛', '投诉热线'] },
  { id: 'q3', content: '责任人是谁？企业还是监管部门？', frequency: 72, emotionLevel: 4, channels: ['社区论坛', '媒体报道'] },
  { id: 'q4', content: '空气质量是否安全？为什么不公布数据？', frequency: 68, emotionLevel: 4, channels: ['投诉热线', '短视频评论', '社区论坛'] },
  { id: 'q5', content: '化工园区规划是否合规？为何临近居民区？', frequency: 61, emotionLevel: 3, channels: ['社区论坛', '媒体报道'] },
  { id: 'q6', content: '之前的安全投诉为什么没处理？', frequency: 55, emotionLevel: 3, channels: ['社区论坛', '投诉热线'] },
]

function generateChecklist(event: EventInfo): ChecklistItem[] {
  const items: ChecklistItem[] = []
  if (!event.name) return items

  if (event.confirmedFacts.length === 0) {
    items.push({ id: generateId(), content: '确认事件基本事实（时间、地点、原因、伤亡）', priority: '紧急', type: '事实补齐', completed: false })
  }
  if (!event.casualtyLevel) {
    items.push({ id: generateId(), content: '核实并确认人员伤亡等级', priority: '紧急', type: '事实补齐', completed: false })
  }
  if (event.involvedUnits.length === 0) {
    items.push({ id: generateId(), content: '确认涉事单位及主体责任单位', priority: '紧急', type: '联系单位', completed: false })
  }
  items.push({ id: generateId(), content: '联系120急救中心确认伤员收治情况', priority: '紧急', type: '联系单位', completed: false })
  items.push({ id: generateId(), content: '联系生态环境局获取空气监测数据', priority: '重要', type: '联系单位', completed: false })
  items.push({ id: generateId(), content: '联系涉事企业获取事故初步原因', priority: '重要', type: '联系单位', completed: false })

  if (event.uncertainInfo.length > 0) {
    event.uncertainInfo.forEach(info => {
      if (info.status === '待核实') {
        items.push({ id: generateId(), content: `核实传言：${info.content}`, priority: info.urgency === '高' ? '紧急' : info.urgency === '中' ? '重要' : '一般', type: '核实传言', completed: false })
      }
    })
  }

  items.push({ id: generateId(), content: '核实现场视频/图片真实性', priority: '重要', type: '核实传言', completed: false })
  items.push({ id: generateId(), content: '确认疏散范围及安置点信息', priority: '重要', type: '事实补齐', completed: false })

  return items
}

function generateResponseTemplate(event: EventInfo, questions: HighFreqQuestion[]): ResponseTemplate {
  const factSentences: TemplateSentence[] = [
    { id: generateId(), content: `${event.time || '今日'}，${event.location || '某地'}发生${event.eventType || '突发事件'}。`, selected: true, edited: false, originalContent: `${event.time || '今日'}，${event.location || '某地'}发生${event.eventType || '突发事件'}。` },
    { id: generateId(), content: `经初步核实，${event.confirmedFacts.length > 0 ? event.confirmedFacts.map(f => f.content).join('；') : '事故原因正在调查中'}。`, selected: true, edited: false, originalContent: `经初步核实，${event.confirmedFacts.length > 0 ? event.confirmedFacts.map(f => f.content).join('；') : '事故原因正在调查中'}。` },
    { id: generateId(), content: `目前，${event.casualtyLevel || '人员伤亡情况正在核实中'}。`, selected: true, edited: false, originalContent: `目前，${event.casualtyLevel || '人员伤亡情况正在核实中'}。` },
    { id: generateId(), content: `事故现场已实施交通管制和人员疏散，相关处置工作正在紧张进行。`, selected: true, edited: false, originalContent: `事故现场已实施交通管制和人员疏散，相关处置工作正在紧张进行。` },
  ]

  const soothingSentences: TemplateSentence[] = [
    { id: generateId(), content: '我们对事故给公众带来的不安深表歉意，每一位市民的安全是我们最关心的事。', selected: true, edited: false, originalContent: '我们对事故给公众带来的不安深表歉意，每一位市民的安全是我们最关心的事。' },
    { id: generateId(), content: '请广大市民不信谣、不传谣，以官方发布信息为准。', selected: true, edited: false, originalContent: '请广大市民不信谣、不传谣，以官方发布信息为准。' },
    { id: generateId(), content: '我们理解公众对伤亡数字的关切，一旦核实确认将第一时间公布。', selected: questions.some(q => q.content.includes('瞒报')), edited: false, originalContent: '我们理解公众对伤亡数字的关切，一旦核实确认将第一时间公布。' },
    { id: generateId(), content: '针对部分网络传言，我们正在加紧核实，请以官方通报为准。', selected: true, edited: false, originalContent: '针对部分网络传言，我们正在加紧核实，请以官方通报为准。' },
  ]

  const measureSentences: TemplateSentence[] = [
    { id: generateId(), content: '已成立事故调查组，将依法依规严肃追究相关责任。', selected: true, edited: false, originalContent: '已成立事故调查组，将依法依规严肃追究相关责任。' },
    { id: generateId(), content: '已安排专业人员对周边环境进行持续监测，监测数据将实时公开。', selected: questions.some(q => q.content.includes('空气')), edited: false, originalContent: '已安排专业人员对周边环境进行持续监测，监测数据将实时公开。' },
    { id: generateId(), content: '疏散群众已得到妥善安置，生活物资供应充足。', selected: true, edited: false, originalContent: '疏散群众已得到妥善安置，生活物资供应充足。' },
    { id: generateId(), content: '下一步将开展安全隐患全面排查，坚决防止类似事故再次发生。', selected: true, edited: false, originalContent: '下一步将开展安全隐患全面排查，坚决防止类似事故再次发生。' },
    { id: generateId(), content: '我们将持续通报事故处置进展，接受社会监督。', selected: true, edited: false, originalContent: '我们将持续通报事故处置进展，接受社会监督。' },
  ]

  return {
    factStatement: { title: '事实说明', icon: 'clipboard', sentences: factSentences },
    soothingExpression: { title: '安抚表述', icon: 'heart', sentences: soothingSentences },
    followUpMeasures: { title: '后续措施', icon: 'shield', sentences: measureSentences },
  }
}

interface StoreState {
  event: EventInfo
  sentiments: SentimentItem[]
  questions: HighFreqQuestion[]
  responseTemplate: ResponseTemplate | null
  currentStep: number
  setEvent: (event: Partial<EventInfo>) => void
  addFact: (fact: Omit<Fact, 'id'>) => void
  removeFact: (id: string) => void
  addUncertainInfo: (info: Omit<UncertainInfo, 'id'>) => void
  removeUncertainInfo: (id: string) => void
  updateUncertainInfoStatus: (id: string, status: UncertainInfo['status']) => void
  generateChecklist: () => void
  toggleChecklistItem: (id: string) => void
  generateResponse: () => void
  toggleSentence: (paragraphKey: keyof ResponseTemplate, sentenceId: string) => void
  editSentence: (paragraphKey: keyof ResponseTemplate, sentenceId: string, content: string) => void
  addSentence: (paragraphKey: keyof ResponseTemplate, content: string) => void
  removeSentence: (paragraphKey: keyof ResponseTemplate, sentenceId: string) => void
  setCurrentStep: (step: number) => void
}

export const useStore = create<StoreState>((set, get) => ({
  event: defaultEvent,
  sentiments: mockSentiments,
  questions: mockQuestions,
  responseTemplate: null,
  currentStep: 0,

  setEvent: (partial) => set((state) => ({ event: { ...state.event, ...partial } })),

  addFact: (fact) => set((state) => ({
    event: { ...state.event, confirmedFacts: [...state.event.confirmedFacts, { ...fact, id: generateId() }] }
  })),

  removeFact: (id) => set((state) => ({
    event: { ...state.event, confirmedFacts: state.event.confirmedFacts.filter(f => f.id !== id) }
  })),

  addUncertainInfo: (info) => set((state) => ({
    event: { ...state.event, uncertainInfo: [...state.event.uncertainInfo, { ...info, id: generateId() }] }
  })),

  removeUncertainInfo: (id) => set((state) => ({
    event: { ...state.event, uncertainInfo: state.event.uncertainInfo.filter(i => i.id !== id) }
  })),

  updateUncertainInfoStatus: (id, status) => set((state) => ({
    event: {
      ...state.event,
      uncertainInfo: state.event.uncertainInfo.map(i => i.id === id ? { ...i, status } : i)
    }
  })),

  generateChecklist: () => {
    const checklist = generateChecklist(get().event)
    set((state) => ({ event: { ...state.event, checklist } }))
  },

  toggleChecklistItem: (id) => set((state) => ({
    event: {
      ...state.event,
      checklist: state.event.checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    }
  })),

  generateResponse: () => {
    const template = generateResponseTemplate(get().event, get().questions)
    set({ responseTemplate: template })
  },

  toggleSentence: (paragraphKey, sentenceId) => set((state) => {
    if (!state.responseTemplate) return state
    const paragraph = state.responseTemplate[paragraphKey] as TemplateParagraph
    return {
      responseTemplate: {
        ...state.responseTemplate,
        [paragraphKey]: {
          ...paragraph,
          sentences: paragraph.sentences.map(s =>
            s.id === sentenceId ? { ...s, selected: !s.selected } : s
          )
        }
      }
    }
  }),

  editSentence: (paragraphKey, sentenceId, content) => set((state) => {
    if (!state.responseTemplate) return state
    const paragraph = state.responseTemplate[paragraphKey] as TemplateParagraph
    return {
      responseTemplate: {
        ...state.responseTemplate,
        [paragraphKey]: {
          ...paragraph,
          sentences: paragraph.sentences.map(s =>
            s.id === sentenceId ? { ...s, content, edited: content !== s.originalContent } : s
          )
        }
      }
    }
  }),

  addSentence: (paragraphKey, content) => set((state) => {
    if (!state.responseTemplate) return state
    const paragraph = state.responseTemplate[paragraphKey] as TemplateParagraph
    return {
      responseTemplate: {
        ...state.responseTemplate,
        [paragraphKey]: {
          ...paragraph,
          sentences: [...paragraph.sentences, { id: generateId(), content, selected: true, edited: false, originalContent: content }]
        }
      }
    }
  }),

  removeSentence: (paragraphKey, sentenceId) => set((state) => {
    if (!state.responseTemplate) return state
    const paragraph = state.responseTemplate[paragraphKey] as TemplateParagraph
    return {
      responseTemplate: {
        ...state.responseTemplate,
        [paragraphKey]: {
          ...paragraph,
          sentences: paragraph.sentences.filter(s => s.id !== sentenceId)
        }
      }
    }
  }),

  setCurrentStep: (step) => set({ currentStep: step }),
}))
