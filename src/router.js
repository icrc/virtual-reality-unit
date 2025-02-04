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
    path: "/help",
    name: "help",
    component: views.Help,
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

export default router
