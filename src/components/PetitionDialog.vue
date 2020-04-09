<template>
  <v-dialog v-model="petitionDialog" max-width="600">
    <v-card>
      <v-btn icon flat style="float:right" @click="petitionDialog = false">
        <v-icon>close</v-icon>
      </v-btn>
      <v-card-title>test</v-card-title>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'PetitionDialog',
  props: [
    'selectedSubjects',
    'viewPetitionDialog',
    'petitionReq'
  ],
  data: function () {
    return {};
  }
}
</script>
