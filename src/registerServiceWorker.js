const SERVICE_WORKER_URL = '/sw.js'

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_URL)
      .then((registration) => {
        // Proactively checks for a newer app shell after startup.
        registration.update()
      })
      .catch((error) => {
        console.warn('SpendWise service worker registration failed.', error)
      })
  })
}
