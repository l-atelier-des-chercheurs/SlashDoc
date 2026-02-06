<template>
  <div class="_loginView">
    <div class="_loginView--content">
      <h1>{{ $t("connect") }}</h1>

      <form v-if="!connected_as" @submit.prevent="login">
        <transition name="pagechange" mode="out-in">
          <div v-if="!author_to_login_to" key="search">
            <transition name="pagechange" mode="out-in">
              <div
                v-if="
                  author_suggestions === false && !debouncing_search_author_name
                "
                key="none"
              />
              <div
                v-else-if="
                  author_suggestions.length === 0 &&
                  !debouncing_search_author_name
                "
                class="u-instructions u-spacingBottom"
                key="no_author"
              >
                <b-icon icon="exclamation-triangle-fill" />
                {{ $t("login_no_account_matches") }}
              </div>
              <div
                v-else-if="author_suggestions.length > 0"
                class="u-spacingBottom u-listOfAvatars"
                key="list"
              >
                <AuthorTag
                  v-for="atpath in author_suggestions"
                  :key="atpath"
                  :path="atpath"
                  :mode="'select'"
                  @click="checkAuthor(atpath)"
                />
              </div>
              <div
                v-if="debouncing_search_author_name"
                class="u-instructions u-spacingBottom"
                key="debouncing"
              >
                <span class="_blinking-dots">…</span>
              </div>
            </transition>
            <div class="u-spacingBottom">
              <TextInput
                :content.sync="search_author_name"
                ref="name_field"
                :label_str="'name_or_pseudonym'"
                :required="true"
                :autofocus="true"
                :input_type="'text'"
                :autocomplete="'username'"
                @toggleValidity="allow_save = $event"
                @onEnter="setFirstSuggestion"
              />
            </div>
          </div>
          <div v-else key="login">
            <div class="u-spacingBottom">
              <AuthorTag
                :key="author_to_login_to.$path"
                :path="author_to_login_to.$path"
              />
            </div>
            <div class="u-spacingBottom">
              <TextInput
                :label_str="'password'"
                ref="password_field"
                :content.sync="input_password"
                :required="true"
                :autofocus="true"
                :input_type="'password'"
                :autocomplete="'current-password'"
                @toggleValidity="allow_save = $event"
                @onEnter="login"
              />
            </div>
            <button
              type="button"
              class="u-buttonLink"
              :class="{ 'is--active': show_recover_modal }"
              @click="show_recover_modal = true"
            >
              {{ $t("recover_password") }}
            </button>
            <RecoverPasswordModal
              v-if="show_recover_modal"
              :author="author_to_login_to"
              @close="show_recover_modal = false"
            />
            <div v-if="msg_password_is_wrong" class="u-warning u-spacingBottom">
              {{ msg_password_is_wrong }}
            </div>

            <div class="u-spacingBottom"></div>
            <div class="_loginView--buttons">
              <button
                type="button"
                class="u-buttonLink"
                @click="author_to_login_to = undefined"
              >
                <b-icon icon="arrow-left-short" />
                {{ $t("back") }}
              </button>

              <button
                type="submit"
                class="u-button u-button_bleuvert"
                :disabled="connection_status === 'pending'"
              >
                <LoaderSpinner v-if="connection_status === 'pending'" />
                <template v-else>{{ $t("login") }}</template>
              </button>
            </div>
          </div>
        </transition>
      </form>

      <template v-if="!author_to_login_to">
        <hr class="_loginView--separator" />

        <div class="_loginView--footer">
          <p class="_loginView--footer-text">{{ $t("not_yet_registered") }}</p>
          <router-link to="/login/create" class="u-button u-button_outline">
            {{ $t("create_account") }}
          </router-link>
        </div>

        <p v-if="authors.length === 0" class="u-instructions">
          <small>{{ $t("no_accounts_yet") }}</small>
        </p>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  components: {
    RecoverPasswordModal: () =>
      import("@/adc-core/modals/RecoverPasswordModal.vue"),
  },
  data() {
    return {
      authors: [],
      search_author_name: "",
      debounced_search_author_name: "",
      debounce_timeout: null,
      debouncing_search_author_name: false,
      author_to_login_to: undefined,
      input_password: "",
      show_recover_modal: false,
      connection_status: undefined,
      msg_password_is_wrong: undefined,
      allow_save: false,
    };
  },
  created() {},
  async mounted() {
    if (this.connected_as) {
      this.$router.replace("/");
      return;
    }
    this.$eventHub.$on("login.suggest", this.checkAuthor);
    this.authors = await this.$api.getFolders({ path: "authors" });
  },
  beforeDestroy() {
    this.$eventHub.$off("login.suggest", this.checkAuthor);
    if (this.debounce_timeout) {
      clearTimeout(this.debounce_timeout);
    }
  },
  watch: {
    search_author_name(new_value) {
      if (this.debounce_timeout) {
        clearTimeout(this.debounce_timeout);
      }

      // Immediately update if search is cleared
      if (new_value.length === 0) {
        this.debounced_search_author_name = "";
        this.debouncing_search_author_name = false;
        return;
      }

      this.debouncing_search_author_name = true;

      this.debounce_timeout = setTimeout(() => {
        this.debounced_search_author_name = new_value;
        this.debouncing_search_author_name = false;
      }, 500);
    },
  },
  computed: {
    author_suggestions() {
      if (
        this.debounced_search_author_name.length === 0 ||
        this.authors.length === 0
      )
        return false;
      const matching = this.authors.filter((a) =>
        this.twoStringsSearch(a.name, this.debounced_search_author_name)
      );
      return matching.map((m) => m.$path).slice(0, 5);
    },
  },
  methods: {
    setFirstSuggestion() {
      if (this.author_suggestions && this.author_suggestions.length > 0)
        this.checkAuthor(this.author_suggestions[0]);
    },
    async login() {
      this.connection_status = "pending";
      const author = this.author_to_login_to;
      if (!author) {
        this.$refs.name_field.$el.querySelector("input").focus();
        this.$alertify.delay(4000).error(this.$t("account_doesnt_exist"));
        this.connection_status = undefined;
        return;
      }
      const path = author.$path;
      this.$api
        .loginToFolder({
          path,
          password: this.input_password,
        })
        .then(() => {
          this.$alertify.delay(4000).success(this.$t("logged_in"));
          this.connection_status = "success";
          setTimeout(() => {
            window.location.reload();
          }, 500);
        })
        .catch((err) => {
          this.connection_status = "failed";
          if (err.code === "submitted_password_is_wrong") {
            this.$refs.password_field.$el.querySelector("input").focus();
            this.msg_password_is_wrong = this.$t("submitted_password_is_wrong");
            setTimeout(() => {
              this.msg_password_is_wrong = undefined;
            }, 3500);
          }
          this.connection_status = undefined;
        });
    },
    checkAuthor(path) {
      const a = this.authors.find((a) => a.$path === path);
      this.search_author_name = "";
      this.author_to_login_to = a;
    },
  },
};
</script>
<style lang="scss" scoped>
._loginView {
  min-height: 60vh;
  background-color: var(--g-50);
  padding: calc(var(--spacing) * 2);
  display: flex;
  align-items: center;
  justify-content: center;
}

._loginView--content {
  background: var(--panel-color);

  border-radius: var(--border-radius);
  padding: calc(var(--spacing) * 2);
  width: 100%;
  max-width: 480px;

  h1 {
    margin: 0 0 calc(var(--spacing) * 2.5);
    text-align: center;
  }
}

._loginView--footer {
}

._loginView--footer-text {
  margin: 0;
  margin: calc(var(--spacing) * 1) 0;
}

._loginView--footer .u-button_outline {
  background-color: var(--g-200);
  color: var(--g-900);
  border: none;
  width: 100%;

  &:hover,
  &:focus-visible {
    background-color: var(--g-300);
  }
}
._loginView--separator {
  margin: calc(var(--spacing) * 2) 0;
}

._blinking-dots {
  animation: blink 1s infinite;
  display: inline-block;
  font-size: 1.5em;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

._loginView--buttons {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: calc(var(--spacing) / 2);
  padding-top: calc(var(--spacing) * 2);
  border-top: 1px solid var(--g-200);
}
</style>
