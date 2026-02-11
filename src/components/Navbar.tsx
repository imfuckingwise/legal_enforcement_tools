import { Scale } from 'lucide-react'

interface NavbarProps {
  currentSection: 'input' | 'output' | 'analysis' | 'case-pack'
  onSectionChange: (section: 'input' | 'output' | 'analysis' | 'case-pack') => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

export default function Navbar({ currentSection, onSectionChange, darkMode, onToggleDarkMode }: NavbarProps) {
  const sections = [
    { id: 'input' as const, label: '調證信息錄入', icon: '📝' },
    { id: 'output' as const, label: '調證結果輸出', icon: '📊' },
    { id: 'analysis' as const, label: '案件數據分析', icon: '📈' },
    { id: 'case-pack' as const, label: '案件整理打包', icon: '📦' },
  ]

  return (
    <nav className="navbar-glass">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Scale className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="text-base sm:text-xl font-bold text-gray-900 dark:text-white block">
                司法調證工具
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">v2.1</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`px-2 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-base font-medium transition-all duration-200
                  ${
                    currentSection === section.id
                      ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-500/25 border border-blue-400/20'
                      : 'bg-white/40 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 border border-gray-300/50 dark:border-gray-600/50'
                  } backdrop-blur-sm`}
              >
                <span className="sm:mr-2">{section.icon}</span>
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            ))}
            
            <button
              onClick={onToggleDarkMode}
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/40 dark:bg-gray-800/40 
                       hover:bg-white/60 dark:hover:bg-gray-800/60 
                       border border-gray-300/50 dark:border-gray-600/50
                       backdrop-blur-sm transition-all duration-200
                       hover:scale-105 active:scale-95"
              title={darkMode ? '切換淺色模式' : '切換深色模式'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
