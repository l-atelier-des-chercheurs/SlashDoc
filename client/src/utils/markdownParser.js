import markdownit from "markdown-it";

/**
 * Simple markdown parser utility
 * Converts markdown to HTML with basic formatting support
 */
export function parseMarkdown(markdownText) {
  const md = markdownit({
    breaks: true, // Convert line breaks to <br>
    linkify: true, // Autoconvert URL-like text to links
    typographer: true, // Enable some language-neutral replacement + quotes beautification
    html: true, // Enable HTML tags in source
  });

  return md.render(markdownText);
}
