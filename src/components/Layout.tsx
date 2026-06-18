import { NavLink, Outlet } from 'react-router-dom'
import { ClipboardList, Search, FileText, Shield } from 'lucide-react'
import { useStore } from '@/store/useStore'

const navItems = [
  { path: '/event-entry', label: '事件录入', icon: ClipboardList, step: 0 },
  { path: '/sentiment-scan', label: '舆情快扫', icon: Search, step: 1 },
  { path: '/response-draft', label: '回应草稿', icon: FileText, step: 2 },
]

export default function Layout() {
  const currentStep = useStore(s => s.currentStep)
  const eventName = useStore(s => s.event.name)

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-navy-900 flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber flex items-center justify-center">
              <Shield className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <h1 className="text-white font-serif font-semibold text-base leading-tight">应急回应辅助台</h1>
              <p className="text-navy-500 text-xs mt-0.5">突发事件口径整理系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <div className="px-4 mb-3">
            <p className="text-navy-500 text-xs font-medium uppercase tracking-wider">工作流程</p>
          </div>
          {navItems.map((item) => {
            const isActive = currentStep === item.step
            const isCompleted = currentStep > item.step
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={() => {
                  let cls = 'flex items-center gap-3 mx-3 my-1 px-4 py-3 rounded-lg text-sm transition-all duration-200 '
                  if (isActive) {
                    cls += 'bg-amber/10 text-amber border border-amber/20'
                  } else if (isCompleted) {
                    cls += 'text-emergency-green hover:bg-navy-800'
                  } else {
                    cls += 'text-navy-500 hover:bg-navy-800 hover:text-navy-500'
                  }
                  return cls
                }}
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isActive ? 'bg-amber/20' : isCompleted ? 'bg-emergency-green/10' : 'bg-navy-700'}`}>
                  {isCompleted ? (
                    <span className="text-emergency-green text-xs font-bold">✓</span>
                  ) : (
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-amber' : 'text-navy-500'}`} />
                  )}
                </div>
                <span className={`font-medium ${isActive ? 'text-amber' : isCompleted ? 'text-emergency-green' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-amber animate-pulse-amber" />
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-navy-700">
          <div className="bg-navy-800 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emergency-red animate-pulse" />
              <span className="text-xs text-amber font-medium">值班模式</span>
            </div>
            <p className="text-xs text-navy-500">当前事件：{eventName || '未录入'}</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-8 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              {navItems.map((item, idx) => (
                <div key={item.path} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs ${currentStep === item.step ? 'text-amber font-semibold' : currentStep > item.step ? 'text-emergency-green' : 'text-gray-400'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === item.step ? 'bg-amber text-navy-900' : currentStep > item.step ? 'bg-emergency-green/10 text-emergency-green' : 'bg-gray-100 text-gray-400'}`}>
                      {currentStep > item.step ? '✓' : idx + 1}
                    </span>
                    {item.label}
                  </div>
                  {idx < navItems.length - 1 && (
                    <div className={`w-8 h-px ${currentStep > idx ? 'bg-emergency-green' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-8 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
