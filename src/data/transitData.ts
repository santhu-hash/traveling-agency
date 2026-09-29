export type TransportMode = 'bus' | 'flight' | 'train' | 'cab';
export type TripType = 'one-way' | 'round-trip';
export type DietaryType = 'all' | 'Vegetarian' | 'Non-Vegetarian' | 'Jain' | 'Vegan' | 'Regional Box';

export interface CityHub {
  id: string;
  name: string;
  state: string;
  code: string;
  busTerminal: string;
  airportName: string;
  trainStation: string;
  popularHotelZones: string[];
}

export interface TransitOption {
  id: string;
  mode: TransportMode;
  operator: string;
  serviceCode: string;
  vehicleType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  baseFare: number;
  taxRate: number;
  rating: string;
  reviewsCount: number;
  seatsAvailable: number;
  berthConfig: 'sleeper-bus' | 'cabin-grid' | 'private-cab';
  amenities: string[];
  onTimePercentage: string;
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
  mode: TransportMode;
  tripType: TripType;
  fromCity: CityHub;
  toCity: CityHub;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    seatPreference: string;
  };
  selectedRoute: TransitOption;
  selectedSeats: SeatItem[];
  selectedMeals: { meal: MealOption; quantity: number }[];
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
  heroTransit: '/src/assets/images/hero_intercity_transit_1790689862313.jpg',
  mealThaliBox: '/src/assets/images/meal_regional_thali_box_1790689882969.jpg',
  localFoodHub: '/src/assets/images/local_food_hub_jaipur_1790689897685.jpg',
  cabTransfer: '/src/assets/images/cab_airport_transfer_1790689916876.jpg',
};

export const CITY_HUBS: CityHub[] = [
  {
    id: 'del',
    name: 'New Delhi',
    state: 'Delhi NCR',
    code: 'DEL',
    busTerminal: 'Kashmere Gate ISBT Terminal 1',
    airportName: 'Indira Gandhi Intl Airport (T3)',
    trainStation: 'New Delhi Railway Jn (NDLS)',
    popularHotelZones: ['Connaught Place', 'Aerocity', 'Chanakyapuri', 'Hauz Khas'],
  },
  {
    id: 'jai',
    name: 'Jaipur',
    state: 'Rajasthan',
    code: 'JAI',
    busTerminal: 'Sindhi Camp Intercity Bus Stand',
    airportName: 'Jaipur International Airport (T2)',
    trainStation: 'Jaipur Junction (JP)',
    popularHotelZones: ['MI Road Heritage Zone', 'Bani Park', 'Civil Lines', 'Amer Road'],
  },
  {
    id: 'bom',
    name: 'Mumbai',
    state: 'Maharashtra',
    code: 'BOM',
    busTerminal: 'Dadar East Neeta Volvo Hub',
    airportName: 'Chhatrapati Shivaji Maharaj Intl (T2)',
    trainStation: 'Mumbai Central (MMCT)',
    popularHotelZones: ['Colaba & Fort', 'Bandra Kurla Complex', 'Juhu Tara Road', 'Worli Sea Face'],
  },
  {
    id: 'blr',
    name: 'Bengaluru',
    state: 'Karnataka',
    code: 'BLR',
    busTerminal: 'Kempegowda Majestic Terminal 2',
    airportName: 'Kempegowda Intl Airport (T2)',
    trainStation: 'KSR Bengaluru City Jn (SBC)',
    popularHotelZones: ['MG Road & Indiranagar', 'Koramangala', 'Whitefield', 'Lavelle Road'],
  },
  {
    id: 'goi',
    name: 'Goa (Panjim)',
    state: 'Goa',
    code: 'GOI',
    busTerminal: 'Panjim KTC Intercity Bus Terminus',
    airportName: 'Manohar International Airport (GOX)',
    trainStation: 'Madgaon Junction (MAO)',
    popularHotelZones: ['Fontainhas Quarter', 'Candolim Beach Road', 'Assagao', 'Benaulim'],
  },
  {
    id: 'hyd',
    name: 'Hyderabad',
    state: 'Telangana',
    code: 'HYD',
    busTerminal: 'Mahatma Gandhi Bus Station (MGBS)',
    airportName: 'Rajiv Gandhi Intl Airport (HYD)',
    trainStation: 'Secunderabad Junction (SC)',
    popularHotelZones: ['Banjara Hills', 'HITEC City', 'Jubilee Hills', 'Begumpet'],
  },
];

