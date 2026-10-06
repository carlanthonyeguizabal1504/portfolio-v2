import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './styles/index.css'
import { router } from './app/router'
import { personalize } from './content/personalize'
import { applyContent, snapshot, loadContent } from './lib/content-store'

personalize()
applyContent(snapshot())

function Portfolio() {
  const [version, setVersion] = useState(0)
  useEffect(() => {
    let alive = true
    void loadContent().then(changed => { if (changed && alive) setVersion(v => v + 1) })
    return () => { alive = false }
  }, [])
  return <RouterProvider key={version} router={router} />
}

// The static title + description in index.html are for crawlers that do not run JS; from here each route renders its own.
document.querySelectorAll('head > [data-static-meta]').forEach((el) => el.remove())

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root in index.html')

createRoot(root).render(
  <StrictMode>
    <Portfolio />
  </StrictMode>,
)
