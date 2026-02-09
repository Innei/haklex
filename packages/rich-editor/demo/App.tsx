import '../src/styles/index'
import './demo.css'

import { useEffect, useState } from 'react'

import { EditorPage } from './pages/EditorPage'
import { NodeShowcase } from './pages/NodeShowcase'
import { PresetsPage } from './pages/PresetsPage'

type Page = 'editor' | 'nodes' | 'presets'

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const hash = window.location.hash.slice(1) as Page
    return hash === 'nodes' || hash === 'presets' ? hash : 'editor'
  })

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Page
      const validPage = hash === 'nodes' || hash === 'presets' ? hash : 'editor'
      setCurrentPage(validPage)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (page: Page) => {
    window.location.hash = page
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div>
            <h1 className="app-title">@shiro/rich-editor</h1>
            <p className="app-subtitle">
              Lexical-based rich text editor & renderer
            </p>
          </div>
          <nav className="app-nav">
            <button
              className={
                currentPage === 'editor' ? 'nav-tab nav-tab-active' : 'nav-tab'
              }
              onClick={() => navigate('editor')}
            >
              Editor
            </button>
            <button
              className={
                currentPage === 'nodes' ? 'nav-tab nav-tab-active' : 'nav-tab'
              }
              onClick={() => navigate('nodes')}
            >
              Node Showcase
            </button>
            <button
              className={
                currentPage === 'presets' ? 'nav-tab nav-tab-active' : 'nav-tab'
              }
              onClick={() => navigate('presets')}
            >
              Presets
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'editor' && <EditorPage />}
        {currentPage === 'nodes' && <NodeShowcase />}
        {currentPage === 'presets' && <PresetsPage />}
      </main>
    </div>
  )
}
