import { VideoClip, Caption } from '@/types/video';

export const animateFade = async (
  ctx: CanvasRenderingContext2D,
  fromOpacity: number,
  toOpacity: number,
  duration: number,
  canvas: HTMLCanvasElement
) => {
  const startTime = performance.now();
  
  return new Promise<void>((resolve) => {
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentOpacity = fromOpacity + (toOpacity - fromOpacity) * progress;
      
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = currentOpacity;
      ctx.putImageData(snapshot, 0, 0);
      ctx.globalAlpha = 1;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };
    
    animate();
  });
};

export const drawTikTokCaptions = (
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  captions: Caption[], 
  currentTime: number
) => {
  const activeCaptions = captions.filter(
    caption => currentTime >= caption.startTime && currentTime <= caption.endTime
  );
  
  if (activeCaptions.length === 0) return;
  
  activeCaptions.forEach(caption => {
    const progress = (currentTime - caption.startTime) / (caption.endTime - caption.startTime);
    
    let opacity = 1;
    if (progress < 0.1) {
      opacity = progress * 10;
    } else if (progress > 0.9) {
      opacity = (1 - progress) * 10;
    }
    
    ctx.save();
    
    const captionY = canvas.height * 0.5;
    const fontSize = Math.min(canvas.width * 0.06, 36);
    
    ctx.font = `bold ${fontSize}px Montserrat, Poppins, Open Sans, Arial`;
    const textMetrics = ctx.measureText(caption.text);
    const textWidth = textMetrics.width;
    const padding = 15;
    const boxWidth = Math.min(textWidth + padding * 2, canvas.width * 0.9);
    const boxHeight = fontSize * 1.5;
    let boxX = (canvas.width - boxWidth) / 2; // Changed from const to let to fix the error
    
    let boxY = captionY;
    
    if (caption.animation) {
      switch (caption.animation) {
        case 'bounce':
          boxY += Math.sin(currentTime * 5) * 5;
          break;
        case 'pop':
          ctx.scale(1 + Math.sin(progress * Math.PI) * 0.1, 1 + Math.sin(progress * Math.PI) * 0.1);
          break;
        case 'shake':
          boxX += Math.sin(currentTime * 15) * 3;
          break;
        case 'slide':
          if (progress < 0.3) {
            boxY = captionY + (canvas.height * 0.5 - captionY) * (1 - progress / 0.3);
          }
          break;
        case 'wave':
          break;
      }
    }
    
    ctx.globalAlpha = opacity * 0.6;
    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
    
    ctx.fillStyle = getStyleColor(caption.style || 'default');
    ctx.globalAlpha = opacity;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    if (caption.animation === 'wave') {
      drawWavyText(ctx, caption.text, canvas.width / 2, boxY + boxHeight / 2, currentTime);
    } else {
      drawWrappedText(ctx, caption.text, canvas.width / 2, boxY + boxHeight / 2, boxWidth - padding * 2, fontSize);
    }
    
    ctx.restore();
  });
};

export const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};

const getStyleColor = (style: Caption['style']): string => {
  switch (style) {
    case 'hook': return '#ff385c';
    case 'emphasis': return '#ffffff';
    case 'highlight': return '#37f0d1';
    case 'social': return '#fffd80';
    case 'cta': return '#ffa726';
    default: return '#ffffff';
  }
};

const drawWavyText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  time: number
) => {
  const waveHeight = 3;
  const waveFrequency = 0.3;
  
  ctx.save();
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const textWidth = ctx.measureText(text).width;
  const startX = x - textWidth / 2;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    const charWidth = ctx.measureText(char).width;
    
    const charX = startX + ctx.measureText(text.substring(0, i)).width + charWidth / 2;
    const charY = y + Math.sin(time * 3 + i * waveFrequency) * waveHeight;
    
    ctx.fillText(char, charX, charY);
  }
  
  ctx.restore();
};

const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number
) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  
  lines.push(currentLine);
  
  const lineHeight = fontSize * 1.4;
  const totalHeight = lineHeight * lines.length;
  const startY = y - (totalHeight / 2) + (lineHeight / 2);
  
  lines.sort((a, b) => {
    if (Math.abs(a.length - b.length) < 3) return 0;
    return a.length - b.length;
  });
  
  lines.forEach((line, i) => {
    ctx.shadowColor = 'rgba(0, 0, 0, 1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText(line, x, startY + (i * lineHeight));
  });
};

