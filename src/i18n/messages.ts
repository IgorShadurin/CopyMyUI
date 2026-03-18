import type { AppLocale } from "@/i18n/config";
import { en } from "@/i18n/locales/en";
import { aa } from "@/i18n/locales/aa";
import { ab } from "@/i18n/locales/ab";
import { ae } from "@/i18n/locales/ae";
import { af } from "@/i18n/locales/af";
import { ak } from "@/i18n/locales/ak";
import { am } from "@/i18n/locales/am";
import { an } from "@/i18n/locales/an";
import { ar } from "@/i18n/locales/ar";
import { as } from "@/i18n/locales/as";
import { av } from "@/i18n/locales/av";
import { ay } from "@/i18n/locales/ay";
import { az } from "@/i18n/locales/az";
import { ba } from "@/i18n/locales/ba";
import { be } from "@/i18n/locales/be";
import { bg } from "@/i18n/locales/bg";
import { bi } from "@/i18n/locales/bi";
import { bm } from "@/i18n/locales/bm";
import { bn } from "@/i18n/locales/bn";
import { bo } from "@/i18n/locales/bo";
import { br } from "@/i18n/locales/br";
import { bs } from "@/i18n/locales/bs";
import { ca } from "@/i18n/locales/ca";
import { ce } from "@/i18n/locales/ce";
import { ch } from "@/i18n/locales/ch";
import { co } from "@/i18n/locales/co";
import { cr } from "@/i18n/locales/cr";
import { cs } from "@/i18n/locales/cs";
import { cu } from "@/i18n/locales/cu";
import { cv } from "@/i18n/locales/cv";
import { cy } from "@/i18n/locales/cy";
import { da } from "@/i18n/locales/da";
import { de } from "@/i18n/locales/de";
import { dv } from "@/i18n/locales/dv";
import { dz } from "@/i18n/locales/dz";
import { ee } from "@/i18n/locales/ee";
import { el } from "@/i18n/locales/el";
import { eo } from "@/i18n/locales/eo";
import { es } from "@/i18n/locales/es";
import { et } from "@/i18n/locales/et";
import { eu } from "@/i18n/locales/eu";
import { fa } from "@/i18n/locales/fa";
import { ff } from "@/i18n/locales/ff";
import { fi } from "@/i18n/locales/fi";
import { fj } from "@/i18n/locales/fj";
import { fo } from "@/i18n/locales/fo";
import { fr } from "@/i18n/locales/fr";
import { fy } from "@/i18n/locales/fy";
import { ga } from "@/i18n/locales/ga";
import { gd } from "@/i18n/locales/gd";
import { gl } from "@/i18n/locales/gl";
import { gn } from "@/i18n/locales/gn";
import { gu } from "@/i18n/locales/gu";
import { gv } from "@/i18n/locales/gv";
import { ha } from "@/i18n/locales/ha";
import { he } from "@/i18n/locales/he";
import { hi } from "@/i18n/locales/hi";
import { ho } from "@/i18n/locales/ho";
import { hr } from "@/i18n/locales/hr";
import { ht } from "@/i18n/locales/ht";
import { hu } from "@/i18n/locales/hu";
import { hy } from "@/i18n/locales/hy";
import { hz } from "@/i18n/locales/hz";
import { ia } from "@/i18n/locales/ia";
import { id } from "@/i18n/locales/id";
import { ie } from "@/i18n/locales/ie";
import { ig } from "@/i18n/locales/ig";
import { ii } from "@/i18n/locales/ii";
import { ik } from "@/i18n/locales/ik";
import { io } from "@/i18n/locales/io";
import { is } from "@/i18n/locales/is";
import { it } from "@/i18n/locales/it";
import { iu } from "@/i18n/locales/iu";
import { ja } from "@/i18n/locales/ja";
import { jv } from "@/i18n/locales/jv";
import { ka } from "@/i18n/locales/ka";
import { kg } from "@/i18n/locales/kg";
import { ki } from "@/i18n/locales/ki";
import { kj } from "@/i18n/locales/kj";
import { kk } from "@/i18n/locales/kk";
import { kl } from "@/i18n/locales/kl";
import { km } from "@/i18n/locales/km";
import { kn } from "@/i18n/locales/kn";
import { ko } from "@/i18n/locales/ko";
import { kr } from "@/i18n/locales/kr";
import { ks } from "@/i18n/locales/ks";
import { ku } from "@/i18n/locales/ku";
import { kv } from "@/i18n/locales/kv";
import { kw } from "@/i18n/locales/kw";
import { ky } from "@/i18n/locales/ky";
import { la } from "@/i18n/locales/la";
import { lb } from "@/i18n/locales/lb";
import { lg } from "@/i18n/locales/lg";
import { li } from "@/i18n/locales/li";
import { ln } from "@/i18n/locales/ln";
import { lo } from "@/i18n/locales/lo";
import { lt } from "@/i18n/locales/lt";
import { lu } from "@/i18n/locales/lu";
import { lv } from "@/i18n/locales/lv";
import { mg } from "@/i18n/locales/mg";
import { mh } from "@/i18n/locales/mh";
import { mi } from "@/i18n/locales/mi";
import { mk } from "@/i18n/locales/mk";
import { ml } from "@/i18n/locales/ml";
import { mn } from "@/i18n/locales/mn";
import { mr } from "@/i18n/locales/mr";
import { ms } from "@/i18n/locales/ms";
import { mt } from "@/i18n/locales/mt";
import { my } from "@/i18n/locales/my";
import { na } from "@/i18n/locales/na";
import { nb } from "@/i18n/locales/nb";
import { nd } from "@/i18n/locales/nd";
import { ne } from "@/i18n/locales/ne";
import { ng } from "@/i18n/locales/ng";
import { nl } from "@/i18n/locales/nl";
import { nn } from "@/i18n/locales/nn";
import { no } from "@/i18n/locales/no";
import { nr } from "@/i18n/locales/nr";
import { nv } from "@/i18n/locales/nv";
import { ny } from "@/i18n/locales/ny";
import { oc } from "@/i18n/locales/oc";
import { oj } from "@/i18n/locales/oj";
import { om } from "@/i18n/locales/om";
import { or } from "@/i18n/locales/or";
import { os } from "@/i18n/locales/os";
import { pa } from "@/i18n/locales/pa";
import { pi } from "@/i18n/locales/pi";
import { pl } from "@/i18n/locales/pl";
import { ps } from "@/i18n/locales/ps";
import { pt } from "@/i18n/locales/pt";
import { qu } from "@/i18n/locales/qu";
import { rm } from "@/i18n/locales/rm";
import { rn } from "@/i18n/locales/rn";
import { ro } from "@/i18n/locales/ro";
import { ru } from "@/i18n/locales/ru";
import { rw } from "@/i18n/locales/rw";
import { sa } from "@/i18n/locales/sa";
import { sc } from "@/i18n/locales/sc";
import { sd } from "@/i18n/locales/sd";
import { se } from "@/i18n/locales/se";
import { sg } from "@/i18n/locales/sg";
import { si } from "@/i18n/locales/si";
import { sk } from "@/i18n/locales/sk";
import { sl } from "@/i18n/locales/sl";
import { sm } from "@/i18n/locales/sm";
import { sn } from "@/i18n/locales/sn";
import { so } from "@/i18n/locales/so";
import { sq } from "@/i18n/locales/sq";
import { sr } from "@/i18n/locales/sr";
import { ss } from "@/i18n/locales/ss";
import { st } from "@/i18n/locales/st";
import { su } from "@/i18n/locales/su";
import { sv } from "@/i18n/locales/sv";
import { sw } from "@/i18n/locales/sw";
import { ta } from "@/i18n/locales/ta";
import { te } from "@/i18n/locales/te";
import { tg } from "@/i18n/locales/tg";
import { th } from "@/i18n/locales/th";
import { ti } from "@/i18n/locales/ti";
import { tk } from "@/i18n/locales/tk";
import { tl } from "@/i18n/locales/tl";
import { tn } from "@/i18n/locales/tn";
import { to } from "@/i18n/locales/to";
import { tr } from "@/i18n/locales/tr";
import { ts } from "@/i18n/locales/ts";
import { tt } from "@/i18n/locales/tt";
import { tw } from "@/i18n/locales/tw";
import { ty } from "@/i18n/locales/ty";
import { ug } from "@/i18n/locales/ug";
import { uk } from "@/i18n/locales/uk";
import { ur } from "@/i18n/locales/ur";
import { uz } from "@/i18n/locales/uz";
import { ve } from "@/i18n/locales/ve";
import { vi } from "@/i18n/locales/vi";
import { vo } from "@/i18n/locales/vo";
import { wa } from "@/i18n/locales/wa";
import { wo } from "@/i18n/locales/wo";
import { xh } from "@/i18n/locales/xh";
import { yi } from "@/i18n/locales/yi";
import { yo } from "@/i18n/locales/yo";
import { za } from "@/i18n/locales/za";
import { zh } from "@/i18n/locales/zh";
import { zu } from "@/i18n/locales/zu";
import type { Messages } from "@/i18n/locales/types";

