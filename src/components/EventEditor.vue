<!-- Event Editor Component - for editing event details -->
<template>
    <dialog ref="dialog" class="s-container modified-s-container dialog" @click="handleModalClick">
      <div class="s-grid">
        <div>
          <main>
            <article>
              <header>
                <h3>Event<icon type="x" size="36" class="icon btn_close" title="Close (losing changes)" @click="show(false)" /></h3>
              </header>
              <form>
                a <br>a <br>a <br>a <br>a <br>a <br>a <br>a <br>a <br>a <br>
              </form>
            </article>
          </main>
        </div>
      </div>
  </dialog>
</template>

<script></script>

<script setup>
import { ref, useTemplateRef } from "vue"
import Icon from "vue-feather"

const dialog = useTemplateRef('dialog')

const props = defineProps({
  // store: {
  //   type: Object,
  //   default() {
  //     return {}
  //   },
  // },
})

const show = (state = true) => {
  if (state) {
    dialog.value.showModal()
    document.body.style.overflow = 'hidden'  
  } else {
    dialog.value.close()
    document.body.style.overflow = 'auto'
  }
}

const handleModalClick = (event) => {
  if (event.target === dialog.value) {
    show(false)
  }
}

defineExpose({
  show
})
</script>

<style scoped>
.dialog {
  overflow: hidden;
}

.modified-s-container {
  margin-inline: auto;
  width: 80%;
  max-width: 750px;
  min-width: 350px;
}

.btn_close {
  float: right;
}
</style>
