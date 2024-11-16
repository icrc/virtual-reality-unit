import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import { createPinia } from "pinia"

import { useStoryStore } from "@/stores/storyStore"



const pinia = createPinia()

createApp(App).use(router).use(pinia).mount("#app")

useStoryStore()
