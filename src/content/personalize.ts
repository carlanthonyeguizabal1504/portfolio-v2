import rows from './imported.json'
import { site, certification, socials, externalLinks } from './site'
import { homeHero, homeManifesto, homeSections, ctaBand, workSection, workChapters } from './home'
import { aboutSection, capabilities, credentials } from './about'
import { servicesSection, servicesPage, services } from './services'
import { liveAutomation } from './automation'
import { method } from './method'
import { proofPage, clientAccounts, videoTestimonials, communityQuotes } from './proof'
import { showcasePage, showcaseFilm, showcaseStats, productTabs, showcaseFaq } from './showcase'
import { contactPage, contactForm } from './contact'
import { faqs, allFaqs } from './faqs'
import { tools, dailyTools } from './tools'
import { privacyPolicy, termsOfService } from './legal'
import { pages, externals } from '@/app/routes'

export function replace(target: unknown, value: unknown) {
  if (Array.isArray(target) && Array.isArray(value)) target.splice(0, target.length, ...value)
  else if (target && value && typeof target === 'object' && typeof value === 'object') Object.assign(target, value)
}

export function personalize() {
  const profile = JSON.parse(rows.find(r => r.type === 'PortfolioProfile')?.description || '{}')
  const photo = profile.imageUrl || '/profile.jpg'
  const projects = rows.filter(r => ['Activity', 'Project'].includes(r.type))
  const hobbies = rows.filter(r => r.type === 'PortfolioHobby')
  const skillRows = rows.filter(r => r.type === 'Skill')
  const picture = (src: string, alt: string) => ({ src, alt, width: 1600, height: 1000 })
  const clinic = projects.find(r => r.type === 'Project')!
  const github = 'https://github.com/carlanthonyeguizabal1504'
  replace(site, { name: 'Carl Anthony Eguizabal', brand: 'Carl Anthony', brandParts: ['Carl', 'Anthony'], role: '2nd-year BSIT student', email: 'eguizabalcarl77@gmail.com', emailSubject: 'Hello, Carl!', replyPromise: 'I’ll reply when I’m free from class.', location: 'Philippines', countryCode: 'PH', timeZone: 'Asia/Manila', timePlace: 'in the Philippines', url: 'https://carlanthonyeguizabal1504.github.io/portfolio-v2', avatar: picture(photo, 'Carl Anthony Eguizabal'), avatarSmall: photo, logo: { light: '/ca-navbar-logo.png', dark: '/ca-navbar-logo.png', headerLight: '/ca-navbar-logo.png', headerDark: '/ca-navbar-logo.png' } })
  replace(certification, { title: 'BSIT · 2nd Year', detail: profile.school, issuer: profile.school, href: github })
  replace(socials, [{ label: 'GitHub', href: github, external: true, icon: 'github' }, { label: 'Facebook', href: 'https://www.facebook.com/kal.el.666172', external: true, icon: 'facebook' }])
  replace(externalLinks, { resource: github, showcase: clinic.evidence_url, company: github })
  replace(homeHero, { headlineThin: 'Still learning.', headlineBold: 'Always building.', subhead: 'I’m Carl, a BSIT student turning school projects into things you can actually use.', cta: { label: 'Say hello', to: '/#contact' } })
  replace(homeManifesto, { eyebrow: 'The way I learn', parts: ['Every project starts with', { key: 'curiosity.' }, 'I make room to', { key: 'experiment,' }, 'learn from what breaks,', { key: 'improve' }, 'the small details, and keep', { key: 'building.' }] })
  replace(homeSections, { work: { eyebrow: 'Selected projects', title: 'From the classroom to the browser.' }, proof: { eyebrow: 'Learning log', title: 'Progress you can open.' }, objections: { eyebrow: 'Before you write', title: 'A few quick answers.' } })
  replace(ctaBand, { title: 'Have an idea for a school project?', body: 'Let’s talk about it, compare notes, and learn something new.', button: 'Email me' })
  replace(workSection, { eyebrow: 'Selected projects', titleThin: 'Made for class.', titleBold: 'Built to explore.', all: { label: `Explore ${projects.length} projects`, to: '/work' } })
  const marks = Object.values(tools)
  skillRows.forEach((s, i) => { if (marks[i]) replace(marks[i], { name: s.title }) })
  replace(dailyTools, marks.slice(0, skillRows.length))
  const item = (r: typeof clinic, i: number) => ({ id: `project-${i}`, name: r.title, kicker: r.type === 'Project' ? 'School project' : 'Class activity', summary: `${r.description}. ${r.learnings ? 'What I learned: ' + r.learnings + '.' : 'An exercise in turning a classroom task into a working web page.'}`, image: picture(r.thumbnail_url, r.title), href: r.evidence_url, stack: r.tools, status: 'Live' })
  const chapters = [
    { id: 'featured', title: clinic.title, line: 'My HCI project, live in the browser.', count: 1, unit: 'project', description: 'A clinic appointment website created for my Human–Computer Interaction project.', lead: picture(clinic.thumbnail_url, clinic.title), gallery: [picture(clinic.thumbnail_url, clinic.title)], link: { label: 'Open the project', href: clinic.evidence_url, external: true }, items: [], marks: marks.slice(0, 3) },
    { id: 'case-studies', title: 'Class Activities', line: 'Small briefs. Real working pages.', count: projects.length - 1, unit: 'activities', description: 'My IT Elective activities, from favorite songs to an Avengers hub.', items: projects.filter(r => r !== clinic).map(item), marks: marks.slice(0, 3) },
    { id: 'process', title: 'Learning Process', line: 'Understand, experiment, improve.', count: 3, unit: 'steps', description: 'How I turn an assignment into a finished project.', items: [{ id: 'understand', name: 'Understand the brief', kicker: '01 · Plan', summary: 'Read the task, work out what the page needs, and sketch a first layout.' }, { id: 'build', name: 'Build and try', kicker: '02 · Create', summary: 'Start with the basics, try the page in a browser, and learn from mistakes.' }, { id: 'improve', name: 'Refine and share', kicker: '03 · Improve', summary: 'Check the spacing, links, and mobile layout before publishing.' }], marks: marks.slice(0, 2) },
    { id: 'screens', title: 'Project Screens', line: 'A closer look at what I’ve made.', count: projects.length, unit: 'screens', description: 'Screens and previews from my school projects.', items: projects.map(item), marks: marks.slice(0, 3) },
    { id: 'websites', title: 'Live Websites', line: 'Open a project and try it yourself.', count: projects.length, unit: 'sites', description: 'All of my published school websites in one place.', items: projects.map(item), marks: marks.slice(0, 3) },
    { id: 'apps', title: 'Design & Code', line: 'The tools I’m learning right now.', count: skillRows.length, unit: 'skills', description: 'An honest look at my current skills and learning progress.', items: skillRows.map((s,i) => ({ id: `skill-${i}`, name: s.title, kicker: s.description, summary: `I’m developing my ${s.title} skills through school activities and personal practice.` })), marks: marks.slice(0, 3) },
    { id: 'side-projects', title: 'Beyond the Screen', line: 'Cycling, gaming, music, and design.', count: hobbies.length, unit: 'interests', description: 'The things that help me reset and stay curious.', items: hobbies.map((h,i) => ({ id: `hobby-${i}`, name: h.title, kicker: 'Outside class', summary: h.description || 'Exploring ideas and learning something new.', image: picture(h.thumbnail_url, h.title) })), marks: marks.slice(0, 2) },
    { id: 'experiments', title: 'How I Work', line: 'Learning a little more with each build.', count: 4, unit: 'habits', description: 'The habits I bring into my projects.', items: rows.filter(r => r.type === 'PortfolioWorkingStyle').map((r,i) => ({ id: `habit-${i}`, name: r.title, kicker: 'Working style', summary: r.description })), marks: marks.slice(0, 2) },
  ]
  replace(workChapters, chapters)
  replace(aboutSection, { eyebrow: 'About me', titleThin: 'Hi, I’m', titleBold: 'Carl Anthony.', lede: 'A student, a curious maker, and a work in progress.', lead: profile.about, leadQuiet: 'This is where I keep the things I’m learning along the way.', picture: picture(photo, 'Carl Anthony Eguizabal'), note: { company: 'I study at ' + profile.school, product: { label: 'my projects', href: github }, rest: 'are part of that learning journey.' } })
  replace(capabilities, skillRows.map((r,i) => ({ title: `${r.title} · ${r.description}`, tools: [marks[i % marks.length]] })))
  replace(credentials, [{ id: 'cert', title: profile.school, detail: profile.program }, { id: 'place', title: 'Section ' + profile.section, detail: 'IT Elective 1' }, { id: 'community', title: 'Professor', detail: profile.professor }, { id: 'partner', title: 'Outside class', detail: 'Cycling · Gaming · Music · Web design' }])
  replace(method, { eyebrow: 'My process', title: 'Understand. Build. Improve.', summary: 'Start with the brief, experiment with a first version, and refine what needs work.', steps: [{ name: 'Understand', body: 'Read the task and sketch the first idea.', inputs: ['Brief', 'Research', 'Sketch'] }, { name: 'Build', body: 'Turn that idea into a working page.', inputs: ['Layout', 'Code', 'Test'] }, { name: 'Improve', body: 'Listen to feedback, fix issues, and share.', inputs: ['Feedback', 'Polish', 'Publish'] }] })
  replace(liveAutomation, { eyebrow: 'From idea to submission', titleThin: 'Understand. Build.', titleBold: 'Improve.', steps: method.steps, panel: { lead: 'Idea to', rest: 'Finished Project' }, legend: { auto: 'Build & check', lead: 'Learning path' }, zones: { booking: 'Classroom', pipeline: 'Project workflow' }, connected: 'Learning in progress' })
  const stages = [['Assignment','Read the brief'],['Research','Gather references'],['Plan','Sketch the layout'],['Build','Write the code'],['Test','Try the interaction'],['Review','Check the result'],['Refine','Apply feedback'],['Revisit','Try another idea'],['Rethink','Start a new approach'],['Submit','Share the project'],['Practice','Keep learning']]
  liveAutomation.nodes.forEach((n,i) => replace(n, { title: stages[i]![0], tag: stages[i]![1], about: stages[i]![1] + ' and learn from the result.' }))
  liveAutomation.links.forEach(l => { if (l.label) l.label = 'Try again' })
  replace(servicesPage, { eyebrow: 'What I’m learning', title: 'Skills I’m building, one project at a time.', lede: 'School projects are where I put these skills into practice.' })
  replace(servicesSection, { eyebrow: 'Skills in practice', titleThin: 'Learn the basics.', titleBold: 'Make them work.', explore: 'See projects' })
  const learning = [['Web Design','Creating layouts that are clear and easy to use.','Clean layouts',['Layout and spacing','Readable typography','Responsive pages']],['Front-end Development','Turning a design into a working web page.','Working pages',['HTML structure','CSS styling','JavaScript interaction']],['UI Prototyping','Trying an interface before writing the code.','Clickable ideas',['Figma wireframes','User flows','Reusable components']],['Problem Solving','Breaking a confusing task into smaller steps.','Clearer solutions',['Read the problem','Test one idea','Refine the result']],['Project Practice','Keeping progress visible and sharing what I learn.','Steady progress',['GitHub basics','Class activities','Feedback and iteration']]]
  services.forEach((s,i) => replace(s, { title: learning[i]![0], summary: learning[i]![1], outcome: learning[i]![2], bullets: learning[i]![3], tools: marks.slice(i % 3, i % 3 + 3) }))
  replace(proofPage, { eyebrow: 'Learning log', titleThin: 'Practice makes', titleBold: 'progress visible.', lede: 'Actual school activities and projects, with links you can open. Each one taught me something new.', bands: { videos: 'Project clips', quotes: 'Learning notes', clients: 'School projects' } })
  replace(videoTestimonials, [])
  replace(communityQuotes, [])
  replace(clientAccounts, projects.map(r => ({ label: r.type === 'Project' ? 'HCI Project' : 'IT Elective Activity', role: r.title, work: r.description + ' · ' + r.completed_on, tags: r.tools.split(',').map(t => t.trim()) })))
  replace(showcasePage, { eyebrow: 'Project spotlight', titleThin: 'Clinic appointments,', titleBold: 'a closer look.', lede: 'My clinic appointment website for Human–Computer Interaction. A chance to practice interface design and turn a class brief into a live website.', footnote: 'School project · HTML, CSS, Figma & Canva', cta: { label: 'Open clinic project', href: clinic.evidence_url, external: true }, roomsTitle: 'Explore my projects' })
  replace(showcaseFilm, { src: '', poster: picture(clinic.thumbnail_url, clinic.title), pagePosters: { phone: clinic.thumbnail_url, wide: clinic.thumbnail_url }, name: clinic.title, description: 'A preview of my HCI clinic appointment project.' })
  replace(showcaseStats, [[String(projects.length),'published projects'],[String(skillRows.length),'skills in progress'],['2nd','year BSIT'],['4','outside interests']])
  replace(productTabs, projects.map((r,i) => ({ id: `room-${i+1}`, label: r.title, body: r.description + '. Built with ' + r.tools + '.', image: picture(r.thumbnail_url,r.title) })))
  replace(showcaseFaq, [{ question: 'What was this project for?', answer: 'The clinic appointment website was created for my Human–Computer Interaction class.' }, { question: 'Can I try the website?', answer: 'Yes. Use the project link to open the published website in another tab.' }, { question: 'What did you use?', answer: clinic.tools + '. I used the project to practice both interface design and web development.' }])
  replace(contactPage, { eyebrow: 'Contact', titleThin: 'Questions, ideas,', titleBold: 'or a quick hello.', lede: 'Class feedback, a project idea, or notes from another student—I’d love to hear them.', faqEyebrow: 'Quick answers', faqTitle: 'Before you write', faqSub: 'You can also email me directly.', cardTitle: 'Send a message', cardBody: 'Tell me what you have in mind. A few lines is enough.' })
  replace(contactForm, { phEmail: 'you@example.com', message: 'Your message', phMessage: 'Feedback, a project idea, or a quick hello…' })
  const answers = [{ question: 'What do you build?', answer: 'School websites, interface prototypes, and small coding projects while studying BSIT.' }, { question: 'Are you taking paid client work?', answer: 'This is my academic portfolio. The projects here document my learning and school activities.' }, { question: 'What tools are you learning?', answer: skillRows.map(s => s.title).join(', ') + '.' }, { question: 'Can we collaborate on a school project?', answer: 'Send me your idea and the class requirements. We can work out what fits our schedules.' }, { question: 'How can I reach you?', answer: 'Email eguizabalcarl77@gmail.com or use the Facebook link in the sidebar.' }]
  Object.keys(faqs).forEach((k,i) => replace(faqs[k as keyof typeof faqs], answers[i]))
  replace(allFaqs, answers)
  replace(privacyPolicy, { updated: 'October 6, 2026', intro: 'This page describes how Carl Anthony’s student portfolio handles data.', sections: [{ heading: 'Contact', paragraphs: ['The contact form opens your email app with a draft. Send it from your email app when you are ready.'] }, { heading: 'Browser preferences', paragraphs: ['Your theme and sidebar preference are saved on this device. Admin sign-in uses a session on this browser.'] }, { heading: 'Portfolio editing', paragraphs: ['Public portfolio content is stored in Supabase. Only the authorized administrator can save changes.'] }] })
  replace(termsOfService, { updated: 'October 6, 2026', intro: 'This portfolio presents school work and personal learning projects.', sections: [{ heading: 'Academic projects', paragraphs: ['Projects are shared for learning and demonstration. They may change as I continue improving them.'] }, { heading: 'Credits', paragraphs: ['The portfolio design is based on brewed-ops/portfoliov2-template under its PolyForm Noncommercial license. Icons and fonts retain their original licenses.'] }, { heading: 'External websites', paragraphs: ['Project and social links open separate websites.'] }] })
  pages.forEach(p => { p.title = `${p.label} | Carl Anthony Eguizabal`; p.description = 'Carl Anthony’s BSIT student portfolio, school projects, and learning journey.'; if (p.id === 'work') { p.label = 'Projects'; p.badge = projects.length } if (p.id === 'services') p.label = 'Skills'; if (p.id === 'proof') p.label = 'Learning Log' })
  replace(externals, [])
}

/** All public content has a form in the private editor. Functions and icon components stay in code. */
export const contentRegistry: Record<string, unknown> = {
  site, certification, socials, externalLinks, homeHero, homeManifesto, homeSections, ctaBand, workSection, workChapters,
  aboutSection, capabilities, credentials, method, liveAutomation, servicesPage, servicesSection, services,
  proofPage, clientAccounts, videoTestimonials, communityQuotes, showcasePage, showcaseFilm, showcaseStats, productTabs, showcaseFaq,
  contactPage, contactForm, faqs, allFaqs, tools, dailyTools, privacyPolicy, termsOfService,
}
