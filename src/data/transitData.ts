import heroTransitImg from '../assets/images/hero_intercity_transit_1790689862313.jpg';
import mealThaliBoxImg from '../assets/images/meal_regional_thali_box_1790689882969.jpg';
import localFoodHubImg from '../assets/images/local_food_hub_jaipur_1790689897685.jpg';
import cabTransferImg from '../assets/images/cab_airport_transfer_1790689916876.jpg';

export type TransportMode = 'bus' | 'flight' | 'train' | 'cab';
export type TripType = 'one-way' | 'round-trip';
export type DietaryType = 'all' | 'Vegetarian' | 'Non-Vegetarian' | 'Jain' | 'Vegan' | 'Regional Box';
export type TravelPurpose = 'Leisure & Family' | 'Business Express' | 'Solo Backpacker' | 'Pilgrimage & Heritage';
export type BudgetTier = 'All Tiers' | 'Economy Saver' | 'Comfort Standard' | 'Executive Luxury';
export type ConcessionType = 'None' | 'Student (15% Off)' | 'Senior Citizen (20% Off)' | 'Armed Forces (25% Off)';
export type PlaceScale = 'Auto-Detect' | 'Village / Rural' | 'Town / District' | 'City / State' | 'Country / International';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { symbol: string; rateFromInr: number; label: string }
> = {
  INR: { symbol: '₹', rateFromInr: 1, label: '₹ INR (Indian Rupee)' },
  USD: { symbol: '$', rateFromInr: 0.012, label: '$ USD (US Dollar)' },
  EUR: { symbol: '€', rateFromInr: 0.011, label: '€ EUR (Euro)' },
  GBP: { symbol: '£', rateFromInr: 0.0095, label: '£ GBP (British Pound)' },
  AED: { symbol: 'AED ', rateFromInr: 0.044, label: 'AED (UAE Dirham)' },
};

export function formatCurrency(amountInInr: number, currency: CurrencyCode = 'INR'): string {
  const cfg = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;
  const converted = Math.max(1, Math.round(amountInInr * cfg.rateFromInr));
  return `${cfg.symbol}${converted.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US')}`;
}

export interface CityHub {
  id: string;
  name: string;
  state: string;
  country: string;
  placeType: 'Village / Rural' | 'Town / District' | 'City / State' | 'Country / International';
  code: string;
  lat: number;
  lng: number;
  rtcOperator: string;
  busTerminal: string;
  airportName: string;
  trainStation: string;
  popularHotelZones: string[];
  regionalCuisineName: string;
  signatureDishes: string[];
  metroInfo?: string;
}

export interface TransitOption {
  id: string;
  mode: TransportMode;
  operator: string;
  serviceCode: string;
  vehicleType: string;
  tier: 'Economy Saver' | 'Comfort Standard' | 'Executive Luxury';
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  distanceKm: number;
  baseFare: number;
  taxRate: number;
  rating: string;
  reviewsCount: number;
  seatsAvailable: number;
  berthConfig: 'sleeper-bus' | 'cabin-grid' | 'private-cab';
  amenities: string[];
  onTimePercentage: string;
  recommendedFor: TravelPurpose[];
}

export interface SeatItem {
  id: string;
  label: string;
  deck: 'lower' | 'upper' | 'main';
  row: number;
  col: number;
  position: 'Window' | 'Middle' | 'Aisle' | 'Single Window';
  type: 'Sleeper Berth' | 'Semi-Sleeper' | 'Cabin Seat' | 'Executive Seat';
  status: 'available' | 'booked' | 'ladies-available';
  surcharge: number;
}

export interface MealOption {
  id: string;
  name: string;
  dietary: Exclude<DietaryType, 'all'>;
  regionTag: string;
  description: string;
  itemsIncluded: string;
  calories: string;
  price: number;
  image?: string;
}

export interface LocalCommuteOption {
  id: string;
  category: 'cab-transfer' | 'self-drive-bike' | 'self-drive-car';
  title: string;
  vehicleModel: string;
  capacity: string;
  pickupPoint: string;
  inclusionText: string;
  billingUnit: 'per transfer' | 'per 24 hrs';
  price: number;
  image?: string;
}

export interface PublicTransitGuide {
  cityName: string;
  metroNetwork: {
    lines: string;
    stationConnect: string;
    fareRange: string;
    operatingHours: string;
  };
  cityBusService: {
    operator: string;
    keyCorridors: string;
    acPassFare: string;
  };
  rickshawAndPrepaid: {
    baseFare: string;
    perKmRate: string;
    stationCounterTip: string;
  };
}

export interface LocalFoodSpot {
  id: string;
  cityName: string;
  name: string;
  category: 'Heritage Dining' | 'Street Food Hub' | 'Regional Thali' | 'Artisanal Cafe';
  neighborhood: string;
  distanceFromHub: string;
  dietaryOptions: string;
  signatureDish: string;
  avgCostForTwo: string;
  timings: string;
  rating: string;
}

export interface ConfirmedBooking {
  pnr: string;
  bookedAt: string;
  currency: CurrencyCode;
  mode: TransportMode;
  tripType: TripType;
  fromCity: CityHub;
  toCity: CityHub;
  customBoardingPoint: string;
  customDroppingPoint: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    seatPreference: string;
    concession: ConcessionType;
  };
  selectedRoute: TransitOption;
  selectedSeats: SeatItem[];
  selectedMeals: { meal: MealOption; quantity: number }[];
  customMealNote?: string;
  selectedLocalCommute: LocalCommuteOption | null;
  includeInsurance: boolean;
  savedFoodSpots: LocalFoodSpot[];
  passengerContact: {
    fullName: string;
    phone: string;
    email: string;
    dropHotelAddress: string;
    paymentMethod: string;
  };
  pricing: {
    baseFareTotal: number;
    childDiscountTotal: number;
    concessionDiscountTotal: number;
    returnFareTotal: number;
    seatSurchargeTotal: number;
    taxes: number;
    convenienceFee: number;
    mealsTotal: number;
    localCommuteTotal: number;
    insuranceTotal: number;
    grandTotal: number;
  };
}

export const GENERATED_IMAGES = {
  heroTransit: heroTransitImg,
  mealThaliBox: mealThaliBoxImg,
  localFoodHub: localFoodHubImg,
  cabTransfer: cabTransferImg,
};

