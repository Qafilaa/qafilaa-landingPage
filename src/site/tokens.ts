/**
 * Generated from `Qafilaa Site v3.dc.html` (handoff 14), lines 1416-1487.
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
export const NARROW = 900;  /* under this the phone rig goes inline and wide graphics scroll */
export const PW = 413;
export const PH = 872;

/* One line per screen — what the rider is actually looking at. Keyed by screen,
   because a screen means the same thing in whichever flow it turns up. */
export const CAPS: Record<string, string> = {
  convoy:'Every rider on one live map', convoyStale:'Positions are last-known, not live',
  convoyOffline:'No signal. The map still works', convoyList:'Who is rolling, stopped, resting',
  riderDetail:'One rider: speed, battery, last ping', muster:'The whole group, counted',
  quickActions:'Rest, regroup, broadcast, or call it', rallyLive:'Bearing and distance to the rally point',
  offlineNav:'Turn-by-turn from the downloaded pack', broadcast:'One message to the whole convoy',
  rideControl:'Lead, sweep, and the ride itself', endRide:'Close the ride for everyone at once',
  rollPresence:'Who has actually thrown a leg over', rollPrompt:'The nudge that starts the day',
  dayLegs:'Today: legs, fuel, passes', shareDay:'A card for the group chat',
  dayComplete:'Distance done, altitude gained', crash:'Hard impact. Countdown before it sends',
  sosReceived:'What the nearest rider sees', sendSos:'Tap, hold, or flip the phone',
  sosSent:'Sent with position, bearing, blood group', sosResolved:'Resolved, and logged',
  medicalScene:'Readable without unlocking the phone', medical:'Blood group, allergies, contacts',
  profile:'Name, phone, photo. Once.', bikes:'Make, model, registration, service due',
  docsB5:'Licence, RC, insurance, PUC, permits', welcome:'The first screen after setup',
  trips:'Every trip you are part of', tripDetail:'The trip, its crew, its days',
  crew:'Who is in, who has not answered', invite:'Send the code, or a link',
  joinCode:'Six characters. That is the whole join.', memberF5:'One rider, one bike, one readiness',
  createTrip:'Name it, date it, pick the route', itinerary:'Ten days, drawn out',
  legDetail:'One leg: distance, altitude, surface', rallySheet:'The plan for when the plan fails',
  restDay:'A day off the bike, on purpose', stays:'Scoped to nights, not days',
  settle:'Square in the fewest transfers', money:'Every shared cost against the trip',
  addExpense:'Who paid, and how it splits', balances:'What each rider owes, live',
  notes:'Written down beats shouted at a dhaba', noteDetail:'The note, its pin, its seen-by list',
  noteWrite:'Tag a day, drop a pin, post it', permits:'Inner Line permits, per rider',
  docViewer:'The paper itself, offline', checklist:'Packed, or not. No maybe.',
  reminders:'Nudges before they matter', lobby:'Nobody turns a key until this is green',
  readiness:'Your own four rows', roles:'Lead, sweep, medic, mechanic',
  crewReadiness:'The whole crew, row by row', offlineMap:'The route corridor, downloaded',
  recap:'The ride, in numbers', history:'Every ride you have finished',
  discovery:'Worth stopping for, on this leg', poi:'One stop, in detail',
  nudge:'Offered once, then it stays quiet', muted:'Told once, never again',
  settings:'Every default, and how to change it', alerts:'How hard a stop counts as a stop',
  privacyT7:'Scoped to the trip, ends with it', account:'Export it, or delete all of it',
  help:'Answers first, then a human', faqs:'The questions riders actually ask',
  queries:'Your tickets, with a timeline', e20:'Setup done. One last warning.',
  stayMulti:'Three nights, one booking', stayPaidBy:'Who fronted it, and for whom',
  permitDetail:'One permit, its dates and its rider', notePhoto:'The photo, full width',
  roleChange:'Hand the role to someone else', hazard:'Dropped once, seen by everyone',
  sosIncoming:'The alert, on the nearest phone', sosNavigate:'Straight line to the rider down',
  crashCancelled:'Cancelled. Nobody was called.',
  permIntro:'Three permissions, asked honestly', permLoc:'Why always-on, and nothing less',
  permMotion:'The sensor crash detection needs', permNotif:'An SOS has to reach the lock screen'
};

export const TONES: Record<string, Tone> = {
  light:{ bg:'#F7F5F0', ink:'#23241F', mut:'#6E6B63', sur:'#6E6B63', line:'#DCD6C9', card:'#FFFFFF', acc:'#0A6068', acc2:'#0E7C86', ctr:'#E5E2DA', ctaInk:'#F7F5F0', navBg:'#FFFFFF', navA:.80, navLine:'#23241F', navLineA:.17, dens:0.35 },
  paper:{ bg:'#F1EFE9', ink:'#23241F', mut:'#65625A', sur:'#65625A', line:'#E2DDD2', card:'#FBFAF7', acc:'#0A6068', acc2:'#0E7C86', ctr:'#E0DCD2', ctaInk:'#F7F5F0', navBg:'#FFFFFF', navA:.78, navLine:'#23241F', navLineA:.17, dens:0.55 },
  clay: { bg:'#E9E6DE', ink:'#23241F', mut:'#5F5C54', sur:'#5F5C54', line:'#D7D2C6', card:'#F7F5F0', acc:'#0A6068', acc2:'#0E7C86', ctr:'#DBD6CA', ctaInk:'#F7F5F0', navBg:'#FFFFFF', navA:.76, navLine:'#23241F', navLineA:.17, dens:0.4 },
  night:{ bg:'#0B0E0D', ink:'#F7F5F0', mut:'#A8A49C', sur:'#A19D95', line:'#272B28', card:'#101514', acc:'#14C3CE', acc2:'#14C3CE', ctr:'#1B211F', ctaInk:'#04262A', navBg:'#141A18', navA:.74, navLine:'#F7F5F0', navLineA:.16, dens:1 },
  deep: { bg:'#0A5057', ink:'#F7F5F0', mut:'#BFE0E2', sur:'#A7D2D5', line:'#12666F', card:'#064047', acc:'#8FF0F6', acc2:'#A9F4F9', ctr:'#0D5E66', ctaInk:'#04262A', navBg:'#03363B', navA:.76, navLine:'#A9F4F9', navLineA:.24, dens:0.8 }
};
/* One paper stock for the whole scroll: every section reads the light tone, so
   nothing flips to dark on the way down. The dark tones stay defined above only
   so a section can be switched back by hand. */
TONES.paper = TONES.clay = TONES.night = TONES.deep = TONES.light;
export const KEYS = ['bg','ink','mut','sur','line','card','acc','acc2','ctr','ctaInk'];
export const alphaOf = (c: string, a: number) => {
  const t = c.charAt(0) === '#' ? rgb(c) : c.replace(/[^\d,.]/g,'').split(',').slice(0,3).map(Number);
  return 'rgba('+t[0]+','+t[1]+','+t[2]+','+a.toFixed(3)+')';
};
export const rgb = (h: string) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
export const mix = (a: string, b: string, t: number) => { const A=rgb(a),B=rgb(b); return 'rgb('+Math.round(A[0]+(B[0]-A[0])*t)+','+Math.round(A[1]+(B[1]-A[1])*t)+','+Math.round(A[2]+(B[2]-A[2])*t)+')'; };
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const inr = (n: number) => Math.round(n).toLocaleString('en-IN');
