/**
 * Loading Spinner Component
 */
const Loader = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: { spinner: 24, border: 3 },
    md: { spinner: 40, border: 4 },
    lg: { spinner: 60, border: 5 },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '16px',
    }}>
      <div style={{
        width: `${s.spinner}px`,
        height: `${s.spinner}px`,
        border: `${s.border}px solid var(--border-light)`,
        borderTop: `${s.border}px solid var(--color-primary)`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {text && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{text}</p>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
