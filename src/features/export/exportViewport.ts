export function exportViewport(canvas: HTMLCanvasElement, type: 'png' | 'jpg') {
  const mime = type === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mime, 0.92);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `crayon-scene.${type}`;
  link.click();
}