export const animateTikTokTransition = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  nextClip: VideoClip,
  type: number = 0
) => {
  if (!nextClip.url) return;
  
  let nextImage: HTMLImageElement | HTMLVideoElement;
  
  if (nextClip.type === 'image') {
    nextImage = new Image();
    nextImage.crossOrigin = "anonymous";
    nextImage.src = nextClip.url;
    await new Promise<void>((resolve) => {
      nextImage.onload = () => resolve();
      nextImage.onerror = () => resolve();
    });
  } else {
    nextImage = document.createElement('video');
    nextImage.src = nextClip.url;
    await new Promise<void>((resolve) => {
      (nextImage as HTMLVideoElement).onloadeddata = () => resolve();
      (nextImage as HTMLVideoElement).onerror = () => resolve();
      (nextImage as HTMLVideoElement).load();
    });
  }
  
  switch (type % 5) {
    case 0: return animateSpinTransition(ctx, canvas, nextImage);
    case 1: return animateGlitchTransition(ctx, canvas, nextImage);
    case 2: return animateSwipeTransition(ctx, canvas, nextImage);
    case 3: return animateFlashTransition(ctx, canvas, nextImage);
    case 4: return animatePixelateTransition(ctx, canvas, nextImage);
    default: return animateSpinTransition(ctx, canvas, nextImage);
  }
};

const animateSpinTransition = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  nextImage: HTMLImageElement | HTMLVideoElement
) => {
  const duration = 500;
  const startTime = performance.now();
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  return new Promise<void>((resolve) => {
    const animate = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (progress < 0.5) {
          const currentProgress = progress * 2;
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(currentProgress * Math.PI);
          ctx.scale(1 - currentProgress, 1 - currentProgress);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
          ctx.putImageData(snapshot, 0, 0);
          ctx.restore();
        } else {
          const currentProgress = (progress - 0.5) * 2;
          
          let drawWidth, drawHeight;
          const imgWidth = nextImage instanceof HTMLVideoElement ? nextImage.videoWidth : nextImage.width;
          const imgHeight = nextImage instanceof HTMLVideoElement ? nextImage.videoHeight : nextImage.height;
          
          if (imgWidth / imgHeight > canvas.width / canvas.height) {
            drawHeight = canvas.height;
            drawWidth = (imgWidth / imgHeight) * drawHeight;
          } else {
            drawWidth = canvas.width;
            drawHeight = (imgHeight / imgWidth) * drawWidth;
          }
          
          const x = (canvas.width - drawWidth) / 2;
          const y = (canvas.height - drawHeight) / 2;
          
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((1 - currentProgress) * Math.PI);
          ctx.scale(currentProgress, currentProgress);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
          ctx.drawImage(nextImage, x, y, drawWidth, drawHeight);
          ctx.restore();
        }
        
        requestAnimationFrame(animate);
      } else {
        drawImageFit(ctx, canvas, nextImage);
        resolve();
      }
    };
    
    animate();
  });
};

const animateGlitchTransition = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  nextImage: HTMLImageElement | HTMLVideoElement
) => {
  const duration = 600;
  const startTime = performance.now();
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return;
  
  drawImageFit(tempCtx, tempCanvas, nextImage);
  
  return new Promise<void>((resolve) => {
    const animate = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (progress < 0.7) {
          const slices = 8 + Math.floor(progress * 15);
          const sliceHeight = canvas.height / slices;
          
          for (let i = 0; i < slices; i++) {
            const showNext = Math.random() < progress;
            
            const glitchOffsetX = (Math.random() - 0.5) * 20 * progress;
            
            const y = i * sliceHeight;
            const sourceCanvas = showNext ? tempCanvas : canvas;
            
            ctx.drawImage(
              sourceCanvas,
              0, y, canvas.width, sliceHeight,
              glitchOffsetX, y, canvas.width, sliceHeight
            );
            
            if (Math.random() < 0.2) {
              ctx.globalCompositeOperation = 'lighten';
              ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
              ctx.fillRect(0, y, canvas.width, sliceHeight);
              ctx.globalCompositeOperation = 'source-over';
            }
          }
        } else {
          const fadeProgress = (progress - 0.7) / 0.3;
          ctx.drawImage(tempCanvas, 0, 0);
          
          if (Math.random() < 0.5 - fadeProgress) {
            const y = Math.random() * canvas.height;
            const height = Math.random() * 20 + 5;
            const offsetX = (Math.random() - 0.5) * 30 * (1 - fadeProgress);
            
            ctx.drawImage(
              canvas,
              0, y, canvas.width, height,
              offsetX, y, canvas.width, height
            );
          }
        }
        
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        resolve();
      }
    };
    
    animate();
  });
};

const animateSwipeTransition = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  nextImage: HTMLImageElement | HTMLVideoElement
) => {
  const duration = 500;
  const startTime = performance.now();
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return;
  
  drawImageFit(tempCtx, tempCanvas, nextImage);
  
  return new Promise<void>((resolve) => {
    const animate = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(
          canvas, 
          -progress * canvas.width, 0, 
          canvas.width, canvas.height
        );
        
        ctx.drawImage(
          tempCanvas,
          (1 - progress) * canvas.width, 0,
          canvas.width, canvas.height
        );
        
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        resolve();
      }
    };
    
    animate();
  });
};

