import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. LENIS SMOOTH SCROLL INITIALIZATION
// ==========================================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smoothTouch: false,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// ==========================================
// INSTANT NAVBAR SCROLL SENSITIVE HIDE / SHOW (Transparent Header)
// ==========================================
const navbarRightMenu = document.getElementById('navbar-right-menu');
let lastScrollY = 0;
const scrollThreshold = 10;

lenis.on('scroll', ({ scroll }) => {
  ScrollTrigger.update();
  detectActiveSection();

  const currentScroll = Math.max(0, scroll);
  const scrollDelta = currentScroll - lastScrollY;

  if (navbarRightMenu) {
    if (currentScroll <= scrollThreshold) {
      // At top of page -> Always show right menu
      navbarRightMenu.classList.remove('opacity-0', 'pointer-events-none');
      navbarRightMenu.classList.add('opacity-100', 'pointer-events-auto');
    } else if (scrollDelta > 2) {
      // Instant scroll down -> Hide right menu
      navbarRightMenu.classList.add('opacity-0', 'pointer-events-none');
      navbarRightMenu.classList.remove('opacity-100', 'pointer-events-auto');
    } else if (scrollDelta < -2) {
      // Instant scroll up -> Show right menu
      navbarRightMenu.classList.remove('opacity-0', 'pointer-events-none');
      navbarRightMenu.classList.add('opacity-100', 'pointer-events-auto');
    }
  }

  lastScrollY = currentScroll;
});

// ==========================================
// DRAWER NAVIGATION MENU HANDLER
// ==========================================
const drawer = document.getElementById('eyetractive-drawer');
const menuBtn = document.getElementById('eyetractive-menu-btn');
const closeDrawerBtn = document.getElementById('close-eyetractive-drawer');

function openDrawer() {
  if (!drawer) return;
  drawer.classList.remove('opacity-0', 'pointer-events-none');
  drawer.classList.add('opacity-100', 'pointer-events-auto');
  lenis.stop();
}

function closeDrawer() {
  if (!drawer) return;
  drawer.classList.add('opacity-0', 'pointer-events-none');
  drawer.classList.remove('opacity-100', 'pointer-events-auto');
  lenis.start();
}

if (menuBtn) menuBtn.addEventListener('click', openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);

// Close drawer when clicking any drawer nav link
document.querySelectorAll('#eyetractive-drawer a').forEach(link => {
  link.addEventListener('click', closeDrawer);
});


// ==========================================
// LIVE ACCENT THEME COLOR SWITCHER (Purple / Blue / Green)
// ==========================================
const themeColors = {
  purple: { color: '#7000FF', light: 'rgba(112, 0, 255, 0.08)' },
  blue: { color: '#0052CC', light: 'rgba(0, 82, 204, 0.08)' },
  green: { color: '#044E35', light: 'rgba(4, 78, 53, 0.08)' }
};

window.setThemeAccent = function (themeName) {
  if (!themeColors[themeName]) return;
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('en_theme_accent', themeName);

  // Update SVG stroke colors in hero canvas dynamically
  const accentHex = themeColors[themeName].color;
  document.querySelectorAll('.hero-accent-svg path').forEach(path => {
    const currentStroke = path.getAttribute('stroke');
    if (currentStroke && currentStroke !== 'none') {
      if (path.classList.contains('opacity-low')) {
        path.setAttribute('stroke', accentHex);
      } else {
        path.setAttribute('stroke', accentHex);
      }
    }
  });

  // Update dots in hero SVG line
  document.querySelectorAll('.hero-accent-dot').forEach(el => {
    el.style.backgroundColor = accentHex;
  });

  // Update active state in switcher UI
  document.querySelectorAll('#theme-switcher-control button').forEach(btn => {
    if (btn.getAttribute('data-theme-btn') === themeName) {
      btn.classList.add('ring-2', 'ring-white', 'scale-125');
    } else {
      btn.classList.remove('ring-2', 'ring-white', 'scale-125');
    }
  });
};

// Restore saved theme on initial load (defaults to green)
const savedTheme = localStorage.getItem('en_theme_accent') || 'green';
setTimeout(() => {
  setThemeAccent(savedTheme);
}, 50);




// ==========================================
// 3. GIMMICK: AMBIENT HOVER GRADIENT MOUSE TRACKING
// ==========================================
document.querySelectorAll('.ambient-gradient-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// ==========================================
// 4. DYNAMIC NAVBAR BRAND LOGO SWITCHER
// ==========================================
const navBrandText = document.getElementById('nav-brand-text');
const storySections = document.querySelectorAll('[data-story]');

const HASH_KEYWORD_MAP = {
  '#hero': 'prefix',
  '#story': 'prefix',
  '#prefix': 'prefix',
  '#showcase': 'work',
  '#work': 'work',
  '#works': 'work',
  '#passionate': 'passionate',
  '#identity': 'identity',
  '#atelier-desk': 'contact',
  '#contact': 'contact'
};

function updateNavBrandText(keyword) {
  if (!navBrandText || !keyword) return;
  const newText = `en-${keyword}`;
  if (navBrandText.textContent.trim() === newText) {
    if (navBrandText.style.opacity !== '1') navBrandText.style.opacity = '1';
    return;
  }

  // Instant switch with zero delay
  navBrandText.textContent = newText;
  navBrandText.style.opacity = '1';
  navBrandText.style.transform = 'none';
}

let isNavigating = false;
let navigationTimer = null;

function detectActiveSection() {
  if (isNavigating) return;

  const visibleSections = Array.from(document.querySelectorAll('[data-story]')).filter(
    sec => sec.offsetParent !== null && sec.style.display !== 'none'
  );
  if (!visibleSections.length) return;

  const currentScroll = window.scrollY || window.pageYOffset || 0;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // If scrolled near bottom of page (within 150px), activate the last visible section (e.g. contact)
  if (currentScroll >= maxScroll - 150) {
    const lastSec = visibleSections[visibleSections.length - 1];
    if (lastSec) {
      const lastKeyword = lastSec.getAttribute('data-story');
      if (lastKeyword) {
        updateNavBrandText(lastKeyword);
        return;
      }
    }
  }

  // If at very top of page (first 80px), activate first visible section
  if (currentScroll < 80 && visibleSections[0]) {
    const firstKeyword = visibleSections[0].getAttribute('data-story');
    if (firstKeyword) {
      updateNavBrandText(firstKeyword);
      return;
    }
  }

  const viewportThreshold = window.innerHeight * 0.45;
  let activeKeyword = null;

  for (const sec of visibleSections) {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= viewportThreshold && rect.bottom >= viewportThreshold) {
      activeKeyword = sec.getAttribute('data-story');
      break;
    }
  }

  if (activeKeyword) {
    updateNavBrandText(activeKeyword);
  }
}

