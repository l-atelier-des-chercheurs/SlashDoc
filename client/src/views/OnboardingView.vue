<template>
  <div class="_onboardingView">
    <div
      class="_onboardingView--content"
      :class="{ '_content-wide': current_step === 3 }"
    >
      <transition name="fade" mode="out-in">
        <!-- Step 4: Welcome overview with three columns -->
        <div v-if="current_step === 3" :key="'welcome-4'" class="_welcomeStep">
          <h1 class="_onboardingView--title _welcomeTitle">
            {{ $t("onboarding_welcome_title") }}
          </h1>
          <p class="_onboardingView--subtitle _welcomeSubtitle">
            {{ $t("onboarding_welcome_subtitle") }}
          </p>
          <div
            class="_threeColumns"
            :class="{ 'is--mobile': $root.is_mobile_view }"
          >
            <div class="_column">
              <div class="_navButton">
                <b-icon icon="upload" />
                {{ $t("onboarding_contribute_title") }}
              </div>
              <div class="_columnImage">
                <img
                  :src="
                    $root.publicPath + 'onboarding/onboarding-contribute.png'
                  "
                  :alt="$t('onboarding_contribute_title')"
                />
              </div>
              <p>{{ $t("onboarding_contribute_description") }}</p>
            </div>
            <div class="_column">
              <div class="_navButton">
                <b-icon icon="grid" />
                {{ $t("onboarding_explore_title") }}
              </div>
              <div class="_columnImage">
                <img
                  :src="$root.publicPath + 'onboarding/onboarding-explore.png'"
                  :alt="$t('onboarding_explore_title')"
                />
              </div>
              <p>{{ $t("onboarding_explore_description") }}</p>
            </div>
            <div class="_column">
              <div class="_navButton">
                <b-icon icon="file-earmark" />
                {{ $t("onboarding_publish_title") }}
              </div>
              <div class="_columnImage">
                <img
                  :src="$root.publicPath + 'onboarding/onboarding-publish.png'"
                  :alt="$t('onboarding_publish_title')"
                />
              </div>
              <p>{{ $t("onboarding_publish_description") }}</p>
            </div>
          </div>
          <p class="_welcomeConclusion">
            {{ $t("onboarding_welcome_conclusion") }}
          </p>
        </div>
        <!-- Steps 1-3: Original format -->
        <div v-else :key="`step-${current_step}`">
          <h1 class="_onboardingView--title">
            {{ current_step_data.title_before }}
            <span
              :class="['_highlight', `_highlight_${current_step_data.color}`]"
              >{{ current_step_data.highlight }}</span
            >
            {{ current_step_data.title_after }}
          </h1>
          <p
            v-if="current_step_data.subtitle"
            class="_onboardingView--subtitle"
          >
            {{ current_step_data.subtitle }}
          </p>
          <h2 v-if="current_step_data.body_title" class="_onboardingView--body">
            {{ current_step_data.body_title }}
          </h2>
          <p
            v-for="(body, bodyIndex) in current_step_data.body"
            :key="bodyIndex"
            class="_onboardingView--body"
          >
            {{ body }}
          </p>
          <div class="_onboardingView--image">
            <img
              :src="current_step_data.image_src"
              :alt="current_step_data.highlight"
            />
          </div>
        </div>
      </transition>

      <!-- Preload all images (hidden) -->
      <div
        style="
          position: absolute;
          visibility: hidden;
          pointer-events: none;
          width: 0;
          height: 0;
          overflow: hidden;
        "
      >
        <img
          v-for="(step, index) in steps"
          :key="`preload-${index}`"
          :src="step.image_src"
          :alt="step.highlight"
        />
      </div>
    </div>

    <div class="_onboardingView--nav">
      <span class="_onboardingView--step">
        <button
          v-if="current_step > 0"
          type="button"
          class="u-buttonLink"
          @click="goPrevious"
        >
          ←
          {{
            $t("onboarding_space_step", {
              current: current_step + 1,
              total: 4,
            })
          }}
        </button>
      </span>
      <button type="button" class="u-button u-button_black" @click="goNext">
        {{
          current_step === 3
            ? $t("onboarding_start")
            : current_step === 2
            ? $t("onboarding_finish")
            : $t("onboarding_next_space")
        }}
      </button>
    </div>
    <div class="_onboardingView--skip">
      <router-link to="/contribute" class="u-button u-button_black _skipLink">
        {{ $t("onboarding_skip_demo") }}
      </router-link>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  computed: {
    current_step() {
      const step = parseInt(this.$route.query.step, 10);
      // URL uses step numbers 1-4, convert to internal 0-3
      // Validate step is between 1 and 4, default to 0 (which maps to step 1) if invalid
      if (isNaN(step) || step < 1 || step > 4) {
        return 0;
      }
      return step - 1; // Convert URL step (1-4) to internal step (0-3)
    },
    steps() {
      const splitTitle = (titleKey, highlightKey) => {
        const title = this.$t(titleKey);
        const highlight = this.$t(highlightKey);
        const idx = title.indexOf(highlight);
        return {
          title_before: idx >= 0 ? title.slice(0, idx) : title,
          title_after: idx >= 0 ? title.slice(idx + highlight.length) : "",
        };
      };

      const base_path = this.$root?.publicPath || "/_client/";
      return [
        {
          color: "orange",
          highlight: this.$t("onboarding_highlight_collective"),
          ...splitTitle(
            "onboarding_title_collective",
            "onboarding_highlight_collective"
          ),
          subtitle: this.$t("onboarding_subtitle_collective"),
          body: [this.$t("onboarding_body_collective")],
          image_src: base_path + "onboarding/onboarding-orange.png",
        },
        {
          color: "blue",
          highlight: this.$t("onboarding_highlight_connaissance"),
          ...splitTitle(
            "onboarding_title_connaissance",
            "onboarding_highlight_connaissance"
          ),
          body_title: this.$t("onboarding_body_connaissance_1"),
          body: [this.$t("onboarding_body_connaissance_2")],
          image_src: base_path + "onboarding/onboarding-blue.png",
        },
        {
          color: "green",
          highlight: this.$t("onboarding_highlight_transmission"),
          ...splitTitle(
            "onboarding_title_transmission",
            "onboarding_highlight_transmission"
          ),
          body_title: this.$t("onboarding_body_transmission_1"),
          body: [this.$t("onboarding_body_transmission_2")],
          image_src: base_path + "onboarding/onboarding-green.png",
        },
      ];
    },
    current_step_data() {
      return this.steps[this.current_step] || this.steps[0];
    },
  },
  mounted() {
    if (!this.connected_as) {
      this.$router.replace("/login");
      return;
    }
    // If no step query parameter or invalid step, redirect to step 1
    const step = parseInt(this.$route.query.step, 10);
    if (isNaN(step) || step < 1 || step > 4) {
      this.$router.push({
        path: "/onboarding",
        query: { step: 1 },
      });
    }
  },
  methods: {
    goNext() {
      if (this.current_step === 3) {
        this.$router.push("/contribute");
      } else {
        // Convert internal step (0-3) to URL step (1-4)
        const url_step = this.current_step + 2;
        this.$router.push({
          path: "/onboarding",
          query: { step: url_step },
        });
      }
    },
    goPrevious() {
      if (this.current_step > 0) {
        // Convert internal step (0-3) to URL step (1-4)
        const url_step = this.current_step;
        this.$router.push({
          path: "/onboarding",
          query: { step: url_step },
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._onboardingView {
  background-color: var(--g-50);
  // padding: calc(var(--spacing) * 2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

._onboardingView--content {
  background: var(--panel-color);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing) * 2);
  width: 100%;
  max-width: 480px;

  &._content-wide {
    max-width: 900px;
  }
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
  width: 100%;
  max-width: 480px;
}

._onboardingView--content._content-wide ~ ._onboardingView--nav {
  max-width: 900px;
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
}

._onboardingView--skip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin-top: calc(var(--spacing) * 1.5);
  width: 100%;
  text-align: center;
}

._skipLink {
  display: block;
  border-radius: 0;
  padding: calc(var(--spacing) * 1);
}

// Step 4: Welcome overview styles
._welcomeTitle {
  text-align: center;
  border-bottom: none;
  padding-bottom: calc(var(--spacing) * 1);
  margin-bottom: calc(var(--spacing) * 1);
}

._welcomeSubtitle {
  text-align: center;
  margin-bottom: calc(var(--spacing) * 2);
}

._threeColumns {
  display: flex;
  // gap: var(--spacing);
  margin-bottom: calc(var(--spacing) * 2);
  flex-wrap: wrap;

  &.is--mobile {
    flex-direction: column;
  }
}
._navButton {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) / 2);
  border: 1px solid var(--g-200);
  padding: calc(var(--spacing) / 2);
  margin-right: -1px;
  font-size: var(--sl-font-size-large);
  margin-bottom: calc(var(--spacing) / 2);
}
._column {
  flex: 1;
  min-width: 200px;
  margin-bottom: calc(var(--spacing) * 2);

  p {
    margin-right: var(--spacing);
  }
}

._columnImage {
  margin: var(--spacing) 0;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
}

._welcomeConclusion {
  text-align: center;
  font-weight: 600;
  margin-top: calc(var(--spacing) * 2);
}
</style>
