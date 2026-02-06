<template>
  <MarkdownContentPage page_name="confidentiality" />
</template>
<script>
export default {
  components: {
    MarkdownContentPage: () =>
      import("@/components/layout/MarkdownContentPage.vue"),
  },
};
</script>