storySections.forEach((section) => {
  const storyKeyword = section.getAttribute('data-story');

  ScrollTrigger.create({
    trigger: section,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter: () => { if (!isNavigating) updateNavBrandText(storyKeyword); },
    onEnterBack: () => { if (!isNavigating) updateNavBrandText(storyKeyword); },
  });
});

// Window passive scroll listener for brand switcher
window.addEventListener('scroll', detectActiveSection, { passive: true });

// ==========================================
// DYNAMIC PAGE VIEW ROUTER & SCROLL CONTROLLER
// ==========================================
const sectionHero = document.getElementById('hero');
const sectionPartners = document.getElementById('partners');
const sectionShowcase = document.getElementById('showcase');
const sectionPassionate = document.getElementById('passionate');
const sectionIdentity = document.getElementById('identity');
const sectionContact = document.getElementById('atelier-desk');

function updatePageView(targetHash) {
  const hash = targetHash || window.location.hash || '#hero';

  if (hash === '#passionate') {
    // Dedicated Passionate View: passionate -> contact
    showSections([sectionPassionate, sectionContact]);
    hideSections([sectionHero, sectionPartners, sectionShowcase, sectionIdentity]);
  } else if (hash === '#identity') {
    // Dedicated Identity View: identity -> contact
    showSections([sectionIdentity, sectionContact]);
    hideSections([sectionHero, sectionPartners, sectionShowcase, sectionPassionate]);
  } else {
    // Main Home Flow: hero (prefix) -> partners -> showcase (work) -> contact
    showSections([sectionHero, sectionPartners, sectionShowcase, sectionContact]);
    hideSections([sectionPassionate, sectionIdentity]);
  }

  // Immediately update brand text to match active route
  const targetKeyword = HASH_KEYWORD_MAP[hash] || 'prefix';
  updateNavBrandText(targetKeyword, true);

  // Refresh GSAP ScrollTrigger to recalculate active trigger positions
  setTimeout(() => {
    ScrollTrigger.refresh();
    if (!isNavigating) detectActiveSection();
  }, 60);
}

function showSections(sections) {
  sections.forEach(sec => {
    if (sec) sec.style.display = 'block';
  });
}

function hideSections(sections) {
  sections.forEach(sec => {
    if (sec) sec.style.display = 'none';
  });
}

function handleNavigation(hash) {
  if (!hash) return;
  const cleanHash = hash.startsWith('#') ? hash : `#${hash}`;

  isNavigating = true;
  if (navigationTimer) clearTimeout(navigationTimer);

  updatePageView(cleanHash);

  let targetId = cleanHash.substring(1);
  if (cleanHash === '#works' || cleanHash === '#work') targetId = 'showcase';
  if (cleanHash === '#contact') targetId = 'atelier-desk';
  if (cleanHash === '#story' || cleanHash === '#prefix') targetId = 'hero';

  const targetKeyword = HASH_KEYWORD_MAP[cleanHash] || 'prefix';
  updateNavBrandText(targetKeyword, true);

  setTimeout(() => {
    const targetEl = document.getElementById(targetId);
    if (targetEl && targetEl.style.display !== 'none') {
      lenis.scrollTo(targetEl, {
        offset: 0,
        duration: 1.0,
        onComplete: () => {
          isNavigating = false;
          detectActiveSection();
        }
      });
    } else {
      isNavigating = false;
    }
  }, 70);

  navigationTimer = setTimeout(() => {
    isNavigating = false;
  }, 1200);
}

// Bind navbar and drawer links to router
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const targetHash = this.getAttribute('href');
    if (targetHash && targetHash.startsWith('#')) {
      e.preventDefault();
      window.history.pushState(null, null, targetHash);
      handleNavigation(targetHash);
    }
  });
});

// Handle Hash Changes & Browser History Back/Forward
window.addEventListener('popstate', () => {
  handleNavigation(window.location.hash || '#hero');
});
window.addEventListener('hashchange', () => {
  handleNavigation(window.location.hash || '#hero');
});

// Initialize on page load immediately
const initialHash = window.location.hash || '#hero';
handleNavigation(initialHash);

// ==========================================
// PENTAGRAM WORK CATEGORY FILTER CONTROLLER
// ==========================================
window.filterWorks = function (filterType) {
  const cards = document.querySelectorAll('.work-card-item');
  const buttons = document.querySelectorAll('.work-filter-btn');

  // Update active button state
  buttons.forEach(btn => {
    if (btn.getAttribute('data-filter') === filterType) {
      btn.classList.add('bg-navy', 'text-white', 'shadow-sm');
      btn.classList.remove('text-navy-muted', 'hover:bg-white/60');
    } else {
      btn.classList.remove('bg-navy', 'text-white', 'shadow-sm');
      btn.classList.add('text-navy-muted', 'hover:bg-white/60');
    }
  });

  // Filter cards smoothly
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category-type');
    if (filterType === 'all' || cardCat === filterType) {
      card.style.display = 'block';
      gsap.fromTo(card, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    } else {
      card.style.display = 'none';
    }
  });

  // Refresh Lenis & ScrollTrigger positions
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);
};

