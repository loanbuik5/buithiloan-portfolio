/**
 * DEMON SLAYER (KIMETSU NO YAIBA) PORTFOLIO - BÙI THỊ LOAN (裴氏湾)
 * Interactive Script: Canvas Particles, Web Audio Katana FX, Haori Switcher, & Interactions
 */

// ============================================================================
// 1. WEB AUDIO API - SYNTHESIZED SOUND EFFECTS (Zero External Asset Dependency)
// ============================================================================
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Play Katana Swish / Blade Slash sound
function playKatanaSlashSound() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  // White noise buffer for blade friction & wind slice
  const bufferSize = audioCtx.sampleRate * 0.35;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  // Bandpass filter to sculpt the whoosh into a sharp steel slash
  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(3200, now);
  bandpass.frequency.exponentialRampToValueAtTime(600, now + 0.3);
  bandpass.Q.setValueAtTime(4.0, now);

  // Volume envelope
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.4, now + 0.04);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

  // High metallic blade resonance oscillator
  const bladeTone = audioCtx.createOscillator();
  bladeTone.type = 'triangle';
  bladeTone.frequency.setValueAtTime(2400, now);
  bladeTone.frequency.exponentialRampToValueAtTime(800, now + 0.25);

  const toneGain = audioCtx.createGain();
  toneGain.gain.setValueAtTime(0.08, now);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

  // Connect graph
  whiteNoise.connect(bandpass);
  bandpass.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  bladeTone.connect(toneGain);
  toneGain.connect(audioCtx.destination);

  whiteNoise.start(now);
  bladeTone.start(now);
  whiteNoise.stop(now + 0.35);
  bladeTone.stop(now + 0.3);
}

// Play Japanese Temple Chime / Kasugai Crow Ping
function playChimeSound() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.5);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.6);
}

// ============================================================================
// 2. AMBIENT PARTICLES CANVAS (Wisteria Petals & Sun Breathing Embers)
// ============================================================================
const canvas = document.getElementById('ambient-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = -1000;
let mouseY = -1000;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class DemonParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -20;
    this.size = Math.random() * 8 + 4;
    this.speedY = Math.random() * 1.5 + 0.8;
    this.speedX = Math.random() * 1.2 - 0.6;
    this.rotation = Math.random() * 360;
    this.rotSpeed = (Math.random() - 0.5) * 2;
    this.opacity = Math.random() * 0.6 + 0.2;

    // Type: 70% Wisteria Petal (Purple/Pink/Teal), 30% Spark / Ember
    this.isEmber = Math.random() < 0.25;
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.y * 0.02) * 0.5;
    this.rotation += this.rotSpeed;

    // Gentle mouse repulsion
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      const force = (120 - dist) / 120;
      this.x += (dx / dist) * force * 3;
      this.y += (dy / dist) * force * 3;
    }

    if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.opacity;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'tanjiro';

    if (this.isEmber) {
      // Glowing Ember
      ctx.fillStyle = currentTheme === 'zenitsu' ? '#fde047' : currentTheme === 'nezuko' ? '#f472b6' : '#ff4d4d';
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Wisteria Petal / Sakura Blossom
      let petalColor = '#c084fc';
      if (currentTheme === 'tanjiro') petalColor = '#34d399';
      if (currentTheme === 'zenitsu') petalColor = '#fbbf24';
      if (currentTheme === 'nezuko') petalColor = '#f472b6';
      if (currentTheme === 'shinobu') petalColor = '#c084fc';

      ctx.fillStyle = petalColor;
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.5, this.size * 0.8, this.size * 0.5, 0, this.size);
      ctx.bezierCurveTo(-this.size * 0.8, this.size * 0.5, -this.size * 0.8, -this.size * 0.5, 0, -this.size);
      ctx.fill();
    }

    ctx.restore();
  }
}

