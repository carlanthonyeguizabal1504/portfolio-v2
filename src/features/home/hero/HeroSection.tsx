import { useRef } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from '@phosphor-icons/react'
import { homeHero } from '@/content/home'
import { useScrollScene } from '@/hooks/use-scroll-scene'
import { scrollToSection } from '@/lib/motion/smooth-scroll'
import { heroScene } from './hero-scene'
import './hero.css'

/**
 * Hero: a thin line over a bold one (Geist 100 / 700), centered and sized to the
 * content column, then a mono sub-head and one call to action. On scroll the two lines part and
 * sink back while the next section rises (hero-scene.ts on desktop, CSS scroll timeline on phones).
 * Each line sits in a `__layer` wrapper: the scroll motion moves the wrapper, the load entrance
 * animates the line, so the two never fight over one transform.
 */
export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  useScrollScene(ref, heroScene)

  return (
    <section ref={ref} id="top" className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="hero__title">
        <span className="hero__layer hero__layer--thin">
          <span className="hero__line hero__line--thin">{homeHero.headlineThin}</span>
        </span>
        <span className="hero__layer hero__layer--bold">
          <span className="hero__line hero__line--bold">{homeHero.headlineBold}</span>
        </span>
      </h1>

      <div className="hero__foot">
        <p className="hero__sub">{homeHero.subhead}</p>

        {/* Glides Home to the Contact section (a same-path link, so Lenis keeps its glide). */}
        <Link
          to={homeHero.cta.to}
          className="hero__cta btn-line"
          onClick={(event) => {
            // A new-tab click (Ctrl / Cmd / middle) keeps the link's own behaviour.
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
            const section = /^\/#([^/?#]+)$/.exec(homeHero.cta.to)?.[1]
            if (!section) return
            event.preventDefault()
            scrollToSection(section)
          }}
        >
          {homeHero.cta.label}
          <ArrowUpRight size={16} weight="bold" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
