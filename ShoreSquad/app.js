// ShoreSquad — app.js
document.addEventListener('DOMContentLoaded', ()=>{
  // Simple responsive nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');
  navToggle?.addEventListener('click', ()=>{
    const open = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Initialize map (Leaflet)
  const map = L.map('map', {attributionControl:false}).setView([1.3521, 103.8198], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  // Sample events — in real app this would come from an API
  const events = [
    {id:1,title:'Sunrise Shore Cleanup',lat:1.381497,lon:103.955574,date:'2026-06-12',spots:12},
    {id:2,title:'Junior Crew Coastal Sweep',lat:1.35,lon:103.8,date:'2026-06-19',spots:20},
    {id:3,title:'Community Beach Day',lat:1.3,lon:103.75,date:'2026-07-02',spots:30}
  ];

  const markers = {};

  function addEventMarkers(){
    events.forEach(ev =>{
      const m = L.marker([ev.lat,ev.lon]).addTo(map).bindPopup(`<strong>${ev.title}</strong><br>${ev.date}`);
      markers[ev.id]=m;
    });
  }
  addEventMarkers();

  // Render events list
  const eventList = document.getElementById('event-list');
  function renderEventList(){
    eventList.innerHTML='';
    events.forEach(ev=>{
      const li = document.createElement('li');
      li.className='event-item';
      li.innerHTML = `
        <div>
          <div style="font-weight:600">${ev.title}</div>
          <div style="font-size:.9rem;color:var(--muted)">${ev.date} — ${ev.spots} spots</div>
        </div>
        <div>
          <button data-id="${ev.id}" class="focus-btn">View</button>
        </div>`;
      eventList.appendChild(li);
    });

    // attach handlers
    eventList.querySelectorAll('button[data-id]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const id = Number(btn.getAttribute('data-id'));
        const ev = events.find(x=>x.id===id);
        if(ev && markers[id]){
          map.setView([ev.lat,ev.lon], 13, {animate:true});
          markers[id].openPopup();
        }
      });
    });
  }
  renderEventList();

  // Basic weather fetch (OpenWeatherMap) — uses coords of map center
  // ===== NEA Realtime Weather API Integration =====
  const NEA_API_URL = 'https://api.data.gov.sg/v1/environment/2-hour-weather';
  const NEA_4DAY_URL = 'https://api.data.gov.sg/v1/environment/4-day-outlook';

  async function fetchNEAWeather(){
    try{
      // Fetch current weather
      const res = await fetch(NEA_API_URL);
      if(!res.ok) throw new Error('NEA API error');
      const data = await res.json();
      
      // Get current conditions from first area (Singapore overall)
      if(data.items && data.items.length > 0){
        const item = data.items[0];
        const forecasts = item.general || {};
        showCurrentWeather(forecasts, data.metadata.valid_period);
      }
    }catch(err){
      console.error('Weather fetch error:', err);
      document.getElementById('weather-content').innerHTML = '<div style="color:var(--muted)">Weather data unavailable</div>';
    }
  }

  function showCurrentWeather(forecasts, period){
    const el = document.getElementById('weather-content');
    const forecast = forecasts.forecast || 'N/A';
    const humidity = forecasts.humidity ? `${forecasts.humidity.low}-${forecasts.humidity.high}%` : 'N/A';
    const wind = forecasts.wind ? `${forecasts.wind.speed.low}-${forecasts.wind.speed.high} km/h` : 'N/A';
    
    el.innerHTML = `
      <div style="font-weight:600;color:var(--ocean-700)">Current Conditions</div>
      <div style="margin:.5rem 0;color:var(--text)"><strong>${forecast}</strong></div>
      <div style="font-size:.85rem;color:var(--muted)">💧 Humidity: ${humidity}</div>
      <div style="font-size:.85rem;color:var(--muted)">💨 Wind: ${wind}</div>
    `;
  }

  async function fetch4DayForecast(){
    try{
      const res = await fetch(NEA_4DAY_URL);
      if(!res.ok) throw new Error('NEA 4-day API error');
      const data = await res.json();
      
      if(data.items && data.items.length > 0){
        const item = data.items[0];
        const forecasts = item.forecasts || [];
        show4DayForecast(forecasts);
      }
    }catch(err){
      console.error('4-day forecast error:', err);
      const container = document.getElementById('forecast-grid');
      if(container) container.innerHTML = '<div style="color:var(--muted)">Forecast unavailable</div>';
    }
  }

  function show4DayForecast(forecasts){
    const container = document.getElementById('forecast-grid');
    if(!container) return;
    
    container.innerHTML = '';
    forecasts.slice(0, 4).forEach(f=>{
      const date = new Date(f.date);
      const dayName = date.toLocaleDateString('en-SG', {weekday:'short'});
      const dateStr = date.toLocaleDateString('en-SG', {month:'short', day:'numeric'});
      
      const card = document.createElement('div');
      card.className = 'forecast-card';
      card.innerHTML = `
        <div class="forecast-date">${dayName}</div>
        <div class="forecast-date-small">${dateStr}</div>
        <div class="forecast-condition">${f.forecast}</div>
        <div class="forecast-temp">
          <span>📊 ${f.relative_humidity.low}-${f.relative_humidity.high}%</span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Fetch weather on page load
  fetchNEAWeather();
  fetch4DayForecast();

  // Refresh weather every 30 minutes
  setInterval(()=>{
    fetchNEAWeather();
    fetch4DayForecast();
  }, 30 * 60 * 1000);

  // Lazy load images (enhanced) using IntersectionObserver
  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  if('IntersectionObserver' in window){
    const obs = new IntersectionObserver((entries, observer)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img = entry.target;
          // if data-src pattern used, swap here. currently using src directly.
          observer.unobserve(img);
        }
      });
    },{rootMargin:'200px'});
    lazyImgs.forEach(i=>obs.observe(i));
  }

  // Save a simple preference (accent colour) to localStorage
  const accentKey = 'ss-preferred-accent';
  function setAccent(name){
    if(name==='coral') document.documentElement.style.setProperty('--accent-sea','var(--accent-coral)');
    else document.documentElement.style.setProperty('--accent-sea','var(--accent-sea)');
    localStorage.setItem(accentKey,name);
  }
  const saved = localStorage.getItem(accentKey) || 'sea';
  setAccent(saved);

  // Smooth scroll for CTAs
  document.getElementById('join-cta')?.addEventListener('click', ()=>{
    document.getElementById('events')?.scrollIntoView({behavior:'smooth'});
  });

});
