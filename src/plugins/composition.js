// this file can be removed once we're using vue 3
// everything here can be done with new apis in later versions

import { getCurrentInstance } from "vue";
import useCourseDataStore from "../stores/courseData";

export const useVuetify = () => {
  const vm = getCurrentInstance();
  return vm.proxy?.$vuetify || undefined;
};

export const useStore = useCourseDataStore;

export const useCookies = () => {
  const vm = getCurrentInstance();
  return vm.proxy?.$cookies || undefined;
};

export const useRoute = () => {
  const vm = getCurrentInstance();
  return vm.proxy?.$route || undefined;
};

export const useRouter = () => {
  const vm = getCurrentInstance();
  return vm.proxy?.$router || undefined;
};
