const VideoPlayer = () => {
  return (
    <div className="video-container">
      <div className="video-wrapper">
        <iframe 
          width="100%" 
          height="100%"
          src="https://www.youtube.com/embed/fO9e9jnhYK8?autoplay=1&mute=1" 
          title="Live 4K video of Earth and space: 24/7 Livestream of Earth by Sen's 4K video cameras on the ISS" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen
        />
      </div>
      <div className="video-caption">
        <span className="live-badge"><span className="live-dot"></span>LIVE</span>
        <span>24/7 ISS Earth Cam — 4K Livestream by Sen</span>
      </div>
    </div>
  );
};

export default VideoPlayer;
