import { h } from 'vue'
import { useData } from 'vitepress'
import Theme from 'vitepress/theme'
import './styles/index.scss'

export default Object.assign({}, Theme, {
  Layout: () => {
    const props: Record<string, any> = {}
    const { frontmatter } = useData()
    if (frontmatter.value?.layoutClass) {
      props.class = frontmatter.value.layoutClass
    }
    return h(Theme.Layout, props)
  },
})
