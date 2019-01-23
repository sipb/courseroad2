<!-- this is a cool idea for class info on click: https://vuetifyjs.com/en/components/expansion-panels#popout-inset -->

<template>
  <v-card
    :class="{classbox: true, satisfied: isSatisfied}"
  >
    <v-container
      height="200px"
      fluid
      pa-2
    >
      <v-layout fill-height>
        <v-flex xs12 align-end flexbox>
          <div >
          {{classInfo.id}} {{classInfo.title}}
          </div>
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: "class",
  props: ['classInfo'],
  data() {
    return {
      isSatisfied: true
    }
  },
}
</script>


<style scoped>
/*  .classbox {
    padding: 1rem 2rem;
    border-style: solid;
    border-width: 0.2em;
    border-radius: 0.5em;
  }
*/
  .satisfied {
    background: #98fb98;
  }
  /* this is a bad color, change it */
  .unsatisfied {
    background: #eb7e7e;
  }
</style>
