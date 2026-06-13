import { type Ref, watch } from 'vue'

import { syncToJugru } from '@/jugru/sync'

export const useJugruSync = (totalScore: Ref<number>, comment: Ref<string>) => {
  watch(
    [totalScore, comment],
    ([score, text]) => syncToJugru(score, text),
    { immediate: true },
  )
}
