import fs from 'node:fs'
import path from 'node:path'

export default {
  paths() {
    const file = path.resolve(process.cwd(), 'docs/public/data/map-news/news.json')
    if (!fs.existsSync(file)) return []
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
    return (payload.items || []).map((item) => ({
      params: { slug: item.slug }
    }))
  }
}
