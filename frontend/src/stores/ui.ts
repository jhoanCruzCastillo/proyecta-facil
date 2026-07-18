import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export const useUiStore = defineStore('ui', () => {
  const sidebarHidden = ref(false);
  const toasts = ref<ToastItem[]>([]);

  function toast(message: string, type: ToastType = 'success') {
    const id = crypto.randomUUID();
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 2500);
  }

  function hideSidebar() {
    sidebarHidden.value = true;
  }

  function showSidebar() {
    sidebarHidden.value = false;
  }

  return { sidebarHidden, toasts, toast, hideSidebar, showSidebar };
});
