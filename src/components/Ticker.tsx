import React from 'react';

const Ticker: React.FC = () => {
  const spaceFacts = [
    "The International Space Station travels at approximately 17,500 mph (28,000 km/h) - fast enough to orbit Earth 15.5 times per day!",
    "A day on Venus is longer than its year - it takes 243 Earth days to rotate once but only 225 Earth days to orbit the Sun.",
    "There are more stars in the universe than grains of sand on all the beaches on Earth combined.",
    "The Sun contains 99.86% of the Solar System's mass - that's about 330,000 times the mass of Earth.",
    "Astronauts can grow up to 2 inches (5 cm) taller in space due to the lack of gravity compressing their spines.",
    "The Moon is moving away from Earth at a rate of about 1.5 inches (3.8 cm) per year.",
    "Jupiter's Great Red Spot is a storm that has been raging for at least 400 years and is larger than Earth.",
    "A black hole's gravity is so strong that not even light can escape it - hence the name 'black' hole.",
    "The temperature on the surface of the Sun is about 10,000°F (5,500°C), but its core reaches 27 million°F (15 million°C).",
    "There are more possible games of chess than there are atoms in the observable universe."
  ];

  return (
    <div className="ticker">
      <div className="ticker-content">
        {spaceFacts.join(' • ')}
      </div>
    </div>
  );
};

export default Ticker;
