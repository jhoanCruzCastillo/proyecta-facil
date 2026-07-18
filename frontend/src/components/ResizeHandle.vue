<script setup lang="ts">
const emit = defineEmits<{ resize: [delta: number] }>();

function handleMouseDown(e: MouseEvent) {
  e.preventDefault();
  let lastX = e.clientX;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';

  function handleMouseMove(ev: MouseEvent) {
    const delta = ev.clientX - lastX;
    lastX = ev.clientX;
    emit('resize', delta);
  }

  function handleMouseUp() {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}
</script>

<template>
  <div
    @mousedown="handleMouseDown"
    class="w-1 shrink-0 cursor-col-resize hover:bg-brand-300 active:bg-brand-400 bg-gray-200 transition-colors duration-75 relative"
  >
    <div class="absolute inset-y-0 -left-1 -right-1" />
  </div>
</template>
