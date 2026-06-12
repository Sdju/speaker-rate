import { createApp } from 'vue'

import App from './App.vue'
import { isEmbedMode, setAppRoot } from './embed/mode'
import './styles/themes.css'

const mountEl = document.getElementById('app')
if (!mountEl) {
  throw new Error('#app not found')
}

setAppRoot(mountEl)

if (isEmbedMode) {
  mountEl.dataset.embed = 'true'
}

createApp(App).mount(mountEl)
