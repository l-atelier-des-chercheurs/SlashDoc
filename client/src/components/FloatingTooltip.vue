<template>
  <div
    ref="root"
    class="_floatingTooltip"
    :class="{
      '_pointer-left': computed_pointer === 'left',
      '_pointer-right': computed_pointer === 'right',
      '_pointer-top': computed_pointer === 'top',
      '_pointer-bottom': computed_pointer === 'bottom',
      '_is-fixed': is_fixed,
      '_is-positioned': is_fixed && position_ready,
    }"
    :style="position_style"
  >
    <div class="_floatingTooltip--box">
      <h4 v-if="title" class="_floatingTooltip--title">{{ title }}</h4>
      <p v-if="body" class="_floatingTooltip--body">{{ body }}</p>
      <slot v-else name="body" />
      <div v-if="show_step && step_total > 1" class="_floatingTooltip--step">
        {{ step_current }}/{{ step_total }}
      </div>
      <div v-if="show_next" class="_floatingTooltip--actions">
        <button
          type="button"
          class="_floatingTooltip--next"
          @click="$emit('next')"
        >
          {{ is_last_step ? $t("tooltip_close") : $t("tooltip_next") }}
          <b-icon v-if="!is_last_step" icon="arrow-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    step_current: { type: Number, default: 1 },
    step_total: { type: Number, default: 0 },
    show_step: { type: Boolean, default: false },
    show_next: { type: Boolean, default: true },
    pointer: {
      type: String,
      default: "left",
      validator: (v) => ["left", "right", "top", "bottom"].includes(v),
    },
    target_el: { type: HTMLDivElement, default: null },
  },
  data() {
    return {
      position_style: {},
      position_ready: false,
      placement: null,
    };
  },
  computed: {
    is_last_step() {
      return this.step_total <= 1 || this.step_current >= this.step_total;
    },
    is_fixed() {
      return this.target_el != null;
    },
    computed_pointer() {
      if (this.is_fixed && this.placement) return this.placement;
      return this.pointer;
    },
  },
  watch: {
    target_el: {
      handler(el) {
        if (el) {
          this.$nextTick(() => this.updatePosition());
        } else {
          this.position_ready = false;
          this.position_style = {};
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.target_el) this.$nextTick(() => this.updatePosition());
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll, true);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll, true);
  },
  methods: {
    onResize() {
      if (this.target_el) this.updatePosition();
    },
    onScroll() {
      if (this.target_el) this.updatePosition();
    },
    updatePosition() {
      if (!this.target_el || !this.$refs.root) return;
      const pad = 16;
      const gap = 8;
      const viewport_w = window.innerWidth;
      const viewport_h = window.innerHeight;
      const target_rect = this.target_el.getBoundingClientRect();
      this.$refs.root.style.visibility = "hidden";
      this.position_ready = false;
      this.$nextTick(() => {
        const el = this.$refs.root;
        const tw = el.offsetWidth;
        const th = el.offsetHeight;
        this.$refs.root.style.visibility = "";
        const space_right = viewport_w - target_rect.right - pad;
        const space_left = target_rect.left - pad;
        const space_bottom = viewport_h - target_rect.bottom - pad;
        const space_top = target_rect.top - pad;
        let left = 0;
        let top = 0;
        let placement = "right";
        if (space_right >= tw + gap) {
          left = target_rect.right + gap;
          top = target_rect.top + target_rect.height / 2 - th / 2;
          placement = "right";
        } else if (space_left >= tw + gap) {
          left = target_rect.left - tw - gap;
          top = target_rect.top + target_rect.height / 2 - th / 2;
          placement = "left";
        } else if (space_bottom >= th + gap) {
          left = target_rect.left + target_rect.width / 2 - tw / 2;
          top = target_rect.bottom + gap;
          placement = "bottom";
        } else {
          left = target_rect.left + target_rect.width / 2 - tw / 2;
          top = target_rect.top - th - gap;
          placement = "top";
        }
        const pointer_map = {
          right: "left",
          left: "right",
          bottom: "top",
          top: "bottom",
        };
        this.placement = pointer_map[placement];
        left = Math.max(pad, Math.min(viewport_w - tw - pad, left));
        top = Math.max(pad, Math.min(viewport_h - th - pad, top));
        this.position_style = { left: `${left}px`, top: `${top}px` };
        this.position_ready = true;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
._floatingTooltip {
  position: absolute;
  z-index: 20;
  display: flex;
  align-items: flex-start;

  &._pointer-left {
    ._floatingTooltip--box::before {
      left: -8px;
      right: auto;
      border-width: 8px 8px 8px 0;
      border-color: transparent var(--floating-tooltip-bg) transparent
        transparent;
    }
  }

  &._pointer-right {
    ._floatingTooltip--box::before {
      right: -8px;
      left: auto;
      border-width: 8px 0 8px 8px;
      border-color: transparent transparent transparent
        var(--floating-tooltip-bg);
    }
  }

  &._pointer-top {
    position: relative;
    margin-top: calc(var(--spacing) * 1);

    ._floatingTooltip--box::before {
      top: -8px;
      left: 24px;
      right: auto;
      border-width: 0 8px 8px 8px;
      border-color: transparent transparent var(--floating-tooltip-bg)
        transparent;
    }
  }

  &._pointer-bottom {
    ._floatingTooltip--box::before {
      top: auto;
      bottom: -8px;
      left: 24px;
      right: auto;
      border-width: 8px 8px 0 8px;
      border-color: var(--floating-tooltip-bg) transparent transparent
        transparent;
    }
  }

  &._is-fixed {
    position: fixed;
    z-index: 10000;
    visibility: hidden;

    &._is-positioned {
      visibility: visible;
      opacity: 1;
      transition: opacity 0.15s ease;
    }
  }
}

._floatingTooltip--box {
  --floating-tooltip-bg: #4a4a4a;
  position: relative;
  max-width: 320px;
  padding: calc(var(--spacing) * 1.5) calc(var(--spacing) * 2);
  background: var(--floating-tooltip-bg);
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

  &::before {
    content: "";
    position: absolute;
    top: 24px;
    width: 0;
    height: 0;
    border-style: solid;
  }
}

._floatingTooltip--title {
  margin: 0 0 calc(var(--spacing) * 0.75);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #fff;
}

._floatingTooltip--body {
  margin: 0 0 calc(var(--spacing) * 1);
  font-size: 0.9rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.95);
}

._floatingTooltip--step {
  margin-bottom: calc(var(--spacing) * 1);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

._floatingTooltip--actions {
  display: flex;
  justify-content: flex-end;
  margin-top: calc(var(--spacing) * 1);
}

._floatingTooltip--next {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 0.5);
  padding: calc(var(--spacing) * 0.5) calc(var(--spacing) * 1);
  font-size: 0.85rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.25);
    outline: none;
  }

  .b-icon {
    flex-shrink: 0;
  }
}
</style>
