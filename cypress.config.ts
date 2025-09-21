import { defineConfig } from 'cypress'
import * as fs from 'fs'
import * as path from 'path'

export default defineConfig({
  projectId: 'waktwf',
  e2e: {
    baseUrl: 'http://localhost:8080',
    setupNodeEvents(on, config) {
      // Task to read file that might not exist
      on('task', {
        readFileMaybe(filePath: string) {
          const fullPath = path.join(config.projectRoot, filePath)
          if (fs.existsSync(fullPath)) {
            return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
          }
          return null
        }
      })

      return config
    },
  },
})