import React, { useState } from 'react';

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
    miss_distance: {
      kilometers: string;
    };
    relative_velocity: {
      kilometers_per_hour: string;
    };
  }>;
  is_potentially_hazardous: boolean;
}

interface StatsTableProps {
  issData: ISSData | null;
  asteroids: AsteroidData[];
  loading: {
    iss: boolean;
    asteroids: boolean;
  };
}

const StatsTable: React.FC<StatsTableProps> = ({ issData, asteroids, loading }) => {
  const [showAllAsteroids, setShowAllAsteroids] = useState(false);
  
  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const displayedAsteroids = showAllAsteroids ? asteroids : asteroids.slice(0, 5);
  const remainingCount = asteroids.length - displayedAsteroids.length;

  return (
    <div className="grid-container grid-2">
      {/* ISS Stats */}
      <div className="card">
        <div className="card-header">ISS Current Status</div>
        {loading.iss ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading ISS data...
          </div>
        ) : issData ? (
          <table className="stats-table">
            <tbody>
              <tr>
                <td>Latitude</td>
                <td>{formatNumber(issData.latitude, 4)}°</td>
              </tr>
              <tr>
                <td>Longitude</td>
                <td>{formatNumber(issData.longitude, 4)}°</td>
              </tr>
              <tr>
                <td>Altitude</td>
                <td>{formatNumber(issData.altitude, 2)} km</td>
              </tr>
              <tr>
                <td>Velocity</td>
                <td>{formatNumber(issData.velocity, 2)} km/h</td>
              </tr>
              <tr>
                <td>Orbital Period</td>
                <td>~92 minutes</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>Failed to load ISS data</p>
        )}
      </div>

      {/* Asteroids */}
      <div className="card">
        <div className="card-header">Near-Earth Asteroids Today ({asteroids.length})</div>
        {loading.asteroids ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading asteroid data...
          </div>
        ) : asteroids.length > 0 ? (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {displayedAsteroids.map((asteroid, index) => (
              <div key={index} style={{ 
                padding: '1rem', 
                borderBottom: '1px solid var(--border)',
                marginBottom: '0.5rem',
                borderRadius: '8px',
                background: 'var(--accent)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {asteroid.name}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <strong>Diameter:</strong> {formatNumber(asteroid.estimated_diameter.meters.estimated_diameter_min, 0)} - {formatNumber(asteroid.estimated_diameter.meters.estimated_diameter_max, 0)} m
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <strong>Distance:</strong> {formatNumber(parseFloat(asteroid.close_approach_data[0]?.miss_distance.kilometers || '0'), 0)} km
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <strong>Speed:</strong> {formatNumber(parseFloat(asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_hour || '0'), 0)} km/h
                </div>
                {asteroid.is_potentially_hazardous && (
                  <div style={{ 
                    color: '#ff6b6b', 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(255, 107, 107, 0.1)',
                    borderRadius: '4px',
                    border: '1px solid #ff6b6b'
                  }}>
                    ⚠️ Potentially Hazardous
                  </div>
                )}
              </div>
            ))}
            {remainingCount > 0 && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '1rem'
              }}>
                <button
                  onClick={() => setShowAllAsteroids(!showAllAsteroids)}
                  style={{
                    background: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '300',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--text-secondary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {showAllAsteroids ? 'Show Less' : `+${remainingCount} more asteroids`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p>No asteroid data available</p>
        )}
      </div>
    </div>
  );
};

export default StatsTable;
