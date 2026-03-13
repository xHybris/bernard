const timeoutRef = {
  value: null,
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function scheduleNotification(timeStr) {
  if (!timeStr || !('Notification' in window)) {
    return
  }

  if (timeoutRef.value) {
    clearTimeout(timeoutRef.value)
  }

  const [hours, minutes] = timeStr.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)

  if (target <= now) {
    target.setDate(target.getDate() + 1)
  }

  const delay = target.getTime() - now.getTime()

  timeoutRef.value = setTimeout(() => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Bernard', {
        body: "Tu es allé à la salle aujourd'hui ?",
        icon: new URL('/icon-192.png', window.location.href).href,
        tag: 'bernard-daily',
      })

      notification.onclick = () => {
        window.focus()
        window.location.hash = '#/session'
        notification.close()
      }
    }

    scheduleNotification(timeStr)
  }, delay)
}
