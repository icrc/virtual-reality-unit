<!-- Video Timestamp Input Component -->
<template>
  <input :class="{ video_timestamp: true, show_end_time: allowEnd }" type="number" :min="allowEnd ? -1 : 0" v-model="timestamp" :placeholder="placeholder" :data-val="timestamp" />
</template>

<script></script>

<script setup>

const timestamp = defineModel()
const props = defineProps({
  allowEnd: Boolean,
  placeholder: String,
})

</script>

<style scoped>

.video_timestamp {


}

</style>

<style>

label:has(> input.show_end_time[data-val="-1"]),
span:has(> input.show_end_time[data-val="-1"]) {
  position: relative;
}
label:has(> input.show_end_time[data-val="-1"])::before,
span:has(> input.show_end_time[data-val="-1"])::before {
  content: "END";
  position: absolute;
  left: 0;
  height: 0.5rem;
  line-height: 0.5em;
  right: 0;
  text-align: center;
  font-size: 0.75rem;
  bottom: 0;
  margin-bottom: -0.75rem;
  color: blue;
}

</style>
