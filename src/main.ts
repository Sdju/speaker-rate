import { createApp } from 'vue'

import App from './App.vue'
import { applyEmbedDocumentAttrs } from './embed/mode'
import './styles/themes.css'

applyEmbedDocumentAttrs()

createApp(App).mount('#app')