// Sample Quick-Pick Directory spanning Villages, Towns, Indian States, and Global Countries
export const CITY_HUBS: CityHub[] = [
  {
    id: 'araku-village',
    name: 'Araku Valley Village',
    state: 'Alluri Sitharama Raju Dist, AP',
    country: 'India',
    placeType: 'Village / Rural',
    code: 'ARK',
    lat: 18.3273,
    lng: 82.8775,
    rtcOperator: 'APSRTC Palle Velugu & Ghat Express',
    busTerminal: 'Araku Panchayat Bus Stand & Tribal Museum Stop',
    airportName: 'Visakhapatnam Airport Feeder (110 km via Ghat Road)',
    trainStation: 'Araku Railway Station (ARK · Kirandul Line)',
    popularHotelZones: ['Padmapuram Gardens Road', 'Coffee Plantation Homestays', 'Chaparai Road', 'Ananthagiri Hills'],
    regionalCuisineName: 'Araku Tribal Organic & Bamboo Kitchen',
    signatureDishes: ['Bamboo Roasted Corn & Paneer', 'Araku Organic Pepper Coffee', 'Hill Millet Ragi Sangati'],
    metroInfo: 'Ghat Road Shared Jeep, APSRTC Palle Velugu Village Shuttles & Vistadome Rail Coach',
  },
  {
    id: 'pochampally-village',
    name: 'Bhoodan Pochampally Village',
    state: 'Yadadri Bhuvanagiri, Telangana',
    country: 'India',
    placeType: 'Village / Rural',
    code: 'PCH',
    lat: 17.3464,
    lng: 78.8282,
    rtcOperator: 'TGSRTC Gramina Shuttle & Express',
    busTerminal: 'Pochampally Handloom Weavers Bus Stand',
    airportName: 'Rajiv Gandhi Intl Airport Feeder (55 km)',
    trainStation: 'Bibinagar / Bhongir Nearest Rail Halt',
    popularHotelZones: ['Handloom Park Heritage Stay', 'Ikat Weavers Colony', 'Lake View Rural Resort', 'Main Bazaar'],
    regionalCuisineName: 'Telangana Village Sattvic & Country Kitchen',
    signatureDishes: ['Sarva Pindi & Jonna Rotte', 'Pachi Pulusu & Village Dal', 'Bellam Paramannam'],
    metroInfo: 'Village Gramina Electric Auto Feeder & Direct Uppal Metro Link Bus',
  },
  {
    id: 'tir',
    name: 'Tirupati',
    state: 'Andhra Pradesh',
    country: 'India',
    placeType: 'Town / District',
    code: 'TIR',
    lat: 13.6288,
    lng: 79.4192,
    rtcOperator: 'APSRTC Saptagiri Electric AC',
    busTerminal: 'Tirupati Central Bus Station (CBS)',
    airportName: 'Tirupati Airport Renigunta (TIR)',
    trainStation: 'Tirupati Main Railway Station (TPTY)',
    popularHotelZones: ['Alipiri Footpath Zone', 'Kapila Theertham Road', 'Srinivasa Mangapuram', 'Renigunta Road'],
    regionalCuisineName: 'Rayalaseema Sattvic & Traditional Bhojanam',
    signatureDishes: ['Rayalaseema Ragi Sangati', 'Temple Pulihora & Daddojanam', 'Ulavacharu Meal'],
    metroInfo: 'Saptagiri Electric Shuttle & Garland Bus Ring connecting Railway Station to Alipiri',
  },
  {
    id: 'hyd',
    name: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    placeType: 'City / State',
    code: 'HYD',
    lat: 17.385,
    lng: 78.4867,
    rtcOperator: 'TGSRTC Garuda Plus',
    busTerminal: 'Mahatma Gandhi Bus Station (MGBS) & Miyapur Hub',
    airportName: 'Rajiv Gandhi Intl Airport (HYD)',
    trainStation: 'Secunderabad Junction (SC)',
    popularHotelZones: ['Banjara Hills', 'HITEC City', 'Jubilee Hills', 'Gachibowli'],
    regionalCuisineName: 'Deccani & Telugu Royal Kitchen',
    signatureDishes: ['Hyderabadi Dum Biryani', 'Pesarattu Upma', 'Mirchi Ka Salan & Double Ka Meetha'],
    metroInfo: 'Hyderabad Metro Red, Blue & Green Lines (MGBS & Secunderabad Direct Connect)',
  },
  {
    id: 'blr',
    name: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    placeType: 'City / State',
    code: 'BLR',
    lat: 12.9716,
    lng: 77.5946,
    rtcOperator: 'KSRTC Ambari Dream Class',
    busTerminal: 'Kempegowda Majestic Bus Terminal (KBS)',
    airportName: 'Kempegowda Intl Airport (BLR T2)',
    trainStation: 'KSR Bengaluru City Junction (SBC)',
    popularHotelZones: ['MG Road & Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar'],
    regionalCuisineName: 'Kannada & Udupi Heritage Kitchen',
    signatureDishes: ['Benne Masala Dosa', 'Bisi Bele Bath', 'Mangalorean Ghee Roast & Filter Coffee'],
    metroInfo: 'Namma Metro Purple & Green Lines (Direct Majestic KBS & SBC Interchange)',
  },
  {
    id: 'del',
    name: 'New Delhi',
    state: 'Delhi NCR',
    country: 'India',
    placeType: 'City / State',
    code: 'DEL',
    lat: 28.6139,
    lng: 77.209,
    rtcOperator: 'DTC & RSRTC Super Luxury',
    busTerminal: 'Kashmere Gate ISBT & Sarai Kale Khan Hub',
    airportName: 'Indira Gandhi Intl Airport (DEL T3)',
    trainStation: 'New Delhi Railway Station (NDLS)',
    popularHotelZones: ['Connaught Place', 'Aerocity', 'Chanakyapuri', 'Karol Bagh'],
    regionalCuisineName: 'Old Delhi Mughlai & Punjabi Tandoor',
    signatureDishes: ['Dal Makhani & Amritsari Kulcha', 'Chandni Chowk Chaat', 'Paneer Tikka & Rabri Falooda'],
    metroInfo: 'DMRC Airport Express Orange Line, Yellow, Blue & Red Lines across NCR',
  },
  {
    id: 'bom',
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    placeType: 'City / State',
    code: 'BOM',
    lat: 19.076,
    lng: 72.8777,
    rtcOperator: 'MSRTC Shivneri Volvo AC',
    busTerminal: 'Dadar East Shivneri Hub & Borivali Terminal',
    airportName: 'Chhatrapati Shivaji Maharaj Intl (BOM T2)',
    trainStation: 'Mumbai Central (MMCT) & CSMT',
    popularHotelZones: ['Colaba & Nariman Point', 'Bandra Kurla Complex', 'Juhu', 'Powai'],
    regionalCuisineName: 'Konkani & Maharashtrian Coastal',
    signatureDishes: ['Thalipeeth & Thecha', 'Bombay Masala Pav & Vada', 'Kokum Solkadhi & Modak'],
    metroInfo: 'Mumbai Metro Lines 1, 2A, 7 & Aqua Line 3 + Western/Central Suburban Rail',
  },
  {
    id: 'dxb',
    name: 'Dubai',
    state: 'Emirate of Dubai',
    country: 'United Arab Emirates',
    placeType: 'Country / International',
    code: 'DXB',
    lat: 25.2048,
    lng: 55.2708,
    rtcOperator: 'RTA Intercity Luxury Coach',
    busTerminal: 'Al Ghubaiba & Union Square Central Bus Station',
    airportName: 'Dubai International Airport (DXB Terminal 3)',
    trainStation: 'Dubai Metro Red Line & Etihad Rail Hub',
    popularHotelZones: ['Downtown Burj Khalifa', 'Dubai Marina & JBR', 'Business Bay', 'Palm Jumeirah'],
    regionalCuisineName: 'Emirati & Levantine Mezze Kitchen',
    signatureDishes: ['Saffron Machboos & Mezze Platter', 'Grilled Halloumi & Falafel Wrap', 'Luqaimat Date Syrup Dumplings'],
    metroInfo: 'Dubai Metro Red & Green Lines (Direct DXB Terminal 1 & 3 Access with Nol Card)',
  },
  {
    id: 'sin',
    name: 'Singapore',
    state: 'Central Region',
    country: 'Singapore',
    placeType: 'Country / International',
    code: 'SIN',
    lat: 1.3521,
    lng: 103.8198,
    rtcOperator: 'SMRT & Causeway Link Express',
    busTerminal: 'Queen Street & Bugis Intercity Coach Terminal',
    airportName: 'Singapore Changi Airport (SIN Jewel T1–T4)',
    trainStation: 'Woodlands & Tanjong Pagar MRT Rail Interchange',
    popularHotelZones: ['Marina Bay Sands Zone', 'Orchard Road', 'Sentosa Island', 'Bugis & Little India'],
    regionalCuisineName: 'Peranakan & Hawker Heritage Kitchen',
    signatureDishes: ['Laksa Lemak & Hainanese Rice', 'Truffle Char Kway Teow', 'Kaya Toast & Pandan Cake'],
    metroInfo: 'SMRT East-West, Thomson-East Coast & Downtown MRT Lines (SimplyGo Contactless)',
  },
  {
    id: 'lon',
    name: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    placeType: 'Country / International',
    code: 'LHR',
    lat: 51.5072,
    lng: -0.1276,
    rtcOperator: 'National Express Royal Coach',
    busTerminal: 'London Victoria Coach Station',
    airportName: 'London Heathrow International (LHR T5)',
    trainStation: 'London St Pancras Intl & Paddington Station',
    popularHotelZones: ['Westminster & Mayfair', 'Covent Garden', 'South Bank', 'Kensington'],
    regionalCuisineName: 'Modern British & Global Artisan Kitchen',
    signatureDishes: ['Artisan Sourdough & Cornish Pastry Box', 'Herb Roasted Veg & Mash Platter', 'Sticky Toffee Pudding & Earl Grey'],
    metroInfo: 'London Underground Tube, Elizabeth Line (Direct Heathrow to Central London) & Oyster Tap',
  },
  {
    id: 'tyo',
    name: 'Tokyo',
    state: 'Kanto Region',
    country: 'Japan',
    placeType: 'Country / International',
    code: 'HND',
    lat: 35.6762,
    lng: 139.6503,
    rtcOperator: 'Willer Express Highway Coach',
    busTerminal: 'Shinjuku Expressway Bus Terminal (Busta Shinjuku)',
    airportName: 'Tokyo Haneda (HND) & Narita Intl (NRT)',
    trainStation: 'Tokyo Central Shinkansen Station',
    popularHotelZones: ['Shinjuku', 'Ginza & Marunouchi', 'Shibuya', 'Asakusa'],
    regionalCuisineName: 'Edo Ekiben & Washoku Bento Kitchen',
    signatureDishes: ['Shinkansen Makunouchi Ekiben Box', 'Matcha Sobameshi & Tempura', 'Miso Glazed Tofu & Onigiri Trio'],
    metroInfo: 'Tokyo Metro, JR Yamanote Ring Line & Tokyo Monorail (Suica / Pasmo IC Card)',
  },
  {
    id: 'nyc',
    name: 'New York',
    state: 'New York',
    country: 'United States',
    placeType: 'Country / International',
    code: 'JFK',
    lat: 40.7128,
    lng: -74.006,
    rtcOperator: 'Megabus & Greyhound Northeast Express',
    busTerminal: 'Port Authority Bus Terminal Midtown',
    airportName: 'John F. Kennedy International Airport (JFK)',
    trainStation: 'Moynihan Train Hall at Penn Station (NYP)',
    popularHotelZones: ['Midtown Manhattan', 'SoHo & Tribeca', 'Central Park South', 'Brooklyn Heights'],
    regionalCuisineName: 'New York Artisanal Deli & Bistro',
    signatureDishes: ['Everything Bagel & Smoked Veg Lox Box', 'Manhattan Roasted Grain Bowl', 'New York Cheesecake Slice'],
    metroInfo: 'NYC MTA Subway, AirTrain JFK & Long Island Rail Road (OMNY Tap-and-Go)',
  },
];

