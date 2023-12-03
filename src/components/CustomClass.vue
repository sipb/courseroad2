<template>
  <v-card>
    <center>
      <v-btn class="white--text" color="#888" :block="true" @click="openNewClass()">
        New Custom Activity
      </v-btn>
    </center>
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-btn icon flat style="float:right" @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-card-title>
          <h2>
            <span v-if="editing !== undefined">Edit </span>
            <span v-else>New </span>
            Custom Activity
          </h2>
        </v-card-title>
        <v-form ref="form" lazy-validation>
          <div class="px-3">
            <v-text-field v-model="form.values.shortTitle" label="Subject Number" counter="8" required :rules="form.rules.shortTitleRule" />
            <v-text-field v-model="form.values.fullTitle" label="Title" required :rules="form.rules.fullTitleRule" />

            <v-card-text class="px-0">
              <h3>Units/Hours</h3>
            </v-card-text>
            <div class="d-flex">
              <v-text-field v-model="form.values.units" label="Units" class="mx-3" type="number" :rules="form.rules.numberFormRule" />
              <v-text-field v-model="form.values.inClassHours" label="In-Class Hours" class="mx-3" type="number" :rules="form.rules.numberFormRule" />
              <v-text-field v-model="form.values.outOfClassHours" label="Out-of-Class Hours" class="mx-3" type="number" :rules="form.rules.numberFormRule" />
            </div>

            <v-card-text class="px-0">
              <h3>Color</h3>
            </v-card-text>
            <center>
              <v-btn-toggle ref="colors" v-model="form.values.colorChosen" class="elevation-0">
                <v-layout row wrap>
                  <v-flex v-for="(_i, i) in 7" :key="i">
                    <v-btn v-for="(_j, j) in 6" :key="j" :class="`px-4 ma-2 custom_color-${6*i + j}`" :value="`@${6*i + j}`">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-btn-toggle>
            </center>
          </div>
          <v-card-actions class="mt-2">
            <v-spacer />
            <v-btn color="green" class="white--text" @click="validate">
              <span v-if="editing !== undefined">Save&nbsp;</span>
              <span v-else>Add&nbsp;</span>
              Class
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
export default {
  name: 'CustomClass',
  data: function () {
    return {
      dialog: false,
      form: {
        values: {
          shortTitle: undefined,
          fullTitle: undefined,
          units: undefined,
          inClassHours: undefined,
          outOfClassHours: undefined,
          colorChosen: undefined
        },
        rules: {
          shortTitleRule: [
            v => (v !== undefined && v.length > 0) || 'Required',
            v => (v !== undefined && v.length <= 8) || 'Max 8 characters'
          ],
          fullTitleRule: [
            v => (v !== undefined && v.length > 0) || 'Required'
          ],
          numberFormRule: [
            v => (v === undefined || Number(v) >= 0) || 'Must be nonnegative'
          ]
        }
      }

    };
  },
  computed: {
    editing () {
      return this.$store.state.customClassEditing;
    }
  },
  watch: {
    editing (classEditing, oldClassEditing) {
      if (classEditing === undefined) {
        return;
      }
      this.form.values.shortTitle = classEditing.subject_id;
      this.form.values.fullTitle = classEditing.title;
      this.form.values.units = classEditing.units;
      this.form.values.inClassHours = classEditing.in_class_hours;
      this.form.values.outOfClassHours = classEditing.out_of_class_hours;
      this.form.values.colorChosen = classEditing.custom_color;
      this.dialog = true;
    },
    dialog (newDialog, oldDialog) {
      if (!newDialog) {
        this.$store.commit('cancelEditCustomClass');
      }
    }
  },
  methods: {
    addCustomClass: function () {
      const newClass = {
        subject_id: this.form.values.shortTitle,
        title: this.form.values.fullTitle,
        total_units: Number(this.form.values.units) || 0,
        in_class_hours: Number(this.form.values.inClassHours) || 0,
        out_of_class_hours: Number(this.form.values.outOfClassHours) || 0,
        custom_color: this.form.values.colorChosen || '@40',
        public: false,
        offered_fall: true,
        offered_IAP: true,
        offered_spring: true,
        offered_summer: true
      };
      this.dialog = false;
      if (this.editing !== undefined) {
        this.$store.commit('finishEditCustomClass', newClass);
      } else {
        this.$store.commit('addFromCard', newClass);
      }
    },
    openNewClass: function () {
      // Open the dialog for adding a new class
      this.$refs.form.reset();
      this.form.values.colorChosen = undefined;
      this.dialog = true;
    },
    validate: function () {
      if (this.$refs.form.validate()) {
        this.addCustomClass();
      }
    }
  }
};
</script>

<style scoped>
.v-btn-toggle .v-btn * {
  display: none;
}

.v-btn-toggle .v-btn--active * {
  display: inherit;
  position: absolute;
  color: white;
}
</style>
