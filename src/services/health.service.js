import { getHealth } from '../api/health.api'

export const healthService = {
  async check() {
    return getHealth()
  },
}
