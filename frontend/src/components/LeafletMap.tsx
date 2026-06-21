import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { ReactNode } from 'react';

export interface MapPoint {
  id: number | string;
  lat: number;
  lng: number;
  color?: string;
  radius?: number;
  label?: string;
  popup?: ReactNode;
}

export function LeafletMap({
  points,
  center = [6.8, 30.0],
  zoom = 6,
  height = 420,
}: {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  height?: number;
}) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: '100%', borderRadius: 16 }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points
        .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
        .map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={p.radius ?? 7}
            pathOptions={{ color: p.color || '#0B7A3E', fillColor: p.color || '#0B7A3E', fillOpacity: 0.6, weight: 1.5 }}
          >
            {p.label && <Tooltip>{p.label}</Tooltip>}
            {p.popup && <Popup>{p.popup}</Popup>}
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
