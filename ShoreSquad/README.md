# ShoreSquad

ShoreSquad is a youth-centered beach-cleanup platform that helps teams rally, find nearby cleanups, and check live weather before heading out.

Quick setup

1. Open the folder in VS Code: `c:/Users/user/Desktop/C240/Projects(vibe coding)/ShoreSquad`
2. Install the Live Server extension for VS Code.
3. (Optional) Initialize Git:

```powershell
git init
git add .
git commit -m "Initial ShoreSquad scaffold"
```

4. Provide an OpenWeatherMap API key:

- Open `app.js` and set `OPENWEATHER_API_KEY`.

5. Start Live Server (right-click `index.html` → Open with Live Server) or use the Live Server command palette.

Notes

- The map is implemented with Leaflet (CDN). No backend is included — sample events are in `app.js`.
- Images are lazy-loaded where appropriate. Replace `assets/beach-placeholder.jpg` with your own imagery.
- Accessibility: focus outlines, high-contrast CTAs, and accessible markup were included as a baseline.

Next steps (suggested)

- Hook up a backend/API for events and user auth.
- Add real tide data and a more advanced weather/tide dashboard.
- Add UI for creating/joining events, and allow users to RSVP.
