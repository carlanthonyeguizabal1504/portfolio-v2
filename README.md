# Carl Anthony — Student Portfolio

Student portfolio adapted from [brewed-ops/portfoliov2-template](https://github.com/brewed-ops/portfoliov2-template). The original scroll scenes, floating sidebar, motion, project sheets, and responsive design are preserved.

## Edit your portfolio

Open **Admin login** at the bottom of the website or `#/admin`. Use your existing Supabase email and password. The account must be on `portfolio_v2_admins`; the database policies control write access.

The editor includes profile, hero, highlighted statement, projects and galleries, school details, skills, learning process, project spotlight, videos, contact copy, FAQs, and credits. Pictures can be uploaded as JPG, PNG, or WebP and are resized before saving. Videos use a direct MP4 URL. Changes save online in the existing `portfolio_v2_content` table and appear for visitors. Existing V2 payload fields are preserved.

**Export backup** downloads your complete draft. **Import backup** loads it into the editor; it only publishes after you save. Unsaved edits stay in the current editor until discarded or the page is closed.

In **Skills & tools → Skill logos**, upload the logo for each named skill. The same skill shares its logo across About and project cards; editing a repeated logo elsewhere also updates its other appearances. Previously uploaded logos in older backups are recovered automatically.

## Develop

Node 22.12+ or 24:

```sh
npm ci
npm run dev
npm run build
```

The source entry is `source-index.html`. The root `index.html` and static assets are the published build for GitHub Pages. After editing source, run `npm run build` then `npm run publish:files` to update the public files before committing. The site uses hash routing so shared project and admin links work without server rewrite rules.

## Mobile experience

Below 1024px, a floating section dock offers previous/next sections, a section picker, and back to top. It follows the section being read, respects reduced motion, and stays out of the way of menus, project details, and focused form fields. The process explorer and showcase use tap controls to reduce vertical scrolling. Skill cards stay in normal reading order; touch devices use a still background instead of the WebGL animation.

After building, run `node scripts/check-mobile-navigation.mjs` for responsive and navigation checks (Playwright Chromium required). The check covers narrow phones, tablets, landscape, modal focus, section jumps, project sheets, form clearance, and desktop resizing.

## Admin and security

Supabase validates the session and admin allowlist before saving. Database row-level security is the final authorization layer. No password or secret/service-role key is stored in the source. The publishable key is intentionally public. Sessions are kept in the current browser tab and refresh automatically. The editor prevents overwriting a newer edit from another tab.

The original template is licensed under PolyForm Noncommercial 1.0.0, with permission for personal portfolios. See LICENSE; font licenses are in public/fonts/.
