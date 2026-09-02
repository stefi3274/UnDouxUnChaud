'use client';

import { useState } from 'react';

export default function PasswordInput({ value, onChange, placeholder, required, minLength, style }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        style={{ ...style, paddingRight: 44 }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
          padding: 4, lineHeight: 1, color: '#6B6255',
        }}
      >
        {visible ? '🙈' : '👁️'}
      </button>
    </div>
  );
}
