<template>
  <v-card>
    <v-btn
      class="white--text"
      color="grey"
      :block="true"
      @click="openNewClass()"
    >
      New Custom Activity
    </v-btn>
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-btn icon text style="float: right" @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-title>
          <h2>
            <span v-if="editing !== undefined">Edit </span>
            <span v-else>New </span>
            Custom Activity
          </h2>
        </v-card-title>
        <v-form ref="formElement" lazy-validation>
          <div class="px-4">
            <v-text-field
              v-model="form.values.shortTitle"
              label="Subject Number"
              counter="8"
              required
              :rules="form.rules.shortTitleRule"
            />
            <v-text-field
              v-model="form.values.fullTitle"
              label="Title"
              required
              :rules="form.rules.fullTitleRule"
            />

            <v-card-text class="px-0">
              <h3>Units/Hours</h3>
            </v-card-text>
            <div class="d-flex">
              <v-text-field
                v-model="form.values.units"
                label="Units"
                class="mx-4"
                type="number"
                :rules="form.rules.numberFormRule"
              />
              <v-text-field
                v-model="form.values.inClassHours"
                label="In-Class Hours"
                class="mx-4"
                type="number"
                :rules="form.rules.numberFormRule"
              />
              <v-text-field
                v-model="form.values.outOfClassHours"
                label="Out-of-Class Hours"
                class="mx-4"
                type="number"
                :rules="form.rules.numberFormRule"
              />
            </div>

            <v-card-text class="px-0">
              <h3>Color</h3>
            </v-card-text>
            <div style="text-align: center">
              <v-btn-toggle
                v-model="form.values.colorChosen"
                mandatory
                class="elevation-0"
              >
                <v-row>
                  <v-col class="xs12">
                    <v-btn
                      class="white--text px-6 ma-2"
                      value="default"
                      :color="getRawColor()"
                    >
                      Default
                    </v-btn>
                  </v-col>
                  <v-col v-for="(_i, i) in 7" :key="i">
                    <v-btn
                      v-for="(_j, j) in 6"
                      :key="j"
                      class="px-4 ma-2"
                      :color="getRawColor(`custom_color-${6 * i + j}`)"
                      :value="`@${6 * i + j}`"
                    >
                      <!-- <font-awesome-icon icon="check" /> -->
                      <v-icon
                        :color="getRawTextColor(`custom_color-${6 * i + j}`)"
                        >mdi-check</v-icon
                      >
                    </v-btn>
                  </v-col>
                </v-row>
              </v-btn-toggle>
            </div>
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

<script setup>
import { getRawColor, getRawTextColor } from "../mixins/colorMixin.js";
import { ref, watch, computed, reactive } from "vue";
import { useStore } from "../plugins/composition.js";

const store = useStore();

const dialog = ref(false);
const form = reactive({
  values: {
    shortTitle: ref(undefined),
    fullTitle: ref(undefined),
    units: ref(undefined),
    inClassHours: ref(undefined),
    outOfClassHours: ref(undefined),
    colorChosen: ref("default"),
  },
  rules: {
    shortTitleRule: [
      (v) => (v && v.length > 0) || "Required",
      (v) => (v && v.length <= 8) || "Max 8 characters",
    ],
    fullTitleRule: [(v) => (v && v.length > 0) || "Required"],
    numberFormRule: [(v) => !v || Number(v) >= 0 || "Must be nonnegative"],
  },
});

// template ref
const formElement = ref(null);

const editing = computed(() => store.customClassEditing);

watch(editing, (classEditing) => {
  if (classEditing === undefined) {
    return;
  }
  form.values.shortTitle = classEditing.subject_id;
  form.values.fullTitle = classEditing.title;
  form.values.units = classEditing.units;
  form.values.inClassHours = classEditing.in_class_hours;
  form.values.outOfClassHours = classEditing.out_of_class_hours;
  form.values.colorChosen = classEditing.custom_color || "default";
  dialog.value = true;
});

watch(dialog, (newDialog) => {
  if (!newDialog) {
    store.cancelEditCustomClass();
  }
});

const addCustomClass = () => {
  let color = form.values.colorChosen;
  if (color === "default") {
    color = undefined;
  }
  const newClass = {
    subject_id: form.values.shortTitle,
    title: form.values.fullTitle,
    total_units: Number(form.values.units) || 0,
    in_class_hours: Number(form.values.inClassHours) || 0,
    out_of_class_hours: Number(form.values.outOfClassHours) || 0,
    custom_color: color,
    public: false,
    offered_fall: true,
    offered_IAP: true,
    offered_spring: true,
    offered_summer: true,
  };
  dialog.value = false;
  if (editing.value !== undefined) {
    store.finishEditCustomClass(newClass);
  } else {
    store.addFromCard(newClass);
  }
};

const openNewClass = () => {
  // Open the dialog for adding a new class
  if (formElement.value) {
    formElement.value.reset();
  }
  form.values.colorChosen = "default";
  dialog.value = true;
};

const validate = () => {
  if (formElement.value && formElement.value.validate()) {
    addCustomClass();
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
