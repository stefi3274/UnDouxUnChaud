'use client';

import { useEffect } from 'react';

export default function RegistrerLecture({ texteId }) {
  useEffect(() => {
    fetch(`/api/textes/${texteId}/vue`, { method: 'POST' }).catch(() => {});
  }, [texteId]);

  return null;
}
