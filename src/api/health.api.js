import { httpClient } from '../core/http/httpClient'

export const getHealth = () => httpClient('/health')
