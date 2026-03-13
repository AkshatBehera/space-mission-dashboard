import { useState, useRef, useEffect, useCallback } from 'react';
import { trackEvent } from '../utils/analytics';

const AudioControls = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [prevVolume, setPrevVolume] = useState(0.5);
  const [showPrompt, setShowPrompt] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Attempt autoplay on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.5;
    audio.play()
      .then(() => {
        setIsPlaying(true);
        setShowPrompt(false);
        setHasInteracted(true);
        trackEvent('audio_autoplay_success');
      })
      .catch(() => {
        setShowPrompt(true);
        trackEvent('audio_autoplay_blocked');
      });
  }, []);

  // One-time listener: start playback on first user interaction (only if autoplay was blocked)
  useEffect(() => {
    if (hasInteracted) return;
    const start = () => {
      const audio = audioRef.current;
      if (audio) {
        audio.volume = volume;
        audio.play().then(() => {
          setIsPlaying(true);
          setShowPrompt(false);
          trackEvent('audio_first_interaction_play');
        }).catch(() => {});
      }
      setHasInteracted(true);
    };
    document.addEventListener('click', start, { once: true });
    document.addEventListener('keydown', start, { once: true });
    return () => {
      document.removeEventListener('click', start);
      document.removeEventListener('keydown', start);
    };
  }, [hasInteracted, volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      trackEvent('audio_paused');
    } else {
      audio.volume = volume;
      audio.play().then(() => {
        setIsPlaying(true);
        setShowPrompt(false);
        trackEvent('audio_played');
      }).catch(() => {});
    }
  }, [isPlaying, volume]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
      audio.volume = 0;
      trackEvent('audio_muted', { previous_volume: Number(volume.toFixed(2)) });
    } else {
      const restored = prevVolume > 0 ? prevVolume : 0.5;
      setVolume(restored);
      audio.volume = restored;
      trackEvent('audio_unmuted', { restored_volume: Number(restored.toFixed(2)) });
    }
  }, [volume, prevVolume]);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (v > 0) setPrevVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const handleVolumeCommit = useCallback(() => {
    trackEvent('audio_volume_set', { volume_percent: Math.round(volume * 100) });
  }, [volume]);

  return (
    <>
      {/* Startup prompt overlay */}
      {showPrompt && !isPlaying && (
        <div className="audio-prompt" onClick={togglePlay}>
          <div className="audio-prompt-inner">
            <i className="fas fa-music"></i>
            <span>Tap to enable ambient audio</span>
          </div>
        </div>
      )}

      <div className={`audio-player ${isPlaying ? 'playing' : ''}`}>
        <audio ref={audioRef} loop preload="auto">
          <source src={`${import.meta.env.BASE_URL}audio/ambient-space-arpeggio-350710.mp3`} type="audio/mpeg" />
        </audio>

        <button className="audio-btn play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        <div className="volume-control">
          <button className="audio-btn mute-btn" onClick={toggleMute} aria-label={volume === 0 ? 'Unmute' : 'Mute'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              {volume === 0 ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : volume < 0.5 ? (
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              )}
            </svg>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
            onMouseUp={handleVolumeCommit}
            onTouchEnd={handleVolumeCommit}
            onKeyUp={handleVolumeCommit}
            className="volume-slider"
            aria-label="Volume"
          />
        </div>
      </div>
    </>
  );
};

export default AudioControls;
