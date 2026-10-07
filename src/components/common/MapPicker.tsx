import React, { useState } from 'react';
import { MapPin, Navigation, Crosshair, Check, Search } from 'lucide-react';
import { Button } from './Button';

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    formattedAddress?: string;
  }) => void;
}

const PRESET_ZONES = [
  { name: 'Indiranagar Hub', lat: 12.9716, lng: 77.5946 },
  { name: 'Koramangala 4th Block', lat: 12.9352, lng: 77.6245 },
  { name: 'HSR Sector 2', lat: 12.9116, lng: 77.6389 },
  { name: 'Whitefield Main', lat: 12.9698, lng: 77.7499 },
];

export const MapPicker: React.FC<MapPickerProps> = ({
  initialLat = 12.9716,
  initialLng = 77.5946,
  onLocationSelect,
}) => {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = parseFloat(pos.coords.latitude.toFixed(6));
        const newLng = parseFloat(pos.coords.longitude.toFixed(6));
        setLat(newLat);
        setLng(newLng);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('Could not retrieve current location. Using fallback location.');
      }
    );
  };

  const handleZoneSelect = (zone: { lat: number; lng: number; name: string }) => {
    setLat(zone.lat);
    setLng(zone.lng);
  };

  const handleConfirm = () => {
    onLocationSelect({
      lat,
      lng,
      formattedAddress: `Lat: ${lat}, Lng: ${lng} (Precision: High-accuracy Pin)`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Quick Presets */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search neighborhood or delivery landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Quick Delivery Zones:</span>
          {PRESET_ZONES.map((zone) => (
            <button
              key={zone.name}
              type="button"
              onClick={() => handleZoneSelect(zone)}
              className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Coordinate Canvas / Map Container */}
      <div className="relative w-full h-64 bg-slate-950 rounded-xl border border-slate-750 overflow-hidden shadow-inner flex flex-col justify-between p-4 group">
        {/* OpenStreetMap iframe visualization */}
        <iframe
          title="Interactive Location Map"
          className="absolute inset-0 w-full h-full opacity-70 filter contrast-125 saturate-50 pointer-events-none"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
          loading="lazy"
        />

        {/* Center Crosshair Target Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-10 w-10 rounded-full border border-brand-500/40 animate-ping" />
            <div className="bg-brand-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Top Controls Overlay */}
        <div className="relative z-20 flex items-center justify-between pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 font-mono shadow">
            GPS: <span className="text-brand-400 font-semibold">{lat}</span>,{' '}
            <span className="text-brand-400 font-semibold">{lng}</span>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGetCurrentLocation}
            isLoading={isLocating}
            icon={<Navigation className="h-3.5 w-3.5" />}
          >
            Detect My GPS
          </Button>
        </div>

        {/* Bottom Fine Adjustment Nudge Controls */}
        <div className="relative z-20 bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-750 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Crosshair className="h-3.5 w-3.5 text-brand-400" />
            <span>Nudge Pin:</span>
            <button
              type="button"
              onClick={() => setLat((l) => parseFloat((l + 0.0005).toFixed(6)))}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-mono"
            >
              ▲ N
            </button>
            <button
              type="button"
              onClick={() => setLat((l) => parseFloat((l - 0.0005).toFixed(6)))}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-mono"
            >
              ▼ S
            </button>
            <button
              type="button"
              onClick={() => setLng((g) => parseFloat((g - 0.0005).toFixed(6)))}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-mono"
            >
              ◀ W
            </button>
            <button
              type="button"
              onClick={() => setLng((g) => parseFloat((g + 0.0005).toFixed(6)))}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-mono"
            >
              ▶ E
            </button>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            icon={<Check className="h-3.5 w-3.5" />}
          >
            Lock Coordinates
          </Button>
        </div>
      </div>
    </div>
  );
};
