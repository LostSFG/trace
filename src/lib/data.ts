export type ItemType = "lost" | "found";
export type ItemStatus = "active" | "returned";

export interface Report {
  id: string;
  type: ItemType;
  title: string;
  category: string;
  colors: string[];
  location: string;
  date: string; // YYYY-MM-DD
  description: string;
  tags: string[];
  reporter: string;
  contact: string;
  createdAt: number;
  status: ItemStatus;
  matchedWith: string | null;
}

export interface CampusLocation {
  name: string;
  x: number;
  y: number;
}

export const LOCATIONS: CampusLocation[] = [
  { name: "Main Library", x: 30, y: 38 },
  { name: "Cafeteria", x: 58, y: 52 },
  { name: "Lecture Hall A", x: 42, y: 64 },
  { name: "Lecture Hall B", x: 50, y: 70 },
  { name: "Computer Lab", x: 52, y: 40 },
  { name: "Gym & Sports Complex", x: 78, y: 26 },
  { name: "Sports Field", x: 72, y: 12 },
  { name: "Dorm Block B", x: 18, y: 74 },
  { name: "Parking Lot", x: 84, y: 66 },
  { name: "Bus Stop", x: 10, y: 50 },
  { name: "Admin Block", x: 36, y: 18 },
  { name: "Student Center", x: 63, y: 32 },
];

export const CATEGORIES = [
  "Electronics",
  "Accessories",
  "Bags",
  "Books & Notes",
  "Clothing",
  "Keys",
  "ID & Cards",
  "Bottles",
  "Sports",
  "Other",
] as const;

export const COLOR_OPTIONS = [
  "Black",
  "White",
  "Blue",
  "Navy",
  "Red",
  "Green",
  "Yellow",
  "Brown",
  "Grey",
  "Silver",
  "Pink",
  "Multicolor",
  "Not sure",
] as const;

const d = (iso: string) => new Date(`${iso}T12:00:00`).getTime();

