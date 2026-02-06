<template>
  <MarkdownContentPage page_name="terms" />
</template>
<script>
export default {
  components: {
    MarkdownContentPage: () =>
      import("@/components/layout/MarkdownContentPage.vue"),
  },
};
</script>
