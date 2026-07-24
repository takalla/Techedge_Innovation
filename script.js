/* ══════════════════════════════════════════════════════════════
   SCOREBOARD NUMBERS — edit these 5 values to update the site.
   After editing, save this file and re-upload it to your repo.
   updatedDate is just a label shown to visitors — type it however
   you want it to read (e.g. "Jul 2026" or "July 24, 2026").
   ══════════════════════════════════════════════════════════════ */
const SCOREBOARD_DATA = {
  closeRate: 42,
  showRate: 78,
  calls: 310,
  cash: 1200,        // enter in thousands, e.g. 1200 shows as "$1.2M"
  industries: 9,
  updatedDate: 'Jul 2026'
};
/* ══════════════════════════════════════════════════════════════ */


function fmtCash(v){
  if(v >= 1000){ return (v/1000).toFixed(1).replace(/\.0$/,'') + 'M'; }
  return Math.round(v) + 'K';
}

function animateCount(el, target, opts){
  const dur = 1400;
  const start = performance.now();
  const prefix = opts.prefix || '';
  function tick(now){
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = target * eased;
    if(opts.key === 'cash'){
      el.textContent = prefix + fmtCash(val);
    } else {
      el.textContent = prefix + Math.round(val) + (opts.suffix || '');
    }
    if(p < 1){ requestAnimationFrame(tick); }
  }
  requestAnimationFrame(tick);
}

function renderBoard(data){
  document.querySelectorAll('.flip-num').forEach(el=>{
    const key = el.getAttribute('data-key');
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const target = Number(data[key]) || 0;
    animateCount(el, target, {prefix, suffix, key});
  });
  const label = document.getElementById('updatedLabel');
  if(label && data.updatedDate){
    label.textContent = 'Updated ' + data.updatedDate;
  }
}

// trigger the count-up animation once when the board scrolls into view
const boardFrame = document.querySelector('.board-frame');
let animated = false;
const obs = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting && !animated){
      animated = true;
      renderBoard(SCOREBOARD_DATA);
    }
  });
}, {threshold:0.3});
if(boardFrame){ obs.observe(boardFrame); }


// ── Fit-check gate ──
const MIN_OFFER = 6000;
const MIN_COMMISSION = 10;
const fitSubmit = document.getElementById('fitSubmit');
const fitResult = document.getElementById('fitResult');
const fitFormBox = document.getElementById('fitFormBox');
const bookSection = document.getElementById('book');

fitSubmit.addEventListener('click', ()=>{
  const offer = Number(document.getElementById('fitOffer').value);
  const commission = Number(document.getElementById('fitCommission').value);

  if(!offer || !commission){
    fitResult.textContent = "Please fill in both fields to continue.";
    fitResult.className = 'fit-result show fail';
    return;
  }

  const pass = offer >= MIN_OFFER && commission >= MIN_COMMISSION;

  if(pass){
    fitResult.textContent = "Let's talk. Scroll down to grab a time on the calendar.";
    fitResult.className = 'fit-result show pass';
    fitFormBox.querySelectorAll('input').forEach(i=> i.disabled = true);
    fitSubmit.disabled = true;
    fitSubmit.style.opacity = '0.5';
    bookSection.style.display = 'block';
    setTimeout(()=>{ bookSection.scrollIntoView({behavior:'smooth', block:'start'}); }, 350);
  } else {
    fitResult.innerHTML = "Based on what you've shared, this may not be the right fit right now. If you'd still like to chat, feel free to reach out on <a href=\"https://www.instagram.com/techedgeinnovation?igsh=MWlxaGx5azVmNGJzcA==\" target=\"_blank\" rel=\"noopener\" style=\"color:var(--gold-bright); text-decoration:underline;\">Instagram</a>.";
    fitResult.className = 'fit-result show fail';
    bookSection.style.display = 'none';
  }
});


// ── Mobile menu toggle ──
const menuToggle = document.getElementById('menuToggle');
const mobilePanel = document.getElementById('mobilePanel');
menuToggle.addEventListener('click', ()=>{
  const isOpen = mobilePanel.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  menuToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
});
mobilePanel.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click', ()=>{
    mobilePanel.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = '&#9776;';
  });
});
