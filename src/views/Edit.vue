<!-- Edit Page -->
<template>
  <div class="s-container">
    <div class="s-grid">
      <div>
        <aside style="--span: 12; --span-11: 2">
          <nav class="side_nav">
            <menu id="side-navigation" class="svelte-1jn03lf">
              <li>
                <a href="#" @click.prevent="newStory">Create new</a>
              </li>
              <li>
                <a href="#" @click.prevent="loadStory">Load existing</a>
              </li>
              <li>
                <a href="#" @click.prevent="saveStory">Save current {{ unsavedMarker }}</a>
              </li>
              <li>
                <RouterLink to="/view">View project</RouterLink>
              </li>
              <li>
                <a href="#" @click.prevent="shareLink" title="Share a link for viewing this project">Share view link</a>
              </li>
              <li>
                <a href="#" @click.prevent="newProject">Test New Project new</a>
              </li>
            </menu>
          </nav>
        </aside>
        <main style="--span: 12; --span-11: 10">
          <br />
          <article>
            <header>
              <h2>
                <span :class="{ missing: !story.title }">{{ story.title || "No name" }}</span>
                <span v-if="currentFilename" class="current_filename"> ({{ currentFilename }})</span>
              </h2>
            </header>
            <form>
              <div style="--span: 4" class="s-grid">
                <div>
                  <label style="--span: 5">Project name<input ref="storyTitle" placeholder="(No name)" type="text" v-model="story.title" /></label>
                  <label style="--span: 3"
                    >Initial scene
                    <select v-model="story.initialSceneId" :title="'System ID - ' + story.initialSceneId">
                      <option v-if="story.scenes.length" :value="-1" title="kermit">Please select a scene...</option>
                      <option v-if="story.scenes.length" v-for="scene in story.scenes" :key="scene.id" :value="scene.id" :title="'System ID - ' + scene.id">
                        {{ scene.id }} - {{ scene.title || "(No title)" }}
                      </option>
                      <option v-else :value="-1">None available. Please add one</option>
                    </select>
                  </label>
                  <label style="--span: 5">Author<input placeholder="n/a" type="text" v-model="story.author" /></label>
                  <label style="--span: 3"
                    ><span
                      >Default choice layout<icon
                        style="float: right"
                        type="settings"
                        class="icon"
                        aria-describedby="settings-tooltip"
                        title="Layout settings"
                        @click="editDefaultLayoutSettings"
                    /></span>
                    <select v-model="story.defaultChoiceLayout" @change="handleLayoutChange">
                      <option v-for="layout in LAYOUT_NAMES" :key="layout.id" :value="layout.id">
                        {{ layout.name }}
                      </option>
                    </select>
                  </label>
                  <label style="--span: 8">Info<textarea v-model="story.info" rows="3"></textarea></label>
                </div>
              </div>
            </form>
          </article>

          <videos :store="store" />

          <scenes :store="store" />

          <layout-settings-editor ref="layoutSettingsEditor" />
          <action-code-editor ref="actionCodeEditor" />
          <new-project-dialog ref="newProjectDialog" />

        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { alert, confirm } from "@/libs/popups"
import { LAYOUT_NAMES } from "@/layouts"
</script>

<script setup>
import { computed, useTemplateRef, nextTick, onMounted, provide, inject } from "vue"
import { storeToRefs } from "pinia"
import { useRouter } from "vue-router"
import { useStoryStore } from "@/stores/storyStore"
import shortenLink from "@/libs/shortenURL"

import Icon from "vue-feather"

import Videos from "@/components/Videos.vue"
import Scenes from "@/components/Scenes.vue"
import LayoutSettingsEditor from "@/components/LayoutSettingsEditor.vue"
import ActionCodeEditor from "@/components/ActionCodeEditor.vue"
import NewProjectDialog from "@/components/NewProjectDialog.vue"

const store = useStoryStore()
const story = computed(() => store.currentStory)

const currentFilename = storeToRefs(store).currentFilename

const unsavedMarker = computed(() => (store.isSaved ? "" : "*"))

const router = useRouter()

const storyTitle = useTemplateRef("storyTitle")

const layoutSettingsEditor = useTemplateRef("layoutSettingsEditor")
provide("layoutSettingsEditor", layoutSettingsEditor)

const actionCodeEditor = useTemplateRef("actionCodeEditor")
provide("actionCodeEditor", actionCodeEditor)

const newProjectDialog = useTemplateRef("newProjectDialog")

onMounted(() => {
  inject("setWindowTitle")("Edit")
})

/**
 * Add a new story/project (checking if current saved first)
 *
 * @return     {Promise}  n/a
 */
const newStory = async () => {
  if (!(await confirmUnsaved())) return
  store.newStory()
  nextTick(() => storyTitle.value.focus())
}

/**
 * Attempt to start a new project
 */
const newProject = async () => {
  const template = await newProjectDialog.value.getTemplate()
}

/**
 * Edit the default layout settings
 *
 * @param      {Function}  launchEditFunc  The function to launch the editor
 */
const editDefaultLayoutSettings = async () => {
  const newSettings = await layoutSettingsEditor.value.edit(
    story.value.defaultChoiceLayout,
    story.value.defaultChoiceLayoutSettings,
    "Edit Settings for Default Layout"
  )
  if (newSettings) story.value.defaultChoiceLayoutSettings = newSettings
}

/**
 * Handle a change of layout from the layout dropdown
 */
const handleLayoutChange = () => {
  // clear layout settings as they won't be relevant to new layout
  story.value.defaultChoiceLayoutSettings = {}
}

/**
 * Picks and loads a story (checking saved status of current first).
 *
 * @return     {Promise}  n/a
 */
const loadStory = async () => {
  if (!(await confirmUnsaved())) return
  const filename = await store.pickStory()
  if (filename) {
    await store.loadStory(filename)
    window.scrollTo(0, 0)
  }
}

/**
 * Chooses a name, and saves current story.
 */
const saveStory = async () => {
  const fname = await store.chooseStoryFilename()
  if (fname) await store.saveStory(fname.trim())
}

/**
 * Share a link to view the current story (in its current state)
 */
const shareLink = async () => {
  let link = store.getSharingURL(router),
    oldLink = link
  if (process.env.NODE_ENV === "production") link = await shortenLink(link)
  await navigator.clipboard.writeText(link || oldLink)
  const msg = link ? "" : "\n\n Unfortunately, the URL shortener is not working right now though."
  await alert(`A link for viewing this project has been successfully copied to your clipboard!${msg}\n\n \n\n[${link || oldLink}](${link || oldLink})`)
}

/**
 * Confirm continue action if current project is unsaved
 *
 * @return     {Promise<Boolean>}  yes/no
 */
const confirmUnsaved = async () => {
  return store.isSaved ? true : await confirm("Current story is unsaved. Continue?")
}
</script>

<style scoped>
.side_nav {
  position: sticky;
  top: 5em;
}

h2 > .missing {
  opacity: 0.3;
}

.current_filename {
  font-weight: normal;
  color: #888;
}

.icon {
  cursor: pointer;
  :deep(& svg) {
    stroke: #555;
  }
  :deep(& svg):hover {
    stroke: var(--s-color-primary);
  }
}
</style>
