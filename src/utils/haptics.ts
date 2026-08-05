// Native Haptic Vibrations Helper

export function hapticLight() {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(8);
    } catch {
      // Haptics not supported or permitted
    }
  }
}

export function hapticMedium() {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(15);
    } catch {
      // Ignore
    }
  }
}

export function hapticSuccess() {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([10, 40, 15, 40, 25]);
    } catch {
      // Ignore
    }
  }
}

export function hapticWarning() {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([25, 30, 25]);
    } catch {
      // Ignore
    }
  }
}