export const SEED_REPORTS: Report[] = [
  {
    id: "L-0147",
    type: "lost",
    title: "Black wallet",
    category: "Accessories",
    colors: ["Black"],
    location: "Main Library",
    date: "2025-08-27",
    description:
      "Lost my black wallet somewhere near the library. Contains my college ID and some cash.",
    tags: ["college id", "cash"],
    reporter: "Aarav Mehta",
    contact: "aarav.m@campus.edu",
    createdAt: d("2025-08-27"),
    status: "active",
    matchedWith: null,
  },
  {
    id: "L-0149",
    type: "lost",
    title: "Apple AirPods Pro, white case",
    category: "Electronics",
    colors: ["White"],
    location: "Cafeteria",
    date: "2025-09-02",
    description:
      "Left my AirPods on a table near the counter. White case with the initials KM scratched on the back.",
    tags: ["initials km", "engraved"],
    reporter: "Kabir Malhotra",
    contact: "kabir.m@campus.edu",
    createdAt: d("2025-09-02"),
    status: "active",
    matchedWith: null,
  },
  {
    id: "L-0152",
    type: "lost",
    title: "Blue North Face backpack",
    category: "Bags",
    colors: ["Blue", "Navy"],
    location: "Lecture Hall A",
    date: "2025-09-03",
    description:
      "Forgot a blue North Face backpack after the 10 am lecture. Laptop charger and a physics notebook inside.",
    tags: ["laptop charger", "physics notebook"],
    reporter: "Meera Iyer",
    contact: "meera.i@campus.edu",
    createdAt: d("2025-09-03"),
    status: "active",
    matchedWith: null,
  },
  {
    id: "L-0155",
    type: "lost",
    title: "Silver Casio wristwatch",
    category: "Accessories",
    colors: ["Silver", "Grey"],
    location: "Gym & Sports Complex",
    date: "2025-09-05",
    description:
      "Silver Casio watch with a worn strap. It was on the bench near the treadmills after my workout.",
    tags: ["worn strap", "casio"],
    reporter: "Dev Sharma",
    contact: "dev.s@campus.edu",
    createdAt: d("2025-09-05"),
    status: "active",
    matchedWith: null,
  },
  {
    id: "L-0158",
    type: "lost",
    title: "Black automatic umbrella",
    category: "Other",
    colors: ["Black"],
    location: "Bus Stop",
    date: "2025-09-06",
    description:
      "Black automatic umbrella with a wooden handle. Left it at the bus stop during the evening rain.",
    tags: ["wooden handle"],
    reporter: "Sara Fernandes",
    contact: "sara.f@campus.edu",
    createdAt: d("2025-09-06"),
    status: "active",
    matchedWith: null,
  },
  {
    id: "F-0131",
    type: "found",
    title: "Black leather wallet",
    category: "Accessories",
    colors: ["Black"],
    location: "Main Library",
    date: "2025-08-28",
    description:
      "Found a black leather wallet outside the library. Has a student ID card inside.",
    tags: ["student id", "leather"],
    reporter: "Rohan Gupta",
    contact: "rohan.g@campus.edu",
    createdAt: d("2025-08-28"),
    status: "active",
    matchedWith: null,
  },
  {
    id: "F-0133",
    type: "found",
    title: "White earbuds case with initials",
    category: "Electronics",
    colors: ["White"],
    location: "Cafeteria",
    date: "2025-09-02",
    description:
      "Picked up a white Apple AirPods case from under a cafeteria table. Initials KM scratched on the lid.",
    tags: ["initials km", "apple"],
    reporter: "Ananya Rao",
    contact: "ananya.r@campus.edu",
    createdAt: d("2025-09-02"),
    status: "active",
    matchedWith: null,
  },
  {
    id: "F-0136",
    type: "found",
    title: "Navy blue backpack, row 4",
    category: "Bags",
    colors: ["Navy", "Blue"],
    location: "Lecture Hall A",
    date: "2025-09-04",
    description:
      "Navy North Face backpack left in row 4 after the morning lecture. Contains a laptop charger and physics notes.",
    tags: ["laptop charger", "physics notebook", "north face"],
    reporter: "Isha Verma",
    contact: "isha.v@campus.edu",
    createdAt: d("2025-09-04"),
    status: "active",
    matchedWith: null,
  },
  {
    id: "F-0140",
    type: "found",
    title: "Casio watch, silver strap",
    category: "Accessories",
    colors: ["Silver"],
    location: "Gym & Sports Complex",
    date: "2025-09-05",
    description:
      "Found a silver Casio wristwatch on the bench area near the treadmills. The strap looks worn.",
    tags: ["worn strap", "casio"],
    reporter: "Aditya Kulkarni",
    contact: "aditya.k@campus.edu",
    createdAt: d("2025-09-05"),
    status: "active",
    matchedWith: null,
  },
  {
    id: "F-0142",
    type: "found",
    title: "Keys on a red lanyard",
    category: "Keys",
    colors: ["Red", "Silver"],
    location: "Parking Lot",
    date: "2025-09-07",
    description:
      "Three keys on a red lanyard, found near the scooter parking. One key has a small bottle opener.",
    tags: ["lanyard", "three keys"],
    reporter: "Nikhil Bose",
    contact: "nikhil.b@campus.edu",
    createdAt: d("2025-09-07"),
    status: "active",
    matchedWith: null,
  },
  {
    id: "F-0144",
    type: "found",
    title: "HP laptop charger",
    category: "Electronics",
    colors: ["Black"],
    location: "Computer Lab",
    date: "2025-09-08",
    description:
      "Black HP charger left plugged in at station 12 overnight. No name on the brick.",
    tags: ["hp", "charger"],
    reporter: "Tanvi Desai",
    contact: "tanvi.d@campus.edu",
    createdAt: d("2025-09-08"),
    status: "active",
    matchedWith: null,
  },
  {
    id: "F-0145",
    type: "found",
    title: "Student ID card and loose cash",
    category: "ID & Cards",
    colors: ["Not sure"],
    location: "Cafeteria",
    date: "2025-08-28",
    description:
      "Found a student ID card with some loose cash near the cafeteria counter during lunch.",
    tags: ["student id", "cash"],
    reporter: "Farhan Ali",
    contact: "farhan.a@campus.edu",
    createdAt: d("2025-08-28"),
    status: "active",
    matchedWith: null,
  },
];

export const LS_KEY = "trace.reports.v1";

export function loadReports(): Report[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Report[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* fall through to seeds */
  }
  return SEED_REPORTS.map((r) => ({ ...r }));
}

export function nextId(reports: Report[], type: ItemType): string {
  const prefix = type === "lost" ? "L" : "F";
  const max = reports.reduce((m, r) => {
    const n = parseInt(r.id.split("-")[1] ?? "0", 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 100);
  return `${prefix}-0${max + 1}`;
}
