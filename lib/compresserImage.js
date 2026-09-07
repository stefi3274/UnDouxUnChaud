// Redimensionne une image (max 1600px de côté) et la réencode en JPEG
// qualité 0.75, pour rester léger avant l'envoi. Tourne entièrement
// dans le navigateur, via un canvas — aucun envoi au serveur pour ça.
export function compresserImage(file, tailleMax = 1600, qualite = 0.75) {
  return new Promise((resolve, reject) => {
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
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Compression échouée.')); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        qualite
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Impossible de lire l'image.")); };
    img.src = url;
  });
}
