import React, { useState } from 'react';
import { Check, Lock, Compass } from 'lucide-react';
import { SeatItem, TransitOption, CurrencyCode, formatCurrency } from '../data/transitData';

interface SeatMapSelectorProps {
  option: TransitOption;
  seats: SeatItem[];
  selectedSeats: SeatItem[];
  maxSeats: number;
  currency?: CurrencyCode;
  onToggleSeat: (seat: SeatItem) => void;
}

export const SeatMapSelector: React.FC<SeatMapSelectorProps> = ({
  option,
  seats,
  selectedSeats,
  maxSeats,
  currency = 'INR',
  onToggleSeat,
}) => {
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');
  const isSleeperBus = option.berthConfig === 'sleeper-bus';

  const visibleSeats = isSleeperBus
    ? seats.filter((s) => s.deck === activeDeck)
    : seats;

  const rows = Array.from(new Set(visibleSeats.map((s) => s.row))).sort((a, b) => a - b);

  const isSeatSelected = (id: string) => selectedSeats.some((s) => s.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Real-Time {isSleeperBus ? 'Berth & Sleeper Deck' : 'Cabin Seat'} Layout
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select up to {maxSeats} {maxSeats === 1 ? 'seat' : 'seats'} ({selectedSeats.length} of {maxSeats} selected) · {option.vehicleType}
          </p>
        </div>

        {isSleeperBus && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveDeck('lower')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeDeck === 'lower'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lower Deck (Berths L1–L5)
            </button>
            <button
              type="button"
              onClick={() => setActiveDeck('upper')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeDeck === 'upper'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upper Deck (Berths U1–U5)
            </button>
          </div>
        )}
      </div>

      {/* Accessible Legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-slate-300 bg-white font-mono text-[10px] text-slate-700">
            1A
          </span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-700 text-white">
            <Check className="w-3 h-3" />
          </span>
          <span>Selected by You</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-rose-300 bg-rose-50/60 font-mono text-[10px] text-rose-800">
            W
          </span>
          <span>Women Friendly [W]</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 border border-slate-200 text-slate-400">
            <Lock className="w-3 h-3" />
          </span>
          <span>Booked / Occupied</span>
        </div>
      </div>

      {/* Interactive Deck / Cabin Canvas */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-5">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-5 text-xs text-slate-500">
          <span className="font-mono uppercase tracking-wider text-slate-600">
            {isSleeperBus
              ? `Front · Entry Door (${activeDeck === 'lower' ? 'Lower Deck' : 'Upper Deck'})`
              : 'Forward Cabin · Boarding Door 1L'}
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            {isSleeperBus ? 'Driver Cockpit Right' : 'Direction of Travel ↑'}
          </span>
        </div>

        {isSleeperBus ? (
          <div className="grid grid-cols-12 gap-2 mb-3 text-[11px] font-mono text-slate-500">
            <div className="col-span-4 text-center">Single Window (A)</div>
            <div className="col-span-2 text-center">Aisle</div>
            <div className="col-span-3 text-center">Inner Berth (B)</div>
            <div className="col-span-3 text-center">Window Berth (C)</div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 mb-3 text-[11px] font-mono text-slate-500 text-center">
            <div>A · Win</div>
            <div>B · Mid</div>
            <div>C · Aisle</div>
            <div>Walkway</div>
            <div>D · Aisle</div>
            <div>E · Mid</div>
            <div>F · Win</div>
          </div>
        )}

        <div className="space-y-2.5">
          {rows.map((rowNum) => {
            const rowSeats = visibleSeats
              .filter((s) => s.row === rowNum)
              .sort((a, b) => a.col - b.col);

            if (isSleeperBus) {
              const singleSeat = rowSeats.find((s) => s.col === 1);
              const innerSeat = rowSeats.find((s) => s.col === 2);
              const windowSeat = rowSeats.find((s) => s.col === 3);

              return (
                <div key={rowNum} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    {singleSeat && (
                      <SeatButton
                        seat={singleSeat}
                        selected={isSeatSelected(singleSeat.id)}
                        isSleeper
                        baseFare={option.baseFare}
                        currency={currency}
                        onSelect={() => onToggleSeat(singleSeat)}
                      />
                    )}
                  </div>
                  <div className="col-span-2 text-center font-mono text-[11px] text-slate-400">
                    Row {rowNum}
                  </div>
                  <div className="col-span-3">
                    {innerSeat && (
                      <SeatButton
                        seat={innerSeat}
                        selected={isSeatSelected(innerSeat.id)}
                        isSleeper
                        baseFare={option.baseFare}
                        currency={currency}
                        onSelect={() => onToggleSeat(innerSeat)}
                      />
                    )}
                  </div>
                  <div className="col-span-3">
                    {windowSeat && (
                      <SeatButton
                        seat={windowSeat}
                        selected={isSeatSelected(windowSeat.id)}
                        isSleeper
                        baseFare={option.baseFare}
                        currency={currency}
                        onSelect={() => onToggleSeat(windowSeat)}
                      />
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={rowNum} className="grid grid-cols-7 gap-2 items-center">
                {rowSeats.slice(0, 3).map((seat) => (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    selected={isSeatSelected(seat.id)}
                    isSleeper={false}
                    baseFare={option.baseFare}
                    currency={currency}
                    onSelect={() => onToggleSeat(seat)}
                  />
                ))}
                <div className="text-center font-mono text-[11px] text-slate-400">
                  R{rowNum}
                </div>
                {rowSeats.slice(3, 6).map((seat) => (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    selected={isSeatSelected(seat.id)}
                    isSleeper={false}
                    baseFare={option.baseFare}
                    currency={currency}
                    onSelect={() => onToggleSeat(seat)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-600">
        <div>
          <span className="font-medium text-slate-900">Selected Seats: </span>
          {selectedSeats.length === 0 ? (
            <span className="text-slate-500">Click any available berth or seat above to assign passengers</span>
          ) : (
            <span className="font-mono text-slate-800">
              {selectedSeats.map((s) => `${s.label} (${s.position})`).join(' · ')}
            </span>
          )}
        </div>
        <div className="font-mono tabular-nums text-slate-900 font-medium">
          Seat Subtotal:{' '}
          {formatCurrency(
            selectedSeats.reduce((acc, s) => acc + option.baseFare + s.surcharge, 0),
            currency
          )}
        </div>
      </div>
    </div>
  );
};

interface SeatButtonProps {
  seat: SeatItem;
  selected: boolean;
  isSleeper: boolean;
  baseFare: number;
  currency: CurrencyCode;
  onSelect: () => void;
}

const SeatButton: React.FC<SeatButtonProps> = ({
  seat,
  selected,
  isSleeper,
  baseFare,
  currency,
  onSelect,
}) => {
  const isBooked = seat.status === 'booked';
  const isLadies = seat.status === 'ladies-available';
  const totalSeatPrice = baseFare + seat.surcharge;

  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={onSelect}
      title={`${seat.label} · ${seat.position} · ${formatCurrency(totalSeatPrice, currency)}`}
      className={`w-full flex flex-col items-center justify-between rounded-lg border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
        isSleeper ? 'px-2.5 py-2.5 min-h-[60px]' : 'px-1.5 py-2 min-h-[48px]'
      } ${
        isBooked
          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
          : selected
          ? 'bg-blue-700 border-blue-700 text-white shadow-xs'
          : isLadies
          ? 'bg-rose-50/50 border-rose-300 text-slate-900 hover:border-rose-500'
          : 'bg-white border-slate-300 text-slate-900 hover:border-blue-600'
      }`}
    >
      <div className="w-full flex items-center justify-between gap-1">
        <span className="font-mono text-xs font-semibold leading-none">
          {seat.label}
        </span>
        {isBooked ? (
          <Lock className="w-3 h-3 shrink-0 opacity-70" />
        ) : selected ? (
          <Check className="w-3.5 h-3.5 shrink-0" />
        ) : isLadies ? (
          <span className="font-mono text-[10px] text-rose-700 font-semibold">[W]</span>
        ) : null}
      </div>

      <div className="w-full flex items-center justify-between mt-1.5 text-[10px] font-mono tabular-nums opacity-85">
        <span className="truncate">{isSleeper ? seat.position.replace('Single ', '') : seat.position.slice(0, 3)}</span>
        <span>{isBooked ? 'Sold' : formatCurrency(totalSeatPrice, currency)}</span>
      </div>
    </button>
  );
};
