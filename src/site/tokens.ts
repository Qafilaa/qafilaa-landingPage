/**
 * Generated from `Qafilaa Site v2.dc.html` (handoff 11), lines 1319-1338.
 * Daylight palette, tone table and colour helpers.
 */

/** One scroll tone. `paint()` interpolates between adjacent tones and writes
 *  the first ten keys onto `:root` as CSS custom properties every frame. */
export interface Tone {
  bg: string; ink: string; mut: string; sur: string; line: string;
  card: string; acc: string; acc2: string; ctr: string; ctaInk: string;
  navBg: string; navA: number; navLine: string; navLineA: number; dens: number;
}

export const SUR = "font-family:'Space Grotesk',sans-serif; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--sur);";
export const SG = "font-family:'Space Grotesk',sans-serif;";
export const PW = 413;
export const PH = 872;

export const TONES: Record<string, Tone> = {
  light:{ bg:'#F7F5F0', ink:'#23241F', mut:'#6E6B63', sur:'#6E6B63', line:'#EAE5DB', card:'#FFFFFF', acc:'#0A6068', acc2:'#0E7C86', ctr:'#E5E2DA', ctaInk:'#F7F5F0', navBg:'#FFFFFF', navA:.80, navLine:'#23241F', navLineA:.11, dens:0.35 },
  paper:{ bg:'#F1EFE9', ink:'#23241F', mut:'#65625A', sur:'#65625A', line:'#E2DDD2', card:'#FBFAF7', acc:'#0A6068', acc2:'#0E7C86', ctr:'#E0DCD2', ctaInk:'#F7F5F0', navBg:'#FFFFFF', navA:.78, navLine:'#23241F', navLineA:.11, dens:0.55 },
  clay: { bg:'#E9E6DE', ink:'#23241F', mut:'#5F5C54', sur:'#5F5C54', line:'#D7D2C6', card:'#F7F5F0', acc:'#0A6068', acc2:'#0E7C86', ctr:'#DBD6CA', ctaInk:'#F7F5F0', navBg:'#FFFFFF', navA:.76, navLine:'#23241F', navLineA:.11, dens:0.4 },
  night:{ bg:'#0B0E0D', ink:'#F7F5F0', mut:'#A8A49C', sur:'#A19D95', line:'#272B28', card:'#101514', acc:'#14C3CE', acc2:'#14C3CE', ctr:'#1B211F', ctaInk:'#04262A', navBg:'#141A18', navA:.74, navLine:'#F7F5F0', navLineA:.16, dens:1 },
  deep: { bg:'#0A5057', ink:'#F7F5F0', mut:'#BFE0E2', sur:'#A7D2D5', line:'#12666F', card:'#064047', acc:'#8FF0F6', acc2:'#A9F4F9', ctr:'#0D5E66', ctaInk:'#04262A', navBg:'#03363B', navA:.76, navLine:'#A9F4F9', navLineA:.24, dens:0.8 }
};
export const KEYS = ['bg','ink','mut','sur','line','card','acc','acc2','ctr','ctaInk'];
export const alphaOf = (c: string, a: number) => {
  const t = c.charAt(0) === '#' ? rgb(c) : c.replace(/[^\d,.]/g,'').split(',').slice(0,3).map(Number);
  return 'rgba('+t[0]+','+t[1]+','+t[2]+','+a.toFixed(3)+')';
};
export const rgb = (h: string) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
export const mix = (a: string, b: string, t: number) => { const A=rgb(a),B=rgb(b); return 'rgb('+Math.round(A[0]+(B[0]-A[0])*t)+','+Math.round(A[1]+(B[1]-A[1])*t)+','+Math.round(A[2]+(B[2]-A[2])*t)+')'; };
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const inr = (n: number) => Math.round(n).toLocaleString('en-IN');
