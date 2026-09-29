import React, { useState } from 'react';
import {
  Check,
  Download,
  Printer,
  Share2,
  X,
  ArrowRight,
  Navigation,
  PhoneCall,
} from 'lucide-react';
import { ConfirmedBooking, PUBLIC_TRANSIT_GUIDES } from '../data/transitData';

interface TicketModalProps {
  booking: ConfirmedBooking;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ booking, onClose }) => {
  const [whatsappResent, setWhatsappResent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const destinationGuide =
    PUBLIC_TRANSIT_GUIDES[booking.toCity.name] || PUBLIC_TRANSIT_GUIDES['Jaipur'];

  const handlePrintOrDownload = () => {
    window.print();
  };

  const handleDownloadTicketFile = () => {
    const lines = [
      `VAYUPATH OFFICIAL E-TICKET & DESTINATION COMMUTE GUIDE`,
      `======================================================`,
      `PNR Reference : ${booking.pnr}`,
      `Issued At     : ${booking.bookedAt}`,
      `Passenger     : ${booking.passengerContact.fullName} (${booking.passengerContact.phone})`,
      `Route         : ${booking.fromCity.name} (${booking.fromCity.code}) -> ${booking.toCity.name} (${booking.toCity.code})`,
      `Trip Type     : ${booking.tripType.toUpperCase()}`,
      `Departure     : ${booking.departureDate} at ${booking.selectedRoute.departureTime}`,
      `Operator      : ${booking.selectedRoute.operator} · ${booking.selectedRoute.serviceCode} (${booking.selectedRoute.vehicleType})`,
      `Assigned Seats: ${booking.selectedSeats.map((s) => `${s.label} (${s.position})`).join(', ')}`,
      ``,
      `PRE-BOOKED MEALS & PERSONALIZATION`,
      `----------------------------------`,
      booking.selectedMeals.length > 0
        ? booking.selectedMeals.map((m) => `- ${m.meal.name} (${m.meal.dietary}) x${m.quantity} : INR ${m.meal.price * m.quantity}`).join('\n')
        : `- No onboard meal boxes added`,
      ``,
      `ON-GROUND LOCAL TRANSPORT AT ${booking.toCity.name.toUpperCase()}`,
      `----------------------------------`,
      booking.selectedLocalCommute
        ? `- Confirmed: ${booking.selectedLocalCommute.title} (${booking.selectedLocalCommute.vehicleModel})\n  Pickup: ${booking.selectedLocalCommute.pickupPoint}\n  Drop Address: ${booking.passengerContact.dropHotelAddress || 'City Center Hotel'}`
        : `- Using Public Transit (${destinationGuide.metroNetwork.lines})`,
      ``,
      `PRICE TRANSPARENCY BREAKDOWN`,
      `----------------------------------`,
      `Base Fare (${booking.selectedSeats.length} Seats) : INR ${booking.pricing.baseFareTotal}`,
      booking.pricing.returnFareTotal > 0 ? `Return Trip Fare        : INR ${booking.pricing.returnFareTotal}` : null,
      booking.pricing.seatSurchargeTotal > 0 ? `Preferred Seat Surcharge: INR ${booking.pricing.seatSurchargeTotal}` : null,
      `Taxes & Highway/Air GST : INR ${booking.pricing.taxes}`,
      `Convenience Fee         : INR ${booking.pricing.convenienceFee}`,
      `Food & Meal Add-ons     : INR ${booking.pricing.mealsTotal}`,
      `Local Commute Add-on    : INR ${booking.pricing.localCommuteTotal}`,
      booking.pricing.insuranceTotal > 0 ? `Travel Delay Protection : INR ${booking.pricing.insuranceTotal}` : null,
      `TOTAL PAID (${booking.passengerContact.paymentMethod}) : INR ${booking.pricing.grandTotal}`,
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vayupath-ETicket-${booking.pnr}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResendWhatsapp = () => {
    setWhatsappResent(true);
    setTimeout(() => setWhatsappResent(false), 3500);
  };

  const handleCopyTracking = () => {
    navigator.clipboard?.writeText(`https://vayupath.transit/live/${booking.pnr}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Generate deterministic 7x7 QR matrix from PNR string
  const qrCells: boolean[] = [];
  for (let i = 0; i < 49; i++) {
    const charCode = booking.pnr.charCodeAt(i % booking.pnr.length);
    qrCells.push((charCode + i * 7) % 2 === 0);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-xl my-8 overflow-hidden">
        {/* Top Action Bar (Hidden when printing) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-slate-950">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </span>
            <span className="text-sm font-medium">
              Instant E-Ticket Generated · PNR <span className="font-mono font-semibold">{booking.pnr}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintOrDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={handleDownloadTicketFile}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Download E-Ticket Summary
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close E-Ticket"
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main E-Ticket Body */}
        <div className="p-6 md:p-8 space-y-8 max-h-[82vh] overflow-y-auto">
          {/* Primary Boarding Pass Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 border-b border-slate-200">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>Confirmed Boarding Pass · {booking.selectedRoute.operator}</span>
                <span>·</span>
                <span className="font-mono">Service {booking.selectedRoute.serviceCode}</span>
                <span>·</span>
                <span>Issued {booking.bookedAt}</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-4">
                <div>
                  <div className="text-2xl md:text-3xl font-bold font-display text-slate-900">
                    {booking.fromCity.name} ({booking.fromCity.code})
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {booking.mode === 'flight'
                      ? booking.fromCity.airportName
                      : booking.mode === 'train'
                      ? booking.fromCity.trainStation
                      : booking.fromCity.busTerminal}
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 self-center" />

                <div>
                  <div className="text-2xl md:text-3xl font-bold font-display text-slate-900">
                    {booking.toCity.name} ({booking.toCity.code})
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {booking.mode === 'flight'
                      ? booking.toCity.airportName
                      : booking.mode === 'train'
                      ? booking.toCity.trainStation
                      : booking.toCity.busTerminal}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block">Departure</span>
                  <span className="font-mono font-semibold text-slate-900 text-sm">
                    {booking.departureDate} · {booking.selectedRoute.departureTime}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Arrival</span>
                  <span className="font-mono font-semibold text-slate-900 text-sm">
                    {booking.selectedRoute.arrivalTime} ({booking.selectedRoute.duration})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Seat / Berth Numbers</span>
                  <span className="font-mono font-semibold text-blue-700 text-sm">
                    {booking.selectedSeats.map((s) => s.label).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Primary Passenger</span>
                  <span className="font-semibold text-slate-900 text-sm truncate block">
                    {booking.passengerContact.fullName}
                  </span>
                </div>
              </div>
            </div>

            {/* Fast Boarding QR Code Box */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
              <div className="p-3 bg-white border border-slate-300 rounded-lg">
                <svg
                  viewBox="0 0 90 90"
                  className="w-28 h-28 text-slate-900"
                  role="img"
                  aria-label={`Boarding QR Code for PNR ${booking.pnr}`}
                >
                  {/* Finder Patterns */}
                  <rect x="4" y="4" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="10" y="10" width="10" height="10" fill="currentColor" />
                  <rect x="64" y="4" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="70" y="10" width="10" height="10" fill="currentColor" />
                  <rect x="4" y="64" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="10" y="70" width="10" height="10" fill="currentColor" />
                  {/* Data Modules */}
                  {qrCells.map((filled, idx) => {
                    const r = Math.floor(idx / 7);
                    const c = idx % 7;
                    const x = 30 + c * 4.5;
                    const y = 30 + r * 4.5;
                    return filled ? (
                      <rect key={idx} x={x} y={y} width="3.8" height="3.8" fill="currentColor" />
                    ) : null;
                  })}
                </svg>
              </div>
              <div className="text-center mt-2">
                <div className="font-mono text-xs font-semibold text-slate-900">
                  PNR: {booking.pnr}
                </div>
                <div className="text-[11px] text-slate-500">
                  Scan at terminal gate for fast check-in
                </div>
              </div>
            </div>
          </div>

          {/* Mobile WhatsApp & SMS Alert Dispatch + Price Transparency Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-slate-200">
            {/* WhatsApp & SMS Live Alert Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  Mobile Alerts (WhatsApp & SMS Dispatched)
                </h4>
                <button
                  type="button"
                  onClick={handleResendWhatsapp}
                  className="no-print text-xs font-medium text-blue-700 hover:underline whitespace-nowrap"
                >
                  {whatsappResent ? 'Sent Again ✓' : 'Resend to WhatsApp'}
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-500 border-b border-slate-200/70 pb-2">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Business · {booking.passengerContact.phone}
                  </span>
                  <span className="font-mono text-[11px]">Delivered</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Vayupath Confirmed [{booking.pnr}]:</strong> Hi {booking.passengerContact.fullName}, your{' '}
                  {booking.selectedRoute.operator} seat(s){' '}
                  <span className="font-mono font-semibold">
                    {booking.selectedSeats.map((s) => s.label).join(', ')}
                  </span>{' '}
                  from {booking.fromCity.name} to {booking.toCity.name} on {booking.departureDate} ({booking.selectedRoute.departureTime}) are confirmed.
                </p>
                {booking.selectedLocalCommute && (
                  <p className="text-slate-700 leading-relaxed">
                    <strong>Arrival Commute Linked:</strong> {booking.selectedLocalCommute.title} waiting at{' '}
                    {booking.selectedLocalCommute.pickupPoint}.
                  </p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[11px] text-blue-700">
                    Live GPS Link: vayupath.transit/live/{booking.pnr}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTracking}
                    className="no-print inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-950"
                  >
                    <Share2 className="w-3 h-3" />
                    {copiedLink ? 'Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>

            {/* Itemized Price Receipt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  Itemized Price Transparency Receipt
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  Paid via {booking.passengerContact.paymentMethod}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono tabular-nums">
                <div className="flex justify-between text-slate-600">
                  <span>Base Fare ({booking.selectedSeats.length} Seat/Berth)</span>
                  <span>₹{booking.pricing.baseFareTotal.toLocaleString('en-IN')}</span>
                </div>
                {booking.pricing.returnFareTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Return Journey Base Fare</span>
                    <span>₹{booking.pricing.returnFareTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {booking.pricing.seatSurchargeTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Window / Lower Berth Preference</span>
                    <span>₹{booking.pricing.seatSurchargeTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST & Terminal Taxes</span>
                  <span>₹{booking.pricing.taxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Convenience Fee</span>
                  <span>₹{booking.pricing.convenienceFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pre-Booked Meals ({booking.selectedMeals.reduce((a, b) => a + b.quantity, 0)} items)</span>
                  <span>₹{booking.pricing.mealsTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>On-Ground Local Commute Add-on</span>
                  <span>₹{booking.pricing.localCommuteTotal.toLocaleString('en-IN')}</span>
                </div>
                {booking.pricing.insuranceTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Trip Delay & Baggage Protection</span>
                    <span>₹{booking.pricing.insuranceTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-semibold text-slate-900">
                  <span>Total Amount Paid</span>
                  <span>₹{booking.pricing.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Destination Local Travel & Food Companion Guide */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-700" />
                {booking.toCity.name} Arrival Commute & Curated Dining Guide
              </h4>
              <span className="text-xs text-slate-500">
                Bundled with your E-Ticket for offline access
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900">
                  Metro & Rail Transit
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {destinationGuide.metroNetwork.lines} · {destinationGuide.metroNetwork.stationConnect}
                </p>
                <p className="font-mono text-[11px] text-slate-500">
                  Fare: {destinationGuide.metroNetwork.fareRange}
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">
                  Prepaid Auto & Cab Tariff
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {destinationGuide.rickshawAndPrepaid.baseFare} · {destinationGuide.rickshawAndPrepaid.perKmRate}
                </p>
                <p className="text-slate-500">
                  {destinationGuide.rickshawAndPrepaid.stationCounterTip}
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">
                  Saved Destination Food Stops
                </div>
                {booking.savedFoodSpots.length > 0 ? (
                  <ul className="space-y-1 text-slate-600">
                    {booking.savedFoodSpots.map((spot) => (
                      <li key={spot.id}>
                        <strong className="text-slate-800">{spot.name}</strong> ({spot.distanceFromHub}) — {spot.signatureDish}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600 leading-relaxed">
                    Top nearby pick: Johari Bazaar Heritage Thali & Masala Chowk Courtyard (2.8 km from terminal).
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
