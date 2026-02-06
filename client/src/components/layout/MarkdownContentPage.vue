<template>
  <ContentPage>
    <LoaderSpinner v-if="is_loading" />
    <div v-else v-html="parsed_content" class="_markdownContent"></div>
  </ContentPage>
</template>
<script>
import { parseMarkdown } from "@/utils/markdownParser.js";

export default {
  name: "MarkdownContentPage",
  props: {
    page_name: {
      type: String,
      required: true,
      validator: (value) => {
        // Validate that page_name is provided
        return typeof value === "string" && value.length > 0;
      },
    },
  },
  components: {
    ContentPage: () => import("@/components/layout/ContentPage.vue"),
  },
  data() {
    return {
      is_loading: true,
      parsed_content: "",
    };
  },
  computed: {
    current_lang() {
      return this.$i18n.locale || "en";
    },
  },
  watch: {
    current_lang: {
      immediate: true,
      handler() {
        this.loadContent();
      },
    },
    page_name: {
      immediate: true,
      handler() {
        this.loadContent();
      },
    },
  },
  methods: {
    async loadContent() {
      if (!this.page_name) return;
      
      this.is_loading = true;
      try {
        // Dynamically import the markdown file based on current language
        const lang = this.current_lang === "fr" ? "fr" : "en";
        let markdownModule;

        // Use explicit imports for better Vite compatibility
        if (lang === "fr") {
          if (this.page_name === "terms") {
            markdownModule = await import("@/content/terms_fr.md?raw");
          } else if (this.page_name === "confidentiality") {
            markdownModule = await import("@/content/confidentiality_fr.md?raw");
          } else {
            throw new Error(`Unknown page_name: ${this.page_name}`);
          }
        } else {
          if (this.page_name === "terms") {
            markdownModule = await import("@/content/terms_en.md?raw");
          } else if (this.page_name === "confidentiality") {
            markdownModule = await import("@/content/confidentiality_en.md?raw");
          } else {
            throw new Error(`Unknown page_name: ${this.page_name}`);
          }
        }

        this.parsed_content = parseMarkdown(markdownModule.default);
        this.is_loading = false;
      } catch (err) {
        console.error(`Error loading ${this.page_name} content:`, err);
        // Fallback to English if current language file doesn't exist
        if (this.current_lang !== "en") {
          try {
            let fallbackModule;
            if (this.page_name === "terms") {
              fallbackModule = await import("@/content/terms_en.md?raw");
            } else if (this.page_name === "confidentiality") {
              fallbackModule = await import("@/content/confidentiality_en.md?raw");
            } else {
              throw new Error(`Unknown page_name: ${this.page_name}`);
            }
            this.parsed_content = parseMarkdown(fallbackModule.default);
          } catch (fallbackErr) {
            this.parsed_content = "<p>Error loading content. Please try again later.</p>";
          }
        } else {
          this.parsed_content = "<p>Error loading content. Please try again later.</p>";
        }
        this.is_loading = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._markdownContent {
  ::v-deep {
    h1 {
      margin-top: 0;
    }
    h2 {
      margin-top: calc(var(--spacing) * 2);
      margin-bottom: calc(var(--spacing) * 1);
    }
    p {
      margin: calc(var(--spacing) * 1) 0;
    }
    ul,
    ol {
      margin: calc(var(--spacing) * 1) 0;
      padding-left: calc(var(--spacing) * 2);
    }
    li {
      margin: calc(var(--spacing) * 0.5) 0;
    }
    a {
      color: var(--g-700);
      text-decoration: underline;
      &:hover {
        color: var(--g-900);
      }
    }
    .warning-text {
      color: var(--c-rouge);
      font-weight: bold;
    }
    em {
      font-style: italic;
    }
    strong {
      font-weight: bold;
    }
  }
}
</style>
