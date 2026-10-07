import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { MapPicker } from '../../components/common/MapPicker';
import { CreateAddressDTO } from '../../types';
import { MapPin, Building, Hash } from 'lucide-react';

interface AddressMapCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  customerName: string;
  onAddressSaved: (dto: CreateAddressDTO) => void;
}

export const AddressMapCaptureModal: React.FC<AddressMapCaptureModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  onAddressSaved,
}) => {
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560038');
  const [latitude, setLatitude] = useState<number>(12.9716);
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const [isDefault, setIsDefault] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim() || !pincode.trim()) {
      alert('Please fill in Address Line and Pincode.');
      return;
    }

    onAddressSaved({
      customer_id: customerId,
      address_line: addressLine.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      pincode: pincode.trim(),
      latitude,
      longitude,
      formatted_address: formattedAddress || `${addressLine}, ${city} - ${pincode}`,
      is_default: isDefault,
    });

    onClose();
  };

  const handleCoordinatesSelected = (loc: { lat: number; lng: number; formattedAddress?: string }) => {
    setLatitude(loc.lat);
    setLongitude(loc.lng);
    if (loc.formattedAddress) {
      setFormattedAddress(loc.formattedAddress);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Capture Delivery Address & GPS Coordinates"
      subtitle={`Adding delivery location for ${customerName}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Pin Geolocation Coordinates */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            1. Pin Precise Kitchen Delivery Coordinates (GPS / Lat-Lng)
          </label>
          <MapPicker
            initialLat={latitude}
            initialLng={longitude}
            onLocationSelect={handleCoordinatesSelected}
          />
        </div>

        {/* Step 2: Address Details */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300">
            2. Street & House Specifics
          </label>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Flat / House No. / Building / Street Address <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. Flat 304, Silver Oak Heights, 100ft Road"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nearby Landmark</label>
              <div className="relative">
                <Building className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opp. Metro Gate 2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Pincode</label>
              <div className="relative">
                <Hash className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="560038"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefaultAddr"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="isDefaultAddr" className="text-xs text-slate-300">
              Set as primary default address for customer orders
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={<MapPin className="h-4 w-4" />}>
            Save Delivery Address
          </Button>
        </div>
      </form>
    </Modal>
  );
};
