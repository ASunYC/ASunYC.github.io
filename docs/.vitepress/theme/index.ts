import { h } from 'vue'
import { useData } from 'vitepress'
import Theme from 'vitepress/theme'
import SkillsBookHotTop from './components/SkillsBookHotTop.vue'
import './styles/index.scss'

export default Object.assign({}, Theme, {
  Layout: () => {
    const props: Record<string, any> = {}
    const { frontmatter } = useData()
    if (frontmatter.value?.layoutClass) {
      props.class = frontmatter.value.layoutClass
    }
    return h(Theme.Layout, props, {
      'aside-outline-after': () => (
        frontmatter.value?.layoutClass === 'm-skills-book-layout'
          ? h(SkillsBookHotTop)
          : null
      ),
    })
  },
  enhanceApp({ app, router }) {
    router.onAfterPageChanged = () => {
      setTimeout(initSpotlight, 50)
    }
    if (typeof window !== 'undefined') {
      requestAnimationFrame(initSpotlight)
    }
  },
})

function initSpotlight() {
  if (typeof window === 'undefined') return
  const cards = document.querySelectorAll('.spotlight-card')
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      ;(card as HTMLElement).style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
      ;(card as HTMLElement).style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
    })
  })
}
