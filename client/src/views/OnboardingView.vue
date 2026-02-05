<template>
  <div class="_onboardingView">
    <div class="_onboardingView--content">
      <transition name="fade" mode="out-in">
        <!-- Step 1: collective (orange) -->
        <div :key="current_step">
          <template v-if="current_step === 0">
            <h1 class="_onboardingView--title">
              {{ titleCollectiveBefore }}
              <span class="_highlight _highlight_orange">{{
                $t("onboarding_highlight_collective")
              }}</span>
            </h1>
            <p class="_onboardingView--subtitle">
              {{ $t("onboarding_subtitle_collective") }}
            </p>
            <p class="_onboardingView--body">
              {{ $t("onboarding_body_collective") }}
            </p>
            <div class="_onboardingView--image">
              <img
                :src="$root.publicPath + 'onboarding/onboarding-orange.png'"
                :alt="$t('onboarding_highlight_collective')"
              />
            </div>
          </template>

          <!-- Step 2: connaissance (blue) -->
          <template v-if="current_step === 1">
            <h1 class="_onboardingView--title">
              {{ titleConnaissanceBefore }}
              <span class="_highlight _highlight_blue">{{
                $t("onboarding_highlight_connaissance")
              }}</span>
              {{ titleConnaissanceAfter }}
            </h1>
            <h2 class="_onboardingView--body">
              {{ $t("onboarding_body_connaissance_1") }}
            </h2>
            <p class="_onboardingView--body">
              {{ $t("onboarding_body_connaissance_2") }}
            </p>
            <div class="_onboardingView--image">
              <img
                :src="$root.publicPath + 'onboarding/onboarding-blue.png'"
                :alt="$t('onboarding_highlight_connaissance')"
              />
            </div>
          </template>

          <!-- Step 3: transmission (green) -->
          <template v-if="current_step === 2">
            <h1 class="_onboardingView--title">
              {{ titleTransmissionBefore }}
              <span class="_highlight _highlight_green">{{
                $t("onboarding_highlight_transmission")
              }}</span>
            </h1>
            <h2 class="_onboardingView--body">
              {{ $t("onboarding_body_transmission_1") }}
            </h2>
            <p class="_onboardingView--body">
              {{ $t("onboarding_body_transmission_2") }}
            </p>
            <div class="_onboardingView--image">
              <img
                :src="$root.publicPath + 'onboarding/onboarding-green.png'"
                :alt="$t('onboarding_highlight_transmission')"
              />
            </div>
          </template>
        </div>
      </transition>

      <div class="_onboardingView--nav">
        <span class="_onboardingView--step">
          <button
            v-if="current_step > 0"
            type="button"
            class="u-buttonLink"
            @click="current_step = current_step - 1"
          >
            ←
            {{
              $t("onboarding_space_step", {
                current: current_step + 1,
                total: 3,
              })
            }}
          </button>
        </span>
        <button type="button" class="u-button u-button_dark" @click="goNext">
          {{
            current_step === 2
              ? $t("onboarding_finish")
              : $t("onboarding_next_space")
          }}
        </button>
      </div>
    </div>

    <div class="_onboardingView--skip">
      <router-link to="/contribute" class="_skipLink">
        {{ $t("onboarding_skip_demo") }}
      </router-link>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      current_step: 0,
    };
  },
  computed: {
    titleCollectiveBefore() {
      const title = this.$t("onboarding_title_collective");
      const highlight = this.$t("onboarding_highlight_collective");
      const idx = title.indexOf(highlight);
      return idx >= 0 ? title.slice(0, idx) : title;
    },
    titleConnaissanceBefore() {
      const title = this.$t("onboarding_title_connaissance");
      const highlight = this.$t("onboarding_highlight_connaissance");
      const idx = title.indexOf(highlight);
      return idx >= 0 ? title.slice(0, idx) : title;
    },
    titleConnaissanceAfter() {
      const title = this.$t("onboarding_title_connaissance");
      const highlight = this.$t("onboarding_highlight_connaissance");
      const idx = title.indexOf(highlight);
      return idx >= 0 ? title.slice(idx + highlight.length) : "";
    },
    titleTransmissionBefore() {
      const title = this.$t("onboarding_title_transmission");
      const highlight = this.$t("onboarding_highlight_transmission");
      const idx = title.indexOf(highlight);
      return idx >= 0 ? title.slice(0, idx) : title;
    },
  },
  mounted() {
    if (!this.connected_as) {
      this.$router.replace("/login");
    }
  },
  methods: {
    goNext() {
      if (this.current_step === 2) {
        this.$router.push("/contribute");
      } else {
        this.current_step += 1;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._onboardingView {
  min-height: 100%;
  background-color: var(--g-50);
  padding: calc(var(--spacing) * 2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

._onboardingView--content {
  background: var(--panel-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing) * 2);
  width: 100%;
  max-width: 480px;
}

._onboardingView--image {
  margin-bottom: calc(var(--spacing) * 1.5);
  text-align: center;
  max-width: 240px;
  margin: 0 auto;

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
}

._onboardingView--title {
  padding-bottom: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 2);
  // font-size: var(--sl-font-size-xx-large);
  // font-weight: 600;
  // line-height: 1.3;
  border-bottom: 1px solid var(--g-200);

  ._highlight {
    padding: 0 0.15em;
    border-radius: 2px;
  }
  ._highlight_orange {
    background: #f0a050;
    color: #1a1a1a;
  }
  ._highlight_blue {
    background: #7eb8da;
    color: #1a1a1a;
  }
  ._highlight_green {
    background: #7bc89c;
    color: #1a1a1a;
  }
}

._onboardingView--subtitle {
}

._onboardingView--body {
  margin: 0 0 calc(var(--spacing) * 1);

  &:last-of-type {
    margin-bottom: 0;
  }
}

._onboardingView--nav {
  margin-top: calc(var(--spacing) * 2);
  padding-top: calc(var(--spacing) * 1.5);
  border-top: 1px solid var(--g-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing);
}

._onboardingView--step {
  font-size: var(--sl-font-size-small);
  color: var(--g-600);

  .u-buttonLink {
    margin-right: 0.25em;
  }
}

.u-button_dark {
  background: var(--g-700);
  color: var(--panel-color);
  border: none;
  padding: 0.5em 1em;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--sl-font-size-medium);

  &:hover {
    background: var(--g-800);
  }
}

._onboardingView--skip {
  margin-top: calc(var(--spacing) * 1.5);
  width: 100%;
  max-width: 480px;
  text-align: center;
}

._skipLink {
  display: block;
  padding: calc(var(--spacing) * 1);
  background: var(--g-700);
  color: var(--panel-color);
  border-radius: var(--border-radius);
  text-decoration: none;
  font-size: var(--sl-font-size-medium);

  &:hover {
    background: var(--g-800);
  }
}
</style>
