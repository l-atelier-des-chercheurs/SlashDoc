<template>
  <div class="_createAccountView">
    <div class="_createAccountView--content">
      <form
        class="input-validation-required _createAccountForm"
        @submit.prevent="createAuthor"
      >
        <h1 class="_createAccountView--title">
          {{ $t("join_slashdoc") }}
        </h1>
        <div class="_createAccountView--divider"></div>
        <h2 class="_createAccountView--instruction">
          {{ $t("recommend_org_email") }}
        </h2>

        <div class="_createAccountView--fields">
          <div class="_createAccountView--field">
            <TextInput
              :content.sync="new_author_email"
              :label_str="'email'"
              :required="$root.app_infos.instance_meta.require_mail_to_signup"
              :input_type="'email'"
              :autocomplete="'email'"
              @toggleValidity="($event) => (email_valid = $event)"
            />
          </div>

          <div class="_createAccountView--field">
            <TextInput
              :content.sync="new_author_last_name"
              :label_str="'last_name'"
              :required="true"
              :autocomplete="'family-name'"
              @toggleValidity="checkValidity"
            />
          </div>

          <div class="_createAccountView--field">
            <TextInput
              :content.sync="new_author_first_name"
              :label_str="'first_name'"
              :required="true"
              :autofocus="true"
              :autocomplete="'given-name'"
              @toggleValidity="checkValidity"
            />
          </div>
        </div>

        <div class="_createAccountView--terms">
          <label class="_createAccountView--termsLabel">
            <input
              type="checkbox"
              v-model="terms_accepted"
              class="_createAccountView--checkbox"
            />
            <span class="_createAccountView--termsText">
              {{ $t("accept_terms_text_start") }}
              <router-link to="/terms" class="_createAccountView--termsLink">
                {{ $t("terms_of_use_of_slashdoc") }}
              </router-link>
              {{ $t("accept_terms_text_middle") }}
              <router-link
                to="/confidentiality"
                class="_createAccountView--termsLink"
              >
                {{ $t("privacy_policy_of_slashdoc") }}
              </router-link>
              {{ $t("accept_terms_text_end") }}
            </span>
          </label>
        </div>

        <button
          type="submit"
          class="u-button u-button_orange _createAccountView--submitButton"
          :disabled="terms_accepted === false"
          :class="{ 'is--loading': is_creating_author }"
        >
          <LoaderSpinner v-if="is_creating_author" />
          <template v-else>{{ $t("accept_and_signup") }}</template>
        </button>
      </form>

      <!-- Success message -->
      <div v-if="account_created_notice" class="u-successMsg">
        {{ $t("account_created") }}
      </div>

      <div class="_createAccountView--footer">
        <router-link to="/login" class="u-buttonLink">
          <b-icon icon="arrow-left-short" />
          {{ $t("back") }}
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      authors: [],

      // Form fields
      new_author_email: "",
      new_author_first_name: "",
      new_author_last_name: "",
      new_author_password: "",
      new_author_cover_raw: undefined,

      is_creating_author: false,
      error_msg: "",

      can_create_author: false,
      submitted_signup_password: "",
      is_submitting_signup_password: false,

      account_created_notice: false,

      terms_accepted: false,
      email_valid: false,
      first_name_valid: false,
      last_name_valid: false,
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
    signup_password() {
      return this.$root.app_infos.instance_meta.signup_password_hashed;
    },
    combined_name() {
      // Combine first and last name, prioritizing first name
      const parts = [];
      if (this.new_author_first_name.trim()) {
        parts.push(this.new_author_first_name.trim());
      }
      if (this.new_author_last_name.trim()) {
        parts.push(this.new_author_last_name.trim());
      }
      return parts.join(" ") || this.new_author_first_name || "";
    },
  },
  methods: {
    goToLogin() {
      this.$router.push("/login");
    },
    checkValidity(is_valid) {
      // This is called from TextInput's toggleValidity event
      // We can use it to track field validity if needed
    },
    async createAuthor() {
      if (!this.combined_name.trim()) {
        this.$alertify
          .delay(4000)
          .error(this.$t("name") + " " + this.$t("required"));
        return;
      }

      this.is_creating_author = true;

      try {
        // Generate a simple password - users will need to reset it
        // Or we could show a password field, but the image doesn't show one
        const temp_password =
          Math.random().toString(36).slice(2) +
          Math.random().toString(36).slice(2);

        const author_slug = await this.$api.createFolder({
          path: "authors",
          additional_meta: {
            email: this.new_author_email,
            name: this.combined_name,
            requested_slug: this.combined_name,
            $status: "public",
            $password: temp_password,
          },
        });

        this.$alertify.delay(4000).success(this.$t("account_created"));

        // Only login if not yet connected
        if (!this.connected_as) {
          await this.$api.loginToFolder({
            path: "authors/" + author_slug,
            password: temp_password,
          });
        } else {
          // Otherwise we are instance admins
          this.account_created_notice = true;
          setTimeout(() => {
            this.account_created_notice = false;
          }, 3000);
        }

        if (!this.is_instance_admin) {
          // Reload the page to ensure user is properly connected before onboarding
          window.location.href = "/onboarding";
        }
      } catch (err) {
        if (err.code === "unique_field_taken") {
          this.$alertify
            .delay(4000)
            .error(this.$t("name_taken") + " : " + err.err_infos);
        } else {
          this.$alertify.delay(4000).error(err.message || "error:");
        }
      }
      this.is_creating_author = false;
    },

    hashCode(s) {
      return (
        "" +
        s.split("").reduce(function (a, b) {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0)
      );
    },
  },
};
</script>
<style lang="scss" scoped>
._createAccountView {
  background-color: var(--g-50);
  padding: calc(var(--spacing) * 2);
  overflow-y: auto;
  margin: 0 auto;
}

._createAccountView--content {
  background: white;
  width: 100%;
  padding: calc(var(--spacing) * 2);
  margin: 0 auto;
  max-width: 480px;
}

._createAccountForm {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 1.5);
}

._createAccountView--title {
  margin: 0;
  text-align: center;
}

._createAccountView--divider {
  width: 60%;
  height: 1px;
  background-color: var(--g-200);
  margin: 0 auto;
}

._createAccountView--instruction {
  margin: 0;
  text-align: center;
}
._createAccountView--field {
  margin-bottom: calc(var(--spacing) * 1);
}

._createAccountView--terms {
  margin: calc(var(--spacing) * 0.5) 0;
}

._createAccountView--termsLabel {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: calc(var(--spacing) / 2);
  cursor: pointer;
}

._createAccountView--checkbox {
  margin-top: 0.25em;
  flex-shrink: 0;
  width: 1.2em;
  height: 1.2em;
  cursor: pointer;
}

._createAccountView--termsText {
  flex: 1;
}

._createAccountView--termsLink {
  color: var(--g-700);
  text-decoration: underline;
  font-weight: 500;
}

._createAccountView--submitButton {
  width: 100%;
  margin-top: calc(var(--spacing) * 0.5);
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 1.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) / 2);

  &.is--loading {
    cursor: wait;
  }
}

._createAccountView--footer {
  margin-top: calc(var(--spacing) * 2);
  padding-top: calc(var(--spacing) * 1.5);
  border-top: 1px solid var(--g-200);
  text-align: center;
}
</style>
