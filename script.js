let lenis;

function initSmoothScrolling() {
  if (lenis) return; // Prevent double init

  // Skip Lenis on touch-primary devices (phones/tablets).
  // Native iOS momentum scroll (Safari) conflicts with JS smooth-scroll libraries.
  const isTouch = !window.matchMedia('(pointer: fine)').matches;
  if (isTouch) return;
  
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Handle anchor clicks for Lenis & Touch smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#') && targetId.length > 1) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          if (window.closeMobileMenu) window.closeMobileMenu();
          if (lenis) {
            lenis.scrollTo(targetElement);
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // Active Section Highlighting
  const sections = document.querySelectorAll('section, header');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  
  const updateActiveNav = () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      if (link.classList.contains('bg-gold-primary') || link.classList.contains('mobile-cta-btn')) return;
      link.classList.remove('text-gold-primary');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('text-gold-primary');
      }
    });
  };

  if (lenis) {
    lenis.on('scroll', updateActiveNav);
  } else {
    window.addEventListener('scroll', updateActiveNav);
  }
}

// Mobile Menu toggle & Auto-Close Logic
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  const updateMenuIcon = (isOpen) => {
    if (!menuBtn) return;
    if (isOpen) {
      menuBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      menuBtn.setAttribute('aria-label', 'Close Menu');
    } else {
      menuBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>';
      menuBtn.setAttribute('aria-label', 'Open Menu');
    }
  };
  
  window.closeMobileMenu = () => {
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
      updateMenuIcon(false);
    }
  };

  window.openMobileMenu = () => {
    if (mobileMenu && !mobileMenu.classList.contains('active')) {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateMenuIcon(true);
    }
  };

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (mobileMenu.classList.contains('active')) {
        window.closeMobileMenu();
      } else {
        window.openMobileMenu();
      }
    });

    // Close on backdrop click
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        window.closeMobileMenu();
      }
    });

    // Auto close menu when clicking mobile menu links
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        window.closeMobileMenu();
      });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        window.closeMobileMenu();
      }
    });
  }

  // Setup Indian Mobile Number Validation
  const mobileInput = document.getElementById('mobile');
  const mobileError = document.getElementById('mobile-error');
  if (mobileInput) {
    window.setupIndianMobileValidation(mobileInput, mobileError, () => {
      if (typeof window.checkFormValidity === 'function') {
        window.checkFormValidity();
      }
    });
  }

  const contactPhoneInput = document.getElementById('contact-phone');
  const contactPhoneError = document.getElementById('contact-phone-error');
  if (contactPhoneInput) {
    window.setupIndianMobileValidation(contactPhoneInput, contactPhoneError);
  }
});

// Helper for Indian Mobile Number Formatting & Validation
window.setupIndianMobileValidation = function(inputEl, errorEl, onValidityChange) {
  if (!inputEl) return;

  inputEl.setAttribute('inputmode', 'numeric');
  inputEl.setAttribute('type', 'tel');
  inputEl.setAttribute('autocomplete', 'tel');
  inputEl.setAttribute('maxlength', '10');

  function extract10Digits(val) {
    let digits = (val || '').replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.slice(2);
    } else if (digits.startsWith('091') && digits.length > 11) {
      digits = digits.slice(3);
    } else if (digits.startsWith('0') && digits.length > 10) {
      digits = digits.slice(1);
    }
    return digits.slice(0, 10);
  }

  function handleInput(isBlur = false) {
    const raw = inputEl.value;
    const digits = extract10Digits(raw);

    if (inputEl.value !== digits) {
      inputEl.value = digits;
    }

    const isValid = digits.length === 10;
    const storedValue = isValid ? '+91' + digits : '';

    if (errorEl) {
      if (digits.length > 0 && digits.length < 10 && (isBlur || raw.length >= 10)) {
        errorEl.textContent = 'Enter a valid 10-digit mobile number';
        errorEl.classList.remove('hidden');
      } else if (digits.length === 10 || digits.length === 0) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
      }
    }

    if (onValidityChange) {
      onValidityChange(isValid, storedValue);
    }
  }

  inputEl.addEventListener('input', () => handleInput(false));
  inputEl.addEventListener('change', () => handleInput(false));
  inputEl.addEventListener('paste', () => setTimeout(() => handleInput(false), 10));
  inputEl.addEventListener('blur', () => handleInput(true));

  if (inputEl.value) {
    handleInput(false);
  }
};

