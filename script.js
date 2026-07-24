const DEFAULTS = { closeRate: 42, showRate: 78, calls: 310, cash: 1200, industries: 9, updatedAt: Date.now(), passcode: null };
  const STORAGE_KEY = 'scoreboard-data';
  let current = null;

  function fmtCash(v){
    // stored in $K already for simplicity of display; if large, show as $x.xM
    if(v >= 1000){ return (v/1000).toFixed(1).replace(/\.0$/,'') ; }
    return v;
  }

  function animateCount(el, target, opts){
    const dur = 1400;
    const start = performance.now();
    const prefix = opts.prefix || '';
    const suffix = opts.suffix || '';
    function tick(now){
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      let val = target * eased;
      let display = opts.key === 'cash' ? fmtCash(val) : Math.round(val);
      el.textContent = prefix + (opts.key === 'cash' ? (val >= 1000 ? val/1000 : Math.round(val)) : Math.round(val)) + suffix;
      if(opts.key === 'cash'){
        const shown = val >= 1000 ? (val/1000).toFixed(1).replace(/\.0$/,'') + 'M' : Math.round(val) + 'K';
        el.textContent = prefix + shown;
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
    if(data.updatedAt){
      const d = new Date(data.updatedAt);
      label.textContent = 'Updated ' + d.toLocaleDateString(undefined,{month:'short', day:'numeric', year:'numeric'});
    }
  }

  async function loadBoard(){
    try{
      const res = await window.storage.get(STORAGE_KEY, true);
      current = res ? JSON.parse(res.value) : DEFAULTS;
    }catch(e){
      current = DEFAULTS;
    }
    renderBoard(current);
  }

  // trigger animation when scrolled into view
  const boardFrame = document.querySelector('.board-frame');
  let animated = false;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting && !animated){
        animated = true;
        loadBoard();
      }
    });
  }, {threshold:0.3});
  if(boardFrame){ obs.observe(boardFrame); }

  // Modal logic
  const overlay = document.getElementById('modalOverlay');
  const openEdit = document.getElementById('openEdit');
  const passStage = document.getElementById('passStage');
  const editStage = document.getElementById('editStage');
  const modalHint = document.getElementById('modalHint');

  openEdit.addEventListener('click', ()=>{
    overlay.classList.add('open');
    if(!current) current = DEFAULTS;
    if(!current.passcode){
      modalHint.textContent = 'First time here. Set a passcode to protect your stats.';
    } else {
      modalHint.textContent = 'Enter your passcode to edit the live stats.';
    }
    passStage.style.display = 'block';
    editStage.style.display = 'none';
    document.getElementById('passInput').value = '';
  });

  document.getElementById('cancelPass').addEventListener('click', ()=> overlay.classList.remove('open'));
  document.getElementById('cancelEdit').addEventListener('click', ()=> overlay.classList.remove('open'));

  document.getElementById('submitPass').addEventListener('click', ()=>{
    const val = document.getElementById('passInput').value;
    if(!current.passcode){
      if(val.length < 4){ alert('Please choose a passcode of at least 4 characters.'); return; }
      current.passcode = val;
    } else {
      if(val !== current.passcode){ alert('Incorrect passcode.'); return; }
    }
    document.getElementById('inCloseRate').value = current.closeRate;
    document.getElementById('inShowRate').value = current.showRate;
    document.getElementById('inCalls').value = current.calls;
    document.getElementById('inCash').value = current.cash;
    document.getElementById('inIndustries').value = current.industries;
    passStage.style.display = 'none';
    editStage.style.display = 'block';
  });

  document.getElementById('saveStats').addEventListener('click', async ()=>{
    current.closeRate = Number(document.getElementById('inCloseRate').value) || 0;
    current.showRate = Number(document.getElementById('inShowRate').value) || 0;
    current.calls = Number(document.getElementById('inCalls').value) || 0;
    current.cash = Number(document.getElementById('inCash').value) || 0;
    current.industries = Number(document.getElementById('inIndustries').value) || 0;
    current.updatedAt = Date.now();
    try{
      await window.storage.set(STORAGE_KEY, JSON.stringify(current), true);
    }catch(e){
      console.error('Could not save stats', e);
    }
    overlay.classList.remove('open');
    animated = false;
    renderBoard(current);
  });

  // initial load in case board is already in view
  loadBoard();

  // Fit-check gate
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
      fitResult.textContent = "Let's Talk. Scroll down to grab a time on the calendar.";
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

  // Mobile menu toggle
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
