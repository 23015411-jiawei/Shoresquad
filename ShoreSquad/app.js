// ShoreSquad — app.js
document.addEventListener('DOMContentLoaded', ()=>{
  const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // <-- replace with your API key

  // Simple responsive nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');
  navToggle?.addEventListener('click', ()=>{
    const open = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Initialize map (Leaflet)
  const map = L.map('map', {attributionControl:false}).setView([36.0, -122.0], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  // Sample events — in real app this would come from an API
  const events = [
    {id:1,title:'Sunrise Shore Cleanup',lat:36.619,lon:-121.901,date:'2026-06-12',spots:12},
    {id:2,title:'Junior Crew Coastal Sweep',lat:36.978,lon:-122.031,date:'2026-06-19',spots:20},
    {id:3,title:'Community Beach Day',lat:35.997,lon:-121.390,date:'2026-07-02',spots:30}
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
  async function fetchWeather(lat,lon){
    if(OPENWEATHER_API_KEY==='YOUR_OPENWEATHER_API_KEY'){
      document.getElementById('weather-content').innerText = 'Add an OpenWeather API key in app.js to see live weather.';
      return;
    }
    try{
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`);
      if(!res.ok) throw new Error('weather fetch failed');
      const data = await res.json();
      showWeather(data);
    }catch(err){
      document.getElementById('weather-content').innerText = 'Weather unavailable.';
    }
  }

  function showWeather(data){
    const el = document.getElementById('weather-content');
    el.innerHTML = `
      <div style="font-weight:600">${data.name} — ${Math.round(data.main.temp)}°C</div>
      <div style="color:var(--muted)">${data.weather[0].description}</div>
    `;
  }

  // Initial weather load
  const center = map.getCenter();
  fetchWeather(center.lat, center.lng);

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
