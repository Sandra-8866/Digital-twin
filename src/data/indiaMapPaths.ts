export interface StatePath {
  id: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
}

// A high-fidelity, grid-aligned schematic polygon map of India (viewBox="0 0 600 650")
// Designed to look like a digital telemetry grid mesh, fit for a Digital Twin dashboard.
export const indiaStatesMapPaths: StatePath[] = [
  {
    id: "LA",
    name: "Ladakh",
    path: "M 230,40 L 290,65 L 305,100 L 260,115 L 225,95 L 225,65 Z",
    labelX: 260,
    labelY: 75
  },
  {
    id: "JK",
    name: "Jammu and Kashmir",
    path: "M 180,55 L 230,40 L 225,65 L 225,95 L 205,115 L 175,100 Z",
    labelX: 195,
    labelY: 80
  },
  {
    id: "HP",
    name: "Himachal Pradesh",
    path: "M 205,115 L 260,115 L 270,140 L 245,155 L 210,135 Z",
    labelX: 235,
    labelY: 130
  },
  {
    id: "PB",
    name: "Punjab",
    path: "M 165,120 L 210,135 L 200,165 L 165,150 Z",
    labelX: 180,
    labelY: 145
  },
  {
    id: "UK",
    name: "Uttarakhand",
    path: "M 245,155 L 270,140 L 295,170 L 285,190 L 250,185 Z",
    labelX: 270,
    labelY: 170
  },
  {
    id: "HR",
    name: "Haryana",
    path: "M 200,165 L 250,185 L 240,215 L 215,220 L 195,190 Z",
    labelX: 215,
    labelY: 195
  },
  {
    id: "DL",
    name: "Delhi",
    path: "M 225,198 L 235,198 L 235,208 L 225,208 Z",
    labelX: 228,
    labelY: 204
  },
  {
    id: "RJ",
    name: "Rajasthan",
    path: "M 125,170 L 195,190 L 215,220 L 190,285 L 130,265 L 110,215 Z",
    labelX: 160,
    labelY: 230
  },
  {
    id: "UP",
    name: "Uttar Pradesh",
    path: "M 250,185 L 285,190 L 355,220 L 370,265 L 340,295 L 290,265 L 240,215 Z",
    labelX: 300,
    labelY: 235
  },
  {
    id: "GJ",
    name: "Gujarat",
    path: "M 90,280 L 135,270 L 160,295 L 155,340 L 115,355 L 90,325 Z",
    labelX: 120,
    labelY: 310
  },
  {
    id: "MP",
    name: "Madhya Pradesh",
    path: "M 190,285 L 290,265 L 310,310 L 325,355 L 260,370 L 215,355 L 175,320 Z",
    labelX: 235,
    labelY: 320
  },
  {
    id: "BH", // BIHAR (using BR but map mapping)
    name: "Bihar",
    path: "M 355,220 L 415,235 L 420,270 L 360,285 L 340,295 C 340,295 355,220 355,220 Z",
    labelX: 380,
    labelY: 255
  },
  {
    id: "JH",
    name: "Jharkhand",
    path: "M 360,285 L 420,270 L 435,310 L 390,335 L 365,315 Z",
    labelX: 395,
    labelY: 305
  },
  {
    id: "WB",
    name: "West Bengal",
    path: "M 420,270 L 440,270 L 450,290 L 430,360 L 415,345 L 435,310 Z",
    labelX: 435,
    labelY: 330
  },
  {
    id: "OR", // ODISHA (using OD but mapped here)
    name: "Odisha",
    path: "M 365,315 L 390,335 L 415,345 L 400,410 L 350,395 L 345,350 Z",
    labelX: 375,
    labelY: 365
  },
  {
    id: "CG",
    name: "Chhattisgarh",
    path: "M 310,310 L 345,350 L 350,395 L 320,440 L 305,400 L 295,355 Z",
    labelX: 320,
    labelY: 370
  },
  {
    id: "MH",
    name: "Maharashtra",
    path: "M 155,340 L 215,355 L 260,370 L 295,355 L 305,400 L 255,445 L 180,410 L 165,370 Z",
    labelX: 215,
    labelY: 390
  },
  {
    id: "AP",
    name: "Andhra Pradesh",
    path: "M 255,445 L 305,400 L 320,440 L 305,490 L 275,545 L 265,510 L 245,480 Z",
    labelX: 285,
    labelY: 485
  },
  {
    id: "TG",
    name: "Telangana",
    path: "M 255,445 L 245,480 L 265,510 L 305,490 L 305,450 Z",
    labelX: 275,
    labelY: 465
  },
  {
    id: "KA",
    name: "Karnataka",
    path: "M 180,410 L 255,445 L 245,480 L 265,510 L 235,565 L 205,535 L 190,470 Z",
    labelX: 215,
    labelY: 495
  },
  {
    id: "GO", // GOA (using GA but map mapping)
    name: "Goa",
    path: "M 188,485 L 195,485 L 195,495 L 188,495 Z",
    labelX: 185,
    labelY: 490
  },
  {
    id: "KL",
    name: "Kerala",
    path: "M 205,535 L 235,565 L 225,605 L 215,615 L 200,555 Z",
    labelX: 212,
    labelY: 575
  },
  {
    id: "TN",
    name: "Tamil Nadu",
    path: "M 235,565 L 275,545 L 265,605 L 245,620 L 225,605 Z",
    labelX: 250,
    labelY: 585
  },
  // North East States
  {
    id: "SK",
    name: "Sikkim",
    path: "M 440,225 L 455,225 L 455,240 L 440,240 Z",
    labelX: 448,
    labelY: 232
  },
  {
    id: "AS",
    name: "Assam",
    path: "M 480,230 L 525,235 L 535,255 L 515,270 L 475,265 L 465,245 Z",
    labelX: 495,
    labelY: 250
  },
  {
    id: "AR",
    name: "Arunachal Pradesh",
    path: "M 480,230 L 525,220 L 555,225 L 565,245 L 525,235 Z",
    labelX: 535,
    labelY: 230
  },
  {
    id: "ML",
    name: "Meghalaya",
    path: "M 475,265 L 505,265 L 505,280 L 475,280 Z",
    labelX: 490,
    labelY: 272
  },
  {
    id: "NL",
    name: "Nagaland",
    path: "M 555,240 L 575,245 L 570,265 L 555,260 Z",
    labelX: 565,
    labelY: 252
  },
  {
    id: "MN",
    name: "Manipur",
    path: "M 555,260 L 570,265 L 565,285 L 550,280 Z",
    labelX: 560,
    labelY: 272
  },
  {
    id: "MZ",
    name: "Mizoram",
    path: "M 545,280 L 560,285 L 555,310 L 540,305 Z",
    labelX: 550,
    labelY: 295
  },
  {
    id: "TR",
    name: "Tripura",
    path: "M 525,280 L 540,280 L 540,295 L 525,295 Z",
    labelX: 532,
    labelY: 288
  },
  // Islands & UTs
  {
    id: "LD",
    name: "Lakshadweep",
    path: "M 150,560 A 8,8 0 1,1 150,576 A 8,8 0 1,1 150,560 M 145,585 A 6,6 0 1,1 145,597 A 6,6 0 1,1 145,585",
    labelX: 147,
    labelY: 578
  },
  {
    id: "AN",
    name: "Andaman and Nicobar Islands",
    path: "M 490,520 A 10,10 0 1,1 490,540 M 500,560 A 8,8 0 1,1 500,576 M 505,590 A 6,6 0 1,1 505,602",
    labelX: 497,
    labelY: 560
  }
];

// Helper to resolve state/UT ID aliases between our dataset and path definitions.
export const normalizeStateId = (id: string): string => {
  const mapping: { [key: string]: string } = {
    "BR": "BH",
    "OD": "OR",
    "GA": "GO",
    "BH": "BR",
    "OR": "OD",
    "GO": "GA"
  };
  return mapping[id] || id;
};
