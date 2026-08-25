// ============================================
// LUMORA BOOKS - ABOUT & CONTACT CONTROLLER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initStatsCounters();
  initContactForm();
});

// 1. Animated Stats Counters for about.html
function initStatsCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (counters.length === 0) return;

  // Options for intersection observer
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        animateCounter(counter);
        observer.unobserve(counter); // Animate only once
      }
    });
  }, observerOptions);

  counters.forEach(counter => {
    observer.observe(counter);
  });
}

function animateCounter(counter) {
  const target = parseInt(counter.getAttribute('data-target'));
  const duration = 2000; // 2 seconds duration
  const frameRate = 30; // 30 frames per second
  const totalFrames = Math.round(duration / frameRate);
  const increment = target / totalFrames;
  let currentFrame = 0;
  let currentValue = 0;

  const timer = setInterval(() => {
    currentFrame++;
    currentValue += increment;

    if (currentFrame >= totalFrames) {
      counter.textContent = target.toLocaleString('en-IN') + '+';
      clearInterval(timer);
    } else {
      counter.textContent = Math.floor(currentValue).toLocaleString('en-IN') + '+';
    }
  }, frameRate);
}

// 2. Validate & Post Contact Form for contact.html
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');

  const nameError = document.getElementById('contactNameError');
  const emailError = document.getElementById('contactEmailError');
  const subjectError = document.getElementById('contactSubjectError');
  const messageError = document.getElementById('contactMessageError');

  const statusBanner = document.getElementById('contactFormStatus');
  const submitBtn = document.getElementById('contactSubmitBtn');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset validations & banners
    nameError.textContent = '';
    emailError.textContent = '';
    subjectError.textContent = '';
    messageError.textContent = '';
    statusBanner.style.display = 'none';

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      nameError.textContent = 'Name is required';
      isValid = false;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      emailError.textContent = 'Email address is required';
      isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      emailError.textContent = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate Subject
    if (!subjectInput.value.trim()) {
      subjectError.textContent = 'Subject is required';
      isValid = false;
    }

    // Validate Message
    if (!messageInput.value.trim()) {
      messageError.textContent = 'Message is required';
      isValid = false;
    }

    if (!isValid) return;

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'SENDING MESSAGE...';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          subject: subjectInput.value.trim(),
          message: messageInput.value.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        statusBanner.textContent = '✨ Thank you! Your message has been sent successfully. We will get back to you shortly.';
        statusBanner.style.backgroundColor = '#d4edda';
        statusBanner.style.color = '#155724';
        statusBanner.style.border = '1px solid #c3e6cb';
        statusBanner.style.display = 'block';

        contactForm.reset();
      } else {
        statusBanner.textContent = data.message || 'An error occurred. Please try again.';
        statusBanner.style.backgroundColor = '#f8d7da';
        statusBanner.style.color = '#721c24';
        statusBanner.style.border = '1px solid #f5c6cb';
        statusBanner.style.display = 'block';
      }
    } catch (error) {
      console.error('Contact submit error:', error);
      statusBanner.textContent = 'Server connection error. Please check your connection and try again.';
      statusBanner.style.backgroundColor = '#f8d7da';
      statusBanner.style.color = '#721c24';
      statusBanner.style.border = '1px solid #f5c6cb';
      statusBanner.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'SEND MESSAGE';
    }
  });
}
