import { getCurrentInstance } from "vue";

export const useVuetify = () => {
  const vm = getCurrentInstance();
  return vm.proxy?.$vuetify || undefined;
};

export const useStore = () => {
  const vm = getCurrentInstance();
  return vm.proxy?.$store || undefined;
};

export const useCookies = () => {
  const vm = getCurrentInstance();
  return vm.proxy?.$cookies || undefined;
};
