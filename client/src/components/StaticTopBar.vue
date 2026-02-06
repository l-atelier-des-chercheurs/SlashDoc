<template>
  <div
    class="_staticTopBar"
    :class="{ 'is--mobileView': $root.is_mobile_view }"
  >
    <router-link to="/" class="_staticTopBar--logo">/doc</router-link>
    <div class="_staticTopBar--actions">
      <router-link to="/login" class="u-button u-button_transparent">
        {{ $t("login/create_account") }}
      </router-link>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
  },
  computed: {},
};
</script>
<style lang="scss" scoped>
._staticTopBar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding: 0 calc(var(--spacing) * 2);
}

._staticTopBar--logo {
  font-size: var(--sl-font-size-large);
  text-decoration: none;
  padding: calc(var(--spacing) / 1) 0;
}
</style>
