export interface ProjectItem {
  /** SVG icon markup */
  iconSvg: string
  /** Project name */
  title: string
  /** Short description */
  details: string
  /** Link (internal sub-path or external URL) */
  link: string
}

const bookSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`
const kanbanSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M6 8h.01"/><path d="M12 8h.01"/><path d="M18 8h.01"/><path d="M6 13h.01"/><path d="M12 13h.01"/></svg>`

export const PROJECTS: ProjectItem[] = [
  {
    iconSvg: bookSvg,
    title: 'Skills Book',
    details: 'Claude Code skill management tool — search, browse, and install 1500+ community skills',
    link: '/skills-book/'
  },
  {
    iconSvg: kanbanSvg,
    title: 'Hermes Kanban',
    details: 'Hermes Dashboard cockpit for Gateway chat, Kanban dispatch, worker profiles, and runtime model settings',
    link: '/kanban'
  }
  // Future projects: add here
]