window.initializeAnimations = function(settings) {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // Set Footer Year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.innerText = new Date().getFullYear();

  // 1. Smooth Scrolling
  initSmoothScrolling();

  // 2. RippleGrid — skip on screens below 992px and on reduced-motion
  const isMobileViewport = window.innerWidth < 992;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const container = document.getElementById('ripple-grid-container');
  if (container && typeof RippleGrid !== 'undefined' && !container.hasChildNodes() && !isMobileViewport && !prefersReducedMotion) {
    new RippleGrid(container, {
      gridColor: '#C9A227',
      rippleIntensity: 0.2,
      gridSize: 24,
      gridThickness: 15,
      mouseInteraction: true,
      mouseInteractionRadius: 1.2,
      opacity: 0.8,
      fadeDistance: 2.2,
      vignetteStrength: 3
    });
  }

  // 3. Hero Reveal & Number Counter
  gsap.fromTo(".hero-content", 
    { opacity: 0, scale: 0.9, y: 30 }, 
    { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 0.1 }
  );

  // Number Counter Animation
  const statNumbers = document.querySelectorAll('.hero-content .text-xl, .hero-content .text-2xl, .hero-content .text-3xl');
  statNumbers.forEach(numEl => {
    const targetValue = parseInt(numEl.innerText.replace(/[^0-9]/g, ''));
    if (!isNaN(targetValue) && targetValue > 0) {
      const originalText = numEl.innerText;
      const prefix = originalText.replace(/[0-9].*/, '');
      const suffix = originalText.replace(/.*[0-9]/, '');
      
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetValue,
        duration: 2,
        ease: 'power3.out',
        delay: 0.3,
        onUpdate: function() {
          numEl.innerText = prefix + Math.floor(obj.val) + suffix;
        }
      });
    }
  });

  // 4. Stagger Reveal for Event Cards
  ScrollTrigger.getAll().forEach(t => t.kill());

  const eventCards = gsap.utils.toArray('.event-card');
  eventCards.forEach((card) => {
    gsap.fromTo(card, 
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // 5. Initialize ALL Event Swipers dynamically with mobile fallback
  const swipers = document.querySelectorAll('.event-swiper');
  const isSmallScreen = window.innerWidth < 640;
  swipers.forEach((swiperEl, index) => {
    const rotationBase = [25, 35, 45][index % 3];
    const depthBase = [120, 100, 80][index % 3];

    new Swiper(swiperEl, {
      effect: isSmallScreen ? 'slide' : 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: isSmallScreen ? 1.25 : 'auto',
      spaceBetween: isSmallScreen ? 12 : 0,
      coverflowEffect: {
        rotate: rotationBase,
        stretch: 0,
        depth: depthBase,
        modifier: 1,
        slideShadows: true,
      },
      pagination: { 
        el: swiperEl.querySelector('.swiper-pagination'), 
        clickable: true 
      },
      loop: true,
      autoplay: { 
        delay: 2500 + (index * 500), 
        disableOnInteraction: false 
      }
    });
  });

  // 7. About & Program Animations (skip if user prefers reduced motion)
  if (!prefersReducedMotion) {
  const aboutItems = gsap.utils.toArray('.about-item');
  if(aboutItems.length) {
    gsap.fromTo(aboutItems, 
      { opacity: 0, y: 50, rotateX: 15 },
      { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        stagger: 0.2, 
        duration: 1.2, 
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: '#about',
          start: 'top 65%',
        }
      }
    );
  }

  const programCards = gsap.utils.toArray('.program-card');
  if(programCards.length) {
    gsap.fromTo(programCards, 
      { opacity: 0, scale: 0.8, rotationY: 15 },
      { 
        opacity: 1, 
        scale: 1,
        rotationY: 0,
        stagger: 0.15, 
        duration: 1.2, 
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '#programs',
          start: 'top 80%',
        }
      }
    );
  }
  } // end !prefersReducedMotion

  // Initialize Form UI
  renderFormOptions();
  updateFormUI();

  // Universal 3D Tilt Effect
  const tiltElements = document.querySelectorAll('.tilt-card, .event-card, .about-item, .program-card');
  tiltElements.forEach(el => {
    // Only init if not on mobile
    if (window.matchMedia("(pointer: fine)").matches) {
      el.addEventListener('mousemove', handleTilt);
      el.addEventListener('mouseleave', resetTilt);
    }
  });

  function handleTilt(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top; // y position within the element
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
    const rotateY = ((x - centerX) / centerX) * 10;
    
    gsap.to(el, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.5
    });
  }

  function resetTilt(e) {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      ease: 'elastic.out(1, 0.3)',
      duration: 1
    });
  }



  // Refresh ScrollTrigger since DOM changed
  ScrollTrigger.refresh();
};

