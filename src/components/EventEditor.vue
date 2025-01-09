<!-- Event Editor Component - for editing event details -->
<template>
  <div v-if="visible" class="overlay">
    <div class="s-container modified-s-container">
      <div class="s-grid">
        <div>
          <main>
            <article @click="show(false)">
              <header>
                <h3>Event</h3>
              </header>
              <form>
                a <br>a <br>a <br>a <br>a <br>a <br>a <br>a <br>a <br>a <br>
              </form>
            </article>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script></script>

<script setup>
import { ref, computed } from "vue"

const visible = ref(false)

const props = defineProps({
  // store: {
  //   type: Object,
  //   default() {
  //     return {}
  //   },
  // },
})

const show = (state = true) => {
  visible.value = state
}

defineExpose({
  show
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0 0 0 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #0008;
  z-index: 10000;
}

.modified-s-container {
  margin-inline: auto;
  width: 80%;
  max-width: 750px;
  min-width: 350px;
}
</style>
