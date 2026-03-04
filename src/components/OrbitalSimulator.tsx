import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

// Try to import interfaces with a fallback
let ISSData, AsteroidData;
try {
  ({ ISSData, AsteroidData } = require('../../pages/Dashboard.tsx'));
  console.log('Successfully imported ISSData and AsteroidData from Dashboard.tsx');
} catch (error) {
  console.error('Failed to import from Dashboard.tsx:', error);
  // Fallback types if import fails
  ISSData = { latitude: 0, longitude: 0, altitude: 0, velocity: 0 };
  AsteroidData = { name: '', estimated_diameter: { meters: { estimated_diameter_min: 0, estimated_diameter_max: 0 } }, close_approach_data: [], is_potentially_hazardous: false };
}

extend({ ThreeOrbitControls });

// Earth radius in km
const EARTH_RADIUS = 6371;

// Function to convert lat, lon, alt to Cartesian coordinates
const geoToCartesian = (lat: number, lon: number, alt: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const radius = EARTH_RADIUS + alt;

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return { x, y, z };
};

// Suntimes function for sunrise/sunset
const suntimes = (lat: number, lng: number, tz?: number) => {
  const d = new Date();
  const radians = Math.PI / 180.0;
  const degrees = 180.0 / Math.PI;
  const a = Math.floor((14 - (d.getMonth() + 1.0)) / 12);
  const y = d.getFullYear() + 4800 - a;
  const m = (d.getMonth() + 1) + 12 * a - 3;
  const j_day = d.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const n_star = j_day - 2451545.0009 - lng / 360.0;
  const n = Math.floor(n_star + 0.5);
  const solar_noon = 2451545.0009 - lng / 360.0 + n;
  const M = 356.0470 + 0.9856002585 * n;
  const C = 1.9148 * Math.sin(M * radians) + 0.02 * Math.sin(2 * M * radians) + 0.0003 * Math.sin(3 * M * radians);
  const L = (M + 102.9372 + C + 180) % 360;
  const j_transit = solar_noon + 0.0053 * Math.sin(M * radians) - 0.0069 * Math.sin(2 * L * radians);
  const D = Math.asin(Math.sin(L * radians) * Math.sin(23.45 * radians)) * degrees;
  const cos_omega = (Math.sin(-0.83 * radians) - Math.sin(lat * radians) * Math.sin(D * radians)) / (Math.cos(lat * radians) * Math.cos(D * radians));
  if (cos_omega > 1) return [null, -1]; // sun never rises
  if (cos_omega < -1) return [-1, null]; // sun never sets
  const omega = Math.acos(cos_omega) * degrees;
  const j_set = j_transit + omega / 360.0;
  const j_rise = j_transit - omega / 360.0;
  const utc_time_set = 24 * (j_set - j_day) + 12;
  const utc_time_rise = 24 * (j_rise - j_day) + 12;
  const tz_offset = tz === undefined ? -1 * d.getTimezoneOffset() / 60 : tz;
  const local_rise = (utc_time_rise + tz_offset) % 24;
  const local_set = (utc_time_set + tz_offset) % 24;
  return [local_rise, local_set];
};

// Component for ISS Simulator
const ISSSimulator = ({ issData }: { issData: any }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.001;
    }
  });
  if (!issData) return <mesh><sphereGeometry args={[1, 32, 32]} /><meshStandardMaterial color="blue" /></mesh>; // Placeholder Earth
  const { x, y, z } = geoToCartesian(issData.latitude, issData.longitude, issData.altitude);

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1, 32, 32]} /> // Earth
      <meshStandardMaterial color="blue" />
      <mesh position={[x / EARTH_RADIUS, y / EARTH_RADIUS, z / EARTH_RADIUS]}> // Scaled ISS
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </mesh>
  );
};

// Component for Earth-Sun Sunrise/Sunset Simulation
const EarthSunSimulator = ({ issData }: { issData: any }) => {
  const [sunrise, sunset] = issData ? suntimes(issData.latitude, issData.longitude) : [null, null];
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.001; // Earth rotation
    }
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 32, 32]} /> // Earth
      <meshStandardMaterial color="green" />
      <pointLight position={[10, 0, 0]} intensity={1.5} /> // Sun
      // Display times
      <div style={{ position: 'absolute', top: 0, color: 'white' }}>
        Sunrise: {sunrise ? sunrise.toFixed(2) : 'N/A'} | Sunset: {sunset ? sunset.toFixed(2) : 'N/A'}
      </div>
    </mesh>
  );
};

// Component for Asteroid Simulator
const AsteroidSimulator = ({ asteroids }: { asteroids: any[] }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.001;
    }
  });
  const scale = 1e-6; // Scale large distances
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 32, 32]} /> // Earth
      <meshStandardMaterial color="blue" />
      {asteroids.map((asteroid: any, index: number) => {
        const distance = parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers) * scale;
        return (
          <mesh key={index} position={[distance, 0, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="red" />
          </mesh>
        );
      })}
    </mesh>
  );
};

// Main Orbital Simulator Component
const OrbitalSimulator = ({ issData, asteroids }: { issData: any; asteroids: any[] }) => {
  const [earthTexture] = useLoader(TextureLoader, ['/images/earth.jpg']);
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ISSSimulator issData={issData} />
        <EarthSunSimulator issData={issData} />
        <AsteroidSimulator asteroids={asteroids} />
        <orbitControls />
      </Canvas>
    </div>
  );
};

export default OrbitalSimulator;