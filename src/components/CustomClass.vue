<template>
  <v-card>
    <center>
      <v-btn class="white--text" color="#888" :block="true" @click="viewDialog = true">
        New Custom Activity
      </v-btn>
    </center>
    <v-dialog v-model="viewDialog" max-width="600">
      <v-card>
        <v-btn icon flat style="float:right" @click="viewDialog=false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-card-title>
          <h2>New Custom Activity</h2>
        </v-card-title>
        <v-form ref="form" lazy-validation>
          <div class="px-3">
            <v-text-field v-model="form.values.shortTitle" label="Short Code" counter="8" required :rules="form.rules.shortTitleRule" />
            <v-text-field v-model="form.values.fullTitle" label="Title" required :rules="form.rules.fullTitleRule" />

            <v-card-text class="px-0"><h3>Units/Hours</h3></v-card-text>
            <div class="d-flex">
              <v-text-field v-model="form.values.units" label="Units" class="mx-3" type="number" :rules="form.rules.numberFormRule" />
              <v-text-field v-model="form.values.inClassHours" label="In-Class Hours" class="mx-3" type="number" :rules="form.rules.numberFormRule" />
              <v-text-field v-model="form.values.outOfClassHours" label="Out-of-Class Hours" class="mx-3" type="number" :rules="form.rules.numberFormRule" />
            </div>

            <v-card-text class="px-0"><h3>Color</h3></v-card-text>
            <center>
              <v-btn-toggle v-model="form.values.colorChosen" mandatory>
                <v-btn class="px-4 mr-2" color="#B55757" :value="'@0'" fab />
                <v-btn class="px-4 mx-2" color="#DE4343" :value="'@6'" fab />
                <v-btn class="px-4 mx-2" color="#DE9043" :value="'@7'" fab />
                <v-btn class="px-4 mx-2" color="#DE43DE" :value="'@28'" fab />
                <v-btn class="px-4 mx-2" color="#5786B5" :value="'@19'" fab />
                <v-btn class="px-4 mx-2" color="#8657B5" :value="'@21'" fab />
                <v-btn class="px-4 mx-2" color="#16B516" :value="'@16'" fab />
                <v-btn class="px-4 ml-2" color="#737373" :value="'@39'" fab />
              </v-btn-toggle>
            </center>
          </div>
          <v-card-actions class="mt-2">
            <v-spacer />
            <v-btn color="green" class="white--text" @click="validate">
              Add Class
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
      viewDialog: false,
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
            v => v !== undefined && v.length > 0 || 'Required',
            v => v !== undefined && v.length <= 8 || 'Max 8 characters'
          ],
          fullTitleRule: [
            v => v !== undefined && v.length > 0 || 'Required'
          ],
          numberFormRule: [
            v => v === undefined || Number(v) >= 0 || 'Must be nonnegative'
          ]
        }
      }

    };
  },
  methods: {
    addCustomClass: function () {
      const newClass = {
        subject_id: this.form.values.shortTitle,
        title: this.form.values.fullTitle,
        total_units: Number(this.form.values.units) || 0,
        in_class_hours: Number(this.form.values.inClassHours) || 0,
        out_of_class_hours: Number(this.form.values.outOfClassHours) || 0,
        custom_color: this.form.values.colorChosen,
        public: false,
        offered_fall: true,
        offered_IAP: true,
        offered_spring: true,
        offered_summer: true
      };
      this.viewDialog = false;
      this.$store.commit('addFromCard', newClass);
    },
    validate: function () {
      if (this.$refs.form.validate()) {
        this.addCustomClass();
      }
    }
  }
};
</script>