export type { Messages } from "@/i18n/locales/types";

export const messagesByLocale: Partial<Record<AppLocale, Messages>> = {
  en,
  aa,
  ab,
  ae,
  af,
  ak,
  am,
  an,
  ar,
  as,
  av,
  ay,
  az,
  ba,
  be,
  bg,
  bi,
  bm,
  bn,
  bo,
  br,
  bs,
  ca,
  ce,
  ch,
  co,
  cr,
  cs,
  cu,
  cv,
  cy,
  da,
  de,
  dv,
  dz,
  ee,
  el,
  eo,
  es,
  et,
  eu,
  fa,
  ff,
  fi,
  fj,
  fo,
  fr,
  fy,
  ga,
  gd,
  gl,
  gn,
  gu,
  gv,
  ha,
  he,
  hi,
  ho,
  hr,
  ht,
  hu,
  hy,
  hz,
  ia,
  id,
  ie,
  ig,
  ii,
  ik,
  io,
  is,
  it,
  iu,
  ja,
  jv,
  ka,
  kg,
  ki,
  kj,
  kk,
  kl,
  km,
  kn,
  ko,
  kr,
  ks,
  ku,
  kv,
  kw,
  ky,
  la,
  lb,
  lg,
  li,
  ln,
  lo,
  lt,
  lu,
  lv,
  mg,
  mh,
  mi,
  mk,
  ml,
  mn,
  mr,
  ms,
  mt,
  my,
  na,
  nb,
  nd,
  ne,
  ng,
  nl,
  nn,
  no,
  nr,
  nv,
  ny,
  oc,
  oj,
  om,
  or,
  os,
  pa,
  pi,
  pl,
  ps,
  pt,
  qu,
  rm,
  rn,
  ro,
  ru,
  rw,
  sa,
  sc,
  sd,
  se,
  sg,
  si,
  sk,
  sl,
  sm,
  sn,
  so,
  sq,
  sr,
  ss,
  st,
  su,
  sv,
  sw,
  ta,
  te,
  tg,
  th,
  ti,
  tk,
  tl,
  tn,
  to,
  tr,
  ts,
  tt,
  tw,
  ty,
  ug,
  uk,
  ur,
  uz,
  ve,
  vi,
  vo,
  wa,
  wo,
  xh,
  yi,
  yo,
  za,
  zh,
  zu,
};

const inProgressMessagesByLocale: Partial<Record<AppLocale, Messages>> = {};

export function getMessagesForLocale(locale: AppLocale) {
  return messagesByLocale[locale] ?? inProgressMessagesByLocale[locale] ?? en;
}
