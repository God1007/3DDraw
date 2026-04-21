import { CanvasTexture, RepeatWrapping } from 'three';

export function createCrayonTexture(color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to create crayon texture context.');
  }

  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 180; index += 1) {
    const alpha = 0.04 + (index % 7) * 0.01;
    context.strokeStyle = `rgba(255,255,255,${alpha})`;
    context.lineWidth = 1 + (index % 3);
    context.beginPath();
    context.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    context.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    context.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 2);

  return texture;
}
