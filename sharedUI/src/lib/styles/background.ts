export const backgroundStyles = {
bgGrid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(0,212,200,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,200,.04) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
    pointerEvents: 'none'
  }as React.CSSProperties,
  orb1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'rgba(0,212,200,.08)',
    top: '-80px',
    right: '10%',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'floatOrb 8s ease-in-out infinite'
  } as React.CSSProperties,
  orb2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'rgba(0,80,160,.1)',
    bottom: '-50px',
    left: '5%',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'floatOrb 8s ease-in-out infinite reverse'
  }as React.CSSProperties,
}