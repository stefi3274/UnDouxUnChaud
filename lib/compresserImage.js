// Redimensionne une image (max 1600px de côté par défaut) et la réencode en
// JPEG avant l'envoi, pour économiser le stockage et surtout le transfert
// (quota Supabase). Tourne entièrement dans le navigateur, via un canvas.
// Garde l'original si la version compressée n'est pas plus légère, ou si la
// compression échoue (l'envoi n'est jamais bloqué par la compression).
export function compresserImage(file, tailleMax = 1600, qualite = 0.75) {
  return new Promise((resolve) => {
    // Fichier déjà léger (moins de 200 Ko) : inutile d'y toucher.
    if (file.size < 200 * 1024) { resolve(file); return; }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > tailleMax || height > tailleMax) {
        if (width > height) {
          height = Math.round((height * tailleMax) / width);
          width = tailleMax;
        } else {
          width = Math.round((width * tailleMax) / height);
          height = tailleMax;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      // Fond blanc : le JPEG n'a pas de transparence (sinon PNG transparent = fond noir).
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }));
        },
        'image/jpeg',
        qualite
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}