const animateFlashTransition = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  nextImage: HTMLImageElement | HTMLVideoElement
) => {
  const duration = 400;
  const startTime = performance.now();
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return;
  
  drawImageFit(tempCtx, tempCanvas, nextImage);
  
  return new Promise<void>((resolve) => {
    const animate = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        
        if (progress < 0.3) {
          const whiteProgress = progress / 0.3;
          ctx.globalAlpha = 1 - whiteProgress;
          ctx.drawImage(canvas, 0, 0);
          
          ctx.globalAlpha = whiteProgress;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (progress < 0.5) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          const fadeProgress = (progress - 0.5) / 0.5;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tempCanvas, 0, 0);
          
          ctx.globalAlpha = 1 - fadeProgress;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        resolve();
      }
    };
    
    animate();
  });
};

const animatePixelateTransition = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  nextImage: HTMLImageElement | HTMLVideoElement
) => {
  const duration = 700;
  const startTime = performance.now();
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return;
  
  drawImageFit(tempCtx, tempCanvas, nextImage);
  
  const maxPixelSize = 30;
  
  return new Promise<void>((resolve) => {
    const animate = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        
        if (progress < 0.5) {
          const pixelationProgress = progress * 2;
          const pixelSize = Math.ceil(pixelationProgress * maxPixelSize);
          
          pixelateImage(ctx, canvas, pixelSize);
        } else {
          const pixelationProgress = (1 - progress) * 2;
          const pixelSize = Math.ceil(pixelationProgress * maxPixelSize);
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tempCanvas, 0, 0);
          
          if (pixelSize > 1) {
            pixelateImage(ctx, canvas, pixelSize);
          }
        }
        
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        resolve();
      }
    };
    
    animate();
  });
};

const pixelateImage = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  pixelSize: number
) => {
  const w = canvas.width;
  const h = canvas.height;
  
  const imageData = ctx.getImageData(0, 0, w, h);
  
  ctx.clearRect(0, 0, w, h);
  
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return;
  
  tempCanvas.width = Math.ceil(w / pixelSize);
  tempCanvas.height = Math.ceil(h / pixelSize);
  
  tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
  
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    tempCanvas, 
    0, 0, tempCanvas.width, tempCanvas.height,
    0, 0, w, h
  );
  ctx.imageSmoothingEnabled = true;
};

const drawImageFit = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | HTMLVideoElement
) => {
  const imgWidth = image instanceof HTMLVideoElement ? image.videoWidth : image.width;
  const imgHeight = image instanceof HTMLVideoElement ? image.videoHeight : image.height;
  
  let drawWidth, drawHeight;
  
  if (imgWidth / imgHeight > canvas.width / canvas.height) {
    drawHeight = canvas.height;
    drawWidth = (imgWidth / imgHeight) * drawHeight;
  } else {
    drawWidth = canvas.width;
    drawHeight = (imgHeight / imgWidth) * drawWidth;
  }
  
  const x = (canvas.width - drawWidth) / 2;
  const y = (canvas.height - drawHeight) / 2;
  
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
};

export const formatTikTokStaggeredText = (text: string): string[] => {
  if (!text) return [];
  
  // Remove any unexpected text patterns
  const cleanedText = text.replace(/\s*AM\s*/g, '').trim();
  
  // If text is very short, just return it as a single line
  if (cleanedText.length <= 15) return [cleanedText];
  
  // Split text into words
  const words = cleanedText.split(' ');
  
  // For very short captions (2-4 words) - use two lines
  if (words.length <= 4) {
    const midpoint = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, midpoint).join(' ');
    const secondLine = words.slice(midpoint).join(' ');
    return [firstLine, secondLine];
  }
  
  // For longer captions - use three lines with staggered formatting
  const totalWords = words.length;
  let firstBreak = Math.floor(totalWords / 3);
  let secondBreak = Math.floor(totalWords * 2 / 3);
  
  // Adjust breaks to avoid splitting after prepositions, articles, etc.
  const breakWords = ['the', 'a', 'an', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'with', 'by'];
  
  // Adjust first break point if needed
  if (firstBreak > 0 && breakWords.includes(words[firstBreak - 1].toLowerCase())) {
    firstBreak--; 
  } else if (firstBreak < words.length - 1 && breakWords.includes(words[firstBreak].toLowerCase())) {
    firstBreak++; 
  }
  
  // Adjust second break point if needed
  if (secondBreak > 0 && breakWords.includes(words[secondBreak - 1].toLowerCase())) {
    secondBreak--;
  } else if (secondBreak < words.length - 1 && breakWords.includes(words[secondBreak].toLowerCase())) {
    secondBreak++;
  }
  
  // Ensure breaks don't go out of bounds
  firstBreak = Math.max(1, Math.min(firstBreak, totalWords - 2));
  secondBreak = Math.max(firstBreak + 1, Math.min(secondBreak, totalWords - 1));
  
  // Create the three lines
  const line1 = words.slice(0, firstBreak).join(' ');
  const line2 = words.slice(firstBreak, secondBreak).join(' ');
  const line3 = words.slice(secondBreak).join(' ');
  
  // Sort lines by length to create staggered appearance
  const lines = [line1, line2, line3];
  lines.sort((a, b) => a.length - b.length);
  
  // Return the sorted lines - shortest, longest, medium for visual effect
  return lines;
};
