export interface Fact {
  id: string
  content: string
  source: string
  confirmedAt: string
}

export interface UncertainInfo {
  id: string
  content: string
  status: '待核实' | '核实中' | '已排除'
  urgency: '高' | '中' | '低'
}

export interface ChecklistItem {
  id: string
  content: string
  priority: '紧急' | '重要' | '一般'
  type: '事实补齐' | '联系单位' | '核实传言'
  completed: boolean
}

export interface EventInfo {
  id: string
  name: string
  location: string
  time: string
  involvedUnits: string[]
  eventType: string
  casualtyLevel: string
  confirmedFacts: Fact[]
  uncertainInfo: UncertainInfo[]
  checklist: ChecklistItem[]
}

export interface SentimentItem {
  id: string
  channel: '媒体报道' | '短视频评论' | '社区论坛' | '投诉热线'
  title: string
  summary: string
  emotionLevel: 1 | 2 | 3 | 4 | 5
  tendency?: '客观' | '质疑' | '煽动'
  heat: number
  timestamp: string
  source?: string
}

export interface HighFreqQuestion {
  id: string
  content: string
  frequency: number
  emotionLevel: 1 | 2 | 3 | 4 | 5
  channels: string[]
}

export interface TemplateSentence {
  id: string
  content: string
  selected: boolean
  edited: boolean
  originalContent: string
}

export interface TemplateParagraph {
  title: string
  icon: string
  sentences: TemplateSentence[]
}

export interface ResponseTemplate {
  factStatement: TemplateParagraph
  soothingExpression: TemplateParagraph
  followUpMeasures: TemplateParagraph
}

export type Channel = '媒体报道' | '短视频评论' | '社区论坛' | '投诉热线'
