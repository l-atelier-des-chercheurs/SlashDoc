<template>
  <div class="_onboardingView">
    <div class="_onboardingView--content">
      <h1>{{ $t("onboarding") }}</h1>
      <p class="u-instructions">
        {{ $t("onboarding_intro") }}
      </p>
      <div class="_onboardingView--footer">
        <router-link to="/contribute" class="u-button u-button_bleuvert">
          {{ $t("contribute") }}
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  mounted() {
    if (!this.connected_as) {
      this.$router.replace("/login");
    }
  },
};
</script>
<style lang="scss" scoped>
._onboardingView {
  min-height: 100%;
  background-color: var(--g-50);
  padding: calc(var(--spacing) * 2);
  display: flex;
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

  h1 {
    margin: 0 0 calc(var(--spacing) * 2);
    font-size: var(--sl-font-size-xx-large);
  }
}

._onboardingView--footer {
  margin-top: calc(var(--spacing) * 2);
  padding-top: calc(var(--spacing) * 1.5);
  border-top: 1px solid var(--g-200);
}
</style>
