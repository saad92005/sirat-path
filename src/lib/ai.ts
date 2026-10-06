// Provider abstraction so AI stays optional and swappable (local first, never a paid requirement).
export interface AIProvider {
  id: string
  label: string
  isAvailable(): Promise<{ ok: boolean; reason?: string }>
  explain(question: string, context: string[]): Promise<string>
}

/** Default: no AI. The app never fabricates an answer when no model is present. */
export const NoAIProvider: AIProvider = {
  id: 'none',
  label: 'No AI',
  isAvailable: async () => ({ ok: false, reason: 'Local AI is unavailable on this device.' }),
  explain: async () => { throw new Error('AI unavailable') },
}

export async function hasWebGPU() {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu
  if (!gpu) return false
  try { return Boolean(await gpu.requestAdapter()) } catch { return false }
}
