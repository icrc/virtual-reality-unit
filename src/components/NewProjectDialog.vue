<!-- New Project Popup -->
<template>
  <popup-dialog ref="dialog" v-slot="popupControl" heading="New Project" class="new-project-container">
    <div style="--span: 4">
      <span>Please select the project template or sample you wish to start from:</span>
      <hr />
    </div>
    
    <div>
      <span class="actions">
        <button class="s-outline" @click="popupControl.setVisible(false)">Cancel</button>
        <button @click="() => popupControl.returnResult(true)">Go</button>
      </span>
    </div>
  </popup-dialog>
</template>

<script>
import SAMPLES from "@/samples"
</script>

<script setup>
import { useTemplateRef, toRaw, ref, computed, nextTick } from "vue"

import PopupDialog from "@/components/PopupDialog.vue"
import Icon from "vue-feather"

const dialog = useTemplateRef("dialog")


/**
 * Gets the template for the new project, or falsey if cancelled
 *
 * @return     {object|null}  The template.
 */
const getTemplate = () => {
  const promise = dialog.value.launchPopup()
  return promise
}

defineExpose({
  getTemplate,
})

</script>

<style scoped>
.new-project-container {
  width: 32%;
  max-width: 750px;
  min-width: 450px;
}

.icon {
  cursor: pointer;
}

.actions {
  flex-direction: row;
  display: flex;
  gap: 0.25rem;
  justify-content: end;
  & button {
    width: fit-content;
  }
}

.disabled_icon {
  :deep(& svg) {
    stroke: #ccc !important;
  }
}
:deep(.disabled_icon) {
  cursor: default !important;
  pointer-events: none;
}


</style>
