// Home.jsx with underline effect
import { useNavigate } from 'react-router-dom';
import { Radio, Eye } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Live Stream</h1>
        <p style={styles.subtitle}>Choose your role</p>
        
        <div style={styles.buttonGroup}>
          <button 
            onClick={() => navigate('/broadcast')}
            onMouseEnter={() => setHoveredButton('broadcast')}
            onMouseLeave={() => setHoveredButton(null)}
            style={styles.button}
          >
            <Radio size={28} strokeWidth={1} />
            <span style={styles.buttonText}>Broadcast</span>
            <div style={{
              ...styles.underline,
              width: hoveredButton === 'broadcast' ? '100%' : '0%',
            }} />
          </button>

          <button 
            onClick={() => navigate('/watch')}
            onMouseEnter={() => setHoveredButton('watch')}
            onMouseLeave={() => setHoveredButton(null)}
            style={styles.button}
          >
            <Eye size={28} strokeWidth={1} />
            <span style={styles.buttonText}>Join Live</span>
            <div style={{
              ...styles.underline,
              width: hoveredButton === 'watch' ? '100%' : '0%',
            }} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    fontSize: 'clamp(44px, 8vw, 72px)',
    fontWeight: 300,
    letterSpacing: '-0.03em',
    margin: 0,
    marginBottom: '6px',
    color: '#000',
  },
  subtitle: {
    fontSize: 'clamp(15px, 2vw, 20px)',
    fontWeight: 300,
    letterSpacing: '0.02em',
    color: '#000',
    margin: 0,
    marginBottom: '48px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '48px',
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    flex: '1',
    maxWidth: '140px',
    padding: '20px 12px 16px 12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    color: '#000',
    outline: 'none',
    position: 'relative',
  },
  buttonText: {
    fontSize: 'clamp(15px, 1.5vw, 18px)',
    fontWeight: 300,
    letterSpacing: '0.03em',
    margin: 0,
  },
  underline: {
    height: '1px',
    background: '#000',
    transition: 'width 0.2s ease',
    position: 'absolute',
    bottom: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  }
};