<template>
  <v-card>
    <center>
      <v-btn class="white--text" color="green" @click="viewDialog = true">
        Create a Custom Activity
      </v-btn>
    </center>
    <v-dialog v-model="viewDialog" max-width="600">
      <v-card>
        <v-btn icon flat style="float:right" @click="viewDialog=false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-card-title>
          <h2>Custom Activities</h2>
        </v-card-title>
        <v-select class="px-3" label="Edit an Existing Custom Activity" :items="customClasses" return-object />
        <v-form ref="form" lazy-validation>
          <div class="px-3">
            <v-text-field v-model="form.values.shortTitle" label="Short Title" counter="8" required :rules="form.rules.shortTitleRule" />
            <v-text-field v-model="form.values.fullTitle" label="Full Title" required :rules="form.rules.fullTitleRule" />

            <v-card-text class="px-0"><h3>Units/Hours</h3></v-card-text>
            <div class="d-flex">
              <v-text-field v-model="form.values.units" label="Units" class="mx-3" type="number" />
              <v-text-field v-model="form.values.inClassHours" label="In-Class Hours" class="mx-3" type="number" />
              <v-text-field v-model="form.values.outOfClassHours" label="Out-of-Class Hours" class="mx-3" type="number" />
            </div>

            <v-card-text class="px-0"><h3>Color</h3></v-card-text>
            <center>
              <v-btn-toggle v-model="form.values.colorChosen" mandatory>
                <v-btn class="px-4 mr-2" color="#B55757" :value="'#B55757'" fab />
                <v-btn class="px-4 mx-2" color="#DE4343" :value="'#DE4343'" fab />
                <v-btn class="px-4 mx-2" color="#DE9043" :value="'#DE9043'" fab />
                <v-btn class="px-4 mx-2" color="#DE43DE" :value="'#DE43DE'" fab />
                <v-btn class="px-4 mx-2" color="#5786B5" :value="'#5786B5'" fab />
                <v-btn class="px-4 mx-2" color="#8657B5" :value="'#8657B5'" fab />
                <v-btn class="px-4 mx-2" color="#16B516" :value="'#16B516'" fab />
                <v-btn class="px-4 ml-2" color="#737373" :value="'#737373'" fab />
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
          shortTitleRule: [v => v !== undefined && v.length <= 8 || 'Title must be less than 8 characters', v => v !== undefined && v.length > 0 || 'Input is Required'],
          fullTitleRule: [v => v !== undefined && v.length > 0 || 'Input is Required'],
          numberFormRule: [v => this.numberFormRule(v) || 'Negative Number is Invalid']
        }
      }

    };
  },
  computed: {
    customClasses: function () {
      return this.$store.state.roads[this.$store.state.activeRoad].contents.customClasses;
    }
  },
  methods: {
    addCustomClass: function () {
      const newClass = {
        'id': this.form.values.shortTitle,
        'title': this.form.values.fullTitle,
        'units': this.form.values.units,
        'in_class_hours': this.form.values.inClassHours,
        'out_of_class_hours': this.form.values.outOfClassHours,
        'custom_color': this.form.values.colorChosen
      };
      this.$store.commit('addCustomClass', newClass);
    },
    validate: function () {
      if (this.$refs.form.validate()) {
        // TODO Send to store results of form to create custom class
        this.addCustomClass();
      }
    },
    numberFormRule: function (value) {
      const regex = new RegExp('(?!-).*');
      return regex.test(value);
    }
  }
};
</script>
