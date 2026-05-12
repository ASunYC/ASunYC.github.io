import fs from 'node:fs'
import path from 'node:path'

export default {
  paths() {
    const dir = path.resolve(process.cwd(), 'docs/public/data/skills-shop/skills')
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => ({
        params: { slug: file.replace(/\.json$/, '') }
      }))
  }
}