// Initialize particles
const particleCount = window.innerWidth < 768 ? 30 : 65;
for (let i = 0; i < particleCount; i++) {
  const p = new DemonParticle();
  p.y = Math.random() * canvas.height;
  particles.push(p);
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ============================================================================
// 3. NICHIRIN KATANA SLASH ANIMATION TRIGGER
// ============================================================================
const slashOverlay = document.getElementById('katana-slash-overlay');

function triggerKatanaSlash() {
  playKatanaSlashSound();
  slashOverlay.classList.remove('active');
  void slashOverlay.offsetWidth; // Force CSS reflow
  slashOverlay.classList.add('active');

  setTimeout(() => {
    slashOverlay.classList.remove('active');
  }, 450);
}

// Bind slash effect to primary buttons & skill cards
document.querySelectorAll('.slash-effect-btn, .skill-card').forEach((el) => {
  el.addEventListener('click', () => {
    triggerKatanaSlash();
  });
});

// ============================================================================
// 4. HAORI THEME SWITCHER
// ============================================================================
const themeBtn = document.getElementById('theme-btn');
const themeDropdown = document.getElementById('theme-dropdown');
const themeOptions = document.querySelectorAll('.theme-opt');

themeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  themeDropdown.classList.toggle('show');
});

document.addEventListener('click', () => {
  themeDropdown.classList.remove('show');
});

themeOptions.forEach((opt) => {
  opt.addEventListener('click', (e) => {
    e.stopPropagation();
    const chosenTheme = opt.getAttribute('data-theme-val');
    document.documentElement.setAttribute('data-theme', chosenTheme);

    themeOptions.forEach((o) => o.classList.remove('active'));
    opt.classList.add('active');
    themeDropdown.classList.remove('show');

    playChimeSound();
    triggerKatanaSlash();
  });
});

// ============================================================================
// 5. SOUND TOGGLE CONTROL
// ============================================================================
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const soundIcon = document.getElementById('sound-icon');
const soundToast = document.getElementById('sound-toast');
const toastText = document.getElementById('toast-text');

function showToast(toastEl, message, duration = 2500) {
  if (message && toastText) toastText.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, duration);
}

soundToggleBtn.addEventListener('click', () => {
  initAudio();
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    soundIcon.className = 'fa-solid fa-volume-high';
    showToast(soundToast, 'Âm thanh kiếm thuật đã kích hoạt!');
    playKatanaSlashSound();
  } else {
    soundIcon.className = 'fa-solid fa-volume-xmark';
    showToast(soundToast, 'Đã tắt âm thanh kiếm thuật.');
  }
});

// ============================================================================
// 6. COPY TO CLIPBOARD WITH KASUGAI CROW NOTIFICATION
// ============================================================================
const copyToast = document.getElementById('copy-toast');

function copyToClipboard(text, label) {
  initAudio();
  playChimeSound();

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      copyToast.innerHTML = `<i class="fa-solid fa-feather-pointed"></i> Quạ Kasugai: Đã sao chép ${label}!`;
      copyToast.classList.add('show');
      setTimeout(() => {
        copyToast.classList.remove('show');
      }, 2500);
    });
  } else {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    copyToast.innerHTML = `<i class="fa-solid fa-feather-pointed"></i> Quạ Kasugai: Đã sao chép ${label}!`;
    copyToast.classList.add('show');
    setTimeout(() => {
      copyToast.classList.remove('show');
    }, 2500);
  }
}

// Make copyToClipboard accessible globally for inline onclick
window.copyToClipboard = copyToClipboard;

// ============================================================================
// 7. KASUGAI CROW MESSAGE FORM HANDLER
// ============================================================================
function handleMessageSubmit(event) {
  event.preventDefault();
  initAudio();
  playKatanaSlashSound();

  const name = document.getElementById('sender-name').value;
  const email = document.getElementById('sender-email').value;
  const msg = document.getElementById('sender-message').value;

  // Mailto fallback or interactive simulation
  const subject = encodeURIComponent(`[Sát Quỷ Đội Portfolio] Thư liên hệ từ ${name}`);
  const body = encodeURIComponent(`Họ tên: ${name}\nEmail: ${email}\n\nNội dung thông điệp:\n${msg}`);

  copyToast.innerHTML = `<i class="fa-solid fa-crow"></i> Quạ Kasugai đã tiếp nhận thông điệp! Mở ứng dụng thư...`;
  copyToast.classList.add('show');
  setTimeout(() => {
    copyToast.classList.remove('show');
    window.location.href = `mailto:loanbuik5@gmail.com?subject=${subject}&body=${body}`;
  }, 1200);

  document.getElementById('kasugai-form').reset();
}
window.handleMessageSubmit = handleMessageSubmit;

