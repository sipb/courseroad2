<template>
  <v-container>
    <v-layout>
      <v-flex>
        <v-card class = "class-info-card" id = "classInfoCard">
          <v-card-title>
            Class Info
          </v-card-title>
          <v-card-text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec rutrum mauris quis interdum vehicula. Vivamus sagittis commodo ante, ut gravida velit aliquam eget. Fusce quis lobortis dolor. Sed vel erat in nibh pretium tempor. Integer lobortis velit purus, vitae rutrum ipsum dignissim vitae. Nullam in efficitur mauris. Mauris eleifend est sit amet elit congue, quis efficitur tellus mattis. Ut ut mollis tellus. Maecenas orci ex, ultrices eu magna nec, posuere efficitur lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
export default {
  name: "ClassInfo",
  components: {},
  props: [],
  data: function() {return {}}
}
</script>


<style>
.class-info-card {
  height: 30vh;
  position: fixed;
  bottom: 1em;
  right: 0;
  width: 20em;
}
</style>
