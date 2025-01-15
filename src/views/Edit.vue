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
                <a href="#" @click.prevent="shareLink" title="Share a link for viewing this project">Share link</a>
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
                  <label style="--span: 5">Project name<input placeholder="(No name)" type="text" v-model="story.title" /></label>
                  <label style="--span: 3">Initial scene
                    <select v-model="story.initialSceneId">
                      <option v-if="story.scenes.length" :value="-1">Please select a scene...</option>
                      <option v-if="story.scenes.length" v-for="scene in story.scenes" :key="scene.id" :value="scene.id">
                        {{ scene.id }} - {{ scene.title || "(No title)" }}
                      </option>
                      <option v-else :value="-1">None available. Please add one</option>
                    </select>
                  </label>
                  <label style="--span: 5">Author<input placeholder="n/a" type="text" v-model="story.author" /></label>
                  <label style="--span: 3">Default choice layout
                    <select v-model="story.defaultChoiceLayout">
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

          <!-- Sample crap from sugar website - for reference -->
          <article style="display: none">
            <form>
              <div style="--span: 4" class="s-grid">
                <div style="align-items: end">
                  <label><input type="radio" name="color" value="blue" /> Blue</label>
                  <div>
                    <label><input type="checkbox" />Checkbox</label>
                  </div>
                  <div>
                    <label>Select value <input type="range" min="0" max="100" /></label>
                  </div>
                  <div><progress value=".7" max="1">70 %</progress></div>
                  <div><progress></progress></div>
                  <label
                    >With tooltip <input aria-describedby="username-tooltip" type="text" />
                    <div role="tooltip" id="username-tooltip">Username cannot be an email</div></label
                  >
                  <search style="--span: 4"><input type="search" name="" aria-label="Search" /><button type="submit">Search</button></search>
                  <label>Email <input type="email" placeholder="Email" aria-invalid="true" /></label>
                  <label>Valid <input type="text" placeholder="Email" aria-invalid="false" /></label>
                  <div style="--span: 4">
                    <label>Upload a file<input type="file" /></label>
                  </div>
                  <div><input type="text" placeholder="Disabled" disabled /></div>
                  <div>
                    <select aria-label="Select an animal">
                      <option value="1">Ape</option>
                      <option value="2">Elephant</option>
                      <option value="3">Jaguar</option>
                    </select>
                  </div>
                  <div><button aria-busy="true">Submit</button></div>
                </div>
              </div>
            </form>
          </article>
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
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useRouter } from "vue-router"
import { useStoryStore } from "@/stores/storyStore"
import shortenLink from "@/libs/shortenURL"

import Videos from "@/components/Videos.vue"
import Scenes from "@/components/Scenes.vue"

const store = useStoryStore()
const story = computed(() => store.currentStory)

const currentFilename = storeToRefs(store).currentFilename

const unsavedMarker = computed(() => (store.isSaved ? "" : "*"))

const router = useRouter()

/**
 * Add a new story/project (checking if current saved first)
 *
 * @return     {Promise}  n/a
 */
const newStory = async () => {
  if (!(await confirmUnsaved())) return
  store.newStory()
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
  let link = store.getSharingURL(router)
  if (process.env.NODE_ENV === "production") link = await shortenLink(link)
  await navigator.clipboard.writeText(link)
  await alert("A link for viewing this project has been successfully copied to your clipboard!\n\n" + link)
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
  font-weight:normal;
  color: #888;
}
</style>
