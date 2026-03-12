import { useState, useEffect, useRef, useCallback } from 'react';
import MapComponent from '../components/MapComponent';
import StatsTable from '../components/StatsTable';
import VideoPlayer from '../components/VideoPlayer';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: Element | null) => void;
      };
    };
  }
}

interface ISSData {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
}

interface AsteroidData {
  name: string;
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  close_approach_data: Array<{
    close_approach_date: string;
    miss_distance: {
      kilometers: string;
    };
    relative_velocity: {
      kilometers_per_hour: string;
    };
  }>;
  is_potentially_hazardous: boolean;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

const formatDecimalTime = (decimalHours: number | null): string => {
  if (decimalHours === null || decimalHours < 0) return 'N/A';
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
};

const generateStars = (count: number, w: number, h: number): Star[] =>
  Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.7 + 0.3,
  }));

const Dashboard = () => {
  const [issData, setIssData] = useState<ISSData | null>(null);
  const [asteroids, setAsteroids] = useState<AsteroidData[]>([]);
  const [loading, setLoading] = useState({ iss: true, asteroids: true });
  const [twitterLoaded, setTwitterLoaded] = useState(false);
  const [twitterFailed, setTwitterFailed] = useState(false);
  const [sunriseTime, setSunriseTime] = useState<number | null>(null);
  const [sunsetTime, setSunsetTime] = useState<number | null>(null);
  const [localTime, setLocalTime] = useState<string>('');
  const [localDate, setLocalDate] = useState<string>('');
  const [localHourDecimal, setLocalHourDecimal] = useState<number>(0);
  const earthSunCanvasRef = useRef<HTMLCanvasElement>(null);
  const solarSystemCanvasRef = useRef<HTMLCanvasElement>(null);
  const earthSunStarsRef = useRef<Star[]>([]);
  const solarStarsRef = useRef<Star[]>([]);
  const twitterContainerRef = useRef<HTMLDivElement>(null);

  // ---------- Data Fetching ----------
  const fetchISSData = async () => {
    try {
      const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setIssData({
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        velocity: data.velocity,
      });
    } catch (error) {
      console.error('Error fetching ISS data:', error);
    } finally {
      setLoading(prev => ({ ...prev, iss: false }));
    }
  };

  const fetchAsteroidData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      const endDateStr = endDate.toISOString().split('T')[0];
      const response = await fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${endDateStr}&api_key=49MKlLPHhOYvqnMiDWWFbtSsRyeWW5ob6FpQGDrk`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.near_earth_objects) {
        const all = (Object.values(data.near_earth_objects).flat() as AsteroidData[]).sort((a, b) => {
          const dA = Math.min(...a.close_approach_data.map(d => parseFloat(d.miss_distance.kilometers)));
          const dB = Math.min(...b.close_approach_data.map(d => parseFloat(d.miss_distance.kilometers)));
          return dA - dB;
        });
        setAsteroids(all);
      }
    } catch (error) {
      console.error('Error fetching asteroid data:', error);
    } finally {
      setLoading(prev => ({ ...prev, asteroids: false }));
    }
  };

  useEffect(() => {
    fetchISSData();
    fetchAsteroidData();
    const interval = setInterval(() => { fetchISSData(); fetchAsteroidData(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ---------- Twitter / X Widget Loader ----------
  useEffect(() => {
    let pollId: ReturnType<typeof setInterval>;
    let failTimeout: ReturnType<typeof setTimeout>;

    const tryLoad = () => {
      if (window.twttr?.widgets?.load && twitterContainerRef.current) {
        window.twttr.widgets.load(twitterContainerRef.current);
        return true;
      }
      return false;
    };

    // Check if embeds actually rendered (the <a> tags get replaced by <iframe>)
    const checkRendered = () => {
      const container = twitterContainerRef.current;
      if (!container) return false;
      const iframes = container.querySelectorAll('iframe.twitter-timeline');
      return iframes.length > 0;
    };

    tryLoad();
    pollId = setInterval(() => {
      tryLoad();
      if (checkRendered()) {
        setTwitterLoaded(true);
        clearInterval(pollId);
        clearTimeout(failTimeout);
      }
    }, 2000);

    // After 10s, if still not rendered, show fallback
    failTimeout = setTimeout(() => {
      clearInterval(pollId);
      if (!checkRendered()) {
        setTwitterFailed(true);
      } else {
        setTwitterLoaded(true);
      }
    }, 10000);

    return () => { clearInterval(pollId); clearTimeout(failTimeout); };
  }, []);

  // ---------- Sunrise / Sunset ----------
  const topCities = [
    { name: 'New York', lat: 40.7128, lng: -74.006, tz: -4, tzAbbr: 'EDT' },
    { name: 'London', lat: 51.5074, lng: -0.1278, tz: 0, tzAbbr: 'GMT' },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, tz: 9, tzAbbr: 'JST' },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, tz: 1, tzAbbr: 'CET' },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, tz: 10, tzAbbr: 'AEST' },
    { name: 'Beijing', lat: 39.9042, lng: 116.4074, tz: 8, tzAbbr: 'CST' },
    { name: 'Dubai', lat: 25.276987, lng: 55.296249, tz: 4, tzAbbr: 'GST' },
    { name: 'Mumbai', lat: 19.076, lng: 72.8777, tz: 5.5, tzAbbr: 'IST' },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, tz: -3, tzAbbr: 'BRT' },
    { name: 'Moscow', lat: 55.7558, lng: 37.6173, tz: 3, tzAbbr: 'MSK' },
  ];
  const [selectedCity, setSelectedCity] = useState(topCities[0]);

  const suntimes = useCallback((lat: number, lng: number, tz: number) => {
    const d = new Date();
    const rad = Math.PI / 180, deg = 180 / Math.PI;
    const a = Math.floor((14 - (d.getMonth() + 1)) / 12);
    const y = d.getFullYear() + 4800 - a;
    const m = d.getMonth() + 1 + 12 * a - 3;
    const jDay = d.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    const nStar = jDay - 2451545.0009 - lng / 360;
    const n = Math.floor(nStar + 0.5);
    const solarNoon = 2451545.0009 - lng / 360 + n;
    const M = 356.047 + 0.9856002585 * n;
    const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    const L = (M + 102.9372 + C + 180) % 360;
    const jTransit = solarNoon + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * L * rad);
    const D = Math.asin(Math.sin(L * rad) * Math.sin(23.45 * rad)) * deg;
    const cosOmega = (Math.sin(-0.83 * rad) - Math.sin(lat * rad) * Math.sin(D * rad)) / (Math.cos(lat * rad) * Math.cos(D * rad));
    if (cosOmega > 1) return [null, -1];
    if (cosOmega < -1) return [-1, null];
    const omega = Math.acos(cosOmega) * deg;
    const jSet = jTransit + omega / 360;
    const jRise = jTransit - omega / 360;
    const rise = ((24 * (jRise - jDay) + 12) + tz) % 24;
    const set = ((24 * (jSet - jDay) + 12) + tz) % 24;
    return [rise, set];
  }, []);

  useEffect(() => {
    const [rise, set] = suntimes(selectedCity.lat, selectedCity.lng, selectedCity.tz);
    setSunriseTime(rise);
    setSunsetTime(set);
  }, [selectedCity, suntimes]);

  // ---------- Real-time clock for selected city ----------
  useEffect(() => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const updateLocalTime = () => {
      // Get current UTC time in milliseconds (getTime() already returns UTC)
      const now = new Date();
      const utcMillis = now.getTime();
      
      // Apply timezone offset (convert hours to milliseconds)
      const localMillis = utcMillis + (selectedCity.tz * 3600000);
      const localDate = new Date(localMillis);
      
      // Format time as 12-hour with AM/PM
      const hours = localDate.getUTCHours();
      const minutes = localDate.getUTCMinutes();
      const seconds = localDate.getUTCSeconds();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const formattedTime = `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period} ${selectedCity.tzAbbr}`;
      
      // Calculate decimal hour (for sun position animation)
      const decimalHour = hours + minutes / 60 + seconds / 3600;
      
      // Format date as "DD MonthName YYYY"
      const day = localDate.getUTCDate();
      const month = monthNames[localDate.getUTCMonth()];
      const year = localDate.getUTCFullYear();
      const formattedDate = `${day.toString().padStart(2, '0')} ${month} ${year}`;
      
      setLocalTime(formattedTime);
      setLocalDate(formattedDate);
      setLocalHourDecimal(decimalHour);
    };
    
    // Update immediately
    updateLocalTime();
    
    // Then update every second
    const intervalId = setInterval(updateLocalTime, 1000);
    
    // Cleanup: stop the timer when component unmounts or selectedCity changes
    return () => clearInterval(intervalId);
  }, [selectedCity]);

  // ---------- Earth-Sun Simulation ----------
  useEffect(() => {
    const canvas = earthSunCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = Math.min(400, w * 0.6);
      canvas.width = w;
      canvas.height = h;
      earthSunStarsRef.current = generateStars(150, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      ctx.fillStyle = '#030014';
      ctx.fillRect(0, 0, w, h);

      // Static stars
      earthSunStarsRef.current.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.fill();
      });

      // Sun glow
      ctx.save();
      ctx.shadowColor = '#FDB813';
      ctx.shadowBlur = 50;
      const sunR = Math.min(w, h) * 0.1;
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR);
      sg.addColorStop(0, '#FFFBE6');
      sg.addColorStop(0.3, '#FFE066');
      sg.addColorStop(0.7, '#FDB813');
      sg.addColorStop(1, '#F97316');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
      ctx.fill();
      // corona
      const cg = ctx.createRadialGradient(cx, cy, sunR, cx, cy, sunR * 1.8);
      cg.addColorStop(0, 'rgba(253,184,19,0.25)');
      cg.addColorStop(1, 'rgba(253,184,19,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Orbit path
      const orbitR = Math.min(w, h) * 0.35;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Earth
      const angle = Date.now() / 6000;
      const ex = cx + orbitR * Math.cos(angle);
      const ey = cy + orbitR * Math.sin(angle);
      const earthR = Math.min(w, h) * 0.04;
      ctx.save();
      ctx.shadowColor = '#60A5FA';
      ctx.shadowBlur = 20;
      const eg = ctx.createRadialGradient(ex - 2, ey - 2, 0, ex, ey, earthR);
      eg.addColorStop(0, '#93C5FD');
      eg.addColorStop(0.4, '#3B82F6');
      eg.addColorStop(0.8, '#1E40AF');
      eg.addColorStop(1, '#1E3A5F');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(ex, ey, earthR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Moon
      const moonAngle = Date.now() / 1200;
      const moonDist = earthR * 2.5;
      const mx = ex + moonDist * Math.cos(moonAngle);
      const my = ey + moonDist * Math.sin(moonAngle);
      ctx.fillStyle = '#D1D5DB';
      ctx.beginPath();
      ctx.arc(mx, my, earthR * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = '#FFE066';
      ctx.font = `bold ${Math.max(11, w * 0.015)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Sun', cx, cy + sunR + 18);
      ctx.fillStyle = '#93C5FD';
      ctx.fillText('Earth', ex, ey + earthR + 16);

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  // ---------- Solar System Simulation ----------
  useEffect(() => {
    const canvas = solarSystemCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const planets = [
      { name: 'Mercury', orbitFrac: 0.12, speed: 0.025, sizeFrac: 0.006, color: '#B5B8B1', glow: '#B5B8B1' },
      { name: 'Venus', orbitFrac: 0.19, speed: 0.018, color: '#E8CDA0', sizeFrac: 0.009, glow: '#E8CDA0' },
      { name: 'Earth', orbitFrac: 0.27, speed: 0.012, color: '#3B82F6', sizeFrac: 0.01, glow: '#60A5FA' },
      { name: 'Mars', orbitFrac: 0.34, speed: 0.009, color: '#C1440E', sizeFrac: 0.007, glow: '#EF4444' },
      { name: 'Jupiter', orbitFrac: 0.47, speed: 0.005, color: '#C88B3A', sizeFrac: 0.022, glow: '#F59E0B' },
      { name: 'Saturn', orbitFrac: 0.59, speed: 0.004, color: '#EAD6B8', sizeFrac: 0.019, glow: '#FDE68A', hasRing: true },
      { name: 'Uranus', orbitFrac: 0.73, speed: 0.003, color: '#67E8F9', sizeFrac: 0.014, glow: '#22D3EE' },
      { name: 'Neptune', orbitFrac: 0.87, speed: 0.002, color: '#6366F1', sizeFrac: 0.013, glow: '#818CF8' },
    ];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = Math.min(550, w * 0.75);
      canvas.width = w;
      canvas.height = h;
      solarStarsRef.current = generateStars(200, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const maxR = Math.min(w, h) / 2 - 20;

      ctx.fillStyle = '#030014';
      ctx.fillRect(0, 0, w, h);

      // Stars
      solarStarsRef.current.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.fill();
      });

      // Sun
      const sunR = maxR * 0.08;
      ctx.save();
      ctx.shadowColor = '#FDB813';
      ctx.shadowBlur = 40;
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR);
      sg.addColorStop(0, '#FFFBE6');
      sg.addColorStop(0.4, '#FFE066');
      sg.addColorStop(0.8, '#FDB813');
      sg.addColorStop(1, '#F97316');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // corona
      const cg = ctx.createRadialGradient(cx, cy, sunR, cx, cy, sunR * 2);
      cg.addColorStop(0, 'rgba(253,184,19,0.18)');
      cg.addColorStop(1, 'rgba(253,184,19,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orbits & Planets
      planets.forEach(p => {
        const orbitR = maxR * p.orbitFrac;
        const pSize = Math.max(3, maxR * p.sizeFrac);

        // Orbit ring
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Planet
        const angle = Date.now() * p.speed / 1000;
        const px = cx + orbitR * Math.cos(angle);
        const py = cy + orbitR * Math.sin(angle);

        ctx.save();
        ctx.shadowColor = p.glow;
        ctx.shadowBlur = pSize * 1.5;
        const pg = ctx.createRadialGradient(px - pSize * 0.2, py - pSize * 0.2, 0, px, py, pSize);
        pg.addColorStop(0, '#fff');
        pg.addColorStop(0.3, p.color);
        pg.addColorStop(1, p.color);
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Saturn ring
        if (p.hasRing) {
          ctx.save();
          ctx.strokeStyle = 'rgba(253,230,138,0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(px, py, pSize * 2, pSize * 0.6, 0.4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = `${Math.max(9, maxR * 0.03)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.name, px, py - pSize - 6);
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  // ---------- Sunrise progress (visual arc) ----------
  const sunInfo = (() => {
    if (sunriseTime === null || sunsetTime === null || sunriseTime < 0 || sunsetTime < 0) {
      return { isDaytime: false, progress: 0 };
    }
    
    // Use the selected city's local time (not your computer's time)
    const currentHour = localHourDecimal;
    const dayLen = sunsetTime - sunriseTime;
    if (dayLen <= 0) return { isDaytime: false, progress: 0 };
    
    // Check if it's daytime (between sunrise and sunset)
    if (currentHour >= sunriseTime && currentHour <= sunsetTime) {
      // Daytime: calculate sun position along arc
      const progress = Math.max(0, Math.min(1, (currentHour - sunriseTime) / dayLen));
      return { isDaytime: true, progress };
    } else {
      // Nighttime: calculate moon position along inverted arc
      const nightLen = 24 - dayLen;
      let progress = 0;
      
      if (currentHour < sunriseTime) {
        // Pre-dawn: hours from midnight to sunrise
        const hoursSinceMidnight = currentHour + 24; // adjust if needed
        const hoursUntilSunrise = sunriseTime - currentHour;
        progress = 1 - (hoursUntilSunrise / nightLen);
      } else {
        // After sunset: hours from sunset
        const hoursAfterSunset = currentHour - sunsetTime;
        progress = hoursAfterSunset / nightLen;
      }
      
      return { isDaytime: false, progress: Math.max(0, Math.min(1, progress)) };
    }
  })();

  return (
    <div className="container">
      <h1 className="dashboard-title">
        CosmicX <span>Dashboard</span>
      </h1>

      {/* ISS Live Position */}
      <section className="card">
        <div className="card-header"><i className="fas fa-satellite"></i> ISS Live Position</div>
        <MapComponent issData={issData} />
      </section>

      {/* Statistics */}
      <section className="card">
        <div className="card-header"><i className="fas fa-chart-bar"></i> Statistics</div>
        <StatsTable issData={issData} asteroids={asteroids} loading={loading} />
      </section>

      {/* Live Space Feed */}
      <section className="card">
        <div className="card-header"><i className="fas fa-video"></i> Live Space Feed</div>
        <VideoPlayer />
      </section>

      {/* Sunrise & Sunset */}
      <section className="card sun-times-card">
        <div className="card-header"><i className="fas fa-sun"></i> Sunrise & Sunset</div>
        <div className="sun-times-controls">
          <select
            value={selectedCity.name}
            onChange={e => setSelectedCity(topCities.find(c => c.name === e.target.value) || topCities[0])}
            className="select-city"
          >
            {topCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Sun arc visual */}
        <div className="sun-arc-container">
          <svg viewBox="0 0 300 280" className="sun-arc-svg">
            <defs>
              <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
              <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E0E7FF" />
                <stop offset="100%" stopColor="#A5B4FC" />
              </linearGradient>
            </defs>
            {/* horizon */}
            <line x1="20" y1="140" x2="280" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            {/* Sun arc path - top half (daytime) */}
            <path d="M 30 140 Q 150 20 270 140" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
            {/* Moon arc path - bottom half (nighttime) */}
            <path d="M 30 140 Q 150 260 270 140" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
            
            {/* Daytime: Show sun following the arc */}
            {sunInfo.isDaytime && (() => {
              const t = sunInfo.progress;
              const cx = 30 + 240 * t;
              const cy = 140 - 240 * t * (1 - t);
              return (
                <>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="url(#sunGrad)"
                    filter="drop-shadow(0 0 8px #FDB813)"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r="6"
                    fill="#FFFBE6"
                  />
                </>
              );
            })()}
            
            {/* Nighttime: Show moon following the lower arc */}
            {!sunInfo.isDaytime && (() => {
              const t = sunInfo.progress;
              const cx = 30 + 240 * t;
              // Mirror of sun arc, but below horizon
              const cy = 140 + 240 * t * (1 - t);
              return (
                <>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="10"
                    fill="url(#moonGrad)"
                    filter="drop-shadow(0 0 6px #A5B4FC)"
                  />
                  <circle
                    cx={cx + 2}
                    cy={cy - 2}
                    r="8"
                    fill="rgba(3, 0, 20, 0.4)"
                  />
                </>
              );
            })()}
          </svg>
        </div>

        <div className="sun-times-display">
          <div className="sun-time-item sunrise">
            <i className="fas fa-arrow-up"></i>
            <div>
              <span className="sun-label">Sunrise</span>
              <span className="sun-value">{formatDecimalTime(sunriseTime)}</span>
            </div>
          </div>
          <div className="sun-time-item sunset">
            <i className="fas fa-arrow-down"></i>
            <div>
              <span className="sun-label">Sunset</span>
              <span className="sun-value">{formatDecimalTime(sunsetTime)}</span>
            </div>
          </div>
          <div className="sun-time-item daylight">
            <i className="fas fa-clock"></i>
            <div>
              <span className="sun-label">Daylight</span>
              <span className="sun-value">
                {sunriseTime !== null && sunsetTime !== null && sunsetTime > 0 && sunriseTime >= 0
                  ? `${Math.floor(sunsetTime - sunriseTime)}h ${Math.round(((sunsetTime - sunriseTime) % 1) * 60)}m`
                  : 'N/A'}
              </span>
            </div>
          </div>
          <div className="sun-time-item local-time">
            <i className="fas fa-globe"></i>
            <div>
              <span className="sun-label">Local Time</span>
              <span className="sun-value">{localTime || '--:--:-- --'}</span>
              <span className="sun-date">{localDate || 'DD Month YYYY'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Earth-Sun Simulation */}
      <section className="card">
        <div className="card-header"><i className="fas fa-globe-americas"></i> Earth–Sun Simulation</div>
        <div className="canvas-container">
          <canvas ref={earthSunCanvasRef} />
        </div>
      </section>

      {/* Solar System */}
      <section className="card">
        <div className="card-header"><i className="fas fa-meteor"></i> Solar System</div>
        <div className="canvas-container solar-system-container">
          <canvas ref={solarSystemCanvasRef} />
        </div>
      </section>

      {/* Space on X */}
      <section className="card twitter-section" ref={twitterContainerRef}>
        <div className="card-header"><i className="fa-brands fa-x-twitter"></i> Space on X</div>
        <div className="twitter-feeds-grid">
          {[
            { handle: 'SpaceX', label: 'SpaceX', desc: 'SpaceX designs, manufactures and launches the most advanced rockets and spacecraft.' },
            { handle: 'NASASolarSystem', label: 'NASA Solar System', desc: 'Official NASA account for solar system exploration and planetary science updates.' },
            { handle: 'NASASpaceAlerts', label: 'Space Alerts', desc: 'Real-time space weather alerts, solar flares, and near-Earth object notifications.' },
          ].map(account => (
            <div key={account.handle} className="twitter-feed-card">
              <h3>{account.label}</h3>
              {/* Standard embed — works if X allows it */}
              {!twitterFailed && (
                <a
                  className="twitter-timeline"
                  data-lang="en"
                  data-theme="dark"
                  data-height="420"
                  data-chrome="noheader nofooter noborders transparent"
                  href={`https://twitter.com/${account.handle}?ref_src=twsrc%5Etfw`}
                >
                  Loading @{account.handle}...
                </a>
              )}
              {/* Nice fallback card when embeds fail */}
              {twitterFailed && (
                <div className="twitter-fallback-card">
                  <div className="twitter-fallback-icon">
                    <i className="fa-brands fa-x-twitter"></i>
                  </div>
                  <p className="twitter-fallback-handle">@{account.handle}</p>
                  <p className="twitter-fallback-desc">{account.desc}</p>
                  <a
                    href={`https://x.com/${account.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="twitter-follow-btn"
                  >
                    <i className="fa-brands fa-x-twitter"></i> View on X
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
