import { createApp } from 'vue'

import { setAppRoot } from '@/appRoot'
import App from './App.vue'
import './styles/themes.css'

const mountEl = document.getElementById('app')
if (!mountEl) throw new Error('#app not found')

setAppRoot(mountEl)
createApp(App).mount(mountEl)
