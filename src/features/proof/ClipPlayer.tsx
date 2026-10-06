import { useState } from 'react'
import { Play } from '@phosphor-icons/react'
import type { VideoTestimonial } from '@/content/schema'

/**
 * A client clip that plays in place (fork "Play in place"): the poster and a play button until the
 * visitor taps, then the video with native controls. Nothing downloads before that. Starting one
 * clip pauses any other clip on the page.
 */
export function ClipPlayer({ clip }: { clip: VideoTestimonial }) {
  const [started, setStarted] = useState(false)
  const tall = clip.height > clip.width

  return (
    <figure className="pf-clip" data-shape={tall ? 'tall' : 'wide'}>
      <div className="pf-clip__player" style={{ aspectRatio: `${clip.width} / ${clip.height}` }}>
        {started ? (
          <video
            src={clip.src}
            poster={clip.poster}
            width={clip.width}
            height={clip.height}
            controls
            autoPlay
            playsInline
            preload="none"
            aria-label={clip.label}
            onPlay={(e) => {
              document.querySelectorAll<HTMLVideoElement>('.pf-clip video').forEach((v) => v !== e.currentTarget && v.pause())
            }}
          />
        ) : (
          <>
            <img src={clip.poster} alt="" width={clip.width} height={clip.height} loading="lazy" decoding="async" />
            <button type="button" className="pg-play" onClick={() => setStarted(true)} aria-label={`Play ${clip.label} (${clip.duration})`}>
              <Play size={22} weight="fill" aria-hidden />
            </button>
          </>
        )}
      </div>
      <figcaption>
        <span className="pg-mono">{clip.label}</span>
        <span className="pg-mono">{clip.duration}</span>
      </figcaption>
    </figure>
  )
}