// Dynamically resolves ANY user-typed village, town, city, state, or country into a complete CityHub
export function resolveCityHub(
  queryText: string,
  scaleOverride: PlaceScale = 'Auto-Detect'
): CityHub {
  const clean = queryText.trim();
  if (!clean) return CITY_HUBS[0];

  const exactMatch = CITY_HUBS.find(
    (c) =>
      c.name.toLowerCase() === clean.toLowerCase() ||
      c.code.toLowerCase() === clean.toLowerCase() ||
      `${c.name}, ${c.state}`.toLowerCase() === clean.toLowerCase() ||
      `${c.name}, ${c.country}`.toLowerCase() === clean.toLowerCase()
  );
  if (exactMatch && scaleOverride === 'Auto-Detect') return exactMatch;

  // Parse "PlaceName, State/Region, Country"
  const parts = clean.split(',').map((p) => p.trim()).filter(Boolean);
  const rawPlaceName = parts[0] || clean;
  const placeName = rawPlaceName
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');

  const lowerAll = clean.toLowerCase();

  // Detect placeType from keywords or user override
  let detectedType: CityHub['placeType'] = 'City / State';
  if (scaleOverride !== 'Auto-Detect') {
    detectedType = scaleOverride;
  } else if (
    lowerAll.includes('village') ||
    lowerAll.includes('palli') ||
    lowerAll.includes('puram') ||
    lowerAll.includes('gram') ||
    lowerAll.includes('mandal') ||
    lowerAll.includes('panchayat') ||
    lowerAll.includes('colony')
  ) {
    detectedType = 'Village / Rural';
  } else if (
    lowerAll.includes('town') ||
    lowerAll.includes('taluk') ||
    lowerAll.includes('district') ||
    lowerAll.includes('hills') ||
    lowerAll.includes('valley')
  ) {
    detectedType = 'Town / District';
  } else if (
    lowerAll.includes('usa') ||
    lowerAll.includes('uk') ||
    lowerAll.includes('uae') ||
    lowerAll.includes('dubai') ||
    lowerAll.includes('singapore') ||
    lowerAll.includes('london') ||
    lowerAll.includes('paris') ||
    lowerAll.includes('france') ||
    lowerAll.includes('japan') ||
    lowerAll.includes('tokyo') ||
    lowerAll.includes('australia') ||
    lowerAll.includes('canada') ||
    lowerAll.includes('germany') ||
    lowerAll.includes('thailand') ||
    lowerAll.includes('malaysia') ||
    lowerAll.includes('sri lanka') ||
    lowerAll.includes('nepal') ||
    parts.length >= 3
  ) {
    detectedType = 'Country / International';
  }

  const stateName =
    parts[1] ||
    (detectedType === 'Village / Rural'
      ? 'Rural Panchayat / Mandal Zone'
      : detectedType === 'Town / District'
      ? 'District Transit Corridor'
      : detectedType === 'Country / International'
      ? 'International Metropolitan Region'
      : 'Regional State Corridor');

  const countryName =
    parts[2] ||
    (detectedType === 'Country / International'
      ? parts[1] || placeName
      : 'User Defined Region');

  const code = placeName
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) % 10000;
  }

  // Generate coordinates that reflect whether it's local/regional or international
  const lat =
    detectedType === 'Country / International'
      ? 25 + (hash % 30)
      : 12 + (hash % 16);
  const lng =
    detectedType === 'Country / International'
      ? 45 + ((hash * 13) % 90)
      : 74 + ((hash * 7) % 12);

  if (detectedType === 'Village / Rural') {
    return {
      id: `village-${code.toLowerCase()}-${hash}`,
      name: placeName,
      state: stateName,
      country: countryName,
      placeType: 'Village / Rural',
      code,
      lat,
      lng,
      rtcOperator: `${placeName} Gramina & Regional RTC Express`,
      busTerminal: `${placeName} Village Panchayat Bus Stand & Main Crossroads`,
      airportName: `Nearest Regional Airport Feeder to ${placeName}`,
      trainStation: `${placeName} Nearest Mandal Halt / Junction Station (${code})`,
      popularHotelZones: [
        `${placeName} Main Panchayat Center`,
        `${placeName} Temple / Heritage Street`,
        `${placeName} Green Farmstay & Highway Junction`,
        `Nearest Mandal Headquarters`,
      ],
      regionalCuisineName: `${placeName} Traditional Village Home-Style Kitchen`,
      signatureDishes: [
        `${placeName} Wood-Fired Traditional Meal & Millet Roti`,
        `Village Farm-Fresh Vegetable Curry & Dal`,
        `Local Jaggery Sweet & Spiced Buttermilk`,
      ],
      metroInfo: `${placeName} Shared Gramina Auto, Palle Velugu Feeder Bus & Direct Highway Jeep Connect`,
    };
  }

  if (detectedType === 'Town / District') {
    return {
      id: `town-${code.toLowerCase()}-${hash}`,
      name: placeName,
      state: stateName,
      country: countryName,
      placeType: 'Town / District',
      code,
      lat,
      lng,
      rtcOperator: `${placeName} District Super Luxury RTC`,
      busTerminal: `${placeName} Central RTC Bus Complex`,
      airportName: `${placeName} Domestic / Regional Airport (${code})`,
      trainStation: `${placeName} Town Railway Junction (${code}J)`,
      popularHotelZones: [
        `${placeName} Station Road`,
        `${placeName} Clock Tower & Market Bazaar`,
        `${placeName} Collectorate / Civil Lines`,
        `Highway Bypass Circle`,
      ],
      regionalCuisineName: `${placeName} District Heritage Kitchen`,
      signatureDishes: [
        `${placeName} Special Banana Leaf Bhojanam`,
        `Regional Roasted Spice Pulao & Fry`,
        `Town Famous Sweet & Filter Coffee`,
      ],
      metroInfo: `${placeName} Town City Bus Ring, Electric E-Rickshaw Corridors & Station Prepaid Booth`,
    };
  }

  if (detectedType === 'Country / International') {
    return {
      id: `intl-${code.toLowerCase()}-${hash}`,
      name: placeName,
      state: stateName,
      country: countryName,
      placeType: 'Country / International',
      code,
      lat,
      lng,
      rtcOperator: `${placeName} National & Cross-Border Express Coach`,
      busTerminal: `${placeName} Central International Coach Terminal`,
      airportName: `${placeName} International Airport (${code} Terminal 1)`,
      trainStation: `${placeName} Central High-Speed Rail Terminal`,
      popularHotelZones: [
        `${placeName} Downtown & Financial District`,
        `${placeName} Old Quarter & Cultural Center`,
        `${placeName} Waterfront / Marina Promenade`,
        `${placeName} Airport Transit Zone`,
      ],
      regionalCuisineName: `${placeName} Global & Local Culinary Kitchen`,
      signatureDishes: [
        `${placeName} Signature Chef's Tasting Bento`,
        `Artisanal Local Herb & Grain Platter`,
        `Traditional ${placeName} Pastry & Specialty Brew`,
      ],
      metroInfo: `${placeName} Airport Express Rail, City Metro Network & Contactless Transit Tap Card`,
    };
  }

  return {
    id: `city-${code.toLowerCase()}-${hash}`,
    name: placeName,
    state: stateName,
    country: countryName,
    placeType: 'City / State',
    code,
    lat,
    lng,
    rtcOperator: `${placeName} Intercity Volvo & State Express`,
    busTerminal: `${placeName} Central Intercity Bus Port`,
    airportName: `${placeName} International / Domestic Airport (${code})`,
    trainStation: `${placeName} Main Railway Junction (${code}J)`,
    popularHotelZones: [
      `${placeName} Central Commercial District`,
      `${placeName} Heritage & Market Square`,
      `${placeName} IT / Business Park Corridor`,
      `${placeName} Station & Terminal Road`,
    ],
    regionalCuisineName: `${placeName} Regional Specialty Kitchen`,
    signatureDishes: [
      `${placeName} Royal Regional Thali`,
      `Local Spiced Pulao & Paneer Special`,
      `Artisan Regional Dessert & Masala Chai`,
    ],
    metroInfo: `${placeName} Metro Rail & Smart City AC Electric Bus Corridors`,
  };
}

