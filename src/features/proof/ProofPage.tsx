import type { ReactNode } from 'react'
import { PageMeta } from '@/app/PageMeta'
import type { PageRoute } from '@/app/routes'
import { PageHeader } from '@/components/page/PageHeader'
import { clientAccounts, communityQuotes, proofPage, videoTestimonials } from '@/content/proof'
import { isoDay, proofJsonLd } from '@/lib/seo'
import { ClipPlayer } from './ClipPlayer'
import './proof.css'

const pad2 = (n: number) => String(n).padStart(2, '0')

/** One band of the ledger: a label that holds while its band scrolls by, the record beside it. */
function Band({ id, title, count, nested, children }: { id: string; title: string; count: string; nested: boolean; children: ReactNode }) {
  const H = nested ? 'h3' : 'h2'
  return (
    <section className="pf-band" aria-labelledby={id}>
      <div className="pf-band__label">
        <H id={id}>{title}</H>
        <span className="pg-mono">{count}</span>
      </div>
      <div className="pf-band__body">{children}</div>
    </section>
  )
}

/** The three bands. Nested = inside a Home section, so every heading steps down one level. */
function ProofLedger({ nested }: { nested: boolean }) {
  const c = proofPage
  const Role = nested ? 'h4' : 'h3'

  return (
    <div className="pf-ledger">
      {videoTestimonials.length > 0 && <Band id="pf-videos" title={c.bands.videos} count={`${pad2(videoTestimonials.length)} clips`} nested={nested}>
        <div className="pf-clips">
          {videoTestimonials.map((clip) => (
            <ClipPlayer key={clip.id} clip={clip} />
          ))}
        </div>
      </Band>}

      {communityQuotes.length > 0 && <Band id="pf-quotes" title={c.bands.quotes} count={`${pad2(communityQuotes.length)} notes`} nested={nested}>
        {communityQuotes.map((q) => (
          <blockquote key={q.name} className="pf-quote">
            <p>{q.text}</p>
            <footer>
              <cite>{q.name}</cite>
              <span className="pg-mono">{q.context}</span>
              <time className="pg-mono" dateTime={isoDay(q.date)}>
                {q.date}
              </time>
            </footer>
          </blockquote>
        ))}
      </Band>}

      <Band id="pf-clients" title={c.bands.clients} count={`${pad2(clientAccounts.length)} projects`} nested={nested}>
        {clientAccounts.map((a, i) => (
          <div key={a.label} className="pf-account">
            <span className="pf-key" data-blank={a.logo ? undefined : ''}>
              {a.logo ? <img src={a.logo.src} alt="" width={a.logo.width} height={a.logo.height} loading="lazy" decoding="async" /> : pad2(i + 1)}
            </span>
            <div>
              <Role>{a.role}</Role>
              <p className="pg-mono">{a.label}</p>
            </div>
            <div className="pf-account__work">
              <p>{a.work}</p>
              <ul className="pf-tags">
                {a.tags.map((t) => (
                  <li key={t} className="pg-mono">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </Band>
    </div>
  )
}

/**
 * Proof, "the ledger": three hairline bands to scan like a record,
 * the client clips, the community notes, the client accounts. Every quote is visible text with its
 * name, where it was said and its date, so answer engines can cite it.
 */
export function ProofPage({ page }: { page: PageRoute }) {
  const c = proofPage

  return (
    <div className="pg pf">
      <PageMeta page={page} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: proofJsonLd({ path: page.path, title: page.title, description: page.description, quotes: communityQuotes, videos: videoTestimonials }),
        }}
      />

      <PageHeader eyebrow={c.eyebrow} titleThin={c.titleThin} titleBold={c.titleBold} lede={c.lede} />
      <ProofLedger nested={false} />
    </div>
  )
}

/** The same ledger as a Home section after About (the sidebar Proof entry scrolls Home to #proof). */
export function ProofSection() {
  const c = proofPage

  return (
    <section id="proof" className="pg pg--section pf" aria-labelledby="proof-title">
      <PageHeader level={2} id="proof-title" eyebrow={c.eyebrow} titleThin={c.titleThin} titleBold={c.titleBold} lede={c.lede} />
      <ProofLedger nested />
    </section>
  )
}
