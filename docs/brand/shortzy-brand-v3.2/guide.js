'use strict';
const applicationMapping = {"idle": {"mascot": "welcome", "role": "status", "action": "Add video"}, "validating": {"mascot": null, "role": "status", "action": "Cancel"}, "uploading": {"mascot": null, "role": "status", "action": "Cancel"}, "queued": {"mascot": null, "role": "status", "action": "Remove from queue"}, "analyzing": {"mascot": "thinking", "role": "status", "action": "Cancel"}, "results": {"mascot": "clipping", "role": "status", "action": "Review clips"}, "empty": {"mascot": null, "role": "status", "action": "Adjust range"}, "editing": {"mascot": null, "role": null, "action": "Save changes"}, "unsaved": {"mascot": null, "role": "status", "action": "Save changes"}, "exporting": {"mascot": "clipping", "role": "status", "action": "Cancel"}, "partial": {"mascot": null, "role": "status", "action": "Retry failed clips"}, "complete": {"mascot": "celebration", "role": "status", "action": "Open exports"}, "cancelled": {"mascot": null, "role": "status", "action": "Start again"}, "error": {"mascot": null, "role": "alert", "action": "Retry"}, "offline": {"mascot": null, "role": "status", "action": "Retry connection"}, "credentials": {"mascot": null, "role": "alert", "action": "Open settings"}, "rateLimited": {"mascot": null, "role": "status", "action": "Retry when available"}, "storageFull": {"mascot": null, "role": "alert", "action": "Choose output folder"}};
const applicationCopy = {"idle": ["Ready", "Add your first video.", "Start with a video you want to turn into shorts.", null, null], "validating": ["Checking", "Checking the video.", "Confirming the format, duration and available audio.", null, null], "uploading": ["In progress", "Uploading your video.", "Show bytes transferred only when a real upload is required.", 42, "42% uploaded \u00b7 example"], "queued": ["Queued", "Your video is waiting.", "Explain queue position only if the engine reports it.", null, null], "analyzing": ["In progress", "Looking for strong moments.", "Show the real analysis stage. Do not invent a completion estimate.", null, null], "results": ["Ready to review", "Your clips are ready to review.", "Check the hook, refine the cut and choose what to export.", null, null], "empty": ["No matches", "No strong matches yet.", "Adjust the range, try another video or create a clip manually.", null, null], "editing": ["Editing", "Make the cut your own.", "Keep the timeline and preview prominent. Offer keyboard alternatives to dragging.", null, null], "unsaved": ["Unsaved", "You have unsaved edits.", "Keep these changes in view and confirm before navigation that would lose them.", null, null], "exporting": ["In progress", "Exporting your selected clips.", "Show real engine progress and support cancellation where available.", 65, "65% exported \u00b7 example"], "partial": ["Needs attention", "Some clips could not be exported.", "Keep successful files available and retry only the failed clips.", null, null], "complete": ["Complete", "Your clips are ready to share.", "Only show this when the actual output files exist and can be opened.", null, null], "cancelled": ["Cancelled", "The task was cancelled.", "Keep the source and saved edits. Explain whether partial outputs were retained.", null, null], "error": ["Error", "We couldn\u2019t process this video.", "Show the actual failure reason and a practical recovery action.", null, null], "offline": ["Connection unavailable", "The AI service is unavailable.", "Local editing remains available if supported. Save progress and allow a retry.", null, null], "credentials": ["Setup needed", "Connect your analysis provider.", "Guide the creator to settings to add or repair their API key.", null, null], "rateLimited": ["Please wait", "The provider needs a moment.", "Use the provider\u2019s real retry-after value. Keep the source and current progress.", null, null], "storageFull": ["Export blocked", "There isn\u2019t enough output space.", "Choose another folder or free space. Keep completed clips available.", null, null]};

