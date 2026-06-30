# WebLLM Performance Checklist

Use this checklist when validating the browser WebLLM docent path. The script is intended for local, real-browser measurement because WebGPU, model cache, GPU memory, and network conditions affect the result.

## Automated Measurement

1. Start the frontend dev server.

   ```powershell
   cd frontend
   npm run dev
   ```

2. In another terminal, run the measurement script.

   ```powershell
   cd frontend
   npm run measure:webllm -- --rounds=3 --url=http://127.0.0.1:5173
   ```

3. Optional: use an installed Chrome executable.

   ```powershell
   cd frontend
   npm run measure:webllm -- --chrome="C:\Program Files\Google\Chrome\Application\chrome.exe" --rounds=5
   ```

4. Record these values in `ai_command/WORK_LOG.md`:

   - model prepare time
   - warm first-token time for each round
   - warm final-response time for each round
   - token update count
   - browser name/version, GPU, network state, and whether the model cache was cold or warm

## Suggested Thresholds

- Warm first token: 8 seconds or less
- Warm final response: 18 seconds or less
- Model prepare: record only, because cold cache and network speed dominate this number

## Manual Checks

1. Open the gallery and confirm the model preparation status changes from preparing to ready.
2. Ask a typed docent question and confirm streaming text appears only in the draft area.
3. Confirm the final answer replaces the draft after generation finishes.
4. Simulate or observe a model preparation failure and confirm the model retry button appears.
5. Press the model retry button and confirm it starts model preparation again without a page refresh.
6. Check Chrome and Edge separately when both browsers are available.
7. Check a WebGPU-unavailable environment and confirm the user-facing error mentions supported browsers and secure context.
8. If testing network failure or low-memory conditions, document the exact setup before recording the result.

## Known Limits

This script does not reproduce Edge/Chrome differences, low-spec hardware, WebGPU-unavailable devices, network interruption, or memory exhaustion by itself. Those need actual browser, device, and network conditions.
