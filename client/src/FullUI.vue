<template>
  <div class="_fullUI">
    <DisconnectModal
      v-if="show_disconnect_modal"
      @close="show_disconnect_modal = false"
    />
    <TrackAuthorChanges />
    <!-- <DynamicCursor v-if="!$root.is_touch_device" /> -->

    <div class="_spinner" v-if="$root.is_loading" key="loader">
      <LoaderSpinner />
    </div>

    <template v-else>
      <WelcomeModal
        v-if="show_welcome_modal"
        @close="show_welcome_modal = false"
      />
      <SlashdocGeneralPasswordModal
        v-else-if="show_general_password_modal"
        @close="handlePasswordModalClose"
      />
      <template v-else>
        <AuthorList
          v-if="show_authors_modal"
          :is_closable="!!connected_as"
          @close="show_authors_modal = false"
        />
        <template v-else>
          <CookieNoticeBar />
          <div class="_fullUI--content">
            <TopBar class="_fullUI--content--topBar" />
            <transition name="pagechange" mode="out-in">
              <router-view
                class="_fullUI--content--view"
                v-slot="{ Component }"
                :key="$route.path"
              >
                <component :is="Component" />
              </router-view>
            </transition>
          </div>
        </template>
        <TaskTracker />
      </template>
    </template>
  </div>
</template>
<script>
import WelcomeModal from "@/components/WelcomeModal.vue";
import SlashdocGeneralPasswordModal from "@/adc-core/modals/SlashdocGeneralPasswordModal.vue";
import TrackAuthorChanges from "@/adc-core/author/TrackAuthorChanges.vue";
import TaskTracker from "@/adc-core/tasks/TaskTracker.vue";
import DisconnectModal from "@/adc-core/modals/DisconnectModal.vue";
import TopBar from "@/components/TopBar.vue";
import AuthorList from "@/adc-core/author/AuthorList.vue";
import CookieNoticeBar from "@/components/CookieNoticeBar.vue";

