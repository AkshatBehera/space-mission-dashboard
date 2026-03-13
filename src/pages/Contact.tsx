import { useMemo, useRef, useState, useEffect, FormEvent } from 'react';
import emailjs from '@emailjs/browser';
import { trackEvent } from '../utils/analytics';

const SERVICE_ID = 'service_tto23vi';
const TEMPLATE_ID = 'template_ftsxu9c';
const PUBLIC_KEY = 'FOs-CFuHknoBigGUW';

const socialLinks = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/akshat-behera',
    iconClass: 'fa-brands fa-linkedin-in',
    color: '#0A66C2',
  },
  {
    name: 'X',
    url: 'https://x.com/akshatbehera',
    iconClass: 'fa-brands fa-x-twitter',
    color: '#000',
  },
  {
    name: 'Portfolio',
    url: 'https://akshatbehera.github.io/akshatbeheraonline/',
    iconClass: 'fas fa-globe',
    color: '#4FC3F7',
  },
];

const spaceQuotes = [
  "That's one small step for man, one giant leap for mankind. — Neil Armstrong",
  "The Earth is the only world known so far to harbor life. — Carl Sagan",
  "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe. — Albert Einstein",
  "The cosmos is within us. We are made of star-stuff. — Carl Sagan",
  "Ad Astra per Aspera — Through hardships to the stars",
  "The sky is not the limit, it's just the beginning.",
];

const Contact = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const randomQuote = useMemo(
    () => spaceQuotes[Math.floor(Math.random() * spaceQuotes.length)],
    []
  );

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(PUBLIC_KEY);
    console.log('EmailJS initialized with public key');
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formRef.current || sending) return;

    trackEvent('contact_submit_attempt');

    const formData = new FormData(formRef.current);
    const emailInput = formData.get('email') as string;
    
    // Validate email
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailInput)) {
      trackEvent('contact_validation_error', { field: 'email' });
      const emailField = formRef.current.querySelector<HTMLInputElement>('input[name="email"]');
      if (emailField) {
        emailField.setCustomValidity('Enter a valid email address');
        emailField.reportValidity();
      }
      return;
    }

    setSending(true);
    setStatus('idle');

    // Use explicit template params for better control
    const templateParams = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    console.log('Attempting to send email...');
    console.log('Service ID:', SERVICE_ID);
    console.log('Template ID:', TEMPLATE_ID);
    console.log('Template params:', templateParams);

    try {
      const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
      console.log('✅ EmailJS success:', response);
      setStatus('success');
      trackEvent('contact_submit_success');
      formRef.current?.reset();
    } catch (err: any) {
      console.error('❌ EmailJS error:', err);
      console.error('Error status:', err?.status);
      console.error('Error text:', err?.text);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      setStatus('error');
      trackEvent('contact_submit_failed', { error_status: String(err?.status ?? 'unknown') });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Contact & Developer</h1>

      {/* Connect With Me */}
      <section className="card">
        <div className="card-header">
          <i className="fas fa-link"></i> Connect With Me
        </div>
        <div className="social-grid">
          {socialLinks.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
              onClick={() => trackEvent('contact_social_click', { platform: link.name, destination: link.url })}
            >
              <div className="social-icon-circle" style={{ background: link.color }}>
                <i className={link.iconClass}></i>
              </div>
              <span className="social-name">{link.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="card">
        <div className="card-header">
          <i className="fas fa-envelope"></i> Send Me a Message
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="contact-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Your Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                title="Enter a valid email address (e.g. name@example.com)"
                autoComplete="email"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
            />
          </div>
          <button type="submit" className="contact-submit" disabled={sending}>
            {sending ? (
              <><i className="fas fa-spinner fa-spin"></i> Sending...</>
            ) : (
              <><i className="fas fa-paper-plane"></i> Send Message</>
            )}
          </button>
          {status === 'success' && (
            <p className="form-status success">
              <i className="fas fa-check-circle"></i> Message sent successfully!
            </p>
          )}
          {status === 'error' && (
            <p className="form-status error">
              <i className="fas fa-times-circle"></i> Failed to send. Please try again.
            </p>
          )}
        </form>
      </section>

      {/* Project Info */}
      <div className="grid-container grid-2">
        <section className="card">
          <div className="card-header">
            <i className="fas fa-code"></i> About This Project
          </div>
          <div className="info-text">
            <p>
              CosmicX Space Mission Dashboard was built using modern web technologies:
            </p>
            <ul className="tech-list">
              <li><span className="dot"></span>React with TypeScript</li>
              <li><span className="dot"></span>Vite for blazing-fast builds</li>
              <li><span className="dot"></span>Leaflet.js for interactive maps</li>
              <li><span className="dot"></span>NASA APIs for real-time data</li>
              <li><span className="dot"></span>Canvas API for simulations</li>
              <li><span className="dot"></span>Responsive Grid & Flexbox layouts</li>
            </ul>
            <p>
              The dashboard tracks the ISS in real-time, monitors near-Earth asteroids, 
              and visualizes solar system dynamics — all updated live.
            </p>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <i className="fas fa-check-circle"></i> Technical Features
          </div>
          <div className="info-text">
            <ul className="feature-list">
              <li>Real-time ISS position tracking</li>
              <li>Live asteroid monitoring</li>
              <li>Earth–Sun & Solar System simulations</li>
              <li>Sunrise & sunset calculator</li>
              <li>Space trivia quiz</li>
              <li>Extreme mobile responsiveness</li>
              <li>Ambient space audio</li>
              <li>Scrolling space facts ticker</li>
              <li>24/7 ISS Live Camera Feed</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Inspiration Quote */}
      <section className="card quote-card">
        <div className="card-header">
          <i className="fas fa-quote-left"></i> Inspiration
        </div>
        <blockquote className="inspiration-quote">
          "{randomQuote}"
        </blockquote>
        <p className="quote-sub">
          Inspired by humanity's endless curiosity about space and the incredible 
          work being done by NASA and international space agencies.
        </p>
      </section>
    </div>
  );
};

export default Contact;
