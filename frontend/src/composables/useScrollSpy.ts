import { type Ref, ref, shallowRef, watch } from 'vue';

// Scroll-spy bidireccional: IntersectionObserver detecta qué item está visible dentro del
// contenedor scrolleable, y `scrollToSection` hace scroll suave al hacer clic en el índice.
export function useScrollSpy(sectionIds: Ref<string[]>) {
  const activeId = ref<string | null>(sectionIds.value[0] ?? null);
  const containerRef = shallowRef<HTMLElement | null>(null);
  const isClickScrolling = ref(false);

  let observer: IntersectionObserver | null = null;

  function setupObserver() {
    observer?.disconnect();
    const container = containerRef.value;
    if (!container || sectionIds.value.length === 0) return;

    observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.value) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          activeId.value = visible[0].target.getAttribute('data-section-id');
        }
      },
      { root: container, rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    );

    for (const id of sectionIds.value) {
      const el = container.querySelector(`[data-section-id="${id}"]`);
      if (el) observer.observe(el);
    }
  }

  watch([containerRef, sectionIds], setupObserver, { immediate: true });

  function scrollToSection(sectionId: string) {
    const container = containerRef.value;
    if (!container) return;

    const el = container.querySelector(`[data-section-id="${sectionId}"]`);
    if (!el) return;

    isClickScrolling.value = true;
    activeId.value = sectionId;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => { isClickScrolling.value = false; }, 800);
  }

  return { activeId, containerRef, scrollToSection };
}