// ============================================================================
// 8. MOBILE MENU TOGGLE & SMOOTH NAVIGATION
// ============================================================================
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');

mobileToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
});

// Close mobile menu when clicking nav link
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
  });
});

// ============================================================================
// 9. EASTER EGG: DEMON SLAYER MARK (DẤU ẤN SÁT QUỶ)
// ============================================================================
const easterTrigger = document.getElementById('easter-egg-trigger');
if (easterTrigger) {
  easterTrigger.addEventListener('click', () => {
    initAudio();
    playKatanaSlashSound();
    for (let i = 0; i < 40; i++) {
      const p = new DemonParticle();
      p.x = canvas.width / 2 + (Math.random() - 0.5) * 200;
      p.y = canvas.height / 2 + (Math.random() - 0.5) * 200;
      p.speedY = (Math.random() - 0.5) * 8;
      p.speedX = (Math.random() - 0.5) * 8;
      p.size = Math.random() * 12 + 6;
      particles.push(p);
    }
    showToast(soundToast, '『滅』 Dấu ấn Sát Quỷ đã thức tỉnh! Tinh thần kiếm sĩ dâng trào!');
  });
}

// ============================================================================
// 10. CUSTOM AVATAR UPLOAD, TOGGLE REAL/ANIME & LOCAL STORAGE PERSISTENCE
// ============================================================================
const avatarFileInput = document.getElementById('avatar-file-input');
const portfolioAvatar = document.getElementById('portfolio-avatar');
const btnUploadPhoto = document.getElementById('btn-upload-photo');
const btnToggleAnime = document.getElementById('btn-toggle-anime');
const avatarContainer = document.getElementById('avatar-container');

const REAL_PHOTO_PATH = 'assets/images/portrait.png';
const ANIME_PHOTO_PATH = 'assets/images/portrait_anime.jpg';
const STORAGE_KEY = 'demonslayer_custom_avatar_bui_thi_loan';

let isAnimeMode = false;

// Check saved custom avatar on load
function loadSavedAvatar() {
  const savedAvatar = localStorage.getItem(STORAGE_KEY);
  if (savedAvatar && portfolioAvatar) {
    portfolioAvatar.src = savedAvatar;
  } else if (portfolioAvatar) {
    portfolioAvatar.src = REAL_PHOTO_PATH;
  }
}
loadSavedAvatar();

// Trigger file input
if (btnUploadPhoto && avatarFileInput) {
  btnUploadPhoto.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarFileInput.click();
  });
}

if (avatarContainer && avatarFileInput) {
  avatarContainer.addEventListener('click', () => {
    avatarFileInput.click();
  });
}

// Handle file selection from computer
if (avatarFileInput && portfolioAvatar) {
  avatarFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh hợp lệ (JPG, PNG, WEBP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      portfolioAvatar.src = dataUrl;
      try {
        localStorage.setItem(STORAGE_KEY, dataUrl);
      } catch (err) {
        console.warn('Không thể lưu ảnh vào localStorage vì kích thước quá lớn, nhưng vẫn hiển thị trên trang:', err);
      }

      isAnimeMode = false;
      if (btnToggleAnime) {
        btnToggleAnime.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Bản Anime';
      }
      triggerKatanaSlash();
      showToast(soundToast, 'Quạ Kasugai: Đã đổi ảnh chân dung của bạn thành công!');
    };
    reader.readAsDataURL(file);
  });
}

// Toggle between Real photo and Anime Demon Slayer character
if (btnToggleAnime && portfolioAvatar) {
  btnToggleAnime.addEventListener('click', (e) => {
    e.stopPropagation();
    isAnimeMode = !isAnimeMode;

    if (isAnimeMode) {
      portfolioAvatar.src = ANIME_PHOTO_PATH;
      btnToggleAnime.innerHTML = '<i class="fa-solid fa-user"></i> Ảnh Thật';
      showToast(soundToast, 'Đã chuyển sang phong cách Anime Sát Quỷ Đội!');
    } else {
      const savedAvatar = localStorage.getItem(STORAGE_KEY);
      portfolioAvatar.src = savedAvatar || REAL_PHOTO_PATH;
      btnToggleAnime.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Bản Anime';
      showToast(soundToast, 'Đã hiển thị ảnh chân dung thật của bạn!');
    }
    triggerKatanaSlash();
  });
}

