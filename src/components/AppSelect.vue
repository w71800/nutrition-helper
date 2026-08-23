<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from "vue";

export type AppSelectOption = {
  value: string;
  label: string;
};

export type AppSelectGroup = {
  id: string;
  label: string;
  options: AppSelectOption[];
};

type ListItem =
  | { key: string; kind: "group"; label: string }
  | { key: string; kind: "option"; index: number; option: AppSelectOption };

const props = withDefaults(
  defineProps<{
    options?: AppSelectOption[];
    groups?: AppSelectGroup[];
    placeholder?: string;
    disabled?: boolean;
    id?: string;
  }>(),
  {
    options: () => [],
    groups: () => [],
    placeholder: "請選擇",
    disabled: false,
  },
);

const model = defineModel<string>({ default: "" });

const generatedId = useId();
const triggerId = computed(() => props.id ?? generatedId);
const listboxId = computed(() => `${triggerId.value}-listbox`);

const open = ref(false);
const openUp = ref(false);
const activeIndex = ref(-1);
const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const typeahead = ref("");
let typeaheadTimer = 0;

const normalizedGroups = computed(() => {
  if (props.groups.length) {
    return props.groups.filter((group) => group.options.length);
  }
  if (props.options.length) {
    return [{ id: "default", label: "", options: props.options }];
  }
  return [];
});

const listItems = computed(() => {
  const items: ListItem[] = [
    {
      key: "placeholder",
      kind: "option",
      index: 0,
      option: { value: "", label: props.placeholder },
    },
  ];
  let index = 1;
  for (const group of normalizedGroups.value) {
    if (group.label) {
      items.push({ key: `group-${group.id}`, kind: "group", label: group.label });
    }
    for (const option of group.options) {
      items.push({
        key: `option-${group.id}-${option.value}`,
        kind: "option",
        index,
        option,
      });
      index += 1;
    }
  }
  return items;
});

const flatOptions = computed(() =>
  listItems.value.flatMap((item) => (item.kind === "option" ? [item.option] : [])),
);

const selectedLabel = computed(
  () => flatOptions.value.find((option) => option.value === model.value)?.label ?? "",
);

function optionId(index: number) {
  return `${listboxId.value}-option-${index}`;
}

function close() {
  open.value = false;
  openUp.value = false;
  typeahead.value = "";
}

function selectIndex(index: number) {
  const option = flatOptions.value[index];
  if (!option) return;
  model.value = option.value;
  close();
}

async function toggle() {
  if (props.disabled) return;
  if (open.value) {
    close();
    return;
  }

  const selected = flatOptions.value.findIndex((option) => option.value === model.value);
  activeIndex.value = selected >= 0 ? selected : 0;
  open.value = true;
  await nextTick();

  const trigger = rootRef.value?.querySelector(".app-select-trigger");
  const panel = panelRef.value;
  if (trigger instanceof HTMLElement && panel) {
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    openUp.value = panel.offsetHeight > spaceBelow && rect.top > spaceBelow;
  }

  document.getElementById(optionId(activeIndex.value))?.scrollIntoView({
    block: "nearest",
  });
}

function moveActive(delta: number) {
  const last = flatOptions.value.length - 1;
  if (last < 0) return;
  if (activeIndex.value < 0) {
    activeIndex.value = delta > 0 ? 0 : last;
  } else {
    activeIndex.value = Math.min(last, Math.max(0, activeIndex.value + delta));
  }
  document.getElementById(optionId(activeIndex.value))?.scrollIntoView({
    block: "nearest",
  });
}

function matchTypeahead(query: string) {
  const start = Math.max(0, activeIndex.value + 1);
  const list = flatOptions.value;
  const haystack = [...list.slice(start), ...list.slice(0, start)];
  const offset = haystack.findIndex((option) =>
    option.label.toLocaleLowerCase("zh-Hant").startsWith(query),
  );
  if (offset < 0) return;
  return (start + offset) % list.length;
}

function onTypeahead(key: string) {
  typeahead.value = `${typeahead.value}${key}`.toLocaleLowerCase("zh-Hant");
  window.clearTimeout(typeaheadTimer);
  typeaheadTimer = window.setTimeout(() => {
    typeahead.value = "";
  }, 700);
  const index = matchTypeahead(typeahead.value);
  if (index == null) return;
  if (open.value) {
    activeIndex.value = index;
    document.getElementById(optionId(index))?.scrollIntoView({ block: "nearest" });
    return;
  }
  selectIndex(index);
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) return;

  if (event.key === "Escape") {
    if (!open.value) return;
    event.preventDefault();
    close();
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!open.value) {
      void toggle();
      return;
    }
    moveActive(1);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!open.value) {
      void toggle();
      return;
    }
    moveActive(-1);
    return;
  }

  if (event.key === "Home" && open.value) {
    event.preventDefault();
    activeIndex.value = 0;
    document.getElementById(optionId(0))?.scrollIntoView({ block: "nearest" });
    return;
  }

  if (event.key === "End" && open.value) {
    event.preventDefault();
    activeIndex.value = Math.max(0, flatOptions.value.length - 1);
    document.getElementById(optionId(activeIndex.value))?.scrollIntoView({
      block: "nearest",
    });
    return;
  }

  if ((event.key === "Enter" || event.key === " ") && open.value) {
    event.preventDefault();
    selectIndex(activeIndex.value);
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    void toggle();
    return;
  }

  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    onTypeahead(event.key);
  }
}

function onTriggerBlur(event: FocusEvent) {
  const next = event.relatedTarget;
  if (next instanceof Node && rootRef.value?.contains(next)) return;
  close();
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!open.value) return;
  const target = event.target;
  if (target instanceof Node && rootRef.value?.contains(target)) return;
  close();
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener("pointerdown", onDocumentPointerDown);
    return;
  }
  document.removeEventListener("pointerdown", onDocumentPointerDown);
});

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) close();
  },
);

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  window.clearTimeout(typeaheadTimer);
});
</script>

<template>
  <div ref="rootRef" class="app-select" :data-open="open ? 'true' : 'false'">
    <button
      :id="triggerId"
      type="button"
      class="app-select-trigger"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listboxId"
      :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
      :disabled="disabled"
      @click="toggle"
      @keydown="onTriggerKeydown"
      @blur="onTriggerBlur"
    >
      <span class="app-select-value" :data-placeholder="model ? undefined : 'true'">
        {{ model ? selectedLabel : placeholder }}
      </span>
      <svg class="app-select-chevron" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>

    <div
      v-if="open"
      :id="listboxId"
      ref="panelRef"
      class="app-select-panel"
      :data-placement="openUp ? 'top' : 'bottom'"
      role="listbox"
      :aria-labelledby="triggerId"
      @pointerdown.prevent
    >
      <template v-for="item in listItems" :key="item.key">
        <p v-if="item.kind === 'group'" class="app-select-group-label">{{ item.label }}</p>
        <div
          v-else
          :id="optionId(item.index)"
          class="app-select-option"
          role="option"
          :aria-selected="model === item.option.value"
          :data-empty="item.option.value === '' ? 'true' : undefined"
          :data-active="activeIndex === item.index ? 'true' : undefined"
          @mousemove="activeIndex = item.index"
          @click="selectIndex(item.index)"
        >
          {{ item.option.label }}
        </div>
      </template>
    </div>
  </div>
</template>
