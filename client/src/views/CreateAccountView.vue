<template>
  <div class="_createAccountView">
    <div class="_createAccountView--content">
      <h1>{{ $t("create_account") }}</h1>
      <CreateAuthor :is_first_user="is_first_user" @close="goToLogin" />
      <div class="_createAccountView--footer">
        <router-link to="/login" class="u-buttonLink">
          <b-icon icon="arrow-left-short" />
          {{ $t("back") }} {{ $t("login") }}
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>
import CreateAuthor from "@/adc-core/author/CreateAuthor.vue";

export default {
  components: {
    CreateAuthor,
  },
  data() {
    return {
      authors: [],
    };
  },
  async mounted() {
    const authors = await this.$api.getFolders({ path: "authors" });
    this.authors = authors;
  },
  computed: {
    is_first_user() {
      return !this.authors || this.authors.length === 0;
    },
  },
  methods: {
    goToLogin() {
      this.$router.push("/login");
    },
  },
};
</script>
<style lang="scss" scoped>
._createAccountView {
  min-height: 100%;
  background-color: var(--g-50);
  padding: calc(var(--spacing) * 2);
  display: flex;
  align-items: center;
  justify-content: center;
}

._createAccountView--content {
  background: var(--panel-color);

  border-radius: var(--border-radius);
  padding: calc(var(--spacing) * 2);
  width: 100%;
  max-width: 480px;

  h1 {
    margin: 0 0 calc(var(--spacing) * 2);
    font-size: var(--sl-font-size-xx-large);
  }
}

._createAccountView--footer {
  margin-top: calc(var(--spacing) * 2);
  padding-top: calc(var(--spacing) * 1.5);
  border-top: 1px solid var(--g-200);
}
</style>
