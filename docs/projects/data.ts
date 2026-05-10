export interface ProjectItem {
  /** Emoji icon */
  icon: string
  /** Project name */
  title: string
  /** Short description */
  details: string
  /** Link (internal sub-path or external URL) */
  link: string
}

/*
 * All projects are listed here.
 * To add a new project: append an entry and create docs/<slug>/.
 */
export const PROJECTS: ProjectItem[] = [
  {
    icon: '📚',
    title: 'Skills Book',
    details: 'Claude Code skill management tool — search, browse, and install 1500+ community skills',
    link: '/skills-book/'
  }
  // Future projects: add here
]