const byId = id => document.getElementById(id);
// aria-disabled does not block clicks by itself. Suppress them before any handler.
document.addEventListener('click', event => {
  if (event.target.closest('[aria-disabled="true"]')) { event.preventDefault(); event.stopImmediatePropagation(); }
}, true);
document.querySelectorAll('[data-sample]').forEach(button => button.addEventListener('click', () => {
 byId('sample-status').textContent = `${button.textContent.trim()} activated. This is a component example.`;
}));
document.querySelectorAll('[data-toggle]').forEach(button => button.addEventListener('click', () => {
 const selected = button.getAttribute('aria-pressed') !== 'true';
 button.setAttribute('aria-pressed', String(selected)); button.textContent = selected ? '✓ Selected' : 'Select clip';
}));
const poseCopy = {welcome:'Welcome: onboarding and import.',thinking:'Thinking: actual analysis, with clear stage text.',clipping:'Clipping: reviewing candidates and export in progress.',celebration:'Celebration: only after successful export.'};
document.querySelectorAll('[data-pose-option]').forEach(button => button.addEventListener('click', () => {
 document.querySelectorAll('[data-pose-option]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
 byId('pose-description').textContent = poseCopy[button.dataset.poseOption];
}));
byId('mixed-choice').indeterminate = true;
byId('sound-switch').addEventListener('click', () => {
 const button = byId('sound-switch'); const checked = button.getAttribute('aria-checked') !== 'true';
 button.setAttribute('aria-checked', String(checked)); byId('switch-word').textContent = checked ? 'On' : 'Off';
});
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
function selectTab(tab, focus = false) {
 tabs.forEach(item => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; byId(item.getAttribute('aria-controls')).hidden = !selected; });
 if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
 tab.addEventListener('click', () => selectTab(tab));
 tab.addEventListener('keydown', event => {
  const indices = {ArrowRight:(index+1)%tabs.length,ArrowLeft:(index+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1};
  if (event.key in indices) { event.preventDefault(); selectTab(tabs[indices[event.key]], true); }
 });
});
byId('clip-toggle').addEventListener('click', () => {
 const button = byId('clip-toggle'); const selected = button.getAttribute('aria-pressed') !== 'true';
 button.setAttribute('aria-pressed', String(selected)); button.querySelector('.clip-check').textContent = selected ? '✓ Selected' : 'Select clip';
 byId('selection-summary').textContent = selected ? '1 example clip selected: A clear opening hook.' : 'No clips selected in this example.';
});
byId('crop-position').addEventListener('input', event => {byId('crop-output').textContent = `${event.target.value}%`;});
const drop = byId('dropzone'); const fileInput = byId('file-input');
function handleFile(file) {
 drop.removeAttribute('data-drag'); if (!file) return;
 const valid = /\.(mp4|mov|webm|mkv)$/i.test(file.name);
 drop.setAttribute('aria-invalid', String(!valid));
 byId('drop-title').textContent = valid ? file.name : 'Choose a supported video file';
 byId('upload-status').textContent = valid ? `${file.name} selected locally for the preview. No upload was performed.` : 'Unsupported filename extension. Choose MP4, MOV, WebM or MKV.';
}
drop.addEventListener('click', () => fileInput.click());fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));
drop.addEventListener('dragover', event => {event.preventDefault(); drop.dataset.drag = 'true';});
drop.addEventListener('dragleave', event => {if (!drop.contains(event.relatedTarget)) drop.removeAttribute('data-drag');});
drop.addEventListener('drop', event => {event.preventDefault();handleFile(event.dataTransfer.files[0]);});
// Preview validation shows an actionable inline error; production validates actual source duration.
byId('error-value').addEventListener('input', event => {
 const value = event.target.value.trim(); const valid = value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 120;
 event.target.setAttribute('aria-invalid', String(!valid)); event.target.dataset.valid = String(valid);
 byId('duration-error').textContent = valid ? '✓ End time is within the example source.' : '! Enter an end time from 0 to 120 seconds.';
 byId('duration-error').className = valid ? 'sz-field-success' : 'sz-field-error';
});
const dialog = byId('remove-dialog');let dialogOpener;
byId('open-dialog').addEventListener('click', event => {dialogOpener = event.currentTarget;dialog.showModal();});
byId('cancel-dialog').addEventListener('click', () => dialog.close('cancel'));
byId('confirm-dialog').addEventListener('click', () => {dialog.close('confirm'); byId('sample-status').textContent = 'Removal confirmed in the demo. No actual clip was deleted.';});
dialog.addEventListener('close', () => dialogOpener?.focus());
byId('show-toast').addEventListener('click', () => {byId('toast').hidden = false;byId('toast-message').textContent = '✓ Example settings saved. This is a visual preview.';});
byId('close-toast').addEventListener('click', () => {byId('toast').hidden = true;byId('show-toast').focus();});
document.querySelectorAll('.sz-tooltip-wrap').forEach(wrapper => {
 const tooltip = wrapper.querySelector('.sz-tooltip');
 wrapper.addEventListener('keydown', event => {if(event.key === 'Escape'){tooltip.dataset.dismissed='true';event.preventDefault();}});
 wrapper.addEventListener('mouseleave', () => delete tooltip.dataset.dismissed);
 wrapper.addEventListener('focusout', () => delete tooltip.dataset.dismissed);
});
function renderApplicationState() {
 const key = byId('app-state').value; const mapping = applicationMapping[key]; const [badge,title,copy,progress,progressLabel] = applicationCopy[key];
 byId('app-mascot').replaceChildren();
 if (mapping.mascot) byId('app-mascot').append(ShortzyMascot.createMascot(mapping.mascot, {width:250}));
 byId('app-badge').textContent = badge; byId('app-title').textContent = title; byId('app-copy').textContent = copy;
 byId('app-action').textContent = mapping.action;
 byId('app-progress-wrap').hidden = progress === null;
 if (progress !== null) {byId('app-progress').value = progress;byId('app-progress-label').textContent = progressLabel;}
 const secondary = {partial:'Open successful exports',unsaved:'Discard changes',empty:'Create a clip manually',offline:'Continue local editing'}[key];
 byId('app-secondary').hidden = !secondary;if(secondary)byId('app-secondary').textContent = secondary;
 byId('app-announcement').textContent = `Preview: ${title} ${copy}`;
}
byId('app-state').addEventListener('change', renderApplicationState);renderApplicationState();
byId('app-action').addEventListener('click', () => {byId('app-announcement').textContent = `${byId('app-action').textContent} is a preview action. Connect it to the real application workflow.`;});
byId('app-secondary').addEventListener('click', () => {byId('app-announcement').textContent = `${byId('app-secondary').textContent} is a preview action.`;});
