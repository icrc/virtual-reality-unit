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
                <a href="#" @click.prevent="saveStory" v-bind="{ ...(store.isSaved && { disabled: true }) }">Save current {{ unsavedMarker }}</a>
              </li>
              <li>
                <a href="#" @click.prevent="viewStory">View project</a>
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
                <span v-if="store.currentFilename">({{ store.currentFilename }})</span>
              </h2>
            </header>
            <form>
              <div style="--span: 4" class="s-grid">
                <div style="align-items: end">
                  <label style="--span: 5">Name<input placeholder="Project name" type="text" v-model="story.title" /></label>
                  <label style="--span: 3"
                    >Initial scene
                    <select v-model="story.initialSceneId">
                      <option v-if="story.scenes.length" v-for="scene in story.scenes" idx="scene.id" :value="scene.id">{{ scene.title }}</option>
                      <option v-else :value="-1">No scenes available. Please add one</option>
                    </select>
                  </label>
                  <label style="--span: 8">Author<input placeholder="n/a" type="text" v-model="story.author" /></label>
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
                  <div><input type="text" placeholder="Disabled" disabled="" /></div>
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

<script setup>
import { computed } from "vue"
import { useStoryStore } from "@/stores/storyStore"

import Videos from "@/components/Videos.vue"
import Scenes from "@/components/Scenes.vue"

const store = useStoryStore()
const story = computed(() => store.currentStory)

const unsavedMarker = computed(() => (store.isSaved ? "" : "*"))

const newStory = async () => {
  if (!(await confirmUnsaved())) return
  store.newStory()
}

const loadStory = async () => {
  if (!(await confirmUnsaved())) return
  const filename = await store.pickStory()
  filename && (await store.loadStory(filename))
}

const viewStory = () => {
  alert("TBA")
}

const saveStory = async e => {
  if (e.target.attributes.disabled) return
  const fname = await store.chooseStoryFilename()
  if (fname) await store.saveStory(fname)
}

const confirmUnsaved = async () => {
  return store.isSaved ? true : confirm("Current story is unsaved. Continue?")
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
</style>