// ==========================================
// 5. GSAP REVEAL ANIMATIONS
// ==========================================
gsap.utils.toArray('section').forEach((sec) => {
  const panel = sec.querySelector('.ice-panel');
  if (panel) {
    gsap.from(panel, {
      scrollTrigger: {
        trigger: sec,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 30,
      duration: 0.9,
      ease: 'power3.out'
    });
  }
});

// ==========================================
// 6. PROJECT SHOWCASE MODAL LIGHTBOX WITH MULTI-MEDIA GALLERY
// ==========================================
const projectData = {
  'the-globe-nextopia': {
    title: 'The Globe at NEXTOPIA',
    headline: 'Transforming live planetary climate telemetry and eco-metrics into a living 360° generative data canvas for Siam Paragon’s iconic spherical landmark.',
    category: 'Creative Technology & Interactive Installation',
    tags: ['#CreativeTechnology', '#DataArt', '#RealTimeVisualization', '#GlobeDisplay', '#Unity', '#InteractiveInstallation', '#PublicArt', '#SiamParagon'],
    year: '2025',
    client: 'Siam Paragon (NEXTOPIA)',
    credits: 'en-prefix, STEP SOLUTION, Small.Good.Studio',
    description: `NEXTOPIA at Siam Paragon was envisioned as a futuristic eco-cultural landmark uniting sustainability, digital innovation, and urban lifestyle. Its centerpiece is "THE GLOBE," an aerial 360-degree spherical LED installation suspended in the central hall. The primary design challenge was to elevate this massive spherical screen beyond a passive video display, turning it into a living, responsive representation of Earth's vital signs—often framed as the planet's seasonal breathing rhythm—while actively reflecting NEXTOPIA's sustainability vision and visitor community engagement.

To bridge complex environmental science with public spatial experience, we co-engineered an end-to-end Live Global Visual pipeline. The platform continuously ingests planetary telemetry from NASA (surface air temperature, carbon monoxide, ozone, and precipitation), USGS seismic feeds, GDACS worldwide flood/wildfire alerts, and GISTDA localized climate datasets (PM 2.5 and Thailand flood monitoring). By converting dense numeric telemetry into an intuitive, fluid generative visual language, the installation empowers Siam Paragon with a dynamic living landmark that communicates global environmental awareness in an accessible and impactful format.

Architecturally, the system operates on an automated real-time ingestion and rendering loop built for resilient 24/7 public exhibition. Global meteorological vector fields are processed directly through PC-based software and GPU particle computation to drive dynamic wind currents that adjust continuously to speed and elevation. Furthermore, the architecture seamlessly integrates with the ONESIAM app ecosystem—overlaying hourly sustainability metrics and minutely interactive leaderboards—complete with automated fallback caching to guarantee uninterrupted 4K spherical projection.`,
    media: [
      { type: 'youtube', url: 'https://youtu.be/oL5rSQWq4SE', title: 'The Globe 360° Spherical LED Showcase' },
      { type: 'image', url: './assets/works/the-globe-wind-particle.jpg', title: 'Planetary Telemetry & Vector Fields' },
      { type: 'image', url: './assets/works/the-globe-data-pipeline.jpg', title: 'Real-time Climate Data Pipeline' }
    ]
  },
  flowbox: {
    title: 'The Globe at NEXTOPIA',
    headline: 'Transforming live planetary climate telemetry and eco-metrics into a living 360° generative data canvas for Siam Paragon’s iconic spherical landmark.',
    category: 'Creative Technology & Interactive Installation',
    tags: ['#CreativeTechnology', '#DataArt', '#RealTimeVisualization', '#GlobeDisplay', '#Unity', '#InteractiveInstallation', '#PublicArt', '#SiamParagon'],
    year: '2025 – 2026',
    client: 'Siam Paragon (NEXTOPIA)',
    credits: 'en-prefix, STEP SOLUTION, Small.Good.Studio',
    description: `NEXTOPIA at Siam Paragon was envisioned as a futuristic eco-cultural landmark uniting sustainability, digital innovation, and urban lifestyle. Its centerpiece is "THE GLOBE," an aerial 360-degree spherical LED installation suspended in the central hall. The primary design challenge was to elevate this massive spherical screen beyond a passive video display, turning it into a living, responsive representation of Earth's vital signs—often framed as the planet's seasonal breathing rhythm—while actively reflecting NEXTOPIA's sustainability vision and visitor community engagement.

To bridge complex environmental science with public spatial experience, we co-engineered an end-to-end Live Global Visual pipeline. The platform continuously ingests planetary telemetry from NASA (surface air temperature, carbon monoxide, ozone, and precipitation), USGS seismic feeds, GDACS worldwide flood/wildfire alerts, and GISTDA localized climate datasets (PM 2.5 and Thailand flood monitoring). By converting dense numeric telemetry into an intuitive, fluid generative visual language, the installation empowers Siam Paragon with a dynamic living landmark that communicates global environmental awareness in an accessible and impactful format.

Architecturally, the system operates on an automated real-time ingestion and rendering loop built for resilient 24/7 public exhibition. Global meteorological vector fields are processed directly through PC-based software and GPU particle computation to drive dynamic wind currents that adjust continuously to speed and elevation. Furthermore, the architecture seamlessly integrates with the ONESIAM app ecosystem—overlaying hourly sustainability metrics and minutely interactive leaderboards—complete with automated fallback caching to guarantee uninterrupted 4K spherical projection.`,
    media: [
      { type: 'youtube', url: 'https://youtu.be/oL5rSQWq4SE', title: 'The Globe 360° Spherical LED Showcase' },
      { type: 'image', url: './assets/works/the-globe-wind-particle.jpg', title: 'Planetary Telemetry & Vector Fields' },
      { type: 'image', url: './assets/works/the-globe-data-pipeline.jpg', title: 'Real-time Climate Data Pipeline' }
    ]
  },
  kroma: {
    title: 'Kroma Atelier',
    headline: 'A warm, approachable WebGL sanctuary depicting light, canvas depth, and fine art with exquisite fidelity.',
    category: 'Virtual Gallery',
    tags: ['#webgl', '#3dgallery', '#fineart', '#shaders', '#threejs'],
    year: '2024',
    client: 'Kroma Fine Art Atelier',
    credits: 'en- studio, Kroma Curatorial Team',
    description: `Kroma Atelier sought to bridge the physical gallery experience with high-net-worth digital art collectors globally. Traditional e-commerce layouts failed to convey the tactile warmth, brushstroke texture, and dynamic lighting of original fine artworks.

We engineered a 3D WebGL virtual showroom utilizing custom sub-surface scattering shaders and real-time volumetric lighting. The digital sanctuary replicates natural gallery illumination, letting collectors observe canvas paint depth and micro-textures from any angle.

The platform features private digital viewing rooms optimized for high-end client presentations across desktop, tablet, and touch screens, driving a 3.4x increase in collector engagement.`,
    media: [
      { type: 'image', url: './assets/works/portrait.jpg', title: '3D Gallery Collector Room' },
      { type: 'image', url: './assets/works/mandala.jpg', title: 'Sub-surface Scattering Shader Material' }
    ]
  },
  'er-vipe': {
    title: 'ER-VIPE: Emergency Room – Virtual Interprofessional Education',
    headline: 'Empowering frontline healthcare teams to master crisis collaboration, critical communication, and compassionate decision-making through immersive 3D simulation.',
    category: 'Medical Simulation & Healthcare EdTech',
    tags: ['#MedicalSimulation', '#HealthcareEdTech', '#InterprofessionalEducation', '#TeamSTEPPS', '#PatientSafety', '#VirtualSimulation', '#Unity3D', '#ChulalongkornUniversity'],
    year: '2024 – 2025',
    client: 'Faculty of Medicine, Chulalongkorn University & ER-VIPE Consortium (www.ervipe.com)',
    credits: 'en-prefix, ER-VIPE Study Group, Faculty of Medicine Chulalongkorn University, Srisavarindhira Thai Red Cross Institute of Nursing',
    description: `In the high-stakes environment of emergency resuscitation, patient survival often hinges on how effectively a multidisciplinary care team collaborates under acute cognitive load. Across emergency departments, miscommunication, hierarchical hesitation, and siloed decision-making between doctors, nurses, pharmacists, and laboratory specialists remain leading causes of preventable clinical errors. The ER-VIPE initiative—led by the Faculty of Medicine at Chulalongkorn University—sought a scalable training environment where frontline healthcare teams could repeatedly practice high-stress collaboration and patient safety protocols before stepping into actual emergency rooms.

To translate this clinical curriculum into an interactive experience, we co-designed an evolving 3D virtual emergency simulation platform. The system immerses teams into dynamic trauma cases—such as an elderly patient arriving with multi-system injuries and rapid shock—requiring synchronized interventions across four deteriorating clinical states. Instead of grading only procedural checklists, the simulation places primary emphasis on critical non-technical skills: executing structured communication (ISBAR), speaking up across professional boundaries during life-saving procedures, and handling sensitive ethical decisions with families through empathy and active listening.

Operating as a networked 3D environment in Unity, ER-VIPE connects students from medicine, nursing, pharmacy, medical technology, and radiologic technology into a single synchronized emergency ward. Actions taken at a nursing station, automated medication tube, or blood-matching laboratory trigger real-time physiological responses in the patient, creating immediate cause-and-effect learning loops. Backed by peer-reviewed clinical education studies, the platform provides an objective debriefing data pipeline that turns virtual trial-and-error into lasting psychological safety, mutual trust, and effective crisis teamwork.`,
    media: [
      { type: 'image', url: './assets/works/ERVIPE_1.png', title: 'ภาพการประสานงานและสื่อสารข้ามสายวิชาชีพ แพทย์–พยาบาล–เภสัชกร–เทคนิคการแพทย์–รังสีเทคนิค' },
      { type: 'image', url: './assets/works/ERVIPE_2.png', title: 'ภาพบรรยากาศห้องฉุกเฉินเสมือนจริง 3D Multi-Role ER Simulation' },
      { type: 'image', url: './assets/works/ERVIPE_3.png', title: 'ภาพ Interactive Dynamic Scenario: การเตรียมยาและโลหิตกู้ชีพฉุกเฉิน' },
      { type: 'image', url: './assets/works/ERVIPE_4.png', title: 'ข้อมูล Objective Debriefing & Learning Objective Survey Pipeline' }
    ]
  },
  nexus: {
    title: 'ER-VIPE: Emergency Room – Virtual Interprofessional Education',
    headline: 'Empowering frontline healthcare teams to master crisis collaboration, critical communication, and compassionate decision-making through immersive 3D simulation.',
    category: 'Medical Simulation & Healthcare EdTech',
    tags: ['#MedicalSimulation', '#HealthcareEdTech', '#InterprofessionalEducation', '#TeamSTEPPS', '#PatientSafety', '#VirtualSimulation', '#Unity3D', '#ChulalongkornUniversity'],
    year: '2024 – 2025',
    client: 'Faculty of Medicine, Chulalongkorn University & ER-VIPE Consortium (www.ervipe.com)',
    credits: 'en-prefix, ER-VIPE Study Group, Faculty of Medicine Chulalongkorn University, Srisavarindhira Thai Red Cross Institute of Nursing',
    description: `In the high-stakes environment of emergency resuscitation, patient survival often hinges on how effectively a multidisciplinary care team collaborates under acute cognitive load. Across emergency departments, miscommunication, hierarchical hesitation, and siloed decision-making between doctors, nurses, pharmacists, and laboratory specialists remain leading causes of preventable clinical errors. The ER-VIPE initiative—led by the Faculty of Medicine at Chulalongkorn University—sought a scalable training environment where frontline healthcare teams could repeatedly practice high-stress collaboration and patient safety protocols before stepping into actual emergency rooms.

To translate this clinical curriculum into an interactive experience, we co-designed an evolving 3D virtual emergency simulation platform. The system immerses teams into dynamic trauma cases—such as an elderly patient arriving with multi-system injuries and rapid shock—requiring synchronized interventions across four deteriorating clinical states. Instead of grading only procedural checklists, the simulation places primary emphasis on critical non-technical skills: executing structured communication (ISBAR), speaking up across professional boundaries during life-saving procedures, and handling sensitive ethical decisions with families through empathy and active listening.

Operating as a networked 3D environment in Unity, ER-VIPE connects students from medicine, nursing, pharmacy, medical technology, and radiologic technology into a single synchronized emergency ward. Actions taken at a nursing station, automated medication tube, or blood-matching laboratory trigger real-time physiological responses in the patient, creating immediate cause-and-effect learning loops. Backed by peer-reviewed clinical education studies, the platform provides an objective debriefing data pipeline that turns virtual trial-and-error into lasting psychological safety, mutual trust, and effective crisis teamwork.`,
    media: [
      { type: 'image', url: './assets/works/ERVIPE_1.png', title: 'ภาพการประสานงานและสื่อสารข้ามสายวิชาชีพ แพทย์–พยาบาล–เภสัชกร–เทคนิคการแพทย์–รังสีเทคนิค' },
      { type: 'image', url: './assets/works/ERVIPE_2.png', title: 'ภาพบรรยากาศห้องฉุกเฉินเสมือนจริง 3D Multi-Role ER Simulation' },
      { type: 'image', url: './assets/works/ERVIPE_3.png', title: 'ภาพ Interactive Dynamic Scenario: การเตรียมยาและโลหิตกู้ชีพฉุกเฉิน' },
      { type: 'image', url: './assets/works/ERVIPE_4.png', title: 'ข้อมูล Objective Debriefing & Learning Objective Survey Pipeline' }
    ]
  },
  'next-tech-collective-momentum': {
    title: 'Collective Momentum: Real-Time Color Blending',
    headline: 'Transforming public pedestrian movement into living collaborative art on Siam Paragon’s flagship tech floor.',
    category: 'Interactive Installation & Spatial Media',
    tags: ['#NextTech', '#InteractiveInstallation', '#MotionTracking', '#CustomShaders', '#GenerativeArt', '#RealtimeColorBlending', '#ComputerVision', '#SiamParagon'],
    year: '2026',
    client: 'Siam Paragon (NEXT TECH)',
    credits: 'en-prefix, Small.Good.Studio',
    description: `Situated on the 4th floor of Siam Paragon, NEXT TECH was created as an innovation and learning hub dedicated to youth, digital communities, and creative exploration. While architectural LED walls in commercial venues frequently serve as passive advertising displays or simple motion-reactive mirrors, the objective for this central wall was to create an interactive landmark that fundamentally reshapes the ambiance of the room. Rather than having visuals merely shadow passersby, the space required an experience that empowers visitors to actively alter the mood, color, and dimensional depth of their environment.

Under the concept “Collective Momentum: Where Motion Becomes Collective Art,” we crafted an interactive canvas centered on human connection and real-time color synthesis based on live motion tracking and spatial proximity. As visitors enter the tracking area, the system assigns a unique personal color palette and radiates a soft, translucent aura around their silhouette. When two people move toward each other, their fields of light exhibit a mutual gravitational pull, morphing and blending in real time to generate unexpected chromatic combinations on the wall. When multiple people stand together, these individual lights link into an expansive, luminous wave that blankets the entire space, turning isolated footsteps into a shared act of co-creation.

Technically, the installation synergizes multi-person optical tracking with a custom GPU shading pipeline. Calibrated wide-angle computer vision sensing continuously tracks the coordinates, movement vectors, and relative proximity of multiple pedestrians in high-density foot traffic. These spatial coordinates feed directly into custom shaders engineered for translucency, iridescence, and subsurface scattering. As pedestrians converge, the shader dynamically interpolates optical properties and morphs chromatic boundaries at the pixel level with zero latency, delivering a dreamlike, refractive radiance that responds immediately and fluidly to human presence.`,
    media: [
      { type: 'video', url: './assets/works/collective_momentum.mp4', title: 'Collective Momentum: วิดีโอจำลองการแสดงผลบนจอ Real-Time Interactive' }
    ]
  },
  'vr-temple-of-dawn': {
    title: 'VR Temple of Dawn (เกมแอปพลิเคชันความเป็นจริงเสมือนวัดอรุณฯ)',
    headline: 'Bridging sacred Thai architectural heritage and modern cultural tourism through collaborative, high-fidelity spatial VR storytelling.',
    category: 'Cultural Heritage Tech & Interactive VR Game',
    tags: ['#CulturalHeritage', '#VirtualReality', '#Unity3D', '#Photogrammetry', '#LiDAR', '#AsymmetricCoop', '#SpatialAudio', '#WatArun', '#NRCT'],
    year: '2023',
    client: 'วัดอรุณราชวราราม ราชวรมหาวิหาร / สำนักงานการวิจัยแห่งชาติ (วช.)',
    credits: 'en-prefix, คณะผู้วิจัยโครงการเทคโนโลยีเสมือนจริงเพื่อมรดกวัฒนธรรมวัดอรุณฯ',
    description: `Wat Arun Ratchawararam (The Temple of Dawn) is one of Thailand’s most iconic landmarks, drawing millions of global visitors. However, on-site visitors frequently encounter communication hurdles: lack of comprehensive multilingual guides, inaccessible historical depths, and restricted physical access to sacred upper elevations like the central prang's pinnacle (Noppasoon) and closed directional pavilions. Supported by the National Research Council of Thailand (NRCT), this project set out to bridge the gap between physical tourism and deep architectural history by creating an interactive virtual reality application for sustainable cultural tourism.

Rather than building an isolated, passive 360-degree tour, we engineered an interactive, asymmetric 2-player collaborative gameplay model rooted in real visitor behaviors. While Player 1 enters the immersive virtual environment via a 6DoF VR headset, Player 2 acts as a cultural navigator holding physical/QR-accessible clue sheets. Together, they navigate four modular mini-games mapped to Wat Arun’s historical core from the Ayutthaya period: The Directional Pavilions (decoding the Buddha's life events), The Principal Prang (piloting a holographic drone to decode Buddhist cosmology and Mount Sumeru architecture from a bird's-eye view), The Old Ordination Hall (classifying ancient Buddha postures across Thai artistic eras), and The Old Sermon Hall (analyzing the wooden Chulamani pagoda and the Four Directional Deities).

Technically, the experience is driven by an end-to-end 3D reconstruction and optimization pipeline. On-site architectural assets and sacred spaces were captured using millimeter-level LiDAR laser scanning combined with high-resolution DSLR photogrammetry. The resulting point clouds were converted into clean, retopologized meshes with PBR textures optimized specifically for standalone Oculus Quest hardware via Unity Engine. Featuring spatialized 3D audio and real-time haptic feedback, the system delivers an authentic cultural exploration that field research validated with over 93% of foreign tourists and 100% of Thai visitors willing to adopt as a premium on-site cultural service.`,
    media: [
      { type: 'image', url: './assets/works/VR_Temple of Dawn_2.png', title: 'VR Temple of Dawn: ภารกิจเกมและกระบวนการ 3D Reconstruction บน Unity' },
      { type: 'image', url: './assets/works/VR_Temple of Dawn_1.png', title: 'VR Temple of Dawn: ภาพรวมประสบการณ์ผู้เล่นสวมแว่น VR ท่องสำรวจวัดอรุณฯ' },
      { type: 'video', url: './assets/works/VR_Temple of Dawn_3.mp4', title: 'VR Temple of Dawn: วิดีโอจำลองประสบการณ์และเกมเพลย์' }
    ]
  },
  aether: {
    title: 'VR Temple of Dawn (เกมแอปพลิเคชันความเป็นจริงเสมือนวัดอรุณฯ)',
    headline: 'Bridging sacred Thai architectural heritage and modern cultural tourism through collaborative, high-fidelity spatial VR storytelling.',
    category: 'Cultural Heritage Tech & Interactive VR Game',
    tags: ['#CulturalHeritage', '#VirtualReality', '#Unity3D', '#Photogrammetry', '#LiDAR', '#AsymmetricCoop', '#SpatialAudio', '#WatArun', '#NRCT'],
    year: '2023',
    client: 'วัดอรุณราชวราราม ราชวรมหาวิหาร / สำนักงานการวิจัยแห่งชาติ (วช.)',
    credits: 'en-prefix, คณะผู้วิจัยโครงการเทคโนโลยีเสมือนจริงเพื่อมรดกวัฒนธรรมวัดอรุณฯ',
    description: `Wat Arun Ratchawararam (The Temple of Dawn) is one of Thailand’s most iconic landmarks, drawing millions of global visitors. However, on-site visitors frequently encounter communication hurdles: lack of comprehensive multilingual guides, inaccessible historical depths, and restricted physical access to sacred upper elevations like the central prang's pinnacle (Noppasoon) and closed directional pavilions. Supported by the National Research Council of Thailand (NRCT), this project set out to bridge the gap between physical tourism and deep architectural history by creating an interactive virtual reality application for sustainable cultural tourism.

Rather than building an isolated, passive 360-degree tour, we engineered an interactive, asymmetric 2-player collaborative gameplay model rooted in real visitor behaviors. While Player 1 enters the immersive virtual environment via a 6DoF VR headset, Player 2 acts as a cultural navigator holding physical/QR-accessible clue sheets. Together, they navigate four modular mini-games mapped to Wat Arun’s historical core from the Ayutthaya period: The Directional Pavilions (decoding the Buddha's life events), The Principal Prang (piloting a holographic drone to decode Buddhist cosmology and Mount Sumeru architecture from a bird's-eye view), The Old Ordination Hall (classifying ancient Buddha postures across Thai artistic eras), and The Old Sermon Hall (analyzing the wooden Chulamani pagoda and the Four Directional Deities).

Technically, the experience is driven by an end-to-end 3D reconstruction and optimization pipeline. On-site architectural assets and sacred spaces were captured using millimeter-level LiDAR laser scanning combined with high-resolution DSLR photogrammetry. The resulting point clouds were converted into clean, retopologized meshes with PBR textures optimized specifically for standalone Oculus Quest hardware via Unity Engine. Featuring spatialized 3D audio and real-time haptic feedback, the system delivers an authentic cultural exploration that field research validated with over 93% of foreign tourists and 100% of Thai visitors willing to adopt as a premium on-site cultural service.`,
    media: [
      { type: 'image', url: './assets/works/VR_Temple of Dawn_2.png', title: 'VR Temple of Dawn: ภารกิจเกมและกระบวนการ 3D Reconstruction บน Unity' },
      { type: 'image', url: './assets/works/VR_Temple of Dawn_1.png', title: 'VR Temple of Dawn: ภาพรวมประสบการณ์ผู้เล่นสวมแว่น VR ท่องสำรวจวัดอรุณฯ' },
      { type: 'video', url: './assets/works/VR_Temple of Dawn_3.mp4', title: 'VR Temple of Dawn: วิดีโอจำลองประสบการณ์และเกมเพลย์' }
    ]
  },
  zenith: {
    title: 'Zenith Health',
    headline: 'Zero-latency 3D volumetric medical scan interpretation and AI-assisted clinical decisioning.',
    category: 'HealthTech Platform',
    tags: ['#healthtech', '#webgpu', '#dicom', '#aidiagnostics', '#3dmedical'],
    year: '2024',
    client: 'Zenith Health Medical Institute',
    credits: 'en- studio, Medical Imaging Lab, Zenith AI',
    description: `Radiologists and surgeons frequently faced delays loading dense DICOM volumetric medical scans, requiring heavy local workstation software that limited remote cross-hospital consultations.

We built a zero-latency WebGPU volumetric viewer capable of streaming high-resolution CT and MRI scans directly in browser environments. An AI confidence layer highlights subtle anomalies with interactive slider controls.

The platform features HIPAA-compliant encrypted pipelines, cutting scan preparation time by 55% while enabling real-time surgical collaboration across medical centers.`,
    media: [
      { type: 'image', url: './assets/works/mandala.jpg', title: '3D Volumetric Scan Viewer' },
      { type: 'image', url: './assets/works/portrait.jpg', title: 'AI Anomaly Detection Overlay' }
    ]
  },
  'siam-discovery-magical-exploration': {
    title: 'The Magical Exploration (Sticky Fun)',
    headline: 'Connecting personal mobile WebGL creativity with monumental architectural screens for Siam Discovery’s festive celebration.',
    category: 'Phygital Retail Experience & Interactive Media',
    tags: ['#SiamDiscovery', '#InteractiveInstallation', '#WebGL', '#RetailTech'],
    year: '2024',
    client: 'Siam Discovery (Siam Piwat Group)',
    credits: 'en-prefix, STEP SOLUTIONS, Small.Good.Studio',
    description: `During the year-end festive holiday season, premier retail destinations compete to capture the imagination of bustling shoppers. For Siam Discovery’s celebration campaign, “The Magical Exploration,” the goal was to transcend conventional static holiday decorations and passive video signage. The space required an inclusive, playful interactive installation that invites visitors to leave their personal mark on the building's architecture—transforming public LED displays into an active communal celebration that encourages spontaneous social sharing and drives engagement toward the ONESIAM retail ecosystem.

To create a seamless bridge between visitors and physical screens, we developed an instant mobile-to-screen interactive experience. Removing the barrier of native app downloads, visitors simply scan an on-site QR code on digital signages to launch a lightweight 3D WebGL customizer directly within their mobile browsers. Shoppers can design their own 3D festive balloon—selecting shapes, tassels, and iconic “Discovery Man” mascot stickers alongside cheerful typography. After holding the on-screen pump button to inflate their creation, a single upward swipe gesture launches the personalized balloon off their phone screen and directly into the shared virtual sky of the massive architectural LED wall.

The system is powered by a synchronized cross-device architecture connecting client-side WebGL, a cloud communication relay, and an on-premise 3D rendering program. The mobile editor uses browser-based WebGL to handle real-time 3D rotations and sticker placements smoothly on mobile hardware. Upon release, data payloads are instantly dispatched through a low-latency cloud server to on-site display computers, where a high-performance 3D engine calculates dynamic buoyancy, wind drift, and lifecycles across multiple simultaneous balloons. Once launched, visitors receive an auto-generated animated share card optimized for social media, complete with direct links to the ONESIAM app for seasonal shopping privileges.`,
    media: [
      { type: 'image', url: './assets/works/The Magical Exploration_1.png', title: 'The Magical Exploration: ภาพรวมกำแพงจอ LED ขนาดใหญ่ ณ Siam Discovery' },
      { type: 'youtube', url: 'https://youtu.be/pG2z-A3BpXs', title: 'The Magical Exploration: วิดีโอประสบการณ์ Interactive Screen' },
      { type: 'image', url: './assets/works/The Magical Exploration_3.png', title: 'The Magical Exploration: การปรับแต่งลูกโป่ง 3D ผ่าน Mobile WebGL' }
    ]
  },
  lumina: {
    title: 'Siam Discovery: The Magical Exploration (Sticky Fun)',
    headline: 'Connecting personal mobile WebGL creativity with monumental architectural screens for Siam Discovery’s festive celebration.',
    category: 'Phygital Retail Experience & Interactive Media',
    tags: ['#SiamDiscovery', '#InteractiveInstallation', '#WebGL', '#RealTimeSync', '#Phygital', '#RetailTech', '#FestiveActivation', '#SiamPiwat'],
    year: '2024 – 2025',
    client: 'Siam Discovery (Siam Piwat Group)',
    credits: 'en-prefix, STEP SOLUTIONS, Small.Good.Studio',
    description: `During the year-end festive holiday season, premier retail destinations compete to capture the imagination of bustling shoppers. For Siam Discovery’s celebration campaign, “The Magical Exploration,” the goal was to transcend conventional static holiday decorations and passive video signage. The space required an inclusive, playful interactive installation that invites visitors to leave their personal mark on the building's architecture—transforming public LED displays into an active communal celebration that encourages spontaneous social sharing and drives engagement toward the ONESIAM retail ecosystem.

To create a seamless bridge between visitors and physical screens, we developed an instant mobile-to-screen interactive experience. Removing the barrier of native app downloads, visitors simply scan an on-site QR code on digital signages to launch a lightweight 3D WebGL customizer directly within their mobile browsers. Shoppers can design their own 3D festive balloon—selecting shapes, tassels, and iconic “Discovery Man” mascot stickers alongside cheerful typography. After holding the on-screen pump button to inflate their creation, a single upward swipe gesture launches the personalized balloon off their phone screen and directly into the shared virtual sky of the massive architectural LED wall.

The system is powered by a synchronized cross-device architecture connecting client-side WebGL, a cloud communication relay, and an on-premise 3D rendering program. The mobile editor uses browser-based WebGL to handle real-time 3D rotations and sticker placements smoothly on mobile hardware. Upon release, data payloads are instantly dispatched through a low-latency cloud server to on-site display computers, where a high-performance 3D engine calculates dynamic buoyancy, wind drift, and lifecycles across multiple simultaneous balloons. Once launched, visitors receive an auto-generated animated share card optimized for social media, complete with direct links to the ONESIAM app for seasonal shopping privileges.`,
    media: [
      { type: 'image', url: './assets/works/The Magical Exploration_1.png', title: 'The Magical Exploration: ภาพรวมกำแพงจอ LED ขนาดใหญ่ ณ Siam Discovery' },
      { type: 'youtube', url: 'https://youtu.be/pG2z-A3BpXs', title: 'The Magical Exploration: วิดีโอประสบการณ์ Interactive Screen' },
      { type: 'image', url: './assets/works/The Magical Exploration_3.png', title: 'The Magical Exploration: การปรับแต่งลูกโป่ง 3D ผ่าน Mobile WebGL' }
    ]
  },
  horizon: {
    title: 'Horizon OS',
    headline: 'An experimental WebXR spatial operating shell with 3D physical workspace window management.',
    category: 'Spatial Computing',
    tags: ['#spatialcomputing', '#webxr', '#threejs', '#wasm', '#spatialui'],
    year: '2024',
    client: 'Horizon XR Labs',
    credits: 'en- studio, Horizon Research Team',
    description: `As spatial computing headsets emerge, web application interfaces require new spatial window paradigms beyond flat 2D screens.

Horizon OS is an experimental WebXR spatial shell allowing users to pin 3D web application widgets floating in physical room environments. Powered by WASM and custom hand-tracking gesture recognition, users manage spatial windows with intuitive pinch and drag motions.

Locked at 90 FPS with sub-8ms interaction latency, Horizon OS bridges Meta Quest, Apple Vision Pro, and desktop web browsers.`,
    media: [
      { type: 'image', url: './assets/works/mandala.jpg', title: '3D Spatial Window Workspace' },
      { type: 'image', url: './assets/works/portrait.jpg', title: 'WebXR Hand Tracking Controls' }
    ]
  },
  veloce: {
    title: 'Veloce Mobility',
    headline: 'Centralized mission control for autonomous delivery fleets visualizing telemetry mesh in real time.',
    category: 'Autonomous Systems',
    tags: ['#autonomousfleet', '#mapbox', '#telemetry', '#websockets', '#missioncontrol'],
    year: '2023',
    client: 'Veloce Autonomous Systems',
    credits: 'en- studio, Veloce Fleet Operations',
    description: `Managing autonomous delivery fleets operating across urban streets requires continuous telemetry monitoring, emergency remote overrides, and instant re-routing.

We built a centralized mission control platform rendering over 10,000 active fleet vehicles on high-density vector maps with zero stutter. Operators receive automated anomaly alerts and live battery diagnostics.

The system maintains 99.98% fleet uptime with real-time route adjustment latency under 50ms.`,
    media: [
      { type: 'image', url: './assets/works/portrait.jpg', title: 'Autonomous Fleet Dispatch Map' },
      { type: 'image', url: './assets/works/mandala.jpg', title: 'Vehicle Telemetry Stream' }
    ]
  },
  pulse: {
    title: 'Pulse Audio',
    headline: 'Browser-based generative spatial soundscape studio empowering sound designers visually.',
    category: 'AudioTech Canvas',
    tags: ['#audiotech', '#webaudioapi', '#audioworklet', '#generativesound', '#dolbyatmos'],
    year: '2024',
    client: 'Pulse Audio Sound Studios',
    credits: 'en- studio, Sound Design Research Lab',
    description: `Film composers and sound designers needed a visual generative workspace to compose multi-channel spatial audio directly in browser-based environments.

We engineered an AudioWorklet synthesis engine running directly in thread pools with ultra-low DSP latency (<5ms). Designers connect visual node graphs to synthesize spatial soundscapes and export mixes for Dolby Atmos or binaural headphone reproduction.

Pulse Audio serves over 120,000 active composers worldwide with fluid node patching and interactive sound modulation.`,
    media: [
      { type: 'image', url: './assets/works/mandala.jpg', title: 'Visual Node Patching Canvas' },
      { type: 'image', url: './assets/works/portrait.jpg', title: 'Multichannel Spatial Audio Mixer' }
    ]
  }
};

function formatStoryText(text) {
  if (!text) return '';
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline font-semibold text-theme-accent hover:opacity-80 transition-opacity">$1</a>');
}

window.openProjectModal = function (projectId) {
  const modal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content');
  const data = projectData[projectId];

  if (!data || !modal || !modalContent) return;

  const initialMedia = data.media && data.media.length > 0 ? data.media[0] : null;
  const storyParagraphs = (data.description || '').split('\n\n');

  modalContent.innerHTML = `
    <div class="space-y-8 text-[#231F2A]">
      
      <!-- 1. MULTI-MEDIA DISPLAY GALLERY VIEWER (Moved to Top) -->
      ${data.media && data.media.length > 0 ? `
        <div class="space-y-4">
          <div id="modal-active-media-display" class="w-full h-72 sm:h-96 lg:h-[28rem] bg-black/90 rounded-none en-work-card-img overflow-hidden relative border border-navy/15 flex items-center justify-center shadow-xl">
            ${renderMediaTag(initialMedia)}
          </div>

          <!-- Gallery Thumbnails Selector -->
          ${data.media.length > 1 ? `
            <div class="flex items-center space-x-3 overflow-x-auto pb-2">
              ${data.media.map((m, idx) => `
                <button onclick="switchModalMedia('${projectId}', ${idx})" 
                  class="modal-media-thumb flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all border-navy/20 hover:border-theme-accent focus:outline-none ${idx === 0 ? 'border-theme-accent ring-2 ring-theme-accent/30' : ''}"
                  data-thumb-idx="${idx}">
                  ${m.type === 'video' || m.type === 'youtube' || (m.url && (m.url.includes('youtube') || m.url.includes('youtu.be'))) ? `
                    <div class="w-full h-full bg-black/90 flex flex-col items-center justify-center text-white text-[10px] font-mono font-bold">
                      <span>&rtrif; VIDEO</span>
                      <span class="text-[8px] text-theme-accent font-sans">${m.type === 'youtube' || (m.url && (m.url.includes('youtube') || m.url.includes('youtu.be'))) ? 'YOUTUBE' : 'MP4'}</span>
                    </div>
                  ` : `
                    <img src="${m.url}" onerror="this.onerror=null;this.src='./assets/works/portrait.jpg'" alt="${m.title || ''}" class="w-full h-full object-cover">
                  `}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- 2. EDITORIAL HEADER & NARRATIVE LAYOUT -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-start">
        
        <!-- Left Editorial Typography Headline & Title -->
        <div class="md:col-span-7 space-y-3">
          <div class="inline-block px-3 py-1 bg-theme-light text-theme-accent text-[11px] font-mono font-bold uppercase rounded-full">
            ${data.category}
          </div>
          <h2 class="text-4xl sm:text-5xl font-sans font-extrabold text-navy leading-none tracking-tight">
            ${data.title}
          </h2>
          <p class="text-lg sm:text-xl font-serif italic text-navy/80 leading-snug pt-1">
            ${data.headline}
          </p>
          
          <!-- Metadata Table (YEAR / CLIENT / CREDITS) -->
          <div class="grid grid-cols-3 gap-4 pt-4 text-xs font-sans border-t border-navy/10">
            <div>
              <span class="block text-[10px] font-mono text-navy-subtle uppercase tracking-widest">YEAR</span>
              <span class="font-bold text-navy text-sm">${data.year || '2024'}</span>
            </div>
            <div>
              <span class="block text-[10px] font-mono text-navy-subtle uppercase tracking-widest">CLIENT</span>
              <span class="font-bold text-navy">${data.client || '-'}</span>
            </div>
            <div>
              <span class="block text-[10px] font-mono text-navy-subtle uppercase tracking-widest">CREDITS</span>
              <span class="font-semibold text-navy-muted leading-tight block">${data.credits || 'en- studio'}</span>
            </div>
          </div>
        </div>

        <!-- Right Detailed Story Narrative -->
        <div class="md:col-span-5 space-y-4 pt-1">
          ${storyParagraphs.map(p => `<p class="text-sm font-sans text-navy-muted leading-relaxed">${formatStoryText(p)}</p>`).join('')}
          
          <!-- Hashtags -->
          ${data.tags && data.tags.length > 0 ? `
            <div class="pt-2 flex flex-wrap gap-2 text-xs font-mono text-theme-accent font-semibold">
              ${data.tags.map(t => `<span>${t}</span>`).join(' ')}
            </div>
          ` : ''}
        </div>

      </div>

    </div>
  `;

  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');

  const modalPanel = document.getElementById('modal-panel-container');
  if (modalPanel) modalPanel.scrollTop = 0;

  // Lock background body scroll and pause Lenis
  document.body.style.overflow = 'hidden';
  if (typeof lenis !== 'undefined' && lenis) {
    lenis.stop();
  }
};

function renderMediaTag(mediaItem) {
  if (!mediaItem) return '';
  if (mediaItem.type === 'youtube' || (mediaItem.url && (mediaItem.url.includes('youtube.com') || mediaItem.url.includes('youtu.be')))) {
    let embedUrl = mediaItem.url;
    let isShorts = false;
    let id = '';
    if (mediaItem.url.includes('youtu.be/')) {
      id = mediaItem.url.split('youtu.be/')[1].split('?')[0];
    } else if (mediaItem.url.includes('youtube.com/shorts/')) {
      id = mediaItem.url.split('shorts/')[1].split('?')[0].split('/')[0];
      isShorts = true;
    } else if (mediaItem.url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(mediaItem.url.split('?')[1]);
      id = urlParams.get('v');
    }
    if (id) {
      embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`;
    }
    return `
      <iframe src="${embedUrl}" title="${mediaItem.title || 'YouTube video'}" class="w-full h-full border-0 ${isShorts ? 'scale-[3.15]' : ''}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    `;
  }
  if (mediaItem.type === 'video') {
    return `
      <video autoplay loop muted playsinline poster="${mediaItem.poster || ''}" class="w-full h-full object-cover">
        <source src="${mediaItem.url}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
  }
  return `
    <img src="${mediaItem.url}" onerror="this.onerror=null;this.src='./assets/works/portrait.jpg'" alt="${mediaItem.title || ''}" class="w-full h-full object-cover">
  `;
}

window.switchModalMedia = function (projectId, mediaIdx) {
  const data = projectData[projectId];
  if (!data || !data.media || !data.media[mediaIdx]) return;
  const display = document.getElementById('modal-active-media-display');
  if (display) {
    display.innerHTML = renderMediaTag(data.media[mediaIdx]);
  }
  document.querySelectorAll('.modal-media-thumb').forEach(thumb => {
    if (parseInt(thumb.getAttribute('data-thumb-idx')) === mediaIdx) {
      thumb.classList.add('border-theme-accent', 'ring-2', 'ring-theme-accent/30');
    } else {
      thumb.classList.remove('border-theme-accent', 'ring-2', 'ring-theme-accent/30');
    }
  });
};

window.closeProjectModal = function () {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.start();
    }
  }
};

// Modal Content Panel Mouse Wheel & Touch Scroll Safety Handler
setTimeout(() => {
  const modalPanelEl = document.getElementById('modal-panel-container');
  const modalOuterEl = document.getElementById('project-modal');

  [modalPanelEl, modalOuterEl].forEach(el => {
    if (!el) return;
    el.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });
  });
}, 100);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProjectModal();
});

// ==========================================
// 7. COPY CONTACT INFO & TOAST
// ==========================================
window.copyContactInfo = function (text, message) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(message);
  }).catch(() => {
    showToast('Copied to clipboard');
  });
};

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3000);
}

// ==========================================
// 8. REALTIME GMT+7 BANGKOK CLOCK
// ==========================================
const clockEl = document.getElementById('realtime-clock');
function updateClock() {
  if (!clockEl) return;
  const now = new Date();
  const options = {
    timeZone: 'Asia/Bangkok',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);
  clockEl.textContent = `GMT+7 BANGKOK ${timeStr}`;
}
setInterval(updateClock, 1000);
updateClock();