export function calculateRouteDistanceKm(from: CityHub, to: CityHub): number {
  if (from.name.toLowerCase() === to.name.toLowerCase()) return 35;
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const isIntl =
    from.placeType === 'Country / International' ||
    to.placeType === 'Country / International' ||
    from.country.toLowerCase() !== to.country.toLowerCase();

  const rawDist = Math.round(R * c * (isIntl ? 1.05 : 1.22));
  if (isIntl) {
    return Math.max(650, Math.min(9800, rawDist));
  }
  if (from.placeType === 'Village / Rural' || to.placeType === 'Village / Rural') {
    return Math.max(45, Math.min(1400, rawDist));
  }
  return Math.max(110, Math.min(2600, rawDist));
}

function addMinutesToTime(startTime: string, minutesToAdd: number): string {
  const [hh, mm] = startTime.split(':').map(Number);
  const totalMins = hh * 60 + mm + minutesToAdd;
  const finalH = Math.floor(totalMins / 60) % 24;
  const finalM = totalMins % 60;
  const daysLater = Math.floor(totalMins / (24 * 60));
  const timeStr = `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
  return daysLater > 0 ? `${timeStr} (+${daysLater}d)` : timeStr;
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

export function getDynamicTransitOptions(
  fromCity: CityHub,
  toCity: CityHub,
  mode: TransportMode,
  customDistanceKm?: number | null
): TransitOption[] {
  const distKm =
    customDistanceKm && customDistanceKm > 5
      ? customDistanceKm
      : calculateRouteDistanceKm(fromCity, toCity);
  const routeCode = `${fromCity.code}${toCity.code}`;
  const isVillageRoute =
    fromCity.placeType === 'Village / Rural' || toCity.placeType === 'Village / Rural';
  const isIntlRoute =
    fromCity.placeType === 'Country / International' ||
    toCity.placeType === 'Country / International' ||
    fromCity.country.toLowerCase() !== toCity.country.toLowerCase();

  if (mode === 'bus') {
    const speedKmh = isVillageRoute ? 48 : 64;
    const baseBusMins = Math.max(60, Math.round((distKm / speedKmh) * 60));
    const baseBusFare = Math.max(120, Math.round(distKm * (isVillageRoute ? 1.65 : 2.15)));

    return [
      {
        id: `bus-exec-${routeCode}`,
        mode: 'bus',
        operator: isVillageRoute
          ? `${fromCity.name} – ${toCity.name} Direct Rural-Connect AC Coach`
          : `${fromCity.rtcOperator} · Multi-Axle`,
        serviceCode: `${fromCity.code}-9601`,
        vehicleType: isVillageRoute
          ? 'Volvo AC Seater / Sleeper (Direct Village Highway Stop)'
          : 'Volvo 9600 AC Sleeper (2+1 Berth)',
        tier: 'Executive Luxury',
        departureTime: '21:15',
        arrivalTime: addMinutesToTime('21:15', baseBusMins),
        duration: formatDuration(baseBusMins),
        durationMinutes: baseBusMins,
        distanceKm: distKm,
        baseFare: Math.round(baseBusFare * 1.22),
        taxRate: 0.05,
        rating: '4.9',
        reviewsCount: 1240,
        seatsAvailable: 14,
        berthConfig: 'sleeper-bus',
        amenities: [
          'Individual Privacy Curtain',
          '65W USB-C Outlet',
          'Direct Village/City Boarding',
          'Live GPS Link',
        ],
        onTimePercentage: '98% On-Time',
        recommendedFor: ['Business Express', 'Leisure & Family'],
      },
      {
        id: `bus-std-${routeCode}`,
        mode: 'bus',
        operator: `SmartBus Intercity (${fromCity.name} → ${toCity.name})`,
        serviceCode: `IC-${(distKm % 900) + 100}`,
        vehicleType: 'BharatBenz AC Sleeper + Onboard Washroom',
        tier: 'Comfort Standard',
        departureTime: '22:30',
        arrivalTime: addMinutesToTime('22:30', baseBusMins + 20),
        duration: formatDuration(baseBusMins + 20),
        durationMinutes: baseBusMins + 20,
        distanceKm: distKm,
        baseFare: baseBusFare,
        taxRate: 0.05,
        rating: '4.8',
        reviewsCount: 930,
        seatsAvailable: 18,
        berthConfig: 'sleeper-bus',
        amenities: [
          'Onboard Washroom',
          'Luggage Tagging',
          'Air Purifier Cabin',
          'Pre-Booked Meal Delivery',
        ],
        onTimePercentage: '96% On-Time',
        recommendedFor: ['Leisure & Family', 'Pilgrimage & Heritage'],
      },
      {
        id: `bus-saver-${routeCode}`,
        mode: 'bus',
        operator: isVillageRoute
          ? `${toCity.rtcOperator} Palle Velugu / Gramina Express`
          : `${toCity.rtcOperator} Super Express`,
        serviceCode: `${toCity.code}-402`,
        vehicleType: isVillageRoute
          ? 'Direct Panchayat & Mandal Express Coach'
          : 'Scania AC Semi-Sleeper & Upper Berth',
        tier: 'Economy Saver',
        departureTime: '06:45',
        arrivalTime: addMinutesToTime('06:45', baseBusMins + 35),
        duration: formatDuration(baseBusMins + 35),
        durationMinutes: baseBusMins + 35,
        distanceKm: distKm,
        baseFare: Math.round(baseBusFare * 0.72),
        taxRate: 0.05,
        rating: '4.7',
        reviewsCount: 680,
        seatsAvailable: 24,
        berthConfig: 'sleeper-bus',
        amenities: [
          'Stops at Village & Town Centers',
          'Reclining Seats',
          'Extra Farm/Bag Allowance',
          'Drinking Water',
        ],
        onTimePercentage: '95% On-Time',
        recommendedFor: ['Solo Backpacker', 'Pilgrimage & Heritage'],
      },
    ];
  }

  if (mode === 'flight') {
    const flightMins = Math.max(60, Math.round((distKm / 740) * 60 + 40));
    const baseFlightFare = Math.max(
      2400,
      Math.round((isIntlRoute ? 8500 : 1650) + distKm * (isIntlRoute ? 4.8 : 3.4))
    );

    return [
      {
        id: `flt-direct-${routeCode}`,
        mode: 'flight',
        operator: isIntlRoute
          ? `Global Flagship Direct (${fromCity.code} → ${toCity.code})`
          : `IndiGo / Regional Connect (${fromCity.code} → ${toCity.code})`,
        serviceCode: isIntlRoute ? `EK-${(distKm % 800) + 101}` : `6E-${(distKm % 800) + 210}`,
        vehicleType: isIntlRoute
          ? 'Boeing 787-9 Dreamliner · International Non-Stop'
          : isVillageRoute
          ? 'ATR 72-600 Regional + Village Airport Shuttle'
          : 'Airbus A321neo · Direct Flight',
        tier: 'Comfort Standard',
        departureTime: '08:15',
        arrivalTime: addMinutesToTime('08:15', flightMins),
        duration: formatDuration(flightMins),
        durationMinutes: flightMins,
        distanceKm: distKm,
        baseFare: baseFlightFare,
        taxRate: 0.12,
        rating: '4.9',
        reviewsCount: 2180,
        seatsAvailable: 16,
        berthConfig: 'cabin-grid',
        amenities: [
          isIntlRoute ? '30kg Check-In + 7kg Cabin' : '15kg Check-In + 7kg Cabin',
          'Fast-Track Boarding',
          'Hot Regional Meal Box',
          'In-Seat Power & Wi-Fi',
        ],
        onTimePercentage: '96% On-Time',
        recommendedFor: ['Business Express', 'Leisure & Family'],
      },
      {
        id: `flt-exec-${routeCode}`,
        mode: 'flight',
        operator: `Air India Prime (${fromCity.name} → ${toCity.name})`,
        serviceCode: `AI-${(distKm % 500) + 401}`,
        vehicleType: isIntlRoute
          ? 'Airbus A350-900 · Executive & Premium Cabin'
          : 'Airbus A320neo · Executive & Economy',
        tier: 'Executive Luxury',
        departureTime: '17:45',
        arrivalTime: addMinutesToTime('17:45', flightMins + 5),
        duration: formatDuration(flightMins + 5),
        durationMinutes: flightMins + 5,
        distanceKm: distKm,
        baseFare: Math.round(baseFlightFare * 1.26),
        taxRate: 0.12,
        rating: '4.8',
        reviewsCount: 1590,
        seatsAvailable: 11,
        berthConfig: 'cabin-grid',
        amenities: [
          'Complimentary Gourmet Dining',
          'Extra Legroom Pitch',
          'Priority Baggage Handling',
          'Terminal Lounge Access',
        ],
        onTimePercentage: '95% On-Time',
        recommendedFor: ['Business Express', 'Leisure & Family'],
      },
      {
        id: `flt-saver-${routeCode}`,
        mode: 'flight',
        operator: `SkySaver Connect (${fromCity.code} → ${toCity.code})`,
        serviceCode: `QP-${(distKm % 700) + 112}`,
        vehicleType: 'Boeing 737 MAX 8 · Eco Saver',
        tier: 'Economy Saver',
        departureTime: '13:20',
        arrivalTime: addMinutesToTime('13:20', flightMins + 15),
        duration: formatDuration(flightMins + 15),
        durationMinutes: flightMins + 15,
        distanceKm: distKm,
        baseFare: Math.round(baseFlightFare * 0.85),
        taxRate: 0.12,
        rating: '4.7',
        reviewsCount: 910,
        seatsAvailable: 21,
        berthConfig: 'cabin-grid',
        amenities: [
          'Cabin Bag + Check-In Included',
          'Universal AC Socket',
          'Pre-Bookable Café Menu',
          'Ergonomic Recaro Seats',
        ],
        onTimePercentage: '95% On-Time',
        recommendedFor: ['Solo Backpacker', 'Pilgrimage & Heritage'],
      },
    ];
  }

  if (mode === 'train') {
    const trainMins = Math.max(75, Math.round((distKm / 85) * 60));
    const baseTrainFare = Math.max(240, Math.round(distKm * 1.8));

    return [
      {
        id: `trn-vb-${routeCode}`,
        mode: 'train',
        operator: isIntlRoute
          ? `High-Speed Euro/Bullet Rail (${fromCity.name} – ${toCity.name})`
          : `Vande Bharat / Intercity Express (${fromCity.name} – ${toCity.name})`,
        serviceCode: `20${(distKm % 89) + 10}-VB`,
        vehicleType: 'Executive AC Chair Car (EC) & First Class',
        tier: 'Executive Luxury',
        departureTime: '06:15',
        arrivalTime: addMinutesToTime('06:15', trainMins),
        duration: formatDuration(trainMins),
        durationMinutes: trainMins,
        distanceKm: distKm,
        baseFare: Math.round(baseTrainFare * 1.25),
        taxRate: 0.05,
        rating: '4.9',
        reviewsCount: 3150,
        seatsAvailable: 15,
        berthConfig: 'cabin-grid',
        amenities: [
          '180° Rotating Executive Seats',
          'Onboard Fresh Kitchen',
          'Automatic Sliding Doors',
          'High-Speed Wi-Fi',
        ],
        onTimePercentage: '99% On-Time',
        recommendedFor: ['Business Express', 'Leisure & Family'],
      },
      {
        id: `trn-raj-${routeCode}`,
        mode: 'train',
        operator: `${fromCity.name} – ${toCity.name} Superfast AC Sleeper`,
        serviceCode: `12${(distKm % 89) + 10}-RJ`,
        vehicleType: '2-Tier AC Sleeper & First AC Coupe',
        tier: 'Comfort Standard',
        departureTime: '19:40',
        arrivalTime: addMinutesToTime('19:40', trainMins + 35),
        duration: formatDuration(trainMins + 35),
        durationMinutes: trainMins + 35,
        distanceKm: distKm,
        baseFare: baseTrainFare,
        taxRate: 0.05,
        rating: '4.8',
        reviewsCount: 1940,
        seatsAvailable: 12,
        berthConfig: 'cabin-grid',
        amenities: [
          'Sterilized Linen & Pillow',
          'Seat-Delivered Regional Meal',
          'Reading Lamp & Socket',
          'Bio-Vacuum Washroom',
        ],
        onTimePercentage: '96% On-Time',
        recommendedFor: ['Leisure & Family', 'Pilgrimage & Heritage'],
      },
      {
        id: `trn-exp-${routeCode}`,
        mode: 'train',
        operator: isVillageRoute
          ? `${fromCity.name} – ${toCity.name} Passenger / Jan Shatabdi Connect`
          : `${fromCity.name} – ${toCity.name} Express`,
        serviceCode: `17${(distKm % 70) + 25}-EX`,
        vehicleType: '3-Tier AC Economy (3E) & Second Class',
        tier: 'Economy Saver',
        departureTime: '23:05',
        arrivalTime: addMinutesToTime('23:05', trainMins + 55),
        duration: formatDuration(trainMins + 55),
        durationMinutes: trainMins + 55,
        distanceKm: distKm,
        baseFare: Math.round(baseTrainFare * 0.68),
        taxRate: 0.05,
        rating: '4.6',
        reviewsCount: 1120,
        seatsAvailable: 26,
        berthConfig: 'cabin-grid',
        amenities: [
          'Stops at Mandal & Town Halts',
          'E-Catering Seat Delivery',
          'Mobile Charging Socket',
          'Confirmed PNR Seat',
        ],
        onTimePercentage: '94% On-Time',
        recommendedFor: ['Solo Backpacker', 'Pilgrimage & Heritage'],
      },
    ];
  }

  // INTERCITY / DOOR-TO-DOOR CABS (Ideal for Villages, Towns & Cities alike!)
  const cabMins = Math.max(45, Math.round((distKm / 65) * 60));
  const baseCabFare = Math.max(850, Math.round(distKm * 13));

  return [
    {
      id: `cab-ev-${routeCode}`,
      mode: 'cab',
      operator: `Door-to-Door Chauffeur (${fromCity.name} → ${toCity.name})`,
      serviceCode: `EV-${routeCode}`,
      vehicleType: 'BYD e6 / Executive AC SUV (Direct Home/Village Pickup)',
      tier: 'Comfort Standard',
      departureTime: '09:00',
      arrivalTime: addMinutesToTime('09:00', cabMins),
      duration: formatDuration(cabMins),
      durationMinutes: cabMins,
      distanceKm: distKm,
      baseFare: baseCabFare,
      taxRate: 0.05,
      rating: '4.9',
      reviewsCount: 780,
      seatsAvailable: 4,
      berthConfig: 'cabin-grid',
      amenities: [
        `Direct Pickup in ${fromCity.name}`,
        `Direct Drop Anywhere in ${toCity.name}`,
        'Highway Tolls Included',
        'Zero Surge Guarantee',
      ],
      onTimePercentage: '100% Doorstep Pickup',
      recommendedFor: ['Business Express', 'Leisure & Family'],
    },
    {
      id: `cab-hycross-${routeCode}`,
      mode: 'cab',
      operator: `Family SUV Cruiser (${fromCity.name} → ${toCity.name})`,
      serviceCode: `SV-${routeCode}`,
      vehicleType: 'Toyota Innova Hycross 6+1 Captain Seats',
      tier: 'Executive Luxury',
      departureTime: '10:30',
      arrivalTime: addMinutesToTime('10:30', cabMins),
      duration: formatDuration(cabMins),
      durationMinutes: cabMins,
      distanceKm: distKm,
      baseFare: Math.round(baseCabFare * 1.28),
      taxRate: 0.05,
      rating: '4.9',
      reviewsCount: 610,
      seatsAvailable: 6,
      berthConfig: 'cabin-grid',
      amenities: [
        'Captain Recliner Seats',
        'Custom Village / Highway Halts',
        'Roof Carrier & Large Boot',
        'All State/Border Permits Included',
      ],
      onTimePercentage: '99% Doorstep Pickup',
      recommendedFor: ['Leisure & Family', 'Pilgrimage & Heritage'],
    },
    {
      id: `cab-sedan-${routeCode}`,
      mode: 'cab',
      operator: `Point-to-Point Saver Cab (${fromCity.name} → ${toCity.name})`,
      serviceCode: `SD-${routeCode}`,
      vehicleType: 'Maruti Dzire / Etios AC Sedan',
      tier: 'Economy Saver',
      departureTime: '07:00',
      arrivalTime: addMinutesToTime('07:00', cabMins + 15),
      duration: formatDuration(cabMins + 15),
      durationMinutes: cabMins + 15,
      distanceKm: distKm,
      baseFare: Math.round(baseCabFare * 0.76),
      taxRate: 0.05,
      rating: '4.7',
      reviewsCount: 540,
      seatsAvailable: 4,
      berthConfig: 'cabin-grid',
      amenities: [
        'Direct Village/Town Doorstep Drop',
        'Verified Local Route Driver',
        'AC & Music System',
        'Transparent Fare',
      ],
      onTimePercentage: '98% Doorstep Pickup',
      recommendedFor: ['Solo Backpacker', 'Pilgrimage & Heritage'],
    },
  ];
}

export function generateSeatsForOption(option: TransitOption): SeatItem[] {
  if (option.berthConfig === 'sleeper-bus') {
    const seats: SeatItem[] = [];
    const bookedIndices = new Set([2, 5, 8, 11, 14]);
    const ladiesIndices = new Set([3, 9]);

    for (const deck of ['lower', 'upper'] as const) {
      for (let row = 1; row <= 5; row++) {
        const idxSingle = (deck === 'upper' ? 15 : 0) + (row - 1) * 3 + 1;
        seats.push({
          id: `${deck}-${row}A`,
          label: `${deck === 'lower' ? 'L' : 'U'}${row}A`,
          deck,
          row,
          col: 1,
          position: 'Single Window',
          type: 'Sleeper Berth',
          status: bookedIndices.has(idxSingle)
            ? 'booked'
            : ladiesIndices.has(idxSingle)
            ? 'ladies-available'
            : 'available',
          surcharge: deck === 'lower' ? 120 : 60,
        });

        const idxAisle = idxSingle + 1;
        seats.push({
          id: `${deck}-${row}B`,
          label: `${deck === 'lower' ? 'L' : 'U'}${row}B`,
          deck,
          row,
          col: 2,
          position: 'Aisle',
          type: 'Sleeper Berth',
          status: bookedIndices.has(idxAisle) ? 'booked' : 'available',
          surcharge: 0,
        });

        const idxWin = idxSingle + 2;
        seats.push({
          id: `${deck}-${row}C`,
          label: `${deck === 'lower' ? 'L' : 'U'}${row}C`,
          deck,
          row,
          col: 3,
          position: 'Window',
          type: 'Sleeper Berth',
          status: bookedIndices.has(idxWin)
            ? 'booked'
            : ladiesIndices.has(idxWin)
            ? 'ladies-available'
            : 'available',
          surcharge: deck === 'lower' ? 80 : 40,
        });
      }
    }
    return seats;
  }

  const seats: SeatItem[] = [];
  const cols = [
    { col: 1, letter: 'A', pos: 'Window' as const },
    { col: 2, letter: 'B', pos: 'Middle' as const },
    { col: 3, letter: 'C', pos: 'Aisle' as const },
    { col: 4, letter: 'D', pos: 'Aisle' as const },
    { col: 5, letter: 'E', pos: 'Middle' as const },
    { col: 6, letter: 'F', pos: 'Window' as const },
  ];
  const bookedSet = new Set(['1B', '1E', '2C', '3A', '3F', '4D', '5B']);
  const ladiesSet = new Set(['2A', '4F']);

  for (let row = 1; row <= 5; row++) {
    for (const c of cols) {
      const code = `${row}${c.letter}`;
      seats.push({
        id: `cabin-${code}`,
        label: code,
        deck: 'main',
        row,
        col: c.col,
        position: c.pos,
        type: row === 1 ? 'Executive Seat' : 'Cabin Seat',
        status: bookedSet.has(code)
          ? 'booked'
          : ladiesSet.has(code)
          ? 'ladies-available'
          : 'available',
        surcharge: row === 1 ? 250 : c.pos === 'Window' ? 100 : 0,
      });
    }
  }
  return seats;
}

export function getDynamicMealsForRoute(fromCity: CityHub, toCity: CityHub): MealOption[] {
  return [
    {
      id: `meal-dest-regional-${toCity.id}`,
      name: `${toCity.name} (${toCity.placeType.split(' ')[0]}) Specialty Box`,
      dietary: 'Regional Box',
      regionTag: `${toCity.state}, ${toCity.country}`,
      description: `Authentic ${toCity.name} regional meal featuring ${toCity.signatureDishes.join(', ')}, freshly packed in a thermal travel box.`,
      itemsIncluded: `${toCity.signatureDishes[0]} · ${toCity.signatureDishes[1] || 'Regional Accompaniments'} · Local Sweet`,
      calories: '630 kcal',
      price: 310,
      image: GENERATED_IMAGES.mealThaliBox,
    },
    {
      id: `meal-origin-regional-${fromCity.id}`,
      name: `${fromCity.name} Departure Fresh Tiffin`,
      dietary: 'Vegetarian',
      regionTag: `${fromCity.name} Kitchen Dispatch`,
      description: `Prepared fresh at your departure point in ${fromCity.name} featuring ${fromCity.signatureDishes[0]} and warm sides.`,
      itemsIncluded: `${fromCity.signatureDishes[0]} · Steamed Rice / Flatbread · Chutneys · Hot Beverage Flask`,
      calories: '540 kcal',
      price: 250,
    },
    {
      id: 'meal-jain-sattvic',
      name: 'Pure Jain Sattvic Travel Tiffin (No Onion / Garlic)',
      dietary: 'Jain',
      regionTag: 'Zero Root Vegetable Certified',
      description: 'Prepared in a dedicated Jain kitchen without onion, garlic, potato, or root vegetables. Sealed with tamper-evident hygiene tape.',
      itemsIncluded: 'Jain Paneer Curry · Jeera Pulao · Dal Tadka · 3 Phulkas · Dry Fruit Barfi',
      calories: '550 kcal',
      price: 290,
    },
    {
      id: 'meal-vegan-millet',
      name: 'Global Vegan Millet & Roasted Chickpea Bowl',
      dietary: 'Vegan',
      regionTag: '100% Plant-Based & Dairy-Free',
      description: 'High-protein millet pilaf paired with charred greens, tahini-turmeric dressing, spiced chickpeas, and toasted seeds.',
      itemsIncluded: 'Foxtail Millet Pilaf · Spiced Chickpeas · Tahini Dressing · Dark Cacao Bite',
      calories: '470 kcal',
      price: 300,
    },
    {
      id: `meal-nonveg-royal-${toCity.id}`,
      name: `${toCity.name} Spiced Dum Biryani & Grill Box`,
      dietary: 'Non-Vegetarian',
      regionTag: `${toCity.name} Non-Veg Delicacy`,
      description: `Aromatic long-grain rice slow-cooked with regional spices, tender grilled chicken, spiced gravy, and cooling raita.`,
      itemsIncluded: '350g Biryani / Rice · 2Pc Spice Grill · Gravy · Raita · Dessert',
      calories: '710 kcal',
      price: 360,
    },
  ];
}

export function getDynamicLocalCommute(toCity: CityHub, mode: TransportMode): LocalCommuteOption[] {
  const arrivalHubName =
    mode === 'flight'
      ? toCity.airportName
      : mode === 'train'
      ? toCity.trainStation
      : toCity.busTerminal;

  const isVillage = toCity.placeType === 'Village / Rural';

  return [
    {
      id: `commute-ev-sedan-${toCity.id}`,
      category: 'cab-transfer',
      title: isVillage
        ? `${toCity.name} Station/Stand to Village Doorstep Cab`
        : `${toCity.name} Terminal-to-Hotel Private Drop`,
      vehicleModel: 'AC Sedan / Electric Executive Car',
      capacity: 'Up to 4 Passengers · 3 Large Bags',
      pickupPoint: `Zero-Wait Pickup outside ${arrivalHubName}`,
      inclusionText: `Direct drop anywhere in ${toCity.name} (${toCity.popularHotelZones[0]}) · 45 min delay buffer`,
      billingUnit: 'per transfer',
      price: isVillage ? 380 : 520,
      image: GENERATED_IMAGES.cabTransfer,
    },
    {
      id: `commute-suv-transfer-${toCity.id}`,
      category: 'cab-transfer',
      title: `${toCity.name} Family SUV / Rural Utility Transfer`,
      vehicleModel: 'Toyota Innova / Mahindra Scorpio-N (6-Seater)',
      capacity: 'Up to 6 Passengers · 5 Large Bags',
      pickupPoint: `Main Arrival Gate at ${arrivalHubName}`,
      inclusionText: `Ideal for families, village roads, or group luggage across ${toCity.name}`,
      billingUnit: 'per transfer',
      price: isVillage ? 680 : 840,
    },
    {
      id: `commute-bike-rental-${toCity.id}`,
      category: 'self-drive-bike',
      title: `Explore ${toCity.name} · 24-Hr Two-Wheeler Rental`,
      vehicleModel: 'Smart Electric Scooter / Royal Enfield 350',
      capacity: '2 Riders · 2 Helmets Included',
      pickupPoint: `Mobility Point at ${arrivalHubName}`,
      inclusionText: `120 km/day included · Zero security deposit with confirmed PNR`,
      billingUnit: 'per 24 hrs',
      price: 420,
    },
    {
      id: `commute-car-rental-${toCity.id}`,
      category: 'self-drive-car',
      title: `${toCity.name} Daily Self-Drive Car Rental`,
      vehicleModel: 'Compact SUV / Automatic Hatchback',
      capacity: '5 Seats · Automatic / Manual',
      pickupPoint: `Parking Bay 1 at ${arrivalHubName}`,
      inclusionText: `200 km/day limit · Full insurance & 24×7 roadside assistance in ${toCity.state}`,
      billingUnit: 'per 24 hrs',
      price: 1600,
    },
  ];
}

export function getDynamicPublicTransitGuide(toCity: CityHub): PublicTransitGuide {
  const isVillage = toCity.placeType === 'Village / Rural';
  return {
    cityName: toCity.name,
    metroNetwork: {
      lines:
        toCity.metroInfo ||
        `${toCity.name} Regional Transit & Feeder Network`,
      stationConnect: isVillage
        ? `Direct Gramina Auto & RTC Feeder Bus from ${toCity.trainStation} to ${toCity.name} Village Center`
        : `Direct interchange access from ${toCity.trainStation} and ${toCity.busTerminal}`,
      fareRange: isVillage
        ? '₹15 – ₹40 (Shared Auto / Village Shuttle)'
        : '₹10 – ₹55 (QR Ticket & Smart Card Accepted)',
      operatingHours: '05:30 to 22:30 Daily',
    },
    cityBusService: {
      operator: `${toCity.rtcOperator}`,
      keyCorridors: `Connects ${toCity.busTerminal} → ${toCity.popularHotelZones.slice(0, 3).join(' → ')}`,
      acPassFare: isVillage
        ? '₹10 – ₹35 Palle Velugu / Rural Shuttle Fare'
        : '₹15 – ₹45 per trip · Daily Unlimited Transit Pass',
    },
    rickshawAndPrepaid: {
      baseFare: isVillage
        ? '₹20 Shared Auto / ₹40 Private Village Drop'
        : '₹30 for first 1.5 km (Official Regulated Meter)',
      perKmRate: `₹14/km thereafter · Official Prepaid Stand at ${toCity.busTerminal}`,
      stationCounterTip: `Confirm your drop landmark in ${toCity.name} (${toCity.popularHotelZones[0]}) at the prepaid booth before boarding.`,
    },
  };
}

export function getDynamicLocalFoodSpots(toCity: CityHub): LocalFoodSpot[] {
  return [
    {
      id: `food-thali-${toCity.id}`,
      cityName: toCity.name,
      name: `${toCity.name} Traditional ${toCity.placeType === 'Village / Rural' ? 'Village Bhojanam & Mess' : 'Heritage Dining Hall'}`,
      category: 'Regional Thali',
      neighborhood: toCity.popularHotelZones[0] || `${toCity.name} Center`,
      distanceFromHub: `1.2 km from ${toCity.busTerminal}`,
      dietaryOptions: '100% Pure Vegetarian · Jain & Sattvic Options Available',
      signatureDish: toCity.signatureDishes[0] || `${toCity.name} Traditional Platter`,
      avgCostForTwo: toCity.placeType === 'Village / Rural' ? '₹350' : '₹750',
      timings: '08:00 – 22:30',
      rating: '4.9',
    },
    {
      id: `food-street-${toCity.id}`,
      cityName: toCity.name,
      name: `${toCity.name} Bazaar & Evening Tiffin Hub`,
      category: 'Street Food Hub',
      neighborhood: toCity.popularHotelZones[1] || `${toCity.name} Main Road`,
      distanceFromHub: `0.9 km from ${toCity.busTerminal}`,
      dietaryOptions: 'Vegetarian · Jain · Vegan & Local Specialties',
      signatureDish: toCity.signatureDishes[1] || 'Fresh Local Tiffin & Spiced Tea',
      avgCostForTwo: toCity.placeType === 'Village / Rural' ? '₹200' : '₹400',
      timings: '07:30 – 22:30',
      rating: '4.8',
    },
    {
      id: `food-fine-${toCity.id}`,
      cityName: toCity.name,
      name: `The ${toCity.name} (${toCity.state}) Courtyard Kitchen`,
      category: 'Heritage Dining',
      neighborhood: toCity.popularHotelZones[2] || `${toCity.name} Highway Zone`,
      distanceFromHub: `2.5 km from ${toCity.trainStation}`,
      dietaryOptions: 'Vegetarian · Non-Vegetarian · Organic Millet Menu',
      signatureDish: toCity.signatureDishes[2] || `${toCity.regionalCuisineName} Platter`,
      avgCostForTwo: toCity.placeType === 'Village / Rural' ? '₹650' : '₹1,350',
      timings: '11:30 – 23:00',
      rating: '4.9',
    },
  ];
}
