import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CAVSU = [14.4791, 120.8980]

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng) })
  return null
}

export default function MapPicker({ value, onChange, readOnly = false }) {
  const pos = value?.lat ? [value.lat, value.lng] : CAVSU

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 h-56">
      <MapContainer center={pos} zoom={16} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
        {!readOnly && <ClickHandler onPick={(latlng) => onChange({ lat: latlng.lat, lng: latlng.lng })} />}
        {value?.lat && <Marker position={[value.lat, value.lng]} />}
      </MapContainer>
    </div>
  )
}
