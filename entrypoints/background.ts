export default defineBackground(() => {
  // Open the side panel when the toolbar icon is clicked.
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error(error));
});
