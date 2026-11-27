# Frontend Status and Acceptance Checklist

Status reflects the current consolidated v8 baseline. Checkboxes are intentionally not marked complete where behaviour has not been fully tested.

## Present in the current baseline

- [x] Landing page and workspace source consolidated from the latest cumulative version
- [x] Sidebar collapse and reopen controls
- [x] New chat and simulated research session flow
- [x] Recent conversations and history search UI
- [x] Research/Web mode and model preference controls
- [x] PDF file selection and in-session browser preview
- [x] Sources, Papers, Findings, Verification, and Report tabs
- [x] Manual evidence register with stance filters
- [x] Evidence register stored in browser localStorage
- [x] Report preview reflects manually captured evidence
- [x] Markdown report export

## Still to implement or verify

- [ ] Run a successful clean `npm install` and `npm run build`
- [ ] Test all controls and navigation in browser
- [ ] Persist PDF binary data across refreshes (IndexedDB)
- [ ] Persist attachment-to-conversation relationships
- [ ] Complete rename/delete conversation actions
- [ ] Persist project creation and selection
- [ ] Add robust empty, loading, validation, and error states
- [ ] Define and implement a shared session state/data layer
- [ ] Connect all workspace modules to the same session data
- [ ] Add mock source, paper extraction, finding, verification, and report adapters
- [ ] Add export validation and report formatting tests
- [ ] Test desktop, tablet, and mobile layouts

## Not implemented until the final API phase

- [ ] Live multi-source web search and retrieval
- [ ] Automatic paper/PDF text extraction and OCR
- [ ] AI findings and insight extraction
- [ ] Automated cross-verification and contradiction detection
- [ ] Verified inline citations and source references

## Known limitation

The current PDF viewer uses `URL.createObjectURL()` for a selected file. Such URLs are temporary and cannot be treated as durable saved document storage. Use IndexedDB (or a future backend document store) for persistent PDF files.

## v10 visual update
- Research agent checking/progress cards now use a vertical timeline layout.
- Each stage occupies its own full-width row with a connected timeline rail.
- Completed, active and queued stages have distinct timeline markers.
- Responsive spacing is included; existing research stage logic and content are unchanged.