export const TRANSIT_OPTIONS: TransitOption[] = [
  // BUSES
  {
    id: 'bus-volvo-9600',
    mode: 'bus',
    operator: 'Zingbus Maxx Royal',
    serviceCode: 'ZB-9602',
    vehicleType: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
    departureTime: '21:30',
    arrivalTime: '03:15',
    duration: '5h 45m',
    durationMinutes: 345,
    baseFare: 1180,
    taxRate: 0.05,
    rating: '4.9',
    reviewsCount: 1420,
    seatsAvailable: 14,
    berthConfig: 'sleeper-bus',
    amenities: ['Individual Berth Curtain', 'USB-C 65W Outlet', 'Fresh Linen Kit', 'Live GPS Tracking'],
    onTimePercentage: '98% On-Time',
  },
  {
    id: 'bus-bharatbenz',
    mode: 'bus',
    operator: 'IntrCity SmartBus Executive',
    serviceCode: 'IC-408',
    vehicleType: 'BharatBenz AC Sleeper + Executive Lounge',
    departureTime: '22:45',
    arrivalTime: '04:30',
    duration: '5h 45m',
    durationMinutes: 345,
    baseFare: 990,
    taxRate: 0.05,
    rating: '4.8',
    reviewsCount: 980,
    seatsAvailable: 19,
    berthConfig: 'sleeper-bus',
    amenities: ['Onboard Washroom', 'Boarding Lounge Access', 'Air Purifier Cabin', 'Hot Meal Delivery'],
    onTimePercentage: '96% On-Time',
  },
  {
    id: 'bus-scania-day',
    mode: 'bus',
    operator: 'RSRTC Gold Line Express',
    serviceCode: 'RJ-104',
    vehicleType: 'Scania Metrolink Semi-Sleeper & Berth',
    departureTime: '07:15',
    arrivalTime: '12:40',
    duration: '5h 25m',
    durationMinutes: 325,
    baseFare: 840,
    taxRate: 0.05,
    rating: '4.6',
    reviewsCount: 640,
    seatsAvailable: 22,
    berthConfig: 'sleeper-bus',
    amenities: ['Panoramic Tinted Glass', 'Reclining Calf Support', 'Express Toll Lane', 'Water Bottle'],
    onTimePercentage: '94% On-Time',
  },

  // FLIGHTS
  {
    id: 'flt-indigo-direct',
    mode: 'flight',
    operator: 'IndiGo Stretch',
    serviceCode: '6E-2184',
    vehicleType: 'Airbus A321neo · Non-Stop',
    departureTime: '08:20',
    arrivalTime: '09:25',
    duration: '1h 05m',
    durationMinutes: 65,
    baseFare: 3250,
    taxRate: 0.12,
    rating: '4.8',
    reviewsCount: 2310,
    seatsAvailable: 18,
    berthConfig: 'cabin-grid',
    amenities: ['15kg Check-in + 7kg Cabin', 'Fast-Forward Boarding', 'Pre-Booked Gourmet Box', 'USB Power'],
    onTimePercentage: '95% On-Time',
  },
  {
    id: 'flt-airindia-exec',
    mode: 'flight',
    operator: 'Air India Express Prime',
    serviceCode: 'AI-491',
    vehicleType: 'Boeing 737-8 MAX · Non-Stop',
    departureTime: '17:40',
    arrivalTime: '18:50',
    duration: '1h 10m',
    durationMinutes: 70,
    baseFare: 3690,
    taxRate: 0.12,
    rating: '4.7',
    reviewsCount: 1540,
    seatsAvailable: 11,
    berthConfig: 'cabin-grid',
    amenities: ['Complimentary Hot Meal', 'Extra Legroom Pitch', 'Priority Baggage Tag', 'Wi-Fi Entertainment'],
    onTimePercentage: '93% On-Time',
  },
  {
    id: 'flt-akasa-saver',
    mode: 'flight',
    operator: 'Akasa Air Café',
    serviceCode: 'QP-1412',
    vehicleType: 'Boeing 737 MAX 8-200 · Non-Stop',
    departureTime: '13:10',
    arrivalTime: '14:15',
    duration: '1h 05m',
    durationMinutes: 65,
    baseFare: 2890,
    taxRate: 0.12,
    rating: '4.7',
    reviewsCount: 890,
    seatsAvailable: 24,
    berthConfig: 'cabin-grid',
    amenities: ['SkyLights Cabin Mood', 'Universal AC Socket', 'Café Akasa Dining', 'Eco-Light Seats'],
    onTimePercentage: '96% On-Time',
  },

  // TRAINS
  {
    id: 'trn-vandebharat',
    mode: 'train',
    operator: 'Vande Bharat Express',
    serviceCode: '20978-VB',
    vehicleType: 'Executive AC Chair Car (EC) & CC',
    departureTime: '06:10',
    arrivalTime: '10:05',
    duration: '3h 55m',
    durationMinutes: 235,
    baseFare: 1420,
    taxRate: 0.05,
    rating: '4.9',
    reviewsCount: 3120,
    seatsAvailable: 16,
    berthConfig: 'cabin-grid',
    amenities: ['180° Rotating Aircraft Seats', 'Onboard Fresh Kitchen', 'Automatic Sliding Doors', 'High-Speed Wi-Fi'],
    onTimePercentage: '99% On-Time',
  },
  {
    id: 'trn-rajdhani-first',
    mode: 'train',
    operator: 'Swarna Jayanti Rajdhani',
    serviceCode: '12958-RJ',
    vehicleType: 'First AC Coupe (1A) & 2-Tier AC',
    departureTime: '19:55',
    arrivalTime: '00:15',
    duration: '4h 20m',
    durationMinutes: 260,
    baseFare: 1850,
    taxRate: 0.05,
    rating: '4.8',
    reviewsCount: 1890,
    seatsAvailable: 9,
    berthConfig: 'cabin-grid',
    amenities: ['Private Lockable Cabin', 'Three-Course Dinner', 'Sterilized Blanket & Pillow', 'Attendant Bell'],
    onTimePercentage: '97% On-Time',
  },

  // INTERCITY CABS
  {
    id: 'cab-byd-exec',
    mode: 'cab',
    operator: 'BluSmart Intercity Elite',
    serviceCode: 'BS-EV90',
    vehicleType: 'BYD e6 Electric Executive SUV (Door-to-Door)',
    departureTime: 'Flexible (09:00)',
    arrivalTime: '13:30',
    duration: '4h 30m',
    durationMinutes: 270,
    baseFare: 3480,
    taxRate: 0.05,
    rating: '4.9',
    reviewsCount: 740,
    seatsAvailable: 4,
    berthConfig: 'cabin-grid',
    amenities: ['Zero Surge Guarantee', 'FASTag Highway Tolls Included', '480L Boot Capacity', 'Verified Chauffeur'],
    onTimePercentage: '100% Confirmed Pickup',
  },
  {
    id: 'cab-innova-hycross',
    mode: 'cab',
    operator: 'Savaari Signature Lounge',
    serviceCode: 'SV-HY7',
    vehicleType: 'Toyota Innova Hycross Hybrid (6+1 Captain Seats)',
    departureTime: 'Flexible (10:30)',
    arrivalTime: '15:00',
    duration: '4h 30m',
    durationMinutes: 270,
    baseFare: 4250,
    taxRate: 0.05,
    rating: '4.8',
    reviewsCount: 520,
    seatsAvailable: 6,
    berthConfig: 'cabin-grid',
    amenities: ['Ottoman Recliner Captain Seats', 'Custom Highway Food Stop', 'Dual-Zone Climate', 'All Tolls & State Tax'],
    onTimePercentage: '99% Confirmed Pickup',
  },
];

