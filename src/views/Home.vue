<!-- Home Page -->
<template>
  <div class="s-container">
    <div class="hero-image"></div>
    <br />
    <h1>Welcome to Video Pathway</h1>
    <p>A system for the creation of video-based branching stories, quizzes, and more...</p>
    <p><button @click="createProject">Create a new project</button><button @click="loadProject">Load an existing project</button></p>
  </div>
</template>

<script setup>
import { onMounted, inject } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const createProject = () => router.push("/edit/new")
const loadProject = () => router.push("/edit/load")

onMounted(() => {
  inject("setWindowTitle")()
})
</script>

<style scoped>
.hero-image {
  height: 25vmax;
  background-image: url(https://fastly.picsum.photos/id/314/1280/720.jpg?hmac=qAxx3DFonXs20rLPQVE9uqA0h7f6nLDU1Bz5mO0Tyz4);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
}

button {
  margin-bottom: 0.5rem;
}
</style>
