<script setup>
import { ref } from "vue";

const notice = ref("");
let noticeTimer;

const showNotice = (message) => {
  notice.value = message;

  if (import.meta.client) {
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => {
      notice.value = "";
    }, 2500);
  }
};
</script>

<template>
  <div class="app-layout">
    <AppHeader @show-notice="showNotice" />

    <slot />

    <AppFooter />

    <Transition name="toast">
      <div v-if="notice" class="toast-message" role="status">
        {{ notice }}
      </div>
    </Transition>
  </div>
</template>
