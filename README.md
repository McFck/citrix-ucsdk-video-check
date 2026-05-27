# Citrix UCSDK Video Check

Small GitHub Pages repro page for a Citrix HDX / `@citrix/ucsdk` video optimization bug.

It does only three things:

1. Tries to load `@citrix/ucsdk` from public npm CDNs.
2. Probes the Citrix local bridge at `ws://127.0.0.1:9002`.
3. Starts the camera and sends it through a local WebRTC loopback.

Expected result: both video boxes show moving video. If Citrix HDX optimization is active and either box is blank or frozen, the log gives a minimal report to compare against a non-optimized browser.

## Run

Open `index.html` from a secure context, or serve the folder:

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173`.

## Publish

Push this repo to GitHub. The included GitHub Actions workflow publishes the root folder to GitHub Pages from `main`.
