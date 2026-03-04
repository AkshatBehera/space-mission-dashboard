import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface ISSData {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
}

interface MapComponentProps {
  issData: ISSData | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ issData }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: true
    });

    // Add dark tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !issData) return;

    const { latitude, longitude, altitude, velocity } = issData;

    // Create custom ISS icon
    const issIcon = L.divIcon({
      className: 'iss-marker',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background: #fff;
          border: 2px solid #000;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
          animation: pulse 2s infinite;
        "></div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Add new marker
    const marker = L.marker([latitude, longitude], { icon: issIcon })
      .addTo(mapInstanceRef.current);

    // Create popup with ISS data
    const popupContent = `
      <div style="color: #000; font-family: 'Instrument Serif', serif;">
        <h3 style="margin: 0 0 10px 0; color: #000;">International Space Station</h3>
        <p style="margin: 5px 0;"><strong>Latitude:</strong> ${latitude.toFixed(4)}°</p>
        <p style="margin: 5px 0;"><strong>Longitude:</strong> ${longitude.toFixed(4)}°</p>
        <p style="margin: 5px 0;"><strong>Altitude:</strong> ${altitude.toFixed(2)} km</p>
        <p style="margin: 5px 0;"><strong>Velocity:</strong> ${velocity.toFixed(2)} km/h</p>
      </div>
    `;

    marker.bindPopup(popupContent);
    markerRef.current = marker;

    // Center map on ISS position
    mapInstanceRef.current.setView([latitude, longitude], 3);

  }, [issData]);

  return (
    <div className="map-container" ref={mapRef}>
      {!issData && (
        <div className="loading">
          <div className="spinner"></div>
          Loading ISS position...
        </div>
      )}
    </div>
  );
};

export default MapComponent;
