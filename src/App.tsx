import React, { useState, useMemo, useEffect } from 'react';
import {
  Bus,
  Plane,
  Train,
  Car,
  ArrowLeftRight,
  Users,
  Plus,
  Minus,
  Navigation,
  Utensils,
  ShieldCheck,
  QrCode,
  SlidersHorizontal,
  Bookmark,
  ChevronRight,
  MapPin,
  Globe,
} from 'lucide-react';
import {
  TransportMode,
  TripType,
  DietaryType,
  TravelPurpose,
  BudgetTier,
  ConcessionType,
  PlaceScale,
  CurrencyCode,
  CURRENCY_CONFIG,
  formatCurrency,
  CityHub,
  TransitOption,
  SeatItem,
  MealOption,
  LocalCommuteOption,
  LocalFoodSpot,
  ConfirmedBooking,
  CITY_HUBS,
  GENERATED_IMAGES,
  resolveCityHub,
  getDynamicTransitOptions,
  generateSeatsForOption,
  getDynamicMealsForRoute,
  getDynamicLocalCommute,
  getDynamicPublicTransitGuide,
  getDynamicLocalFoodSpots,
} from './data/transitData';
import { SeatMapSelector } from './components/SeatMapSelector';
import { TicketModal } from './components/TicketModal';
import { ChatAssistant } from './components/ChatAssistant';

