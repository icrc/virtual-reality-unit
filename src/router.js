import { createRouter, createWebHashHistory as createHistory } from "vue-router"

import * as views from "./views"

const routes = [
  {
    path: "/",
    name: "home",
    component: views.Home,
  },
  {
    path: "/edit",
    name: "edit",
    component: views.Edit,
  },
  {
    path: "/view",
    name: "view",
    component: views.View,
  },
  {
    path: "/play/:data(.*)",
    name: "play",
    component: views.View,
    props: true
  },
  {
    path: "/test",
    name: "test",
    component: views.Test,
  },
  {
    path: "/:catchAll(.*)*",
    name: "unknown",
    component: views.NotFound,
  },
]

const router = createRouter({
  history: createHistory(),
  routes,
})

// // report state
// router.afterEach((to, from) => {
//   // console.log(`Router from:${from.path} to:${to.path}`)
//   // console.log(to.matched[0].name)
//   reportState(to.path, true, from.path)
// })

// // deal with any 'meta' settings
// router.afterEach(to => {
//   if (!to.meta) return
//   if (to.meta.something) handleSomething(to.meta.something)
// })

export default router
