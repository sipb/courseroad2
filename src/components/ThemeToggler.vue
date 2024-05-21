<template>
  <div class="theme-toggler">
    <v-tooltip v-if="!$vuetify.theme.dark" bottom>
      <template #activator="{ on }">
        <v-btn color="info" small fab v-on="on" @click="darkMode">
          <v-icon class="mr-1">mdi-moon-waxing-crescent</v-icon>
        </v-btn>
      </template>
      <span>Dark Mode On</span>
    </v-tooltip>

    <v-tooltip v-else bottom>
      <template #activator="{ on }">
        <v-btn color="info" small fab v-on="on" @click="darkMode">
          <v-icon color="yellow">mdi-white-balance-sunny</v-icon>
        </v-btn>
      </template>
      <span>Dark Mode Off</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  name: "ThemeToggler",
  methods: {
    darkMode: function () {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
  },
};
</script>

<style scoped>
.theme-toggler {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
}
</style>
