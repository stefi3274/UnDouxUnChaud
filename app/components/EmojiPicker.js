'use client';

import { useEffect, useRef, useState } from 'react';

const EMOJIS = [
  '😀','😂','🥰','😍','😘','😉','😊','🙂','😏','😅',
  '🤣','😇','🙃','😜','🤪','😎','🥳','😢','😭','😡',
  '😱','🤔','😴','🥺','😳','🤗','😬','🙄','😴','🤤',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕',
  '💖','💗','💓','💞','💘','😻','🔥','✨','💦','💋',
  '👀','👄','👅','🍑','🍆','🌹','🎉','👏','🙌','🤝',
  '👍','👎','🙏','💪','😴','☕','🍷','🍾','🎶','💫',
];

export default function EmojiPicker({ onSelect }) {
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function fermerSiExterieur(e) {
      if (ref.current && !ref.current.contains(e.target)) setOuvert(false);
    }
    document.addEventListener('mousedown', fermerSiExterieur);
    return () => document.removeEventListener('mousedown', fermerSiExterieur);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-label="Ajouter un emoji"
        style={{
          width: 42, height: 42, borderRadius: '50%', border: '1px solid #DDD2BC',
          background: '#fff', fontSize: '1.2rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        😊
      </button>

      {ouvert && (
        <div style={{
          position: 'absolute', bottom: '110%', right: 0, background: '#fff',
          border: '1px solid #DDD2BC', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
          padding: 10, width: 260, maxHeight: 220, overflowY: 'auto', zIndex: 20,
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4,
        }}>
          {EMOJIS.map((e, i) => (
            <button
              key={`${e}-${i}`}
              type="button"
              onClick={() => { onSelect(e); setOuvert(false); }}
              style={{
                background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer',
                padding: 4, borderRadius: 8, lineHeight: 1,
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
