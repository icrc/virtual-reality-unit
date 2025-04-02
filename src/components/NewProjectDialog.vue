<!-- New Project Popup -->
<template>
  <popup-dialog ref="dialog" v-slot="popupControl" heading="New Project" class="new-project-container">
    <div>
      <label style="--span: 4">
        Please select the project template or sample you wish to start from:
        <select autofocus v-model="templateId" @change="popupControl.fixScroll">
          <option :value="id" v-for="(template, id) in TEMPLATES">{{ template.name }}</option>
        </select>
      </label>
      <label style="--span: 4">Template/sample description<textarea readonly>{{ templateDescription }}</textarea></label>
    </div>

    <div>
      <span class="actions">
        <button class="s-outline" @click="popupControl.setVisible(false)">Cancel</button>
        <button @click="() => popupControl.returnResult(TEMPLATES[templateId].data)">Go</button>
      </span>
    </div>
  </popup-dialog>
</template>

<script>
import SAMPLES from "@/samples"
import { EMPTY_STORY } from "@/stores/storyStore"

const TEMPLATES = [
  { name: "Blank project", description: "A new, blank project with basic structure.", data: EMPTY_STORY },
  ...SAMPLES.map(sample => ({ name: '[Sample] - ' + sample.title, description: sample.info, data: sample })),
]
</script>

<script setup>
import { useTemplateRef, ref, computed } from "vue"

import PopupDialog from "@/components/PopupDialog.vue"

const dialog = useTemplateRef("dialog")
const templateId = ref(0)
const templateDescription = computed(() => TEMPLATES[templateId.value].description)

/**
 * Gets the template for the new project, or falsey if cancelled
 *
 * @return     {object|null}  The template.
 */
const getTemplate = () => {
  templateId.value = 0
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

.actions {
  flex-direction: row;
  display: flex;
  gap: 0.25rem;
  justify-content: end;
  & button {
    width: fit-content;
  }
}

select {
  font-weight: bold;
  & option {
    font-weight: normal;
  }
}

textarea {
  height: 4.5rem;
}
</style>
