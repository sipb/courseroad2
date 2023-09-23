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
              <v-btn-toggle v-model="form.values.colorChosen" class="elevation-0">
                <v-layout row wrap>
                  <v-flex>
                    <v-btn class="px-4 ma-2" color="#B55757" :value="'@0'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#B58657" :value="'@1'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#B5B557" :value="'@2'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#86B557" :value="'@3'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#57B557" :value="'@4'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#57B586" :value="'@5'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn class="px-4 ma-2" color="#DE4343" :value="'@6'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#DE9043" :value="'@7'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#DEDE43" :value="'@8'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#90DE43" :value="'@9'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#43DE43" :value="'@10'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#43DE90" :value="'@11'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn class="px-4 ma-2" color="#B51616" :value="'@12'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#B56516" :value="'@13'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#B5B516" :value="'@14'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#65B516" :value="'@15'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#16B516" :value="'@16'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#16B565" :value="'@17'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn class="px-4 ma-2" color="#57B5B5" :value="'@18'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#5786B5" :value="'@19'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#5757B5" :value="'@20'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#8657B5" :value="'@21'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#B557B5" :value="'@22'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#B55786" :value="'@23'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn class="px-4 ma-2" color="#43DEDE" :value="'@24'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#4390DE" :value="'@25'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#4343DE" :value="'@26'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#9043DE" :value="'@27'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#DE43DE" :value="'@28'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#DE4390" :value="'@29'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn class="px-4 ma-2" color="#16B5B5" :value="'@30'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#1665B5" :value="'@31'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#1616B5" :value="'@32'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#6516B5" :value="'@33'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#B516B5" :value="'@34'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#B51665" :value="'@35'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn class="px-4 ma-2" color="#000000" :value="'@36'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#262626" :value="'@37'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#4D4D4D" :value="'@38'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#737373" :value="'@39'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#999999" :value="'@40'">
                      <font-awesome-icon icon="check" />
                    </v-btn>
                    <v-btn class="px-4 ma-2" color="#BFBFBF" :value="'@41'">
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
        custom_color: this.form.values.colorChosen || "@40",
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
