<template>
  <BaseModal2
    :title="''"
    :is_closable="false"
    @close="$emit('close')"
    class="_slashdocGeneralPasswordModal"
  >
    <div class="_slashdocGeneralPasswordModal--inner">
      <h2 class="_slashdocGeneralPasswordModal--title">
        {{ $t("general_password_modal_title") }}
      </h2>
      <div class="_slashdocGeneralPasswordModal--separator" />
      <p class="_slashdocGeneralPasswordModal--description">
        {{ $t("general_password_modal_description") }}
      </p>

      <form
        @submit.prevent="submitGeneralPassword"
        class="_slashdocGeneralPasswordModal--form"
      >
        <input
          v-model="password_to_submit"
          type="password"
          class="_slashdocGeneralPasswordModal--input"
          :placeholder="$t('general_password_placeholder')"
          required
          autocomplete="current-password"
          @input="allow_send = password_to_submit.length > 0"
          @keydown.enter.prevent="submitGeneralPassword"
        />
        <button
          type="submit"
          :disabled="!allow_send"
          class="u-button u-button_orange u-button_wide _slashdocGeneralPasswordModal--submit"
        >
          {{ $t("access") }}
        </button>
      </form>

      <p
        v-if="password_submit_error"
        class="_slashdocGeneralPasswordModal--error"
      >
        {{ password_submit_error }}
      </p>

      <br />
      <hr />

      <div class="_slashdocGeneralPasswordModal--note">
        <p class="u-spacingBottom">* {{ $t("general_password_modal_note") }}</p>
        <p class="u-spacingBottom">
          {{ $t("general_password_modal_contact_email") }}
        </p>
        <a
          :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
          target="_blank"
        >
          {{ $root.app_infos.instance_meta.contactmail }}
        </a>
      </div>
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      password_to_submit: "",
      allow_send: false,
      remember_on_this_device: true,
      password_submit_error: false,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async submitGeneralPassword() {
      try {
        await this.$api.submitGeneralPassword({
          password: this.password_to_submit,
          remember_on_this_device: this.remember_on_this_device,
        });
        this.$emit("close");
      } catch (err) {
        let msg = err.code;
        if (err.code === "submitted_general_password_is_wrong")
          msg = this.$t("submitted_password_is_wrong");

        this.password_submit_error = msg;
        this.$alertify.delay(4000).error(msg);

        setTimeout(() => {
          this.password_submit_error = false;
        }, 4000);
        return false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._slashdocGeneralPasswordModal {
  ::v-deep ._baseModal--content {
    max-width: 420px;
  }

  ::v-deep header {
    display: none;
  }

  ::v-deep ._content {
    padding: calc(var(--spacing) * 2.5);
  }
}

._slashdocGeneralPasswordModal--inner {
}

._slashdocGeneralPasswordModal--title {
  text-align: center;
}

._slashdocGeneralPasswordModal--separator {
  width: 33%;
  height: 1px;
  margin: 0 auto calc(var(--spacing) * 1.5);
  background: #d3d3d3;
}

._slashdocGeneralPasswordModal--description {
  margin: 0 0 calc(var(--spacing) * 1.5);
  text-align: center;
}

._slashdocGeneralPasswordModal--form {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 0.5);
}

._slashdocGeneralPasswordModal--input {
  // width: 100%;
  // padding: calc(var(--spacing) * 1) calc(var(--spacing) * 1.25);
  // font-size: 1rem;
  // color: var(--g-900);
  // background: white;
  // border: 1px solid #d3d3d3;
  // border-radius: 8px;
  // box-sizing: border-box;

  // &::placeholder {
  //   color: var(--g-500);
  // }

  // &:focus {
  //   outline: none;
  //   border-color: var(--g-400);
  // }
}

._slashdocGeneralPasswordModal--submit {
  width: 100%;
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 1.5);
  // font-size: 1rem;
  // font-weight: 600;
  // color: #707070;
  // background: #f5de98;
  // border: none;
  // border-radius: 8px;
  // cursor: pointer;
  // transition: opacity 0.2s, background 0.2s;

  // &:hover:not(:disabled) {
  //   background: #f0d67a;
  // }

  // &:disabled {
  //   opacity: 0.6;
  //   cursor: not-allowed;
  // }
}

._slashdocGeneralPasswordModal--error {
  margin: calc(var(--spacing) * 1) 0 0;
  font-size: 0.9rem;
  color: var(--c-rouge, #c00);
}

._slashdocGeneralPasswordModal--note {
  margin: calc(var(--spacing) * 2) 0 0;
}
</style>