export default function App() {
  // Step 1: 100% User-Defined Place & Search Engine State (Villages, Towns, Cities, States, Countries)
  const [transportMode, setTransportMode] = useState<TransportMode>('bus');
  const [tripType, setTripType] = useState<TripType>('one-way');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  const [fromQuery, setFromQuery] = useState('Araku Valley Village, AP');
  const [toQuery, setToQuery] = useState('Hyderabad, Telangana');
  const [fromScale, setFromScale] = useState<PlaceScale>('Auto-Detect');
  const [toScale, setToScale] = useState<PlaceScale>('Auto-Detect');

  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // Live resolution of whatever the user types (Village, Town, City, State, or Country)
  const fromCity: CityHub = useMemo(
    () => resolveCityHub(fromQuery, fromScale),
    [fromQuery, fromScale]
  );
  const toCity: CityHub = useMemo(
    () => resolveCityHub(toQuery, toScale),
    [toQuery, toScale]
  );

  // User-customizable Boarding & Dropping Landmarks + Optional Distance Override
  const [customBoardingPoint, setCustomBoardingPoint] = useState('');
  const [customDroppingPoint, setCustomDroppingPoint] = useState('');
  const [customDistanceInput, setCustomDistanceInput] = useState<string>('');

  // Sync default boarding/dropping points whenever fromCity / toCity / transportMode changes
  useEffect(() => {
    const defaultBoard =
      transportMode === 'flight'
        ? fromCity.airportName
        : transportMode === 'train'
        ? fromCity.trainStation
        : fromCity.busTerminal;
    setCustomBoardingPoint(defaultBoard);
  }, [fromCity, transportMode]);

  useEffect(() => {
    const defaultDrop =
      transportMode === 'flight'
        ? toCity.airportName
        : transportMode === 'train'
        ? toCity.trainStation
        : toCity.busTerminal;
    setCustomDroppingPoint(defaultDrop);
  }, [toCity, transportMode]);

  const [departureDate, setDepartureDate] = useState('2026-10-04');
  const [returnDate, setReturnDate] = useState('2026-10-07');

  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [seatPreference, setSeatPreference] = useState('Lower Berth / Window');
  const [concession, setConcession] = useState<ConcessionType>('None');
  const [travelPurpose, setTravelPurpose] = useState<TravelPurpose>('Leisure & Family');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('All Tiers');
  const [showPassengerMenu, setShowPassengerMenu] = useState(false);

  // Sorting & Dynamic Route Generation based on User Input
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'duration-asc' | 'departure-asc'>('recommended');

  const parsedCustomDistance = useMemo(() => {
    const num = Number(customDistanceInput);
    return !Number.isNaN(num) && num > 5 ? Math.round(num) : null;
  }, [customDistanceInput]);

  const dynamicRoutesForCityPair = useMemo(
    () =>
      getDynamicTransitOptions(
        fromCity,
        toCity,
        transportMode,
        parsedCustomDistance
      ),
    [fromCity, toCity, transportMode, parsedCustomDistance]
  );

  const availableRoutes = useMemo(() => {
    const filteredByTier =
      budgetTier === 'All Tiers'
        ? dynamicRoutesForCityPair
        : dynamicRoutesForCityPair.filter((r) => r.tier === budgetTier);

    const baseList = filteredByTier.length > 0 ? filteredByTier : dynamicRoutesForCityPair;

    return [...baseList].sort((a, b) => {
      if (sortBy === 'price-asc') return a.baseFare - b.baseFare;
      if (sortBy === 'duration-asc') return a.durationMinutes - b.durationMinutes;
      if (sortBy === 'departure-asc') return a.departureTime.localeCompare(b.departureTime);
      const aMatch = a.recommendedFor.includes(travelPurpose) ? 1 : 0;
      const bMatch = b.recommendedFor.includes(travelPurpose) ? 1 : 0;
      if (bMatch !== aMatch) return bMatch - aMatch;
      return Number(b.rating) - Number(a.rating);
    });
  }, [dynamicRoutesForCityPair, budgetTier, sortBy, travelPurpose]);

  const [selectedRoute, setSelectedRoute] = useState<TransitOption>(availableRoutes[0]);

  useEffect(() => {
    if (availableRoutes.length > 0) {
      setSelectedRoute(availableRoutes[0]);
    }
  }, [availableRoutes]);

  // Step 2: Seat Layout Map State
  const totalPassengers = Math.max(1, adults + childrenCount);
  const currentDeckSeats = useMemo(() => generateSeatsForOption(selectedRoute), [selectedRoute]);
  const [selectedSeats, setSelectedSeats] = useState<SeatItem[]>([]);

  useEffect(() => {
    const available = currentDeckSeats.filter((s) => s.status !== 'booked');
    const preferred = [...available].sort((a, b) => {
      const scoreSeat = (seat: SeatItem) => {
        if (seatPreference === 'Lower Berth / Window') {
          return (seat.deck === 'lower' ? 2 : 0) + (seat.position.includes('Window') ? 2 : 0);
        }
        if (seatPreference === 'Upper Sleeper Berth') {
          return seat.deck === 'upper' ? 3 : 0;
        }
        if (seatPreference === 'Aisle Easy-Access') {
          return seat.position === 'Aisle' ? 3 : 0;
        }
        if (seatPreference === 'Executive / Extra Legroom') {
          return seat.row === 1 ? 3 : 0;
        }
        return 0;
      };
      return scoreSeat(b) - scoreSeat(a);
    });
    setSelectedSeats(preferred.slice(0, totalPassengers));
  }, [currentDeckSeats, totalPassengers, seatPreference]);

  const handleToggleSeat = (seat: SeatItem) => {
    if (seat.status === 'booked') return;
    const exists = selectedSeats.some((s) => s.id === seat.id);
    if (exists) {
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= totalPassengers) {
        setSelectedSeats((prev) => [...prev.slice(1), seat]);
      } else {
        setSelectedSeats((prev) => [...prev, seat]);
      }
    }
  };

  // Step 3: Dynamic Meals & Personalization for User's Route + Custom Meal Note
  const routeMeals = useMemo(
    () => getDynamicMealsForRoute(fromCity, toCity),
    [fromCity, toCity]
  );
  const [dietaryFilter, setDietaryFilter] = useState<DietaryType>('all');
  const [mealQuantities, setMealQuantities] = useState<Record<string, number>>({});
  const [customMealNote, setCustomMealNote] = useState('');

  useEffect(() => {
    if (routeMeals.length > 0) {
      setMealQuantities({ [routeMeals[0].id]: 1 });
    }
  }, [routeMeals]);

  const filteredMeals = useMemo(() => {
    if (dietaryFilter === 'all') return routeMeals;
    return routeMeals.filter((m) => m.dietary === dietaryFilter);
  }, [routeMeals, dietaryFilter]);

  const handleMealQtyChange = (mealId: string, delta: number) => {
    setMealQuantities((prev) => {
      const current = prev[mealId] || 0;
      const next = Math.max(0, Math.min(10, current + delta));
      const updated = { ...prev, [mealId]: next };
      if (next === 0) delete updated[mealId];
      return updated;
    });
  };

  // Step 4: Dynamic On-Ground Local Transport & Public Transit Guide for User's Destination
  const [commuteTab, setCommuteTab] = useState<'all' | 'cab-transfer' | 'self-drive' | 'public-transit'>('all');
  const dynamicCommuteOptions = useMemo(
    () => getDynamicLocalCommute(toCity, transportMode),
    [toCity, transportMode]
  );
  const [selectedLocalCommute, setSelectedLocalCommute] = useState<LocalCommuteOption | null>(
    dynamicCommuteOptions[0]
  );

  useEffect(() => {
    setSelectedLocalCommute(dynamicCommuteOptions[0] || null);
  }, [dynamicCommuteOptions]);

  const destinationTransitGuide = useMemo(
    () => getDynamicPublicTransitGuide(toCity),
    [toCity]
  );

  // Step 5: Dynamic Destination Food Spots + User Custom Spot Adder
  const baseDestinationFoodSpots = useMemo(
    () => getDynamicLocalFoodSpots(toCity),
    [toCity]
  );
  const [customFoodSpots, setCustomFoodSpots] = useState<LocalFoodSpot[]>([]);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotDish, setNewSpotDish] = useState('');

  const destinationFoodSpots = useMemo(
    () => [...customFoodSpots, ...baseDestinationFoodSpots],
    [customFoodSpots, baseDestinationFoodSpots]
  );

  const [savedFoodSpots, setSavedFoodSpots] = useState<LocalFoodSpot[]>([]);

  useEffect(() => {
    if (baseDestinationFoodSpots.length > 0) {
      setSavedFoodSpots([baseDestinationFoodSpots[0]]);
    }
  }, [baseDestinationFoodSpots]);

  const handleToggleFoodSpot = (spot: LocalFoodSpot) => {
    setSavedFoodSpots((prev) =>
      prev.some((s) => s.id === spot.id)
        ? prev.filter((s) => s.id !== spot.id)
        : [...prev, spot]
    );
  };

  const handleAddCustomFoodSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotName.trim()) return;
    const spot: LocalFoodSpot = {
      id: `user-spot-${Date.now()}`,
      cityName: toCity.name,
      name: newSpotName.trim(),
      category: 'Regional Thali',
      neighborhood: `${toCity.name} User Pick`,
      distanceFromHub: `Near ${customDroppingPoint}`,
      dietaryOptions: 'User Custom Dietary Preference',
      signatureDish: newSpotDish.trim() || `${toCity.name} Local Special`,
      avgCostForTwo: formatCurrency(500, currency),
      timings: '08:00 – 22:30',
      rating: '5.0',
    };
    setCustomFoodSpots((prev) => [spot, ...prev]);
    setSavedFoodSpots((prev) => [spot, ...prev]);
    setNewSpotName('');
    setNewSpotDish('');
  };

  // Checkout & Passenger Contact State
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [fullName, setFullName] = useState('Santhosh Kumar');
  const [phone, setPhone] = useState('+91 98490 72140');
  const [email, setEmail] = useState('santhosh.travel@example.com');
  const [dropHotelAddress, setDropHotelAddress] = useState('');

  useEffect(() => {
    setDropHotelAddress(`${toCity.popularHotelZones[0]}, ${toCity.name}`);
  }, [toCity]);

  const [paymentMethod, setPaymentMethod] = useState<
    'UPI Instant (PhonePe / GPay)' | 'Credit / Debit Card' | 'NetBanking'
  >('UPI Instant (PhonePe / GPay)');
  const [formError, setFormError] = useState<string | null>(null);

  // Confirmed Bookings & E-Ticket Modal State
  const [activeTicket, setActiveTicket] = useState<ConfirmedBooking | null>(null);
  const [savedBookings, setSavedBookings] = useState<ConfirmedBooking[]>([]);

  // User-Specific Price Transparency Calculations
  const pricing = useMemo(() => {
    const activeSeatCount = Math.max(1, selectedSeats.length);
    const baseFareTotal = selectedRoute.baseFare * activeSeatCount;

    const effectiveChildren = Math.min(childrenCount, activeSeatCount);
    const childDiscountTotal = Math.round(
      effectiveChildren * selectedRoute.baseFare * 0.35
    );

    const netAfterChild = baseFareTotal - childDiscountTotal;

    const concessionRate =
      concession === 'Student (15% Off)'
        ? 0.15
        : concession === 'Senior Citizen (20% Off)'
        ? 0.2
        : concession === 'Armed Forces (25% Off)'
        ? 0.25
        : 0;
    const concessionDiscountTotal = Math.round(netAfterChild * concessionRate);

    const discountedBase = Math.max(0, netAfterChild - concessionDiscountTotal);
    const returnFareTotal =
      tripType === 'round-trip' ? Math.round(discountedBase * 0.9) : 0;
    const seatSurchargeTotal = selectedSeats.reduce((acc, s) => acc + s.surcharge, 0);
    const transportSubtotal = discountedBase + returnFareTotal + seatSurchargeTotal;
    const taxes = Math.round(transportSubtotal * selectedRoute.taxRate);
    const convenienceFee = transportMode === 'flight' ? 249 : 79;

    const mealsTotal = Object.entries(mealQuantities).reduce((acc, [id, qty]) => {
      const item = routeMeals.find((m) => m.id === id);
      return acc + (item ? item.price * qty : 0);
    }, 0);

    const localCommuteTotal = selectedLocalCommute ? selectedLocalCommute.price : 0;
    const insuranceTotal = includeInsurance ? 69 * activeSeatCount : 0;

    const grandTotal =
      transportSubtotal +
      taxes +
      convenienceFee +
      mealsTotal +
      localCommuteTotal +
      insuranceTotal;

    return {
      baseFareTotal,
      childDiscountTotal,
      concessionDiscountTotal,
      returnFareTotal,
      seatSurchargeTotal,
      taxes,
      convenienceFee,
      mealsTotal,
      localCommuteTotal,
      insuranceTotal,
      grandTotal,
    };
  }, [
    selectedSeats,
    selectedRoute,
    childrenCount,
    concession,
    tripType,
    transportMode,
    mealQuantities,
    routeMeals,
    selectedLocalCommute,
    includeInsurance,
  ]);

  const handleSwapCities = () => {
    const tempQ = fromQuery;
    const tempScale = fromScale;
    setFromQuery(toQuery);
    setToQuery(tempQ);
    setFromScale(toScale);
    setToScale(tempScale);
  };

  const fromSuggestions = useMemo(() => {
    const q = fromQuery.trim().toLowerCase();
    if (!q) return CITY_HUBS;
    return CITY_HUBS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.placeType.toLowerCase().includes(q)
    );
  }, [fromQuery]);

  const toSuggestions = useMemo(() => {
    const q = toQuery.trim().toLowerCase();
    if (!q) return CITY_HUBS;
    return CITY_HUBS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.placeType.toLowerCase().includes(q)
    );
  }, [toQuery]);

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setFormError('Please enter the primary passenger full name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      setFormError('Please provide a valid WhatsApp / SMS mobile number.');
      return;
    }
    if (selectedSeats.length === 0) {
      setFormError('Please select at least one seat or sleeper berth on the deck map.');
      return;
    }
    setFormError(null);

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const pnr = `VP-${toCity.code}${randomDigits}`;
    const selectedMealsList = Object.entries(mealQuantities)
      .map(([id, quantity]) => {
        const meal = routeMeals.find((m) => m.id === id);
        return meal && quantity > 0 ? { meal, quantity } : null;
      })
      .filter((x): x is { meal: MealOption; quantity: number } => Boolean(x));

    const newBooking: ConfirmedBooking = {
      pnr,
      bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Local Time',
      currency,
      mode: transportMode,
      tripType,
      fromCity,
      toCity,
      customBoardingPoint: customBoardingPoint.trim() || fromCity.busTerminal,
      customDroppingPoint: customDroppingPoint.trim() || toCity.busTerminal,
      departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : undefined,
      passengers: {
        adults,
        children: childrenCount,
        seatPreference,
        concession,
      },
      selectedRoute,
      selectedSeats,
      selectedMeals: selectedMealsList,
      customMealNote: customMealNote.trim() || undefined,
      selectedLocalCommute,
      includeInsurance,
      savedFoodSpots,
      passengerContact: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        dropHotelAddress: dropHotelAddress.trim(),
        paymentMethod,
      },
      pricing,
    };

    setSavedBookings((prev) => [newBooking, ...prev]);
    setActiveTicket(newBooking);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* TOP BAR CONTRACT: Strictly 1 row, 3 zones */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <a
            href="#top"
            className="text-xl font-bold font-display tracking-tight text-slate-900 whitespace-nowrap"
          >
            Vayupath
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => scrollToSection('step-search')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Search Routes
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('step-seats')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Seat Deck
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('step-meals')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Meal Boxes
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('step-commute')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Local Commute
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('step-food-guide')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Dining Guide
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (savedBookings.length > 0) {
                  setActiveTicket(savedBookings[0]);
                } else {
                  scrollToSection('step-checkout');
                }
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
            >
              {savedBookings.length > 0
                ? `View E-Ticket (${savedBookings[0].pnr})`
                : 'Instant E-Ticket Checkout'}
            </button>
          </div>
        </div>
      </header>

      {/* HERO & STEP 1: UNIVERSAL USER-DEFINED PLACE SEARCH ENGINE (VILLAGE, TOWN, CITY, STATE, COUNTRY) */}
      <section id="step-search" className="relative border-b border-slate-200 bg-slate-900">
        <div className="relative min-h-[460px] flex flex-col justify-end">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 overflow-hidden">
            <img
              src={GENERATED_IMAGES.heroTransit}
              alt="Modern transit terminal and luxury sleeper coach at golden hour"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-55"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/30" />
          </div>

          <div className="relative z-10 max-w-7xl w-full mx-auto px-6 pt-10 pb-10 space-y-7">
            <div className="max-w-3xl space-y-2.5">
              <p className="text-xs font-medium text-blue-300 tracking-wide">
                Universal Door-to-Door Transit · Any Village, Town, City, State, or Country Defined by You
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight leading-[1.12]">
                Travel from any village, city, state, or country to anywhere — tailored to your exact input.
              </h1>
            </div>

            {/* Search Engine Surface */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-5 md:p-6 text-slate-900 space-y-5">
              {/* Top Row: Transport Mode Tabs + Trip Type + Currency */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTransportMode('bus')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      transportMode === 'bus'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Bus className="w-3.5 h-3.5" />
                    Buses (Village / Intercity / Volvo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransportMode('flight')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      transportMode === 'flight'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5" />
                    Flights (Domestic & Global)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransportMode('train')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      transportMode === 'train'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Train className="w-3.5 h-3.5" />
                    Trains & Rail
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransportMode('cab')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      transportMode === 'cab'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    Doorstep Cabs
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Trip Type Segmented Control */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setTripType('one-way')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        tripType === 'one-way'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      One-Way
                    </button>
                    <button
                      type="button"
                      onClick={() => setTripType('round-trip')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        tripType === 'round-trip'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Round-Trip (10% Off)
                    </button>
                  </div>

                  {/* Currency Selector for Domestic & International Users */}
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      aria-label="Currency Selector"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="px-2.5 py-1.5 text-xs font-mono font-medium bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                    >
                      {(Object.keys(CURRENCY_CONFIG) as CurrencyCode[]).map((c) => (
                        <option key={c} value={c}>
                          {CURRENCY_CONFIG[c].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Primary Search Inputs Grid: Live User-Defined Origin & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                {/* FROM: Type Any Village, Town, City, State, or Country */}
                <div className="md:col-span-3 relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-600">
                      From (Village / City / Country)
                    </label>
                    <select
                      aria-label="Origin Place Type"
                      value={fromScale}
                      onChange={(e) => setFromScale(e.target.value as PlaceScale)}
                      className="text-[11px] text-blue-700 font-medium bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="Auto-Detect">Auto Type ({fromCity.placeType.split(' ')[0]})</option>
                      <option value="Village / Rural">Village / Rural</option>
                      <option value="Town / District">Town / District</option>
                      <option value="City / State">City / State</option>
                      <option value="Country / International">Country / Global</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={fromQuery}
                    onFocus={() => setShowFromSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowFromSuggestions(false), 180)}
                    onChange={(e) => {
                      setFromQuery(e.target.value);
                    }}
                    placeholder="Type any village, city, state or country..."
                    className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                  />
                  <span className="block text-[11px] text-slate-500 mt-1 truncate">
                    {fromCity.placeType} · {fromCity.state}, {fromCity.country}
                  </span>

                  {showFromSuggestions && (
                    <div className="absolute left-0 right-0 top-[68px] z-30 bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100 max-h-64 overflow-y-auto">
                      <button
                        type="button"
                        onMouseDown={() => setShowFromSuggestions(false)}
                        className="w-full text-left px-3.5 py-2.5 bg-blue-50/70 hover:bg-blue-100/70 transition-colors flex items-center justify-between"
                      >
                        <span className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          Active User Origin: "{fromCity.name}" ({fromCity.placeType})
                        </span>
                        <span className="font-mono text-[10px] text-blue-700">Live ✓</span>
                      </button>
                      {fromSuggestions.map((hub) => (
                        <button
                          key={hub.id}
                          type="button"
                          onMouseDown={() => {
                            setFromQuery(`${hub.name}, ${hub.country === 'India' ? hub.state : hub.country}`);
                            setShowFromSuggestions(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-900">
                              {hub.name} · <span className="font-normal text-slate-500">{hub.placeType}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {hub.state}, {hub.country}
                            </div>
                          </div>
                          <span className="font-mono text-xs text-slate-500">{hub.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* TO: Type Any Destination Village, Town, City, State, or Country */}
                <div className="md:col-span-3 relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-600">
                      To (Village / City / Country)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        aria-label="Destination Place Type"
                        value={toScale}
                        onChange={(e) => setToScale(e.target.value as PlaceScale)}
                        className="text-[11px] text-blue-700 font-medium bg-transparent focus:outline-none cursor-pointer"
                      >
                        <option value="Auto-Detect">Auto Type ({toCity.placeType.split(' ')[0]})</option>
                        <option value="Village / Rural">Village / Rural</option>
                        <option value="Town / District">Town / District</option>
                        <option value="City / State">City / State</option>
                        <option value="Country / International">Country / Global</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleSwapCities}
                        title="Swap Origin and Destination"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-700 whitespace-nowrap"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        Swap
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={toQuery}
                    onFocus={() => setShowToSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowToSuggestions(false), 180)}
                    onChange={(e) => {
                      setToQuery(e.target.value);
                    }}
                    placeholder="Type any village, city, state or country..."
                    className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                  />
                  <span className="block text-[11px] text-slate-500 mt-1 truncate">
                    {toCity.placeType} · {toCity.state}, {toCity.country}
                  </span>

                  {showToSuggestions && (
                    <div className="absolute left-0 right-0 top-[68px] z-30 bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100 max-h-64 overflow-y-auto">
                      <button
                        type="button"
                        onMouseDown={() => setShowToSuggestions(false)}
                        className="w-full text-left px-3.5 py-2.5 bg-blue-50/70 hover:bg-blue-100/70 transition-colors flex items-center justify-between"
                      >
                        <span className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          Active User Destination: "{toCity.name}" ({toCity.placeType})
                        </span>
                        <span className="font-mono text-[10px] text-blue-700">Live ✓</span>
                      </button>
                      {toSuggestions.map((hub) => (
                        <button
                          key={hub.id}
                          type="button"
                          onMouseDown={() => {
                            setToQuery(`${hub.name}, ${hub.country === 'India' ? hub.state : hub.country}`);
                            setShowToSuggestions(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-900">
                              {hub.name} · <span className="font-normal text-slate-500">{hub.placeType}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {hub.state}, {hub.country}
                            </div>
                          </div>
                          <span className="font-mono text-xs text-slate-500">{hub.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Departure & Return Dates */}
                <div className="md:col-span-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full px-2.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                    />
                    <span className="block text-[11px] text-slate-500 mt-1">
                      {selectedRoute.distanceKm} km Route
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      disabled={tripType === 'one-way'}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className={`w-full px-2.5 py-2.5 text-xs font-mono border rounded-lg focus:outline-none ${
                        tripType === 'round-trip'
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-700'
                          : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    />
                    <span className="block text-[11px] text-slate-500 mt-1">
                      {tripType === 'round-trip' ? '10% Return Saver' : 'Enable Round-Trip'}
                    </span>
                  </div>
                </div>

                {/* Passengers, Seat Preference & Concession Selector */}
                <div className="md:col-span-3 relative">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Passengers, Class & Concession
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassengerMenu((prev) => !prev)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg hover:bg-white transition-colors"
                  >
                    <span className="truncate">
                      {adults} {adults === 1 ? 'Adult' : 'Adults'}
                      {childrenCount > 0 ? `, ${childrenCount} Child` : ''}
                    </span>
                    <Users className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                  <span className="block text-[11px] text-slate-500 mt-1 truncate">
                    {seatPreference} · {concession === 'None' ? 'Regular Fare' : concession}
                  </span>

                  {showPassengerMenu && (
                    <div className="absolute right-0 left-0 top-[68px] z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-4 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-900">Adults (12+ yrs)</div>
                        <div className="flex items-center gap-2 font-mono">
                          <button
                            type="button"
                            onClick={() => setAdults((a) => Math.max(1, a - 1))}
                            className="p-1 border border-slate-300 rounded hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold w-5 text-center">{adults}</span>
                          <button
                            type="button"
                            onClick={() => setAdults((a) => Math.min(6, a + 1))}
                            className="p-1 border border-slate-300 rounded hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-900">Children (35% Off)</div>
                        <div className="flex items-center gap-2 font-mono">
                          <button
                            type="button"
                            onClick={() => setChildrenCount((c) => Math.max(0, c - 1))}
                            className="p-1 border border-slate-300 rounded hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold w-5 text-center">{childrenCount}</span>
                          <button
                            type="button"
                            onClick={() => setChildrenCount((c) => Math.min(4, c + 1))}
                            className="p-1 border border-slate-300 rounded hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <label className="block text-[11px] font-medium text-slate-600">
                          Preferred Berth / Seat Position
                        </label>
                        <select
                          value={seatPreference}
                          onChange={(e) => setSeatPreference(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md"
                        >
                          <option value="Lower Berth / Window">Lower Berth / Window</option>
                          <option value="Upper Sleeper Berth">Upper Sleeper Berth</option>
                          <option value="Aisle Easy-Access">Aisle Easy-Access</option>
                          <option value="Executive / Extra Legroom">Executive / Extra Legroom</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-slate-600">
                          Traveler Concession Category
                        </label>
                        <select
                          value={concession}
                          onChange={(e) => setConcession(e.target.value as ConcessionType)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md"
                        >
                          <option value="None">Regular Fare (No Concession)</option>
                          <option value="Student (15% Off)">Student ID (15% Off)</option>
                          <option value="Senior Citizen (20% Off)">Senior Citizen (20% Off)</option>
                          <option value="Armed Forces (25% Off)">Armed Forces (25% Off)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPassengerMenu(false)}
                        className="w-full py-1.5 text-xs font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800"
                      >
                        Apply Passenger Settings
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* User-Defined Exact Boarding Point, Dropping Point & Optional Distance Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
                <div className="md:col-span-5">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Custom Boarding Point / Village Stand / Terminal in {fromCity.name}
                  </label>
                  <input
                    type="text"
                    value={customBoardingPoint}
                    onChange={(e) => setCustomBoardingPoint(e.target.value)}
                    placeholder={`Enter exact pickup landmark or bus stand in ${fromCity.name}...`}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-5">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Custom Dropping Point / Village Landmark / Terminal in {toCity.name}
                  </label>
                  <input
                    type="text"
                    value={customDroppingPoint}
                    onChange={(e) => setCustomDroppingPoint(e.target.value)}
                    placeholder={`Enter exact drop landmark or terminal in ${toCity.name}...`}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Distance (km) Override
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={15000}
                    value={customDistanceInput}
                    onChange={(e) => setCustomDistanceInput(e.target.value)}
                    placeholder={`Auto (${selectedRoute.distanceKm} km)`}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Sample Route Switchers (Village, Town, State, International) + Personalization */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200/80 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-700">Try Any Scale:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFromQuery('Araku Valley Village, AP');
                      setToQuery('Visakhapatnam, Andhra Pradesh');
                      setFromScale('Village / Rural');
                      setToScale('City / State');
                      setTransportMode('bus');
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors whitespace-nowrap"
                  >
                    Village → City
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFromQuery('Bhoodan Pochampally Village');
                      setToQuery('Araku Valley Village');
                      setFromScale('Village / Rural');
                      setToScale('Village / Rural');
                      setTransportMode('cab');
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors whitespace-nowrap"
                  >
                    Village → Village
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFromQuery('Hyderabad, Telangana, India');
                      setToQuery('Dubai, United Arab Emirates');
                      setFromScale('City / State');
                      setToScale('Country / International');
                      setTransportMode('flight');
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors whitespace-nowrap"
                  >
                    India → Dubai (UAE)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFromQuery('London, United Kingdom');
                      setToQuery('Tokyo, Japan');
                      setFromScale('Country / International');
                      setToScale('Country / International');
                      setTransportMode('flight');
                      setCurrency('USD');
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors whitespace-nowrap"
                  >
                    London → Tokyo (Global)
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500">Purpose:</span>
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    {(
                      [
                        'Leisure & Family',
                        'Business Express',
                        'Solo Backpacker',
                        'Pilgrimage & Heritage',
                      ] as const
                    ).map((purpose) => (
                      <button
                        key={purpose}
                        type="button"
                        onClick={() => setTravelPurpose(purpose)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                          travelPurpose === purpose
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {purpose}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN WORKSPACE: 12-COLUMN DESKTOP ARCHITECTURE */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 8 COLUMNS: CORE USER-DRIVEN BOOKING FLOW */}
          <div className="lg:col-span-8 space-y-12">
            {/* 01. DYNAMICALLY CALCULATED SCHEDULES FOR USER'S ROUTE */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">
                    01. {fromCity.name} ({fromCity.placeType.split(' ')[0]}) to {toCity.name} ({toCity.placeType.split(' ')[0]})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Boarding at <strong className="text-slate-700">{customBoardingPoint}</strong> → Dropping at{' '}
                    <strong className="text-slate-700">{customDroppingPoint}</strong> · Distance:{' '}
                    <span className="font-mono font-semibold text-slate-700">{selectedRoute.distanceKm} km</span>
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
                  {(
                    [
                      { id: 'recommended', label: 'Best Match' },
                      { id: 'price-asc', label: 'Lowest Fare' },
                      { id: 'duration-asc', label: 'Fastest' },
                      { id: 'departure-asc', label: 'Earliest' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSortBy(tab.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        sortBy === tab.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
                {availableRoutes.map((route) => {
                  const isCurrent = selectedRoute.id === route.id;
                  const matchesPurpose = route.recommendedFor.includes(travelPurpose);
                  return (
                    <div
                      key={route.id}
                      className={`p-5 transition-colors ${
                        isCurrent ? 'bg-blue-50/35' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono font-semibold text-slate-700">
                              {route.serviceCode}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{route.tier}</span>
                            <span aria-hidden="true">·</span>
                            <span>{route.vehicleType}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-medium">
                              {route.onTimePercentage}
                            </span>
                            {matchesPurpose && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-blue-700">
                                  Recommended for {travelPurpose}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-900">
                            {route.operator}
                          </h3>

                          <div className="flex items-center gap-3 pt-1 font-mono text-sm">
                            <span className="font-semibold text-slate-900">
                              {route.departureTime}
                            </span>
                            <span className="text-xs text-slate-400">
                              — {route.duration} ({route.distanceKm} km) —
                            </span>
                            <span className="font-semibold text-slate-900">
                              {route.arrivalTime}
                            </span>
                            <span className="text-xs text-slate-500 font-sans">
                              ({route.seatsAvailable} seats left)
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 pt-1">
                            {route.amenities.join(' · ')}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                              {formatCurrency(route.baseFare, currency)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              per seat + {Math.round(route.taxRate * 100)}% tax
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRoute(route);
                              scrollToSection('step-seats');
                            }}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                              isCurrent
                                ? 'bg-blue-700 text-white'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {isCurrent ? 'Selected · View Deck' : 'Select & Choose Seats'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 02. INTERACTIVE REAL-TIME SEAT & BERTH LAYOUT MAP */}
            <section
              id="step-seats"
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Step 02 · Auto-prioritized for "{seatPreference}"</span>
                <span className="font-mono">{selectedRoute.operator}</span>
              </div>

              <SeatMapSelector
                option={selectedRoute}
                seats={currentDeckSeats}
                selectedSeats={selectedSeats}
                maxSeats={totalPassengers}
                currency={currency}
                onToggleSeat={handleToggleSeat}
              />
            </section>

            {/* 03. FOOD & PERSONALIZATION OPTIONS TAILORED TO USER'S ORIGIN & DESTINATION */}
            <section
              id="step-meals"
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-blue-700" />
                    03. {fromCity.name} & {toCity.name} Meal Boxes & Custom Food Requests
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generated for your {fromCity.name} ({fromCity.placeType.split(' ')[0]}) → {toCity.name} ({toCity.placeType.split(' ')[0]}) trip
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {(
                    ['all', 'Regional Box', 'Vegetarian', 'Jain', 'Vegan', 'Non-Vegetarian'] as const
                  ).map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => setDietaryFilter(diet)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        dietaryFilter === diet
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {diet === 'all' ? 'All Menus' : diet}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="md:col-span-5 aspect-4/3 rounded-lg overflow-hidden bg-slate-200">
                  <img
                    src={GENERATED_IMAGES.mealThaliBox}
                    alt="Artisanal regional travel meal box"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="md:col-span-7 space-y-2.5">
                  <div className="text-xs text-slate-500">
                    {fromCity.name} & {toCity.name} Kitchen Dispatch · Hygiene Tamper-Sealed
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900">
                    {toCity.regionalCuisineName} & Custom Passenger Meals
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Choose from our pre-packed regional boxes or enter any custom village/home-style dish or dietary instruction below.
                  </p>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Custom Dish / Special Dietary Instruction (Optional)
                    </label>
                    <input
                      type="text"
                      value={customMealNote}
                      onChange={(e) => setCustomMealNote(e.target.value)}
                      placeholder={`e.g. Less spicy ${fromCity.name} millet roti, Halal box, baby milk flask...`}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {filteredMeals.map((meal) => {
                  const qty = mealQuantities[meal.id] || 0;
                  return (
                    <div
                      key={meal.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-slate-800">{meal.dietary}</span>
                          <span aria-hidden="true">·</span>
                          <span>{meal.regionTag}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{meal.calories}</span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900">{meal.name}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {meal.description}
                        </p>
                        <div className="text-[11px] text-slate-500 pt-0.5">
                          Includes: {meal.itemsIncluded}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0">
                        <div className="font-mono text-sm font-bold tabular-nums text-slate-900">
                          {formatCurrency(meal.price, currency)}
                        </div>

                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleMealQtyChange(meal.id, 1)}
                            className="px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                          >
                            + Add Meal Box
                          </button>
                        ) : (
                          <div className="flex items-center gap-2.5 bg-slate-900 text-white px-2.5 py-1 rounded-lg font-mono text-xs">
                            <button
                              type="button"
                              onClick={() => handleMealQtyChange(meal.id, -1)}
                              aria-label="Decrease meal quantity"
                              className="p-0.5 hover:text-blue-300"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-4 text-center font-semibold tabular-nums">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMealQtyChange(meal.id, 1)}
                              aria-label="Increase meal quantity"
                              className="p-0.5 hover:text-blue-300"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 04. ON-GROUND & LOCAL TRANSPORT DIRECTORY AT USER'S DESTINATION */}
            <section
              id="step-commute"
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-700" />
                    04. Last-Mile Local Transport in {toCity.name} ({toCity.placeType})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-book arrival transfers from {customDroppingPoint} to your final address in {toCity.name}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {(
                    [
                      { id: 'all', label: 'All Options' },
                      { id: 'cab-transfer', label: 'Cab / Village Drop' },
                      { id: 'self-drive', label: 'Bike & Car Rental' },
                      { id: 'public-transit', label: 'Local Transit Guide' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCommuteTab(t.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        commuteTab === t.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {commuteTab !== 'public-transit' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <div className="md:col-span-5 aspect-4/3 rounded-lg overflow-hidden bg-slate-200">
                    <img
                      src={GENERATED_IMAGES.cabTransfer}
                      alt="Executive vehicle waiting outside arrival point for last-mile transfer"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="md:col-span-7 space-y-2">
                    <div className="text-xs text-slate-500">
                      Zero-Wait Pickup at {customDroppingPoint}
                    </div>
                    <h3 className="text-lg font-bold font-display text-slate-900">
                      Direct Last-Mile Connection in {toCity.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Whether {toCity.name} is a rural village, district town, metro city, or international hub, your pre-booked transfer or rental syncs with your PNR arrival time.
                    </p>
                    <div className="text-xs text-slate-500">
                      Key {toCity.name} zones: {toCity.popularHotelZones.join(' · ')}
                    </div>
                  </div>
                </div>
              )}

              {commuteTab !== 'public-transit' && (
                <div className="divide-y divide-slate-200">
                  {dynamicCommuteOptions
                    .filter((opt) => {
                      if (commuteTab === 'cab-transfer') return opt.category === 'cab-transfer';
                      if (commuteTab === 'self-drive')
                        return opt.category === 'self-drive-bike' || opt.category === 'self-drive-car';
                      return true;
                    })
                    .map((item) => {
                      const isSelected = selectedLocalCommute?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="font-semibold text-slate-800">
                                {item.category === 'cab-transfer'
                                  ? 'Chauffeur Transfer'
                                  : item.category === 'self-drive-bike'
                                  ? '2-Wheeler Self-Drive'
                                  : '4-Wheeler Self-Drive'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{item.capacity}</span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900">
                              {item.title} — {item.vehicleModel}
                            </h4>
                            <p className="text-xs text-slate-600">
                              Pickup: {item.pickupPoint}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {item.inclusionText}
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                            <div className="text-right">
                              <span className="font-mono text-sm font-bold tabular-nums text-slate-900">
                                {formatCurrency(item.price, currency)}
                              </span>
                              <span className="block text-[11px] text-slate-500">
                                {item.billingUnit}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedLocalCommute(isSelected ? null : item)
                              }
                              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                                isSelected
                                  ? 'bg-blue-700 text-white'
                                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                              }`}
                            >
                              {isSelected ? 'Added to Itinerary ✓' : 'Add to Booking'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Public Transit Guide for User's Destination */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    {toCity.name} Local Public Transit & Shared Feeder Guide
                  </h3>
                  <span className="text-xs text-slate-500">
                    Bundled automatically into your {toCity.name} E-Ticket
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">
                      Rail, Metro & Feeder Links
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {destinationTransitGuide.metroNetwork.lines}
                    </p>
                    <p className="text-slate-500">
                      {destinationTransitGuide.metroNetwork.stationConnect}
                    </p>
                    <p className="font-mono text-[11px] text-slate-700 pt-1">
                      Fare: {destinationTransitGuide.metroNetwork.fareRange}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">
                      Local Bus & Shuttle Corridors
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {destinationTransitGuide.cityBusService.operator}
                    </p>
                    <p className="text-slate-500">
                      {destinationTransitGuide.cityBusService.keyCorridors}
                    </p>
                    <p className="font-mono text-[11px] text-slate-700 pt-1">
                      Pass: {destinationTransitGuide.cityBusService.acPassFare}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">
                      Auto, Jeep & Prepaid Taxi Rates
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {destinationTransitGuide.rickshawAndPrepaid.baseFare} ·{' '}
                      {destinationTransitGuide.rickshawAndPrepaid.perKmRate}
                    </p>
                    <p className="text-slate-500">
                      {destinationTransitGuide.rickshawAndPrepaid.stationCounterTip}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 05. DESTINATION DIETARY & LOCAL FOOD GUIDE + USER CUSTOM SPOT */}
            <section
              id="step-food-guide"
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">
                    05. {toCity.name} ({toCity.placeType}) Local Dining & Food Guide
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Save recommended spots in {toCity.name} or add your own local village/city food stop to your E-Ticket
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-600">
                  {savedFoodSpots.length} saved to E-Ticket guide
                </span>
              </div>

              {/* Allow User to Add Any Custom Local Food Stop in Their Destination */}
              <form
                onSubmit={handleAddCustomFoodSpot}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80"
              >
                <input
                  type="text"
                  value={newSpotName}
                  onChange={(e) => setNewSpotName(e.target.value)}
                  placeholder={`Add your own food spot in ${toCity.name} (e.g. Village Mess / Cafe)...`}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-700 focus:outline-none"
                />
                <input
                  type="text"
                  value={newSpotDish}
                  onChange={(e) => setNewSpotDish(e.target.value)}
                  placeholder="Must-try dish or note..."
                  className="sm:w-56 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-700 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                >
                  + Add to {toCity.name} Guide
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 aspect-4/3 rounded-lg overflow-hidden bg-slate-200">
                  <img
                    src={GENERATED_IMAGES.localFoodHub}
                    alt="Local dining hub illuminated by warm lanterns at twilight"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                <div className="md:col-span-7 divide-y divide-slate-200">
                  {destinationFoodSpots.map((spot) => {
                    const isBookmarked = savedFoodSpots.some((s) => s.id === spot.id);
                    return (
                      <div key={spot.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs text-slate-500">
                            {spot.category} · {spot.neighborhood} · ★ {spot.rating}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleFoodSpot(spot)}
                            className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                              isBookmarked
                                ? 'text-blue-700'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            {isBookmarked ? 'Saved to Guide ✓' : 'Save to E-Ticket'}
                          </button>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900">{spot.name}</h4>
                        <p className="text-xs text-slate-600">
                          Signature Dish:{' '}
                          <strong className="font-medium text-slate-800">{spot.signatureDish}</strong>
                        </p>
                        <div className="text-[11px] text-slate-500">
                          {spot.dietaryOptions} · {spot.distanceFromHub} · Avg {spot.avgCostForTwo} for two
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT 4 COLUMNS: CONTIGUOUS STICKY PRICE TRANSPARENCY & INSTANT CHECKOUT MODULE */}
          <aside id="step-checkout" className="lg:col-span-4 lg:sticky lg:top-20 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-200 pb-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Live User-Defined Itinerary</span>
                  <span className="font-mono uppercase">
                    {transportMode} · {selectedRoute.distanceKm} km
                  </span>
                </div>
                <div className="text-lg font-bold font-display text-slate-900 flex flex-wrap items-center gap-1.5">
                  <span>{fromCity.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{toCity.name}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {fromCity.placeType} ({fromCity.country}) → {toCity.placeType} ({toCity.country})
                </div>
                <div className="text-xs text-slate-600 pt-0.5">
                  {selectedRoute.operator} · {departureDate} ({selectedRoute.departureTime})
                </div>
              </div>

              {/* Price Transparency Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">
                    Price Transparency ({currency})
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                  <span>
                    Base Fare ({Math.max(1, selectedSeats.length)}{' '}
                    {selectedSeats.length === 1 ? 'Seat' : 'Seats'})
                  </span>
                  <span>{formatCurrency(pricing.baseFareTotal, currency)}</span>
                </div>

                {pricing.childDiscountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-mono tabular-nums">
                    <span>Child Fare Savings ({childrenCount} Child)</span>
                    <span>−{formatCurrency(pricing.childDiscountTotal, currency)}</span>
                  </div>
                )}

                {pricing.concessionDiscountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-mono tabular-nums">
                    <span>{concession}</span>
                    <span>−{formatCurrency(pricing.concessionDiscountTotal, currency)}</span>
                  </div>
                )}

                {pricing.returnFareTotal > 0 && (
                  <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                    <span>Return Trip Base ({returnDate})</span>
                    <span>{formatCurrency(pricing.returnFareTotal, currency)}</span>
                  </div>
                )}

                {pricing.seatSurchargeTotal > 0 && (
                  <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                    <span>Berth / Window Surcharge</span>
                    <span>{formatCurrency(pricing.seatSurchargeTotal, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                  <span>GST & Terminal Taxes ({Math.round(selectedRoute.taxRate * 100)}%)</span>
                  <span>{formatCurrency(pricing.taxes, currency)}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                  <span>Convenience Fee</span>
                  <span>{formatCurrency(pricing.convenienceFee, currency)}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                  <span>
                    Meal Add-ons ({Object.values(mealQuantities).reduce((a, b) => a + b, 0)} boxes)
                  </span>
                  <span>{formatCurrency(pricing.mealsTotal, currency)}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                  <span>
                    Local Commute ({selectedLocalCommute ? selectedLocalCommute.vehicleModel.split(' ')[0] : 'None'})
                  </span>
                  <span>{formatCurrency(pricing.localCommuteTotal, currency)}</span>
                </div>

                <label className="flex items-center justify-between pt-2 border-t border-slate-100 cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={includeInsurance}
                      onChange={(e) => setIncludeInsurance(e.target.checked)}
                      className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                    Trip Delay & Cancellation Cover
                  </span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatCurrency(pricing.insuranceTotal, currency)}
                  </span>
                </label>

                <div className="flex items-baseline justify-between pt-3 border-t border-slate-200">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Total Payable
                    </span>
                    <span className="text-[11px] text-slate-500">
                      All taxes, discounts & add-ons applied
                    </span>
                  </div>
                  <span className="text-xl font-bold font-mono tabular-nums text-blue-700">
                    {formatCurrency(pricing.grandTotal, currency)}
                  </span>
                </div>
              </div>

              {/* Passenger & WhatsApp E-Ticket Dispatch Form */}
              <form onSubmit={handleCompleteBooking} className="space-y-3.5 pt-3 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-900">
                  Passenger & Instant WhatsApp Dispatch Details
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Primary Passenger Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      WhatsApp & SMS Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Email for PDF Receipt
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                </div>

                {selectedLocalCommute && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      {toCity.name} Final Drop Address (Village House / Hotel / Street)
                    </label>
                    <input
                      type="text"
                      value={dropHotelAddress}
                      onChange={(e) => setDropHotelAddress(e.target.value)}
                      placeholder={`Enter house, village landmark, or hotel in ${toCity.name}...`}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Payment Gateway Mode
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'UPI Instant (PhonePe / GPay)', short: 'UPI / QR' },
                        { id: 'Credit / Debit Card', short: 'Card' },
                        { id: 'NetBanking', short: 'NetBanking' },
                      ] as const
                    ).map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`py-2 px-2 text-[11px] font-medium rounded-lg border transition-colors whitespace-nowrap ${
                          paymentMethod === pm.id
                            ? 'bg-blue-50 border-blue-700 text-blue-800 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {pm.short}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-rose-700 font-medium">{formError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <QrCode className="w-4 h-4" />
                  Pay {formatCurrency(pricing.grandTotal, currency)} & Generate Instant E-Ticket
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  Generates instant QR Boarding Pass + WhatsApp PNR alert + {toCity.name} Guide
                </p>
              </form>
            </div>
          </aside>
        </div>
      </main>

      {/* QUIET FOOTER */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold font-display text-slate-900 mr-2">Vayupath</span>
            Universal Village-to-Global Multi-Modal Transit, Meal & Local Commute Platform
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span>Village Panchayat to International Terminals</span>
            <span>·</span>
            <span>Multi-Currency & Instant QR E-Ticket</span>
            <span>·</span>
            <span>24×7 PNR Desk</span>
          </div>
        </div>
      </footer>

      {/* INSTANT E-TICKET & QR BOARDING MODAL */}
      {activeTicket && (
        <TicketModal
          booking={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}

      {/* N8N WEBHOOK TRAVEL CHATBOT */}
      <ChatAssistant
        fromPlace={fromCity.name}
        toPlace={toCity.name}
        transportMode={transportMode}
        departureDate={departureDate}
        totalPriceFormatted={formatCurrency(pricing.grandTotal, currency)}
      />
    </div>
  );
}
