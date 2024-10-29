<script setup>

</script>

<template>
  <header>
    <nav class="s-container">
      <div>VideoPath</div>
      <menu>
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><RouterLink to="/view">View</RouterLink></li>
        <li><RouterLink to="/edit">Edit</RouterLink></li>
        <li><RouterLink to="/help">Help</RouterLink></li>
      </menu>
    </nav>
  </header>
  <RouterView />
</template>

<style scoped></style>
