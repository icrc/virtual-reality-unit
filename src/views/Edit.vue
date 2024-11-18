<!-- Edit Page -->
<template>
  <div class="s-container">
    <div class="s-grid">
      <div>
        <aside style="--span: 12; --span-11: 2">
          <nav class="side_nav">
            <!-- <h1>Edit</h1> -->
            <menu id="side-navigation" class="svelte-1jn03lf">
              <li>
                <a href="#">Create new</a>
              </li>
              <li>
                <a href="#">Load existing</a>
              </li>
              <li>
                <a href="#">Save current</a>
              </li>
              <li>
                <a href="#">Test project</a>
              </li>
            </menu>
          </nav>
        </aside>
        <main style="--span: 12; --span-11: 10">
          <br />
          <article>
            <header>
              <h2 :class="{ missing: !store.currentStory.title }">{{ store.currentStory.title || 'No name' }}</h2>
            </header>
            <form>
              <div style="--span: 4" class="s-grid">
                <div style="align-items: end">
                  <label style="--span: 8">Name<input placeholder="Project name" type="text" v-model="store.currentStory.title" /></label>
                  <label style="--span: 8">Author<input placeholder="n/a" type="text" v-model="store.currentStory.author" /></label>
                  <label style="--span: 8">Info<textarea v-model="store.currentStory.info" rows="3"></textarea></label>
                </div>
              </div>
            </form>
          </article>
          
          <article>
            <details>
              <summary role="button">Videos (0)</summary>
              <div>Hello</div>
            </details>
          </article>
          
          <article>
            <details>
              <summary role="button">Scenes (0)</summary>
              <div>World</div>
            </details>
          </article>

          <!-- Sample crap from sugar website - for reference -->
<!--           <article style="display: none">
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
 -->

        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStoryStore } from "@/stores/storyStore"

const store = useStoryStore()

window.store = store


</script>


<style scoped>

.side_nav {
  position: sticky;
  top: 5em;
}

h2.missing {
  opacity: 0.3;
}

</style>
