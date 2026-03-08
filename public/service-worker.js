self.addEventListener("install", () => {
  console.log("Service Worker installing.");
});

self.addEventListener("activate", () => {
  console.log("Service Worker activated.");
});

self.addEventListener("fetch", () => {
  // pass-through
});