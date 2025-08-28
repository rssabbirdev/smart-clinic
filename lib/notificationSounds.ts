// Notification Sounds Utility using Web Audio API
export class NotificationSounds {
  private audioContext: AudioContext | null = null

  constructor() {
    // Initialize audio context on user interaction
    if (typeof window !== 'undefined') {
      this.initAudioContext()
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Web Audio API not supported, notifications will be silent')
    }
  }

  private ensureAudioContext() {
    if (!this.audioContext || this.audioContext.state === 'suspended') {
      this.initAudioContext()
    }
  }

  // Generate a pleasant notification sound
  playNewCaseSound() {
    this.ensureAudioContext()
    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Create a pleasant two-tone sound
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn('Failed to play new case sound:', error)
    }
  }

  // Generate an urgent emergency sound
  playEmergencySound() {
    this.ensureAudioContext()
    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Create an urgent three-tone pattern
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.15)
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.3)
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.45)
      
      gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.6)
    } catch (error) {
      console.warn('Failed to play emergency sound:', error)
    }
  }

  // Generate a general notification sound
  playNotificationSound() {
    this.ensureAudioContext()
    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Create a simple notification sound
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.2)
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  }

  // Test sound function
  testSound(type: 'new_case' | 'emergency' | 'notification') {
    switch (type) {
      case 'new_case':
        this.playNewCaseSound()
        break
      case 'emergency':
        this.playEmergencySound()
        break
      case 'notification':
        this.playNotificationSound()
        break
    }
  }
}

// Create a singleton instance
export const notificationSounds = new NotificationSounds()
