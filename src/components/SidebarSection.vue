<template>
  <div class="sidebar-section">
    <!-- Сайдбар -->
    <SideBar
      :sidebar-items="sidebarItems"
      @select-item="$emit('select-item', $event)"
    />

    <!-- Выбор темы -->
    <ThemeMode
      :themes="themes"
      :show="true"
      @selected-theme="$emit('selected-theme', $event)"
    />
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { SideBar, ThemeMode } from "@mobilon-dev/chotto";

const props = defineProps({
  sidebarItems: { type: Array, required: true },
  themes: { type: Array, required: true },
});
</script>

<style scoped>
.sidebar-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
