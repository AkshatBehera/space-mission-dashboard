import React, { useState, useEffect } from 'react';

const About: React.FC = () => {
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showGodspeed, setShowGodspeed] = useState(false);

  const quizQuestions = [
    {
      question: "How fast does the ISS travel?",
      options: ["17,500 mph", "25,000 mph", "10,000 mph", "30,000 mph"],
      correct: 0
    },
    {
      question: "How many times does the ISS orbit Earth per day?",
      options: ["10 times", "15.5 times", "20 times", "5 times"],
      correct: 1
    },
    {
      question: "What is the altitude of the ISS?",
      options: ["200 km", "400 km", "600 km", "800 km"],
      correct: 1
    },
    {
      question: "How long does one orbit take?",
      options: ["60 minutes", "92 minutes", "120 minutes", "150 minutes"],
      correct: 1
    },
    {
      question: "When was the ISS first launched?",
      options: ["1995", "1998", "2000", "2005"],
      correct: 1
    }
  ];

  const base = import.meta.env.BASE_URL;
  const aboutImages = [
    { src: `${base}images/about/about-1.jpg`, alt: 'Space exploration', caption: 'Explore' },
    { src: `${base}images/about/about-2.jpg`, alt: 'Earth from space', caption: 'Discover' },
    { src: `${base}images/about/about-3.jpg`, alt: 'Rocket launch', caption: 'Innovate' }
  ];

  useEffect(() => {
    // Godspeed easter egg
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'g' && e.altKey) {
        setShowGodspeed(true);
        setTimeout(() => setShowGodspeed(false), 3000);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleQuizAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple answers
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === quizQuestions[currentQuestion].correct;
    
    if (isCorrect) {
      setQuizScore(quizScore + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowQuiz(false);
        setSelectedAnswer(null);
      }
    }, 1500); // Show feedback for 1.5 seconds
  };

  const startQuiz = () => {
    setQuizScore(0);
    setCurrentQuestion(0);
    setShowQuiz(true);
    setSelectedAnswer(null);
  };

  return (
    <div className="container">
      {showGodspeed && (
        <div className="godspeed-message">
          Godspeed! 🚀
        </div>
      )}
      
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem', 
        fontSize: '3rem',
        fontWeight: '300',
        color: 'var(--text-primary)',
        letterSpacing: '2px'
      }}>
        Plirofories <span style={{fontSize: '1.5rem', fontWeight: '300'}}>(Space Mission Stats Dashboard)</span>
      </h1>

      <div className="card">
        <div className="card-header">Mission Overview</div>
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}>
          The International Space Station (ISS) is a modular space station in low Earth orbit. 
          It is a multinational collaborative project involving five participating space agencies: 
          NASA (United States), Roscosmos (Russia), JAXA (Japan), ESA (Europe), and CSA (Canada).
        </p>
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}>
          The ISS serves as a microgravity and space environment research laboratory in which 
          scientific research is conducted in astrobiology, astronomy, meteorology, physics, 
          and other fields.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
          Press Alt + G for a surprise! 🚀
        </p>
      </div>

      <div className="card">
        <div className="card-header">Visuals from Space</div>
        <div className="about-image-grid">
          {aboutImages.map((image, index) => (
            <div key={index} className="about-image-item">
              <img src={image.src} alt={image.alt} />
              <div className="about-image-overlay">
                <p>{image.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-container">
        <h2 style={{ fontSize: '2.5rem', fontWeight: '300', marginBottom: '2rem', color: 'var(--text-primary)' }}>
          Space Trivia Quiz
        </h2>
        {!showQuiz ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
              Test your knowledge about the International Space Station!
            </p>
            <button 
              onClick={startQuiz}
              style={{
                background: 'var(--text-primary)',
                border: 'none',
                color: 'var(--bg-primary)',
                padding: '1.5rem 3rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: '300',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--text-secondary)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Start Quiz
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                fontSize: '1rem', 
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Question {currentQuestion + 1} of {quizQuestions.length}
              </div>
              <div className="quiz-question">
                {quizQuestions[currentQuestion].question}
              </div>
            </div>
            
            <div className="quiz-options">
              {quizQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(index)}
                  className={`quiz-option ${
                    selectedAnswer !== null 
                      ? (index === quizQuestions[currentQuestion].correct ? 'correct' : 
                         index === selectedAnswer ? 'incorrect' : '')
                      : ''
                  }`}
                  disabled={selectedAnswer !== null}
                >
                  <span>{option}</span>
                  {selectedAnswer !== null && (
                    <span className="quiz-feedback-icon">
                      {index === quizQuestions[currentQuestion].correct ? '✅' : 
                       index === selectedAnswer ? '❌' : ''}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {!showQuiz && quizScore > 0 && (
          <div style={{ 
            marginTop: '2rem', 
            textAlign: 'center',
            padding: '2rem',
            background: 'var(--accent)',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '300', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Quiz Complete!
            </div>
            <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Score: {quizScore}/{quizQuestions.length}
            </div>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
              {quizScore === quizQuestions.length ? 'Perfect! 🚀' : 
               quizScore >= quizQuestions.length * 0.8 ? 'Great job! 🌟' : 
               quizScore >= quizQuestions.length * 0.6 ? 'Good effort! ⭐' : 
               'Keep learning! 📚'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