export default {
  props: {},
  components: {
    CookieNoticeBar,
    WelcomeModal,
    SlashdocGeneralPasswordModal,
    TrackAuthorChanges,
    TaskTracker,
    DisconnectModal,
    TopBar,
    AuthorList,
  },
  data() {
    return {
      show_general_password_modal: false,
      show_disconnect_modal: false,
      show_authors_modal: false,
      show_welcome_modal: false,
    };
  },
  async created() {
    console.log("Loading FullUI");

    this.$eventHub.$on(
      `app.prompt_general_password`,
      this.promptGeneralPassword
    );
    this.$eventHub.$on(`app.notify_error`, this.notifyError);

    this.$eventHub.$on(`app.show_welcome_modal`, this.showWelcomeModal);
    this.$eventHub.$on(`showAuthorModal`, this.showAuthorModal);
    await this.$api.init({ debug_mode: this.$root.debug_mode });

    this.$eventHub.$on("socketio.connect", this.socketConnected);
    this.$eventHub.$on("socketio.reconnect", this.socketConnected);
    this.$eventHub.$on("socketio.disconnect", this.socketDisconnected);
    this.$eventHub.$on("socketio.connect_error", this.socketConnectError);
    this.$eventHub.$on("socketio.disconnect", this.showDisconnectModal);

    this.$root.is_loading = false;

    const authors = await this.$api.getFolders({
      path: "authors",
    });
  },
  mounted() {},
  beforeDestroy() {
    this.$eventHub.$off(
      `app.prompt_general_password`,
      this.promptGeneralPassword
    );
    this.$eventHub.$off(`app.show_welcome_modal`, this.showWelcomeModal);
    this.$eventHub.$off(`showAuthorModal`, this.showAuthorModal);
    this.$eventHub.$off(`app.notify_error`, this.notifyError);

    this.$eventHub.$off("socketio.connect", this.socketConnected);
    this.$eventHub.$off("socketio.reconnect", this.socketConnected);
    this.$eventHub.$off("socketio.disconnect", this.socketDisconnected);
    this.$eventHub.$off("socketio.connect_error", this.socketConnectError);
  },
  watch: {
    $route: {
      immediate: true,
      handler(route) {
        this.checkRouteAccess(route);
      },
    },
    "$root.is_loading": {
      handler(is_loading) {
        // Re-check route access when loading completes
        if (!is_loading) {
          this.checkRouteAccess(this.$route);
        }
      },
    },
  },
  computed: {},
  methods: {
    checkRouteAccess(route) {
      // Don't redirect if still loading - wait for API initialization to complete
      if (this.$root.is_loading) return;

      // Always allow if user is logged in
      if (this.connected_as) return;

      // These paths are always accessible without password
      const always_public_paths = ["/", "/terms", "/confidentiality"];

      // Always allow truly public paths
      if (always_public_paths.includes(route.path)) {
        // Hide password modal if on public path
        if (this.show_general_password_modal) {
          this.show_general_password_modal = false;
        }
        return;
      }

      // Allow static routes (like publications)
      if (route.meta && route.meta.static) return;

      // Check if general password is required
      const has_general_password =
        this.$root.app_infos?.instance_meta?.has_general_password === true;
      const has_submitted_password = !!this.$api?.general_password;

      // If password is required but not submitted, show password modal
      if (has_general_password && !has_submitted_password) {
        this.show_general_password_modal = true;
        return;
      }

      // If password is required and submitted, allow access
      if (has_general_password && has_submitted_password) {
        return;
      }

      // If no password is required, allow access to login/create/onboarding/reset-password
      const auth_paths = [
        "/login",
        "/login/create",
        "/onboarding",
        "/reset-password",
      ];
      if (auth_paths.includes(route.path)) {
        return;
      }

      // Otherwise, redirect to login if not authenticated
      this.$router.replace("/login");
    },
    socketConnected() {
      // if (this.$root.debug_mode)
      //   this.$alertify
      //     .closeLogOnClick(true)
      //     .delay(4000)
      //     .success(`Connected or reconnected with id ${this.$api.socket.id}`);
    },
    socketDisconnected(reason) {
      if (this.$root.debug_mode)
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(`Disconnected ${reason}`);
    },
    socketConnectError(reason) {
      // if (this.$root.debug_mode)
      //   this.$alertify
      //     .closeLogOnClick(true)
      //     .delay(4000)
      //     .error(`Connect error ${reason}`);
    },
    showDisconnectModal() {
      this.show_disconnect_modal = true;
    },
    promptGeneralPassword() {
      this.show_general_password_modal = true;
    },
    handlePasswordModalClose() {
      this.show_general_password_modal = false;
      // Re-check route access after password is submitted
      // This allows navigation to proceed if password was successfully entered
      this.$nextTick(() => {
        this.checkRouteAccess(this.$route);
      });
    },
    showWelcomeModal() {
      this.show_welcome_modal = true;
    },
    showAuthorModal() {
      this.show_authors_modal = true;
    },
    notifyError(msg) {
      if (msg === "not_allowed")
        this.$alertify.delay(4000).error(this.$t("action_not_allowed"));
    },
  },
};
</script>
<style lang="scss" scoped>
._fullUI {
  height: 100%;
  display: flex;
  flex-direction: column;
}

._fullUI--content {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;

  ._fullUI--content--topBar {
    flex: 0 0 auto;
  }

  ._fullUI--content--view {
    position: relative;
    flex: 1;
    width: 100%;
    overflow-y: visible;
  }
}

._mainContent {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  flex: 1;
  // overflow: hidden;

  transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  // gap: var(--spacing);

  > * {
    transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  }

  ._routerView {
    flex: 1 1 auto;
    min-width: 0; /* Prevent flex item from overflowing */
  }

  ._chatsListContainer {
    position: relative;
    flex: 0 0 0;
    width: 0;
    overflow: hidden;

    --chats-list-width: 320px;
    --chats-list-padding: 4px;

    &.is--shown {
      flex: 0 0 var(--chats-list-width);
    }
  }
}
</style>
