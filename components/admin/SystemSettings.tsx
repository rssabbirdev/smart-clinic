'use client'

export function SystemSettings() {
  return (
    <div className="kiosk-card">
      <h2 className="text-kiosk-xl font-bold text-gray-800 mb-6">
        ⚙️ System Settings
      </h2>
      <div className="text-kiosk-base text-gray-600">
        <p>System configuration functionality coming soon...</p>
        <p>This will include:</p>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li>Clinic information settings</li>
          <li>Queue management rules</li>
          <li>Auto-logout timeout configuration</li>
          <li>Emergency priority settings</li>
          <li>System backup and restore</li>
        </ul>
      </div>
    </div>
  )
}
