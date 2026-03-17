import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#F8F6F1',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {/* Double-rule border */}
        <div style={{ position: 'absolute', inset: 20, border: '2px solid #1A1A18', display: 'flex' }} />
        <div style={{ position: 'absolute', inset: 28, border: '1px solid #C9A84C', display: 'flex' }} />

        {/* Inner content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, zIndex: 1 }}>

          {/* Kicker */}
          <div style={{ fontSize: 15, letterSpacing: '0.3em', color: '#8A8570', textTransform: 'uppercase' }}>
            Daily Song Guessing Game
          </div>

          {/* Masthead */}
          <div style={{ fontSize: 108, fontWeight: 900, letterSpacing: '0.1em', color: '#1A1A18', lineHeight: 1 }}>
            CHANDLE
          </div>

          {/* Rule */}
          <div style={{ width: 120, height: 2, background: '#C9A84C' }} />

          {/* Example formal title */}
          <div style={{
            fontSize: 30,
            fontStyle: 'italic',
            color: '#1A1A18',
            textAlign: 'center',
            maxWidth: 860,
            lineHeight: 1.5,
          }}>
            &ldquo;Meteorological Precipitation Directed At My Cranial Region&rdquo;
          </div>

          <div style={{ fontSize: 19, color: '#8A8570', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Can you identify the song?
          </div>

          {/* CTA badge */}
          <div style={{
            marginTop: 8,
            padding: '10px 36px',
            border: '2px solid #1A1A18',
            fontSize: 16,
            letterSpacing: '0.15em',
            color: '#1A1A18',
            textTransform: 'uppercase',
          }}>
            chandle.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
