import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon in bundled apps
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const LOCATION = {
  lat: -20.4662348,
  lng: -54.5823688,
  address: 'Rua Dr. Oswaldo Arantes Filho, 127 - Chácara Cachoeira, Campo Grande - MS',
};

export default function Convite() {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`;

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Convite original */}
        <div className="rounded-lg overflow-hidden shadow-2xl border-4 border-amber-400/80 mb-8">
          <img
            src="/convite_66_anos.png"
            alt="Convite de aniversário de 66 anos de Sérgio Martins"
            className="w-full h-auto block"
          />
        </div>

        {/* Mapa interativo */}
        <div className="bg-slate-900 rounded-lg border-2 border-amber-400/50 p-4 md:p-6 shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <span className="h-px w-16 bg-amber-400/60" />
            <span className="mx-4 text-amber-300 text-xl font-serif">Localização Interativa</span>
            <span className="h-px w-16 bg-amber-400/60" />
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg mb-6 max-w-2xl mx-auto">
            <MapContainer
              center={[LOCATION.lat, LOCATION.lng]}
              zoom={16}
              scrollWheelZoom={false}
              style={{ height: '260px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[LOCATION.lat, LOCATION.lng]}>
                <Popup>{LOCATION.address}</Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="text-center">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3 px-6 rounded-full transition-colors shadow-lg"
            >
              <Navigation className="h-5 w-5" />
              Ir para o Google Maps
            </a>

            <p className="text-amber-100/70 text-sm mt-4 flex items-center justify-center gap-1">
              <MapPin className="h-4 w-4" />
              {LOCATION.address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
