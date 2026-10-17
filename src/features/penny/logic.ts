export const categories = [
  "Food & groceries",
  "Daily travel",
  "Rent",
  "College fees",
  "Hostel fees",
  "Books & stationery",
  "Mobile & internet",
  "Shopping",
  "Entertainment",
  "Medical & personal care",
  "Other extras",
];
export type Entry = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  recurring: boolean;
  kind: "income" | "expense" | "transfer";
};
export type PackingItem = { id: string; name: string; quantity: number; packed: boolean };
export type Trip = {
  id: string;
  destinationId: string;
  name: string;
  start: string;
  days: number;
  travellers: number;
  budget: number;
  actual: number;
  checklist: PackingItem[];
  notes: string;
  itinerary: string[];
};
export type Profile = {
  name: string;
  email: string;
  homeCity: string;
  homeState: string;
  savings: number;
  reserve: number;
  bills: number;
  willingness: number;
  packingPreference: string;
  analytics: boolean;
};
export type Account = { profile: Profile; entries: Entry[]; trips: Trip[] };
export function finance(entries: Entry[], existing: number, month: string) {
  const selected = entries.filter((e) => e.date.startsWith(month));
  const income = selected.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
  const expenses = selected.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
  const unspent = income - expenses;
  return { income, expenses, unspent, savings: Math.max(0, existing) + Math.max(0, unspent) };
}
export function safeBudget(savings: number, reserve: number, bills: number, willingness: number) {
  return Math.max(
    0,
    Math.min(Math.max(0, willingness), savings - Math.max(0, reserve) - Math.max(0, bills)),
  );
}
export type Destination = {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  type: string;
  season: string;
  caption: string;
  image: "ghats" | "fort" | "waterfall" | "beach";
  room: number;
  activity: number;
};
export const destinations: Destination[] = [
  {
    id: "lonavala",
    name: "Lonavala",
    state: "Maharashtra",
    lat: 18.7546,
    lon: 73.4062,
    type: "Mountains",
    season: "October–February; June–September for lush scenery, with monsoon caution",
    caption: "Misty hills & little adventures",
    image: "ghats",
    room: 1000,
    activity: 150,
  },
  {
    id: "sinhagad",
    name: "Sinhagad Fort",
    state: "Maharashtra",
    lat: 18.3663,
    lon: 73.7559,
    type: "Trekking",
    season: "October–February",
    caption: "A little history. A big view.",
    image: "fort",
    room: 800,
    activity: 100,
  },
  {
    id: "tamhini",
    name: "Tamhini Ghat",
    state: "Maharashtra",
    lat: 18.4776,
    lon: 73.4144,
    type: "Nature & waterfalls",
    season: "July–September for waterfalls; avoid heavy-rain days",
    caption: "Chase waterfalls, not expenses",
    image: "waterfall",
    room: 900,
    activity: 100,
  },
  {
    id: "alibaug",
    name: "Alibaug",
    state: "Maharashtra",
    lat: 18.6414,
    lon: 72.8722,
    type: "Beaches",
    season: "November–February",
    caption: "Salt in the air, savings to spare",
    image: "beach",
    room: 1200,
    activity: 200,
  },
  {
    id: "panshet",
    name: "Panshet",
    state: "Maharashtra",
    lat: 18.387,
    lon: 73.611,
    type: "Nature & waterfalls",
    season: "October–March",
    caption: "Lakeside picnics & slower days",
    image: "waterfall",
    room: 900,
    activity: 100,
  },
  {
    id: "matheran",
    name: "Matheran",
    state: "Maharashtra",
    lat: 18.9866,
    lon: 73.2679,
    type: "Mountains",
    season: "October–May",
    caption: "Car-free trails above the clouds",
    image: "ghats",
    room: 1100,
    activity: 200,
  },
  {
    id: "mahabaleshwar",
    name: "Mahabaleshwar",
    state: "Maharashtra",
    lat: 17.9237,
    lon: 73.6586,
    type: "Mountains",
    season: "October–June",
    caption: "Strawberries & sweeping valleys",
    image: "ghats",
    room: 1200,
    activity: 200,
  },
  {
    id: "lavasa",
    name: "Lavasa",
    state: "Maharashtra",
    lat: 18.4097,
    lon: 73.5066,
    type: "Relaxing getaway",
    season: "October–March",
    caption: "A peaceful lakeside escape",
    image: "beach",
    room: 1300,
    activity: 150,
  },
];
export function distance(lat: number, lon: number, d: Destination) {
  const rad = (x: number) => (x * Math.PI) / 180;
  const a =
    Math.sin(rad(d.lat - lat) / 2) ** 2 +
    Math.cos(rad(lat)) * Math.cos(rad(d.lat)) * Math.sin(rad(d.lon - lon) / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
export function estimate(
  d: Destination,
  km: number,
  days: number,
  travellers: number,
  transport = "Bus / train",
) {
  const n = Math.max(1, Math.floor(travellers)),
    duration = Math.max(1, Math.floor(days));
  const transportCost =
    transport === "Shared car" ? Math.max(300, km * 2 * 12) : Math.max(120, km * 2 * 1.6) * n;
  const rows = {
    "Round-trip transport": Math.round(transportCost),
    Accommodation: Math.ceil(n / 2) * (duration - 1) * d.room,
    Food: 300 * duration * n,
    Activities: d.activity * n,
    "Local transport": 150 * duration,
  };
  const subtotal = Object.values(rows).reduce((a, b) => a + b, 0),
    contingency = Math.ceil(subtotal * 0.1),
    total = subtotal + contingency;
  return { rows: { ...rows, Contingency: contingency }, total, perPerson: Math.ceil(total / n) };
}
export function packing(
  days: number,
  type: string,
  rain: number,
  temp: number,
  preference = "",
): PackingItem[] {
  const items: [string, number][] = [
    ["Photo ID & student card", 1],
    ["Phone & charger", 1],
    ["Personal medicines", 1],
    ["Toiletries", 1],
    ["Reusable water bottle", 1],
    ["Comfortable clothing", days],
    ["Underwear & socks", days],
  ];
  if (rain >= 40) items.push(["Raincoat or umbrella", 1], ["Waterproof bag cover", 1]);
  if (temp < 15) items.push(["Warm jacket & layers", 1]);
  if (temp >= 28) items.push(["Sunscreen", 1], ["Sun hat", 1]);
  if (type === "Trekking") items.push(["Trekking shoes", 1], ["Trail backpack", 1]);
  if (type === "Beaches") items.push(["Beach towel", 1]);
  if (preference.trim()) items.push([preference.trim(), 1]);
  return items.map(([name, quantity], i) => ({ id: `item-${i}`, name, quantity, packed: false }));
}
export const emptyAccount = (): Account => ({
  profile: {
    name: "Student",
    email: "",
    homeCity: "",
    homeState: "",
    savings: 0,
    reserve: 0,
    bills: 0,
    willingness: 0,
    packingPreference: "",
    analytics: false,
  },
  entries: [],
  trips: [],
});
export const demoAccount = (): Account => ({
  profile: {
    name: "Explorer",
    email: "",
    homeCity: "Pune",
    homeState: "Maharashtra",
    savings: 4000,
    reserve: 2000,
    bills: 1000,
    willingness: 4000,
    packingPreference: "",
    analytics: false,
  },
  entries: [
    {
      id: "income-demo",
      amount: 8000,
      category: "Monthly allowance",
      description: "Monthly pocket money",
      date: "2026-10-01",
      recurring: true,
      kind: "income",
    },
    ...[1500, 700, 1000, 600, 500, 200, 500].map((amount, i) => ({
      id: `demo-${i}`,
      amount,
      category:
        [
          categories[0],
          categories[1],
          categories[2],
          categories[3],
          categories[4],
          categories[5],
          categories[10],
        ][i] ?? "Other extras",
      description:
        [
          "Groceries & campus meals",
          "Bus pass & daily commute",
          "Monthly rent",
          "College fees",
          "Hostel contribution",
          "Notebooks & supplies",
          "Personal expenses",
        ][i] ?? "",
      date: `2026-10-${String(i + 2).padStart(2, "0")}`,
      recurring: i < 5,
      kind: "expense" as const,
    })),
  ],
  trips: [],
});
export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