/* --- MULTI-STEP FORM LOGIC --- */
let currentStep = 1;
const totalSteps = 6;

const EVENT_TYPES = [
  "AI Workshop", "Hackathon", "Guest Lecture", 
  "Technical Workshop", "Placement Training", 
  "Career Guidance", "Industry Expert Session", "Custom Event"
];

let selectedEventType = '';

function renderFormOptions() {
  const searchInput = document.getElementById('eventSearchInput');
  const dropdown = document.getElementById('eventDropdown');
  
  if (searchInput && dropdown) {
    const renderDropdown = (filter = '') => {
      const filtered = EVENT_TYPES.filter(type => type.toLowerCase().includes(filter.toLowerCase()));
      if (filtered.length === 0) {
        dropdown.innerHTML = `<div class="px-5 py-3 text-gray-500 text-sm">No results found</div>`;
        return;
      }
      dropdown.innerHTML = filtered.map(type => `
        <div class="px-5 py-3 cursor-pointer hover:bg-gold-primary/10 hover:text-gold-primary transition-colors text-gray-300" onclick="selectEvent('${type}')">
          ${type}
        </div>
      `).join('');
    };
    
    renderDropdown();
    
    searchInput.addEventListener('focus', () => {
      dropdown.classList.remove('hidden');
    });
    
    searchInput.addEventListener('input', (e) => {
      renderDropdown(e.target.value);
    });
    
    // Hide dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }
}

window.selectEvent = function(type) {
  const searchInput = document.getElementById('eventSearchInput');
  const dropdown = document.getElementById('eventDropdown');
  
  selectedEventType = type;
  searchInput.value = type;
  dropdown.classList.add('hidden');
  checkFormValidity();
};

window.selectRadio = function(labelEl, groupName) {
  // Reset all in group
  document.querySelectorAll(`input[name="${groupName}"]`).forEach(input => {
    const parent = input.closest('label');
    parent.classList.remove('border-gold-primary', 'bg-gold-primary/10', 'shadow-md', 'text-gold-primary', 'font-bold');
    parent.classList.add('border-white/10');
    
    if (groupName === 'preferredMode') parent.classList.replace('text-gold-primary', 'text-gray-400');
    
    const indicator = parent.querySelector('.radio-indicator');
    if(indicator) {
      indicator.classList.replace('border-gold-primary', 'border-white/20');
      indicator.querySelector('.inner-dot').classList.add('hidden');
    }
  });

  // Highlight selected
  labelEl.classList.remove('border-white/10');
  labelEl.classList.add('border-gold-primary', 'bg-gold-primary/10', 'shadow-md');
  if (groupName === 'preferredMode') labelEl.classList.add('text-gold-primary', 'font-bold');

  const indicator = labelEl.querySelector('.radio-indicator');
  if(indicator) {
    indicator.classList.replace('border-white/20', 'border-gold-primary');
    indicator.querySelector('.inner-dot').classList.remove('hidden');
  }
  
  labelEl.querySelector('input').checked = true;
  checkFormValidity();
}

function updateFormUI() {
  if(!document.getElementById('step-1')) return;
  
  // Show/Hide Steps
  for (let i = 1; i <= totalSteps; i++) {
    document.getElementById(`step-${i}`).classList.toggle('hidden', i !== currentStep);
    document.getElementById(`step-${i}`).classList.toggle('animate-fadeIn', i === currentStep);
  }

  // Buttons
  const btnBack = document.getElementById('btnBack');
  const btnNext = document.getElementById('btnNext');
  const btnSubmit = document.getElementById('btnSubmit');

  if (currentStep === 1) {
    btnBack.classList.add('opacity-0', 'pointer-events-none');
  } else {
    btnBack.classList.remove('opacity-0', 'pointer-events-none');
  }

  if (currentStep === totalSteps) {
    btnNext.classList.add('hidden');
    btnSubmit.classList.remove('hidden');
  } else {
    btnNext.classList.remove('hidden');
    btnSubmit.classList.add('hidden');
  }

  // Progress Bar
  const stepsData = [
    { num: 1, title: "Event", icon: "file-text" },
    { num: 2, title: "College", icon: "building-2" },
    { num: 3, title: "Role", icon: "users" },
    { num: 4, title: "Contact", icon: "user" },
    { num: 5, title: "Details", icon: "calendar-clock" },
    { num: 6, title: "Notes", icon: "send" },
  ];

  const progressHTML = stepsData.map((s, idx) => `
    <div class="flex items-center min-w-max">
      <div class="flex items-center justify-center w-10 h-10 rounded-full transition-colors ${currentStep >= s.num ? 'bg-gold-primary text-bg-dark-accent shadow-md' : 'bg-white/10 text-gray-500'}">
        <i data-lucide="${currentStep > s.num ? 'check-circle-2' : s.icon}" class="w-5 h-5"></i>
      </div>
      <span class="ml-3 font-semibold hidden md:block ${currentStep >= s.num ? 'text-white' : 'text-gray-500'}">${s.title}</span>
      ${idx < stepsData.length - 1 ? `<div class="w-8 md:w-12 h-1 mx-4 rounded-full ${currentStep > s.num ? 'bg-gold-primary' : 'bg-white/10'}"></div>` : ''}
    </div>
  `).join('');

  document.getElementById('progress-bar').innerHTML = progressHTML;
  if(window.lucide) lucide.createIcons();
  
  checkFormValidity();
}

window.nextStep = function() {
  if (currentStep < totalSteps) {
    currentStep++;
    
    // Update labels for Step 4 based on Step 3
    if (currentStep === 4) {
      const type = document.querySelector('input[name="applicantType"]:checked')?.value;
      if (type === 'Student') {
        document.getElementById('contactInfoTitle').innerText = 'Student Information';
        document.getElementById('lblApplicantName').innerText = 'Student Name';
        document.getElementById('lblApplicantDesignation').innerText = 'Year / Role (e.g. 3rd Year, President)';
      } else {
        document.getElementById('contactInfoTitle').innerText = 'Faculty Information';
        document.getElementById('lblApplicantName').innerText = 'Faculty Name';
        document.getElementById('lblApplicantDesignation').innerText = 'Designation (e.g. HOD)';
      }
    }
    
    updateFormUI();
  }
}

window.prevStep = function() {
  if (currentStep > 1) {
    currentStep--;
    updateFormUI();
  }
}

window.checkFormValidity = function() {
  const btnNext = document.getElementById('btnNext');
  if(!btnNext) return;
  
  let isValid = false;
  
  if (currentStep === 1) {
    isValid = selectedEventType !== '';
  } else if (currentStep === 2) {
    isValid = document.getElementById('institutionName').value &&
              document.getElementById('institutionType').value &&
              document.getElementById('department').value &&
              document.getElementById('city').value &&
              document.getElementById('state').value;
  } else if (currentStep === 3) {
    isValid = !!document.querySelector('input[name="applicantType"]:checked');
  } else if (currentStep === 4) {
    const mobEl = document.getElementById('mobile');
    const mobDigits = (mobEl ? mobEl.value : '').replace(/\D/g, '');
    let localDigits = mobDigits;
    if (localDigits.startsWith('91') && localDigits.length > 10) localDigits = localDigits.slice(2);
    localDigits = localDigits.slice(0, 10);

    const isMobileValid = localDigits.length === 10;

    isValid = document.getElementById('facultyName').value.trim() !== '' &&
              document.getElementById('designation').value.trim() !== '' &&
              document.getElementById('email').value.trim() !== '' &&
              isMobileValid;
  } else if (currentStep === 5) {
    isValid = document.getElementById('studentsCount').value &&
              document.getElementById('duration').value &&
              document.getElementById('preferredDate').value &&
              !!document.querySelector('input[name="preferredMode"]:checked') &&
              !!document.querySelector('input[name="contactMethod"]:checked');
  } else if (currentStep === 6) {
    isValid = true; // Optional
  }

  if (isValid) {
    btnNext.disabled = false;
    btnNext.classList.remove('bg-white/10', 'text-gray-500', 'cursor-not-allowed');
    btnNext.classList.add('bg-gold-primary', 'text-bg-dark-accent', 'shadow-lg', 'hover:bg-gold-deep', 'hover:-translate-y-1');
  } else {
    btnNext.disabled = true;
    btnNext.classList.add('bg-white/10', 'text-gray-500', 'cursor-not-allowed');
    btnNext.classList.remove('bg-gold-primary', 'text-bg-dark-accent', 'shadow-lg', 'hover:bg-gold-deep', 'hover:-translate-y-1');
  }
}

// Global cache for form data
window.lastSubmittedFormData = null;
window.lastRegistrationId = '';

window.submitBookingForm = function(e) {
  e.preventDefault();
  const btnSubmit = document.getElementById('btnSubmit');
  btnSubmit.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-bg-dark-accent inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending Enquiry...';
  btnSubmit.disabled = true;

  // Gather Data
  const formData = {
    institutionName: document.getElementById('institutionName').value,
    institutionType: document.getElementById('institutionType').value,
    department: document.getElementById('department').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    applicantType: document.querySelector('input[name="applicantType"]:checked')?.value || 'Faculty',
    facultyName: document.getElementById('facultyName').value,
    designation: document.getElementById('designation').value,
    email: document.getElementById('email').value,
    mobile: document.getElementById('mobile').value,
    selectedEvent: selectedEventType,
    studentsCount: document.getElementById('studentsCount').value,
    duration: document.getElementById('duration').value,
    preferredDate: document.getElementById('preferredDate').value,
    preferredMode: document.querySelector('input[name="preferredMode"]:checked')?.value,
    contactMethod: document.querySelector('input[name="contactMethod"]:checked')?.value,
    additionalReqs: document.getElementById('additionalReqs').value || 'None'
  };

  // Generate dynamic registration ID
  const registrationId = `REG-${Math.floor(100000 + Math.random() * 900000)}`;

  // Save to global variables for later selection use
  window.lastSubmittedFormData = formData;
  window.lastRegistrationId = registrationId;

  // Mock API call delay
  setTimeout(() => {
    // Show Success Screen
    document.getElementById('booking-form-container').classList.add('hidden');
    document.getElementById('booking-success').classList.remove('hidden');
    document.getElementById('booking-success').classList.add('flex');
    btnSubmit.innerHTML = 'Bring Dominova to Our Campus <i data-lucide="send" class="w-4 h-4 ml-2"></i>';
    if(window.lucide) lucide.createIcons();
    btnSubmit.disabled = false;
  }, 1500);
}

window.showCommunicationOptions = function() {
  document.getElementById('booking-success').classList.add('hidden');
  document.getElementById('booking-success').classList.remove('flex');
  
  const commOptions = document.getElementById('communication-options');
  commOptions.classList.remove('hidden');
  commOptions.classList.add('flex');
  if(window.lucide) lucide.createIcons();
}

window.handleCommunicationSelection = function(method) {
  const formData = window.lastSubmittedFormData;
  const regId = window.lastRegistrationId;
  
  if (!formData) return;

  const eventName = formData.selectedEvent || '';
  const collegeName = formData.institutionName || '';
  const facultyName = formData.applicantType === 'Faculty' ? formData.facultyName : '';
  const studentName = formData.applicantType === 'Student' ? formData.facultyName : '';
  const roleDesignation = formData.designation || '';
  const emailVal = formData.email || '';
  const mobileVal = formData.mobile || '';

  // Formatted Registration Message
  const message = `Event Name: ${eventName}
College Name: ${collegeName}
Faculty Name: ${facultyName}
Student Name: ${studentName}
Role/Designation: ${roleDesignation}
Registration ID: ${regId}
Email: ${emailVal}
Mobile Number: ${mobileVal}

Thank you for registering.`;

  const cleanNumber = function(num) {
    let cleaned = num.replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    return cleaned;
  };

  const formattedMobile = cleanNumber(mobileVal);

  if (method === 'WhatsApp') {
    window.open(`https://wa.me/${formattedMobile}?text=${encodeURIComponent(message)}`, '_blank');
  } else if (method === 'Phone') {
    window.location.href = `tel:${mobileVal.replace(/\s+/g, '')}`;
  } else if (method === 'Email') {
    window.location.href = `mailto:${emailVal}?subject=Event Registration&body=${encodeURIComponent(message)}`;
  }
}

window.resetBookingForm = function() {
  document.getElementById('bookingForm').reset();
  
  selectedEventType = '';
  const searchInput = document.getElementById('eventSearchInput');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('input[type="radio"]').forEach(el => {
    const p = el.closest('label');
    if (p) {
      p.classList.remove('border-gold-primary', 'bg-gold-primary/10', 'shadow-md', 'text-gold-primary', 'font-bold');
      p.classList.add('border-white/10');
      if (el.name === 'preferredMode') p.classList.add('text-gray-400');
      
      const i = p.querySelector('.radio-indicator');
      if(i) {
        i.classList.replace('border-gold-primary', 'border-white/20');
        i.querySelector('.inner-dot').classList.add('hidden');
      }
    }
  });
  
  currentStep = 1;
  document.getElementById('booking-success').classList.add('hidden');
  document.getElementById('booking-success').classList.remove('flex');
  document.getElementById('communication-options').classList.add('hidden');
  document.getElementById('communication-options').classList.remove('flex');
  document.getElementById('booking-form-container').classList.remove('hidden');
  updateFormUI();
}

function hydrateContactInfo() {
  const settings = (typeof getSettings !== 'undefined') ? getSettings() : {};

  const emailLink = document.getElementById('contact-link-email');
  const emailText = document.getElementById('contact-text-email');
  const phoneLink = document.getElementById('contact-link-phone');
  const phoneText = document.getElementById('contact-text-phone');
  const whatsappLink = document.getElementById('contact-link-whatsapp');
  const whatsappText = document.getElementById('contact-text-whatsapp');

  const notConfiguredText = 'Contact information has not been configured.';

  if (emailLink && emailText) {
    if (settings.contactEmail) {
      emailLink.href = `mailto:${settings.contactEmail}`;
      emailText.textContent = settings.contactEmail;
    } else {
      emailLink.href = '#';
      emailText.textContent = notConfiguredText;
      emailText.classList.remove('text-lg');
      emailText.classList.add('text-sm');
    }
  }

  if (phoneLink && phoneText) {
    if (settings.contactPhone) {
      phoneLink.href = `tel:${settings.contactPhone.replace(/[^0-9+]/g, '')}`;
      phoneText.textContent = settings.contactPhone;
    } else {
      phoneLink.href = '#';
      phoneText.textContent = notConfiguredText;
      phoneText.classList.remove('text-lg');
      phoneText.classList.add('text-sm');
    }
  }

  if (whatsappLink && whatsappText) {
    if (settings.contactWhatsapp) {
      let waNumber = settings.contactWhatsapp.replace(/[^0-9]/g, '');
      if (waNumber.length === 10) waNumber = '91' + waNumber;
      
      whatsappLink.href = `https://wa.me/${waNumber}`;
      whatsappText.textContent = settings.contactWhatsapp;
    } else {
      whatsappLink.href = '#';
      whatsappText.textContent = notConfiguredText;
      whatsappText.classList.remove('text-lg');
      whatsappText.classList.add('text-sm');
    }
  }
}

window.selectProgramAndScroll = function(programType) {
  // Ensure the booking form is visible (reset success and options states if active)
  const successEl = document.getElementById('booking-success');
  const optionsEl = document.getElementById('communication-options');
  const formContainerEl = document.getElementById('booking-form-container');
  
  if (successEl) {
    successEl.classList.add('hidden');
    successEl.classList.remove('flex');
  }
  if (optionsEl) {
    optionsEl.classList.add('hidden');
    optionsEl.classList.remove('flex');
  }
  if (formContainerEl) {
    formContainerEl.classList.remove('hidden');
  }

  // Set step to 1
  currentStep = 1;

  // Select the event type
  if (typeof selectEvent === 'function') {
    selectEvent(programType);
  }

  // Update Form UI steps & validity
  if (typeof updateFormUI === 'function') {
    updateFormUI();
  }

  // Scroll to booking section
  const bookingSection = document.getElementById('booking');
  if (bookingSection) {
    if (lenis) {
      lenis.scrollTo(bookingSection);
    } else {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

document.addEventListener('DOMContentLoaded', hydrateContactInfo);

const WHATSAPP_NUMBER = "918754325192";

async function submitContactForm(event) {
  event.preventDefault();

  const nameEl = document.getElementById('contact-name');
  const phoneEl = document.getElementById('contact-phone');
  const emailEl = document.getElementById('contact-email');
  const subjectEl = document.getElementById('contact-subject');
  const messageEl = document.getElementById('contact-message');

  const nameErr = document.getElementById('contact-name-error');
  const phoneErr = document.getElementById('contact-phone-error');
  const emailErr = document.getElementById('contact-email-error');
  const subjectErr = document.getElementById('contact-subject-error');
  const messageErr = document.getElementById('contact-message-error');

  const nameVal = nameEl ? nameEl.value.trim() : '';
  const emailVal = emailEl ? emailEl.value.trim() : '';
  const rawPhone = phoneEl ? phoneEl.value : '';
  const subjectVal = subjectEl ? subjectEl.value.trim() : '';
  const messageVal = messageEl ? messageEl.value.trim() : '';

  let phoneDigits = rawPhone.replace(/\D/g, '');
  if (phoneDigits.startsWith('91') && phoneDigits.length > 10) phoneDigits = phoneDigits.slice(2);
  phoneDigits = phoneDigits.slice(0, 10);

  let hasError = false;

  // Validate Name
  if (!nameVal) {
    if (nameErr) { nameErr.textContent = 'Name is required'; nameErr.classList.remove('hidden'); }
    hasError = true;
  } else {
    if (nameErr) nameErr.classList.add('hidden');
  }

  // Validate Phone
  if (phoneDigits.length !== 10) {
    if (phoneErr) { phoneErr.textContent = 'Enter a valid 10-digit mobile number'; phoneErr.classList.remove('hidden'); }
    hasError = true;
  } else {
    if (phoneErr) phoneErr.classList.add('hidden');
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailVal || !emailRegex.test(emailVal)) {
    if (emailErr) { emailErr.textContent = 'Enter a valid email address'; emailErr.classList.remove('hidden'); }
    hasError = true;
  } else {
    if (emailErr) emailErr.classList.add('hidden');
  }

  // Validate Subject
  if (!subjectVal) {
    if (subjectErr) { subjectErr.textContent = 'Subject is required'; subjectErr.classList.remove('hidden'); }
    hasError = true;
  } else {
    if (subjectErr) subjectErr.classList.add('hidden');
  }

  // Validate Message
  if (!messageVal) {
    if (messageErr) { messageErr.textContent = 'Message is required'; messageErr.classList.remove('hidden'); }
    hasError = true;
  } else {
    if (messageErr) messageErr.classList.add('hidden');
  }

  if (hasError) return;

  const formattedPhone = `+91${phoneDigits}`;
  
  // Find submit button and show loading state
  const btn = event.target.querySelector('button[type="submit"]');
  const originalBtnContent = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="relative z-10 flex items-center">Sending... <i data-lucide="loader-2" class="w-4 h-4 ml-2 animate-spin"></i></span>';
  lucide.createIcons();

  try {
    if (!window.supabaseClient) throw new Error('Supabase client not initialized');
    
    // 1. Save to Supabase (Primary Database)
    const { error } = await window.supabaseClient.from('contact_submissions').insert([
      {
        name: nameVal,
        phone: formattedPhone,
        email: emailVal,
        subject: subjectVal,
        message: messageVal
      }
    ]);

    if (error) throw error;
    
    // 2. Prepare WhatsApp message
    const waMessage = `*DOMINOVA — New Contact Enquiry*

━━━━━━━━━━━━━━━━━━

*Name:* ${nameVal}

*Phone:* ${formattedPhone}

*Email:* ${emailVal}

*Subject:* ${subjectVal}

*Message:*
${messageVal}

━━━━━━━━━━━━━━━━━━

*Submitted from:* DOMINOVA Website`;

    const encodedMessage = encodeURIComponent(waMessage);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // 3. Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // 4. Show success message
    alert('Your message has been submitted successfully.');
    
    // 5. Reset form only on success
    event.target.reset();
  } catch (err) {
    console.error('Contact form error:', err);
    alert('Sorry, there was an error submitting your message. Please try again later.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalBtnContent;
    lucide.createIcons();
  }
}
