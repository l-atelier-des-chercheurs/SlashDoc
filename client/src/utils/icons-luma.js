import Vue from "vue";
import { BIcon } from "bootstrap-vue";
Vue.component("b-icon", BIcon);

// Luma-specific icons that are not in upstream dodoc (branch next)
// These icons were removed from icons.js when copying from upstream

import {
  BIconArrowLeft,
  BIconCalendarWeek,
  BIconFileText,
  BIconGrid,
  BIconGrid3x3,
  BIconGrid3x3Gap,
  BIconLink45deg,
  BIconListUl,
  BIconQuestionSquare,
  BIconSliders,
  BIconTextLeft,
} from "bootstrap-vue";

// Custom copyright icon component (not available in bootstrap-vue)
const BIconCCircle = {
  name: "BIconCCircle",
  functional: true,
  props: {
    width: { type: [Number, String], default: 10 },
    height: { type: [Number, String], default: 10 },
    fill: { type: String, default: "currentColor" },
  },
  render(h, { props }) {
    return h(
      "svg",
      {
        attrs: {
          xmlns: "http://www.w3.org/2000/svg",
          width: props.width,
          height: props.height,
          fill: props.fill,
          viewBox: "0 0 16 16",
        },
      },
      [
        h("path", {
          attrs: {
            d: "M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.146 4.992c-1.212 0-1.927.92-1.927 2.502v1.06c0 1.571.703 2.462 1.927 2.462.979 0 1.641-.586 1.729-1.418h1.295v.093c-.1 1.448-1.354 2.467-3.03 2.467-2.091 0-3.269-1.336-3.269-3.603V7.482c0-2.261 1.201-3.638 3.27-3.638 1.681 0 2.935 1.054 3.029 2.572v.088H9.875c-.088-.879-.768-1.512-1.729-1.512",
          },
        }),
      ]
    );
  },
};

Vue.component("BIconArrowLeft", BIconArrowLeft);
Vue.component("BIconCalendarWeek", BIconCalendarWeek);
Vue.component("BIconCCircle", BIconCCircle);
Vue.component("BIconFileText", BIconFileText);
Vue.component("BIconGrid", BIconGrid);
Vue.component("BIconGrid3x3", BIconGrid3x3);
Vue.component("BIconGrid3x3Gap", BIconGrid3x3Gap);
Vue.component("BIconLink45deg", BIconLink45deg);
Vue.component("BIconListUl", BIconListUl);
Vue.component("BIconQuestionSquare", BIconQuestionSquare);
Vue.component("BIconSliders", BIconSliders);
Vue.component("BIconTextLeft", BIconTextLeft);
