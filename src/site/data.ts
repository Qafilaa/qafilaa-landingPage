/**
 * Generated from `Qafilaa Site v3.dc.html` (handoff 14), lines 1489-1520.
 * The trip, the ten days, and the crew the demos are built from.
 */

/** One riding day of the Manali-Leh-Manali circuit the whole page is measured against. */
export interface Day {
  n: number; from: string; to: string; km: number; alt: number;
  pass: string; date: string; screen: string;
}

export interface CrewMember { id: string; name: string; role: string; c: string; }

export const TRIP = {
  name:  'Ladakh Circuit',
  route: 'Manali → Leh → Manali',
  dates: 'Tue 1 - Thu 10 Sep 2026',
  days:  10
};

export const DAYS: Day[] = [
  { n:1,  from:'Manali',  to:'Jispa',   km:140, alt:3200, pass:'Atal Tunnel',  date:'1 Sep',  screen:'dayLegs'     },
  { n:2,  from:'Jispa',   to:'Sarchu',  km:90,  alt:4890, pass:'Baralacha La', date:'2 Sep',  screen:'legDetail'   },
  { n:3,  from:'Sarchu',  to:'Leh',     km:255, alt:5328, pass:'Tanglang La',  date:'3 Sep',  screen:'itinerary'   },
  { n:4,  from:'Leh',     to:'Leh',     km:65,  alt:3500, pass:'Acclimatise',  date:'4 Sep',  screen:'restDay'     },
  { n:5,  from:'Leh',     to:'Nubra',   km:160, alt:5359, pass:'Khardung La',  date:'5 Sep',  screen:'rallySheet'  },
  { n:6,  from:'Nubra',   to:'Pangong', km:230, alt:4350, pass:'Shyok route',  date:'6 Sep',  screen:'legDetail'   },
  { n:7,  from:'Pangong', to:'Leh',     km:220, alt:5330, pass:'Chang La',     date:'7 Sep',  screen:'dayLegs'     },
  { n:8,  from:'Leh',     to:'Sarchu',  km:255, alt:5328, pass:'Tanglang La',  date:'8 Sep',  screen:'itinerary'   },
  { n:9,  from:'Sarchu',  to:'Jispa',   km:90,  alt:4890, pass:'Baralacha La', date:'9 Sep',  screen:'legDetail'   },
  { n:10, from:'Jispa',   to:'Manali',  km:135, alt:3200, pass:'Atal Tunnel',  date:'10 Sep', screen:'dayComplete' }
];
export const TOTAL_KM = DAYS.reduce((s: number, d: Day) => s + d.km, 0);
export const MAXD = DAYS.reduce((a: Day, b: Day) => (b.alt > a.alt ? b : a), DAYS[0]);
export const RESTD = DAYS.findIndex((d: Day) => d.pass === 'Acclimatise');
export const PASSES = ['Baralacha La','Tanglang La','Khardung La','Chang La'];

export const CREW: CrewMember[] = [
  { id:'GH', name:'Gaurav', role:'Lead',        c:'#0A6068' },
  { id:'VC', name:'Viren',  role:'Coordinator', c:'#0E7C86' },
  { id:'AK', name:'Akash',  role:'Sweep',       c:'#B26B00' },
  { id:'RS', name:'Rhea',   role:'Rider',       c:'#4B6F70' },
  { id:'TN', name:'Tanvi',  role:'Rider',       c:'#6E6B63' }
];
export const roleOf = (r: string) => CREW.find((c) => c.role === r) || CREW[0];
