import posthog from 'posthog-js'

// Initialize PostHog in both development and production
if (typeof window !== 'undefined') {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim()

    console.log('PostHog Configuration:', {
      apiKey,
      apiHost,
      env: process.env.NODE_ENV
    })

    if (!apiKey) {
      console.error('PostHog API key is not configured')
    }

    posthog.init(apiKey || '', {
      api_host: apiHost || 'https://us.i.posthog.com',
      // Enable debug mode in development
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug()
          console.log('PostHog initialized in debug mode')
        }
      },
      capture_pageview: true, // Automatically capture pageviews
      capture_pageleave: true, // Capture when users leave your pages
      autocapture: true, // Automatically capture clicks, form submissions etc
      persistence: 'localStorage',
      bootstrap: {
        distinctID: 'anonymous',
      },
      enable_recording_console_log: true,
      debug: process.env.NODE_ENV === 'development'
    })

    // Test event
    posthog.capture('test_event', {
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error initializing PostHog:', error)
  }
}

export { posthog } 