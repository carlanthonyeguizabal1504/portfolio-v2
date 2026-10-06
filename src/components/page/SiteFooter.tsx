import { Link } from 'react-router'
import { site } from '@/content/site'
import './site-footer.css'

/** One quiet line under every page: the owner, and the two legal pages nothing else links to. */
export function SiteFooter() {
  return (
    <footer className="site-foot">
      <p>
        {site.name} · {site.brand}
      </p>
      <nav aria-label="Legal">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
        <Link to="/admin">Admin login</Link>
      </nav>
    </footer>
  )
}
