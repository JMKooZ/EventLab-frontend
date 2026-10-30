<template>
  <header class="app-header">
    <div class="app-header__inner">
      <NuxtLink to="/" class="app-header__brand">
        <span class="app-header__brand-icon">E</span>
        <span>EventLab</span>
      </NuxtLink>

      <nav class="app-header__nav">
        <NuxtLink to="/" class="app-header__nav-item"> 대시보드 </NuxtLink>

        <a
          href="#"
          class="app-header__nav-item"
          @click.prevent="
            $emit('show-notice', '이용 안내는 추후 제공할 예정입니다.')
          "
          >이용안내</a
        >
      </nav>

      <div class="app-header__user">
        <div class="app-header__avatar">U</div>
        <span class="app-header__user-name">사용자</span>
      </div>
    </div>
  </header>
</template>

<script setup>
defineEmits(["show-notice"]);
</script>
