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

export const PROJECTS: ProjectItem[] = [
  {
    iconSvg: bookSvg,
    title: 'Skills Book',
    details: 'Claude Code skill management tool — search, browse, and install 1500+ community skills',
    link: '/skills-book/'
  }
  // Future projects: add here
]
