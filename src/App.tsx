import React, { useState, useMemo, useEffect } from 'react';
import {
  Bus,
  Plane,
  Train,
  Car,
  ArrowLeftRight,
  Calendar,
  Users,
  Check,
  Plus,
  Minus,
  Navigation,
  Utensils,
  ShieldCheck,
  QrCode,
  SlidersHorizontal,
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import {
  TransportMode,
  TripType,
  DietaryType,
  CityHub,
  TransitOption,
  SeatItem,
  MealOption,
  LocalCommuteOption,
  LocalFoodSpot,
  ConfirmedBooking,
  CITY_HUBS,
  TRANSIT_OPTIONS,
  MEAL_OPTIONS,
  LOCAL_COMMUTE_OPTIONS,
  PUBLIC_TRANSIT_GUIDES,
  LOCAL_FOOD_SPOTS,
  GENERATED_IMAGES,
  generateSeatsForOption,
} from './data/transitData';
import { SeatMapSelector } from './components/SeatMapSelector';
import { TicketModal } from './components/TicketModal';

export default function App() {
  // Step 1: Search Engine State
  const [transportMode, setTransportMode] = useState<TransportMode>('bus');
  const [tripType, setTripType] = useState<TripType>('one-way');

  const [fromCity, setFromCity] = useState<CityHub>(CITY_HUBS[0]); // New Delhi
  const [toCity, setToCity] = useState<CityHub>(CITY_HUBS[1]); // Jaipur
  const [fromQuery, setFromQuery] = useState(CITY_HUBS[0].name);
  const [toQuery, setToQuery] = useState(CITY_HUBS[1].name);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const [departureDate, setDepartureDate] = useState('2026-10-04');
  const [returnDate, setReturnDate] = useState('2026-10-07');

  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [seatPreference, setSeatPreference] = useState('Lower Berth / Window');
  const [showPassengerMenu, setShowPassengerMenu] = useState(false);

  // Sorting & Route Selection
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'duration-asc' | 'departure-asc'>('recommended');

  const availableRoutes = useMemo(() => {
    const filtered = TRANSIT_OPTIONS.filter((opt) => opt.mode === transportMode);
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.baseFare - b.baseFare;
      if (sortBy === 'duration-asc') return a.durationMinutes - b.durationMinutes;
      if (sortBy === 'departure-asc') return a.departureTime.localeCompare(b.departureTime);
      return Number(b.rating) - Number(a.rating);
    });
  }, [transportMode, sortBy]);

  const [selectedRoute, setSelectedRoute] = useState<TransitOption>(TRANSIT_OPTIONS[0]);

  // Keep selectedRoute synced when switching transport modes
  useEffect(() => {
    const firstForMode = TRANSIT_OPTIONS.find((o) => o.mode === transportMode);
    if (firstForMode) {
      setSelectedRoute(firstForMode);
    }
  }, [transportMode]);

  // Step 2: Seat Layout Map State
  const totalPassengers = Math.max(1, adults + childrenCount);
  const currentDeckSeats = useMemo(() => generateSeatsForOption(selectedRoute), [selectedRoute]);
  const [selectedSeats, setSelectedSeats] = useState<SeatItem[]>([]);

  // Auto-select default seats matching passenger count when route changes
  useEffect(() => {
    const available = currentDeckSeats.filter((s) => s.status !== 'booked');
    setSelectedSeats(available.slice(0, totalPassengers));
  }, [currentDeckSeats, totalPassengers]);

  const handleToggleSeat = (seat: SeatItem) => {
    if (seat.status === 'booked') return;
    const exists = selectedSeats.some((s) => s.id === seat.id);
    if (exists) {
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= totalPassengers) {
        // Replace oldest selected seat so user never gets stuck
        setSelectedSeats((prev) => [...prev.slice(1), seat]);
      } else {
        setSelectedSeats((prev) => [...prev, seat]);
      }
    }
  };

  // Step 3: Meal & Personalization State
  const [dietaryFilter, setDietaryFilter] = useState<DietaryType>('all');
  const [mealQuantities, setMealQuantities] = useState<Record<string, number>>({
    'meal-raj-thali': 1,
  });
  const [savedFoodSpots, setSavedFoodSpots] = useState<LocalFoodSpot[]>([LOCAL_FOOD_SPOTS[0]]);

  const filteredMeals = useMemo(() => {
    if (dietaryFilter === 'all') return MEAL_OPTIONS;
    return MEAL_OPTIONS.filter((m) => m.dietary === dietaryFilter);
  }, [dietaryFilter]);

  const handleMealQtyChange = (mealId: string, delta: number) => {
    setMealQuantities((prev) => {
      const current = prev[mealId] || 0;
      const next = Math.max(0, Math.min(10, current + delta));
      const updated = { ...prev, [mealId]: next };
      if (next === 0) delete updated[mealId];
      return updated;
    });
  };

  const handleToggleFoodSpot = (spot: LocalFoodSpot) => {
    setSavedFoodSpots((prev) =>
      prev.some((s) => s.id === spot.id)
        ? prev.filter((s) => s.id !== spot.id)
        : [...prev, spot]
    );
  };

  // Step 2/4: On-Ground Local Transport State
  const [commuteTab, setCommuteTab] = useState<'all' | 'cab-transfer' | 'self-drive' | 'public-transit'>('all');
  const [selectedLocalCommute, setSelectedLocalCommute] = useState<LocalCommuteOption | null>(
    LOCAL_COMMUTE_OPTIONS[0]
  );

  // Checkout & Passenger Contact State
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [fullName, setFullName] = useState('Aarav Singhania');
  const [phone, setPhone] = useState('+91 98204 71920');
  const [email, setEmail] = useState('aarav.singhania@example.com');
  const [dropHotelAddress, setDropHotelAddress] = useState('Rambagh Heritage Quarter, MI Road');
  const [paymentMethod, setPaymentMethod] = useState<'UPI Instant (PhonePe / GPay)' | 'Credit / Debit Card' | 'NetBanking'>('UPI Instant (PhonePe / GPay)');
  const [formError, setFormError] = useState<string | null>(null);

  // Confirmed Bookings & E-Ticket Modal State
  const [activeTicket, setActiveTicket] = useState<ConfirmedBooking | null>(null);
  const [savedBookings, setSavedBookings] = useState<ConfirmedBooking[]>([]);

  // Price Transparency Calculations
  const pricing = useMemo(() => {
    const activeSeatCount = Math.max(1, selectedSeats.length);
    const baseFareTotal = selectedRoute.baseFare * activeSeatCount;
    const returnFareTotal =
      tripType === 'round-trip' ? Math.round(baseFareTotal * 0.92) : 0;
    const seatSurchargeTotal = selectedSeats.reduce((acc, s) => acc + s.surcharge, 0);
    const transportSubtotal = baseFareTotal + returnFareTotal + seatSurchargeTotal;
    const taxes = Math.round(transportSubtotal * selectedRoute.taxRate);
    const convenienceFee = transportMode === 'flight' ? 249 : 79;

    const mealsTotal = Object.entries(mealQuantities).reduce((acc, [id, qty]) => {
      const item = MEAL_OPTIONS.find((m) => m.id === id);
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
    tripType,
    transportMode,
    mealQuantities,
    selectedLocalCommute,
    includeInsurance,
  ]);

  const handleSwapCities = () => {
    const tempCity = fromCity;
    setFromCity(toCity);
    setToCity(tempCity);
    setFromQuery(toCity.name);
    setToQuery(tempCity.name);
  };

  const fromSuggestions = useMemo(() => {
    const q = fromQuery.trim().toLowerCase();
    if (!q) return CITY_HUBS;
    return CITY_HUBS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
    );
  }, [fromQuery]);

  const toSuggestions = useMemo(() => {
    const q = toQuery.trim().toLowerCase();
    if (!q) return CITY_HUBS;
    return CITY_HUBS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
    );
  }, [toQuery]);

  const destinationTransitGuide =
    PUBLIC_TRANSIT_GUIDES[toCity.name] || PUBLIC_TRANSIT_GUIDES['Jaipur'];

  const destinationFoodSpots = useMemo(() => {
    const exact = LOCAL_FOOD_SPOTS.filter((f) => f.cityName === toCity.name);
    return exact.length > 0 ? exact : LOCAL_FOOD_SPOTS.slice(0, 3);
  }, [toCity]);

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
        const meal = MEAL_OPTIONS.find((m) => m.id === id);
        return meal && quantity > 0 ? { meal, quantity } : null;
      })
      .filter((x): x is { meal: MealOption; quantity: number } => Boolean(x));

    const newBooking: ConfirmedBooking = {
      pnr,
      bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      mode: transportMode,
      tripType,
      fromCity,
      toCity,
      departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : undefined,
      passengers: {
        adults,
        children: childrenCount,
        seatPreference,
      },
      selectedRoute,
      selectedSeats,
      selectedMeals: selectedMealsList,
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
      {/* TOP BAR CONTRACT: Strictly 1 row, 3 zones (Brand Wordmark — 5 Nav Links — 1 Primary Action) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="text-xl font-bold font-display tracking-tight text-slate-900 whitespace-nowrap"
          >
            Vayupath
          </a>

          {/* Zone 2: 5 clean text navigation links */}
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

          {/* Zone 3: 1 primary action */}
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

      {/* HERO & STEP 1: MULTI-MODAL TRANSPORT SEARCH ENGINE */}
      <section id="step-search" className="relative border-b border-slate-200 bg-slate-900">
        {/* High-impact 16:9 visual backdrop with measured scrim and fallback */}
        <div className="relative min-h-[420px] flex flex-col justify-end">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 overflow-hidden">
            <img
              src={GENERATED_IMAGES.heroTransit}
              alt="Modern intercity sleeper coach and glass airport transit terminal at golden hour"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-55"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/30" />
          </div>

          <div className="relative z-10 max-w-7xl w-full mx-auto px-6 pt-12 pb-10 space-y-8">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-medium text-blue-300 tracking-wide">
                Intercity Buses · Domestic & International Flights · Express Rail · Last-Mile Commute
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight leading-[1.12]">
                Book door-to-door intercity transit, sleeper berths, regional meals, and arrival cabs in one itinerary.
              </h1>
            </div>

            {/* Search Engine Surface */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-5 md:p-6 text-slate-900 space-y-5">
              {/* Top Row: Transport Mode Tabs + One-Way / Round-Trip Toggle */}
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
                    Buses (Volvo & Sleeper)
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
                    Flights
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
                    Trains
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
                    Intercity Cabs
                  </button>
                </div>

                {/* Trip Type Segmented Control */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTripType('one-way')}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      tripType === 'one-way'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    One-Way Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType('round-trip')}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      tripType === 'round-trip'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Round-Trip (Return Discount)
                  </button>
                </div>
              </div>

              {/* Search Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                {/* FROM Auto-suggest field */}
                <div className="md:col-span-3 relative">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    From (Departure City / Terminal)
                  </label>
                  <input
                    type="text"
                    value={fromQuery}
                    onFocus={() => setShowFromSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowFromSuggestions(false), 180)}
                    onChange={(e) => {
                      setFromQuery(e.target.value);
                      setShowFromSuggestions(true);
                    }}
                    placeholder="Enter city or station..."
                    className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                  />
                  <span className="block text-[11px] text-slate-500 mt-1 truncate">
                    {transportMode === 'flight'
                      ? fromCity.airportName
                      : transportMode === 'train'
                      ? fromCity.trainStation
                      : fromCity.busTerminal}
                  </span>

                  {showFromSuggestions && (
                    <div className="absolute left-0 right-0 top-[68px] z-30 bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                      {fromSuggestions.map((hub) => (
                        <button
                          key={hub.id}
                          type="button"
                          onMouseDown={() => {
                            setFromCity(hub);
                            setFromQuery(hub.name);
                            setShowFromSuggestions(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-900">
                              {hub.name}, {hub.state}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {transportMode === 'flight' ? hub.airportName : hub.busTerminal}
                            </div>
                          </div>
                          <span className="font-mono text-xs text-slate-500">{hub.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Swap Button + TO Auto-suggest field */}
                <div className="md:col-span-3 relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-600">
                      To (Destination City / Terminal)
                    </label>
                    <button
                      type="button"
                      onClick={handleSwapCities}
                      title="Swap Departure and Destination"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:underline whitespace-nowrap"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      Swap Route
                    </button>
                  </div>
                  <input
                    type="text"
                    value={toQuery}
                    onFocus={() => setShowToSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowToSuggestions(false), 180)}
                    onChange={(e) => {
                      setToQuery(e.target.value);
                      setShowToSuggestions(true);
                    }}
                    placeholder="Enter destination..."
                    className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                  />
                  <span className="block text-[11px] text-slate-500 mt-1 truncate">
                    {transportMode === 'flight'
                      ? toCity.airportName
                      : transportMode === 'train'
                      ? toCity.trainStation
                      : toCity.busTerminal}
                  </span>

                  {showToSuggestions && (
                    <div className="absolute left-0 right-0 top-[68px] z-30 bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                      {toSuggestions.map((hub) => (
                        <button
                          key={hub.id}
                          type="button"
                          onMouseDown={() => {
                            setToCity(hub);
                            setToQuery(hub.name);
                            setShowToSuggestions(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-900">
                              {hub.name}, {hub.state}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {transportMode === 'flight' ? hub.airportName : hub.busTerminal}
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
                    <div className="relative">
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full px-2.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                    <span className="block text-[11px] text-slate-500 mt-1">
                      Calendar Picker
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
                      {tripType === 'round-trip' ? '8% Return Saver' : 'Enable Round-Trip'}
                    </span>
                  </div>
                </div>

                {/* Passengers & Class Selector */}
                <div className="md:col-span-3 relative">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Passengers & Seat Preference
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
                    Pref: {seatPreference}
                  </span>

                  {showPassengerMenu && (
                    <div className="absolute right-0 left-0 top-[68px] z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-slate-900">Adults (12+ yrs)</div>
                        </div>
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
                        <div>
                          <div className="text-xs font-semibold text-slate-900">Children (2–11 yrs)</div>
                        </div>
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

                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <label className="block text-[11px] font-medium text-slate-600">
                          Preferred Berth / Cabin Class
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

                      <button
                        type="button"
                        onClick={() => setShowPassengerMenu(false)}
                        className="w-full py-1.5 text-xs font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800"
                      >
                        Apply Selection
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN WORKSPACE: 12-COLUMN DESKTOP ARCHITECTURE (8 COLS FLOW + 4 COLS CONTIGUOUS PRICE & TICKET MODULE) */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 8 COLUMNS: CORE BOOKING STEPS */}
          <div className="lg:col-span-8 space-y-12">
            {/* 01. AVAILABLE TRANSPORT SCHEDULES */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">
                    01. Select {fromCity.name} to {toCity.name} Schedule
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing live {transportMode.toUpperCase()} inventory for {departureDate} · {totalPassengers}{' '}
                    {totalPassengers === 1 ? 'Passenger' : 'Passengers'}
                  </p>
                </div>

                {/* Interactive Sort Controls */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
                  {(
                    [
                      { id: 'recommended', label: 'Top Rated' },
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

              {/* Schedule List (Single-Elevation Container with Hairline Dividers) */}
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
                {availableRoutes.map((route) => {
                  const isCurrent = selectedRoute.id === route.id;
                  return (
                    <div
                      key={route.id}
                      className={`p-5 transition-colors ${
                        isCurrent ? 'bg-blue-50/35' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          {/* Unboxed Clean Metadata Line (Zero-Pill Discipline) */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono font-semibold text-slate-700">
                              {route.serviceCode}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{route.vehicleType}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-medium">
                              {route.onTimePercentage}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              ★ {route.rating} ({route.reviewsCount} reviews)
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900">
                            {route.operator}
                          </h3>

                          {/* Timings Row */}
                          <div className="flex items-center gap-3 pt-1 font-mono text-sm">
                            <span className="font-semibold text-slate-900">
                              {route.departureTime}
                            </span>
                            <span className="text-xs text-slate-400">
                              — {route.duration} —
                            </span>
                            <span className="font-semibold text-slate-900">
                              {route.arrivalTime}
                            </span>
                            <span className="text-xs text-slate-500 font-sans">
                              ({route.seatsAvailable} seats left)
                            </span>
                          </div>

                          {/* Amenities as quiet separated text */}
                          <div className="text-xs text-slate-500 pt-1">
                            {route.amenities.join(' · ')}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                              ₹{route.baseFare.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              per passenger + {Math.round(route.taxRate * 100)}% GST
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
                <span>Step 02 · Interactive Deck & Cabin Configuration</span>
                <span className="font-mono">{selectedRoute.operator}</span>
              </div>

              <SeatMapSelector
                option={selectedRoute}
                seats={currentDeckSeats}
                selectedSeats={selectedSeats}
                maxSeats={totalPassengers}
                onToggleSeat={handleToggleSeat}
              />
            </section>

            {/* 03. FOOD & PERSONALIZATION OPTIONS (ONBOARD MEALS) */}
            <section
              id="step-meals"
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-blue-700" />
                    03. Pre-Book Onboard Meals & Regional Food Boxes
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Delivered fresh to your seat/berth at departure · Filter by Vegetarian, Non-Vegetarian, Jain, Vegan, or Regional Box
                  </p>
                </div>

                {/* Dietary Interactive Filter Controls */}
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

              {/* Featured Culinary Banner + Meal List */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="md:col-span-5 aspect-4/3 rounded-lg overflow-hidden bg-slate-200">
                  <img
                    src={GENERATED_IMAGES.mealThaliBox}
                    alt="Artisanal regional travel thali meal box with saffron rice and paneer"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="md:col-span-7 space-y-2">
                  <div className="text-xs text-slate-500">
                    Hot Station Kitchen Dispatch · Hygiene Tamper-Sealed
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900">
                    Curated Regional Bento Boxes Served at Your Seat
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every meal box is prepared 45 minutes prior to boarding by FSSAI-certified regional kitchens and synced directly to your PNR seat number.
                  </p>
                </div>
              </div>

              {/* Meal Items Divided by Hairlines */}
              <div className="divide-y divide-slate-200">
                {filteredMeals.map((meal) => {
                  const qty = mealQuantities[meal.id] || 0;
                  return (
                    <div
                      key={meal.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        {/* Clean Unboxed Metadata */}
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
                          ₹{meal.price}
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

            {/* 04. ON-GROUND & LOCAL TRANSPORT DIRECTORY AT DESTINATION */}
            <section
              id="step-commute"
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-700" />
                    04. On-Ground Local Transport in {toCity.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-book private station/airport hotel transfers, daily self-drive rentals, or view public transit tariffs
                  </p>
                </div>

                {/* Interactive Commute Mode Filter */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {(
                    [
                      { id: 'all', label: 'All Options' },
                      { id: 'cab-transfer', label: 'Cab / Hotel Transfer' },
                      { id: 'self-drive', label: 'Bike & Car Rental' },
                      { id: 'public-transit', label: 'Public Transit Guide' },
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

              {/* Visual Showcase for Airport/Station Cab Transfer */}
              {commuteTab !== 'public-transit' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <div className="md:col-span-5 aspect-4/3 rounded-lg overflow-hidden bg-slate-200">
                    <img
                      src={GENERATED_IMAGES.cabTransfer}
                      alt="Electric executive sedan parked outside arrival terminal for hotel transfer"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="md:col-span-7 space-y-2">
                    <div className="text-xs text-slate-500">
                      Zero-Wait Terminal Pickup · Synced with PNR Live Arrival Time
                    </div>
                    <h3 className="text-lg font-bold font-display text-slate-900">
                      Step Off Your {transportMode.toUpperCase()} Straight Into Your {toCity.name} Ride
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      If your intercity bus, flight, or train is delayed, your chauffeur or self-drive rental slot automatically adjusts at zero penalty.
                    </p>
                    <div className="text-xs text-slate-500">
                      Popular drop zones: {toCity.popularHotelZones.join(' · ')}
                    </div>
                  </div>
                </div>
              )}

              {/* Pre-Bookable Cab Transfers & Self-Drive Rentals */}
              {commuteTab !== 'public-transit' && (
                <div className="divide-y divide-slate-200">
                  {LOCAL_COMMUTE_OPTIONS.filter((opt) => {
                    if (commuteTab === 'cab-transfer') return opt.category === 'cab-transfer';
                    if (commuteTab === 'self-drive')
                      return opt.category === 'self-drive-bike' || opt.category === 'self-drive-car';
                    return true;
                  }).map((item) => {
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
                              ₹{item.price}
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

              {/* Public Transit Guide for Arrival Destination */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    {toCity.name} Public Transit & Official Meter Tariff Guide
                  </h3>
                  <span className="text-xs text-slate-500">
                    Included free on your WhatsApp E-Ticket
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">
                      Metro Rail Connectivity
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
                      City Bus Corridors
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
                      Prepaid Auto & Rickshaw Rates
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

            {/* 05. DESTINATION DIETARY & LOCAL FOOD GUIDE */}
            <section
              id="step-food-guide"
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">
                    05. {toCity.name} Local Dining & Street Food Guide
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bookmark iconic local restaurants & street food hubs near your arrival station to attach to your E-Ticket
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-600">
                  {savedFoodSpots.length} saved to E-Ticket guide
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 aspect-4/3 rounded-lg overflow-hidden bg-slate-200">
                  <img
                    src={GENERATED_IMAGES.localFoodHub}
                    alt="Heritage courtyard dining hub illuminated by warm lanterns at twilight"
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
                          Must Try: <strong className="font-medium text-slate-800">{spot.signatureDish}</strong>
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
              {/* Itinerary Header */}
              <div className="border-b border-slate-200 pb-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Live Fare & Itinerary Summary</span>
                  <span className="font-mono uppercase">{transportMode}</span>
                </div>
                <div className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                  <span>{fromCity.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span>{toCity.name}</span>
                </div>
                <div className="text-xs text-slate-600">
                  {selectedRoute.operator} · {departureDate} ({selectedRoute.departureTime})
                </div>
              </div>

              {/* Price Transparency Breakdown (Tabular Numerals) */}
              <div className="space-y-2.5 text-xs">
                <div className="text-xs font-semibold text-slate-900">
                  Price Transparency Breakdown
                </div>

                <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                  <span>
                    Base Fare ({Math.max(1, selectedSeats.length)}{' '}
                    {selectedSeats.length === 1 ? 'Seat' : 'Seats'})
                  </span>
                  <span>₹{pricing.baseFareTotal.toLocaleString('en-IN')}</span>
                </div>

                {pricing.returnFareTotal > 0 && (
                  <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                    <span>Return Trip Base ({returnDate})</span>
                    <span>₹{pricing.returnFareTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {pricing.seatSurchargeTotal > 0 && (
                  <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                    <span>Berth / Window Surcharge</span>
                    <span>₹{pricing.seatSurchargeTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                  <span>GST & Terminal Taxes ({Math.round(selectedRoute.taxRate * 100)}%)</span>
                  <span>₹{pricing.taxes.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                  <span>Convenience Fee</span>
                  <span>₹{pricing.convenienceFee.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                  <span>
                    Meal Add-ons ({Object.values(mealQuantities).reduce((a, b) => a + b, 0)} boxes)
                  </span>
                  <span>₹{pricing.mealsTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                  <span>
                    Local Commute ({selectedLocalCommute ? selectedLocalCommute.vehicleModel.split(' ')[0] : 'None'})
                  </span>
                  <span>₹{pricing.localCommuteTotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Optional Insurance Toggle */}
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
                    ₹{pricing.insuranceTotal}
                  </span>
                </label>

                <div className="flex items-baseline justify-between pt-3 border-t border-slate-200">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Total Payable
                    </span>
                    <span className="text-[11px] text-slate-500">
                      All taxes & selected add-ons included
                    </span>
                  </div>
                  <span className="text-xl font-bold font-mono tabular-nums text-blue-700">
                    ₹{pricing.grandTotal.toLocaleString('en-IN')}
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
                      {toCity.name} Hotel / Drop Destination Address
                    </label>
                    <input
                      type="text"
                      value={dropHotelAddress}
                      onChange={(e) => setDropHotelAddress(e.target.value)}
                      placeholder="Enter hotel name or locality..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                )}

                {/* Payment Gateway Method Selector */}
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
                  Pay ₹{pricing.grandTotal.toLocaleString('en-IN')} & Generate Instant E-Ticket
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  Generates instant QR Boarding Pass + WhatsApp PNR alert + {toCity.name} Travel Guide
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
            Intercity Bus, Flight, Rail & Local Commute Ticketing Platform
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span>ISO 27001 Payment Security</span>
            <span>·</span>
            <span>IRCTC & IATA Authorized Aggregator</span>
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
    </div>
  );
}
