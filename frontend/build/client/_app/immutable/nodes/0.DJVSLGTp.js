import { c as s, a as i } from "../chunks/26I3BnCA.js";
import {
  b as f,
  E as p,
  d as c,
  f as d,
  g as m,
  h,
  i as l,
  j as _,
} from "../chunks/nwBLtpdx.js";
function u(t, e, ...a) {
  var n = t,
    o = d,
    r;
  f(() => {
    o !== (o = e()) && (r && (m(r), (r = null)), (r = c(() => o(n, ...a))));
  }, p),
    h && (n = l);
}
function E(t, e) {
  var a = s(),
    n = _(a);
  u(n, () => e.children), i(t, a);
}
export { E as component };
