<template>
  <div class="theme-toggler">
    <v-tooltip v-if="!isDarkMode" bottom>
      <template #activator="{ on }">
        <v-btn color="info" small fab v-on="on" @click="changeTheme">
          <v-icon class="mr-1">mdi-moon-waxing-crescent</v-icon>
        </v-btn>
      </template>
      <span>Dark Mode On</span>
    </v-tooltip>

    <v-tooltip v-else bottom>
      <template #activator="{ on }">
        <v-btn color="info" small fab v-on="on" @click="changeTheme">
          <v-icon color="yellow">mdi-white-balance-sunny</v-icon>
        </v-btn>
      </template>
      <span>Dark Mode Off</span>
    </v-tooltip>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useStore, useVuetify } from "../plugins/composition.js";

const store = useStore();
const vuetify = useVuetify();

function changeTheme() {
  store.commit("changeTheme");
  vuetify.theme.dark = store.state.isDarkMode;
}

const isDarkMode = computed(() => {
  return store.state.isDarkMode;
});

onMounted(() => {
  vuetify.theme.dark = store.state.isDarkMode;
});
</script>

<style scoped>
.theme-toggler {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
}
</style>