export function generateSeatsForOption(option: TransitOption): SeatItem[] {
  if (option.berthConfig === 'sleeper-bus') {
    const seats: SeatItem[] = [];
    const bookedIndices = new Set([2, 5, 8, 11, 14]);
    const ladiesIndices = new Set([3, 9]);

    for (const deck of ['lower', 'upper'] as const) {
      for (let row = 1; row <= 5; row++) {
        // Col 1: Single Window Berth (Left side)
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

        // Col 2: Double Aisle Berth (Right side inner)
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

        // Col 3: Double Window Berth (Right side outer)
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

  // Cabin grid for Flights, Trains, and Cabs
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

export const MEAL_OPTIONS: MealOption[] = [
  {
    id: 'meal-raj-thali',
    name: 'Royal Marwar Saffron Thali Box',
    dietary: 'Regional Box',
    regionTag: 'Rajasthan Heritage Specialty',
    description: 'Slow-cooked smoked paneer, saffron jeera pulao, panchmel dal, and warm bajra phulka packed in a thermal bento.',
    itemsIncluded: 'Paneer Lababdar · Saffron Pulao · Dal · 2 Phulkas · Gulab Jamun',
    calories: '640 kcal',
    price: 320,
    image: GENERATED_IMAGES.mealThaliBox,
  },
  {
    id: 'meal-jain-sattvic',
    name: 'Pure Jain Sattvic Travel Tiffin',
    dietary: 'Jain',
    regionTag: 'Zero Root Vegetable Certified',
    description: 'Prepared in a dedicated Jain kitchen without onion, garlic, or root vegetables. Sealed with tamper-evident hygiene tape.',
    itemsIncluded: 'Jain Shahi Paneer · Jeera Rice · Moong Dal Tadka · 3 Rotis · Dry Fruit Barfi',
    calories: '560 kcal',
    price: 290,
  },
  {
    id: 'meal-veg-south',
    name: 'Dakshin Filter Coffee & Mini Tiffin',
    dietary: 'Vegetarian',
    regionTag: 'South Indian Classic',
    description: 'Steamed mini idlis tossed in Madurai podi, crispy medu vada, vegetable upma, and brass-decoction filter coffee flask.',
    itemsIncluded: '6 Podi Idlis · 2 Vadas · Coconut & Tomato Chutney · Sambar · 150ml Hot Coffee',
    calories: '510 kcal',
    price: 240,
  },
  {
    id: 'meal-vegan-millet',
    name: 'Himalayan Millet & Roasted Chickpea Bowl',
    dietary: 'Vegan',
    regionTag: '100% Plant-Based & Dairy-Free',
    description: 'High-protein foxtail millet pilaf paired with charred broccoli, tahini-turmeric dressing, and toasted pumpkin seeds.',
    itemsIncluded: 'Foxtail Millet Pilaf · Spiced Chickpeas · Tahini Dressing · Dark Cacao Bite',
    calories: '470 kcal',
    price: 310,
  },
  {
    id: 'meal-nonveg-awadhi',
    name: 'Lucknowi Dum Chicken Biryani Box',
    dietary: 'Non-Vegetarian',
    regionTag: 'Awadhi Slow-Cooked',
    description: 'Long-grain aged basmati layered with saffron, whole spices, tender marinated chicken, mirchi ka salan, and burani raita.',
    itemsIncluded: '350g Dum Biryani · 2Pc Chicken · Mirchi Salan · Mint Raita · Shahi Tukda',
    calories: '720 kcal',
    price: 360,
  },
];

export const LOCAL_COMMUTE_OPTIONS: LocalCommuteOption[] = [
  {
    id: 'commute-ev-sedan',
    category: 'cab-transfer',
    title: 'Pre-Booked Airport / Station Hotel Drop',
    vehicleModel: 'Executive Electric Sedan (BYD e6 / Tigor EV)',
    capacity: 'Up to 4 Passengers · 3 Large Bags',
    pickupPoint: 'Zero-Wait Arrival Gate Bay #2 (Chauffeur Placard)',
    inclusionText: 'Includes 45 min waiting buffer, parking fee & direct hotel drop',
    billingUnit: 'per transfer',
    price: 540,
    image: GENERATED_IMAGES.cabTransfer,
  },
  {
    id: 'commute-suv-transfer',
    category: 'cab-transfer',
    title: 'Family SUV Terminal-to-Hotel Transfer',
    vehicleModel: 'Toyota Innova Crysta 6-Seater',
    capacity: 'Up to 6 Passengers · 5 Large Bags',
    pickupPoint: 'VIP Arrival Forecourt Lane 1',
    inclusionText: 'Tracked against your PNR for automatic delay adjustment',
    billingUnit: 'per transfer',
    price: 820,
  },
  {
    id: 'commute-bike-ather',
    category: 'self-drive-bike',
    title: '24-Hour Self-Drive Smart Scooter Rental',
    vehicleModel: 'Ather 450X Gen-3 Electric / Royal Enfield Classic',
    capacity: '2 Riders · 2 ISI Helmets Included',
    pickupPoint: 'Station Exit Dock #4 Self-Serve Kiosk',
    inclusionText: '120 km/day range included · Fast-charging pass · Zero deposit with PNR',
    billingUnit: 'per 24 hrs',
    price: 450,
  },
  {
    id: 'commute-car-nexon',
    category: 'self-drive-car',
    title: 'Daily Self-Drive City Hatchback Rental',
    vehicleModel: 'Tata Nexon EV Prime / Maruti Baleno Automatic',
    capacity: '5 Seats · Automatic Transmission',
    pickupPoint: 'Terminal Multi-Level Parking Level P1',
    inclusionText: '200 km/day limit · Comprehensive insurance & roadside cover',
    billingUnit: 'per 24 hrs',
    price: 1650,
  },
];

export const PUBLIC_TRANSIT_GUIDES: Record<string, PublicTransitGuide> = {
  Jaipur: {
    cityName: 'Jaipur',
    metroNetwork: {
      lines: 'Pink Line (Mansarovar to Badi Chaupar)',
      stationConnect: 'Direct escalator access outside Sindhi Camp Bus Stand & Jaipur Railway Junction',
      fareRange: '₹10 – ₹30 (NCMC Tap Card & QR Ticket supported)',
      operatingHours: '06:20 to 21:49 Daily',
    },
    cityBusService: {
      operator: 'JCTSL Low-Floor AC & Electric City Buses',
      keyCorridors: 'Route 3A (Airport – Ajmeri Gate – Amer Fort) · Route 9A (Railway Jn – Hawa Mahal)',
      acPassFare: '₹15 – ₹45 per trip · ₹120 Unlimited Day Pass',
    },
    rickshawAndPrepaid: {
      baseFare: '₹30 for first 2 km (E-Rickshaw ₹15 shared per sector)',
      perKmRate: '₹14/km thereafter · Official Prepaid Booth at Platform 1 & Sindhi Camp Gate 2',
      stationCounterTip: 'Always book from the RTA Prepaid Booth before exiting the terminal gate to avoid surge haggling.',
    },
  },
  'New Delhi': {
    cityName: 'New Delhi',
    metroNetwork: {
      lines: 'Orange Airport Express Line · Yellow Line ·Kashmere Gate Interchange (Red/Yellow/Violet)',
      stationConnect: '18 mins from IGI Airport T3 to New Delhi Railway Station via Airport Express',
      fareRange: '₹10 – ₹60 (WhatsApp QR Ticket on +91-9650855800)',
      operatingHours: '04:45 to 23:30 Daily',
    },
    cityBusService: {
      operator: 'DTC Electric Low-Floor AC Fleet (Blue & Green Buses)',
      keyCorridors: 'Airport Express Bus EXP-4 · Connaught Place Outer Circle Ring',
      acPassFare: '₹10 – ₹25 per trip · ₹50 Daily AC Bus Pass',
    },
    rickshawAndPrepaid: {
      baseFare: '₹30 for first 1.5 km',
      perKmRate: '₹11/km by calibrated GPS meter · Delhi Traffic Police Prepaid Booth at NDLS Ajmeri Gate',
      stationCounterTip: 'Use the DMRC Momentum 2.0 app or WhatsApp QR at metro gates to skip token queues.',
    },
  },
  Mumbai: {
    cityName: 'Mumbai',
    metroNetwork: {
      lines: 'Aqua Line 3 (Aarey – BKC – Airport T2) · Red Line 7 · Yellow Line 2A',
      stationConnect: 'Underground direct walkthrough from T2 Arrivals to CSJM International Airport Metro Station',
      fareRange: '₹10 – ₹50 (Mumbai 1 National Common Mobility Card)',
      operatingHours: '05:55 to 22:45 Daily',
    },
    cityBusService: {
      operator: 'BEST Chalo AC Double-Decker & Electric Express',
      keyCorridors: 'A-115 (Churchgate – Nariman Point) · Chalo Airport Express to Thane/Bandra',
      acPassFare: '₹6 minimum AC fare · ₹60 Daily Unlimited Pass on Chalo App',
    },
    rickshawAndPrepaid: {
      baseFare: '₹23 Auto (Suburbs) / ₹28 Kaali-Peeli Taxi (South Mumbai)',
      perKmRate: '₹15.33/km strictly by digital e-meter',
      stationCounterTip: 'In Mumbai suburbs (Bandra and north), three-wheeler autos run strictly by meter without haggling.',
    },
  },
};

export const LOCAL_FOOD_SPOTS: LocalFoodSpot[] = [
  {
    id: 'food-lmb-jaipur',
    cityName: 'Jaipur',
    name: 'Laxmi Mishthan Bhandar (LMB Heritage Hall)',
    category: 'Regional Thali',
    neighborhood: 'Johari Bazaar, Pink City',
    distanceFromHub: '3.4 km from Sindhi Camp Bus Terminal',
    dietaryOptions: '100% Pure Vegetarian · Dedicated Jain Menu',
    signatureDish: 'Dal Baati Churma, Ker Sangri & Paneer Ghewar',
    avgCostForTwo: '₹850',
    timings: '08:00 – 23:00',
    rating: '4.8',
  },
  {
    id: 'food-masala-chowk',
    cityName: 'Jaipur',
    name: 'Masala Chowk Open-Air Culinary Courtyard',
    category: 'Street Food Hub',
    neighborhood: 'Ram Niwas Garden, Adarsh Nagar',
    distanceFromHub: '2.8 km from Sindhi Camp · 9 km from Airport',
    dietaryOptions: 'Vegetarian · Jain · Vegan Chaat Options',
    signatureDish: 'Samrat Pyaaz Kachori, Kulhad Masala Chai & Kulfi Falooda',
    avgCostForTwo: '₹400',
    timings: '08:30 – 22:30',
    rating: '4.7',
  },
  {
    id: 'food-baradari',
    cityName: 'Jaipur',
    name: 'The Johri & Baradari Courtyard Kitchen',
    category: 'Heritage Dining',
    neighborhood: 'City Palace Precinct',
    distanceFromHub: '3.9 km from Jaipur Junction',
    dietaryOptions: 'Vegetarian · Non-Vegetarian · Gluten-Free Millet',
    signatureDish: 'Smoked Laal Maas, Bajra Khichda & Rose Pistachio Kulfi',
    avgCostForTwo: '₹1,600',
    timings: '12:00 – 23:30',
    rating: '4.9',
  },
  {
    id: 'food-carnatic-del',
    cityName: 'New Delhi',
    name: 'Carnatic Cafe & Triveni Terrace Kitchen',
    category: 'Regional Thali',
    neighborhood: 'Mandi House / Connaught Place',
    distanceFromHub: '2.6 km from New Delhi Railway Station',
    dietaryOptions: '100% Vegetarian · Jain Options Available',
    signatureDish: 'Malleswaram 18th Cross Dosa & Palak Patta Chaat',
    avgCostForTwo: '₹700',
    timings: '09:00 – 22:30',
    rating: '4.9',
  },
  {
    id: 'food-soam-mumbai',
    cityName: 'Mumbai',
    name: 'Soam Babulnath & Swati Snacks',
    category: 'Regional Thali',
    neighborhood: 'Babulnath / Tardeo',
    distanceFromHub: '1.4 km from Mumbai Central Station',
    dietaryOptions: '100% Vegetarian · Pure Jain · Vegan Sattvic',
    signatureDish: 'Panki Chatni, Jowar Pita Pockets & Malai Malpua',
    avgCostForTwo: '₹950',
    timings: '11:30 – 22:45',
    rating: '4.8',
  },
];
