import { X } from 'lucide-react';
import { trackEvent } from '../services/analytics';
import googleLogo from '../assets/icons/google-maps.svg';
import appleLogo from '../assets/icons/apple-maps.svg';
import wazeLogo from '../assets/icons/waze.svg';

interface NavigationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  station: any;
  startPostcode?: string;
  endPostcode?: string;
}

export function NavigationBottomSheet({ isOpen, onClose, station, startPostcode, endPostcode }: NavigationBottomSheetProps) {
  if (!isOpen || !station) return null;

  // For multi-stop routing: Origin -> Station (Waypoint) -> Destination
  
  // Google Maps
  const getGoogleMapsUrl = () => {
    const waypoint = encodeURIComponent(`${station.brand}, ${station.address}`);
    
    // If we have both start and end, create a multi-stop route
    if (startPostcode && endPostcode) {
      const origin = encodeURIComponent(startPostcode);
      const destination = encodeURIComponent(endPostcode);
      // Use standard Google Maps URL format for waypoints
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoint}&travelmode=driving`;
    }
    
    // Fallback if missing postcodes
    return `https://www.google.com/maps/dir/?api=1&destination=${waypoint}&travelmode=driving`;
  };

  // Apple Maps
  const getAppleMapsUrl = () => {
    const waypoint = encodeURIComponent(`${station.brand}, ${station.address}`);
    
    // Apple Maps does not fully support multi-stop routing via simple URL schemes in all versions.
    // However, iOS 16+ supports it. Let's pass start, end, and daddr. 
    // Standard format: saddr (start) -> daddr (destination)
    if (startPostcode && endPostcode) {
        const origin = encodeURIComponent(startPostcode);
        // We'll map to the station first, as Apple Maps URL scheme is limited for true waypoints
        return `http://maps.apple.com/?saddr=${origin}&daddr=${waypoint}&dirflg=d`;
    }
    return `http://maps.apple.com/?daddr=${waypoint}&dirflg=d`;
  };

  // Waze
  const getWazeUrl = () => {
    const q = encodeURIComponent(`${station.brand}, ${station.address}`);
    // Waze deep links do not officially support multi-stop routing via URL.
    // It only supports a single destination.
    return `https://waze.com/ul?q=${q}&navigate=yes`;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 z-[110] backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[120] bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 shadow-2xl transform transition-transform duration-300 ease-out max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white">Navigate with</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <a
            href={getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { trackEvent('navigate_clicked', { provider: 'google_maps', stationBrand: station.brand }); onClose(); }}
            className="w-full flex items-center p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
          >
            <div className="w-10 h-10 bg-slate-950 rounded-lg flex items-center justify-center mr-4">
              <img src={googleLogo} alt="Google Maps" className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <div className="text-white font-bold">Google Maps</div>
              <div className="text-xs text-slate-400">Recommended for traffic</div>
            </div>
          </a>

          <a
            href={getAppleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { trackEvent('navigate_clicked', { provider: 'apple_maps', stationBrand: station.brand }); onClose(); }}
            className="w-full flex items-center p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
          >
            <div className="w-10 h-10 bg-slate-950 rounded-lg flex items-center justify-center mr-4">
              <img src={appleLogo} alt="Apple Maps" className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <div className="text-white font-bold">Apple Maps</div>
              <div className="text-xs text-slate-400">Default for iOS</div>
            </div>
          </a>

          <a
            href={getWazeUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { trackEvent('navigate_clicked', { provider: 'waze', stationBrand: station.brand }); onClose(); }}
            className="w-full flex items-center p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
          >
            <div className="w-10 h-10 bg-slate-950 rounded-lg flex items-center justify-center mr-4">
              <img src={wazeLogo} alt="Waze" className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <div className="text-white font-bold">Waze</div>
              <div className="text-xs text-slate-400">Community-driven alerts</div>
            </div>
          </a>
        </div>
      </div>
    </>
  );
}
