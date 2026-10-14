import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { ArrowUp, ArrowDown, ArrowLineUp, SquaresFour, X } from '@phosphor-icons/react'
import { useShell } from '@/app/shell-context'
import { pages } from '@/app/routes'
import { scrollToSection, setScrollLock } from '@/lib/motion/smooth-scroll'
import './section-navigator.css'

const sections = [
  { id: 'top', label: 'Home', detail: 'Start here' },
  { id: 'manifesto', label: 'My approach', detail: 'What drives my work' },
  { id: 'automation', label: 'My process', detail: 'From idea to submission' },
  { id: 'work', label: 'Projects', detail: 'Explore my work' },
  { id: 'services', label: 'Skills', detail: 'What I’m learning' },
  { id: 'about', label: 'About', detail: 'A little about me' },
  { id: 'proof', label: 'Learning log', detail: 'Practice & progress' },
  { id: 'showcase', label: 'Showcase', detail: 'A closer look' },
  { id: 'contact', label: 'Contact', detail: 'Say hello' },
]
const labelFor = (section: typeof sections[number]) => pages.find(p => p.section === section.id)?.label ?? section.label

/** A small thumb-reachable dock; the native dialog supplies focus containment and Escape. */
export function SectionNavigator() {
  const { pathname } = useLocation()
  const { drawerOpen, searchOpen } = useShell()
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const visible = pathname === '/' && !drawerOpen && !searchOpen

  useEffect(() => {
    if (pathname !== '/') return
    const targets = sections.map(s => document.getElementById(s.id))
    let tops: number[] = []
    let frame = 0
    const update = () => {
      frame = 0
      const point = window.scrollY + Math.min(160, window.innerHeight * 0.25)
      let index = 0
      tops.forEach((top, i) => { if (top <= point) index = i })
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) index = sections.length - 1
      setActive(index)
    }
    const measure = () => {
      tops = targets.map(t => t ? t.getBoundingClientRect().top + window.scrollY : Infinity)
      update()
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    const observer = new ResizeObserver(measure)
    targets.forEach(t => { if (t) observer.observe(t) })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    measure()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const element = dialog.current
    element?.showModal()
    setScrollLock(true)
    return () => {
      element?.close()
      setScrollLock(false)
    }
  }, [open])

  const close = () => {
    setOpen(false)
    trigger.current?.focus({ preventScroll: true })
  }
  const jump = (index: number) => {
    close()
    requestAnimationFrame(() => {
      const id = sections[index]!.id
      const target = document.getElementById(id)
      target?.setAttribute('tabindex', '-1')
      target?.focus({ preventScroll: true })
      scrollToSection(id)
    })
  }

  return (
    <>
      <nav className="section-dock" aria-label="Page sections" hidden={!visible}>
        <button type="button" onClick={() => jump(0)} aria-label="Back to top" title="Back to top">
          <ArrowLineUp size={19} aria-hidden />
        </button>
        <button type="button" onClick={() => jump(active - 1)} disabled={active === 0} aria-label="Previous section" title="Previous section">
          <ArrowUp size={18} aria-hidden />
        </button>
        <button ref={trigger} className="section-dock__picker" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-controls="section-picker">
          <span><SquaresFour size={13} aria-hidden /> Sections <span>{String(active + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}</span></span>
          <strong>{labelFor(sections[active]!)}</strong>
        </button>
        <button type="button" onClick={() => jump(active + 1)} disabled={active === sections.length - 1} aria-label="Next section" title="Next section">
          <ArrowDown size={18} aria-hidden />
        </button>
      </nav>
      <dialog ref={dialog} id="section-picker" className="section-picker" aria-labelledby="section-picker-title" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close() }}>
        <div className="section-picker__card">
          <header>
            <div><p>Explore the portfolio</p><h2 id="section-picker-title">Where to next?</h2></div>
            <button type="button" onClick={close} aria-label="Close sections"><X size={20} aria-hidden /></button>
          </header>
          <div className="section-picker__list">
            {sections.map((section, i) => (
              <button key={section.id} type="button" onClick={() => jump(i)} aria-current={active === i ? 'location' : undefined}>
                <span className="section-picker__number">{String(i + 1).padStart(2, '0')}</span>
                <span><strong>{labelFor(section)}</strong><small>{section.detail}</small></span>
                <span className="section-picker__dot" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </dialog>
    </>
  )
}
