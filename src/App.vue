<template>
  <div class="full-width center-content">
    <hello-component name="World" />
  </div>
</template>
<script>
import HelloComponent from './components/HelloComponent.vue'
export default {
  components: {
    HelloComponent
  }
}
</script>
