// 浏览器端canvas生成高斯蓝色柔光斑PNG
const size = 512;
const canvas = document.createElement('canvas');
canvas.width = canvas.height = size;
const ctx = canvas.getContext('2d');

// 渐变参数
const centerX = size / 2;
const centerY = size / 2;
const radius = size * 0.45;

const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
gradient.addColorStop(0, 'rgba(74,198,255,0.43)'); // #4ac6ff, 43% alpha
gradient.addColorStop(0.22, 'rgba(74,198,255,0.22)');
gradient.addColorStop(0.43, 'rgba(74,198,255,0.09)');
gradient.addColorStop(0.7, 'rgba(74,198,255,0.03)');
gradient.addColorStop(1, 'rgba(74,198,255,0.0)'); // 完全透明

ctx.clearRect(0, 0, size, size);
ctx.globalCompositeOperation = 'lighter';
ctx.fillStyle = gradient;
ctx.beginPath();
ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
ctx.fill();

// 导出PNG
canvas.toBlob(blob => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'blue-glow-spot.png';
  a.click();
  URL.revokeObjectURL(url);
});

// 你可以直接复制粘贴此脚本到浏览器控制台，自动下载PNG。
