# Citrix UCSDK Video Check

Small GitHub Pages repro page for a Citrix HDX / `@citrix/ucsdk` video optimization bug.

It does only three things:

1. Loads `@citrix/ucsdk` from files bundled with this app.
2. Starts a normal browser camera preview.
3. Starts a second camera preview through `CitrixWebRTC.initUCSDK`, `CitrixWebRTC.mapVideoElement`, and `CitrixWebRTC.getUserMedia`.

Expected result: both video boxes show moving video. The second box is the one that exercises the Citrix optimized endpoint/client rendering path.

## Run

Install dependencies, build the static site, then serve `dist`:

```bash
npm install
npm run build
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Then open `http://127.0.0.1:4173`.

## Publish

Push this repo to GitHub. The included GitHub Actions workflow runs `npm ci`, copies the installed `@citrix/ucsdk` browser files into `dist`, and publishes `dist` to GitHub Pages from `main`.
