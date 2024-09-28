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

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ThemeToggler",

  computed: {
    isDarkMode() {
      return this.$store.state.isDarkMode;
    },
  },
  mounted() {
    this.$vuetify.theme.dark = this.$store.state.isDarkMode;
  },
  methods: {
    changeTheme() {
      this.$store.commit("changeTheme");
      this.$vuetify.theme.dark = this.$store.state.isDarkMode;
    },
  },
});
</script>

<style scoped>
.theme-toggler {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
}
</style>
