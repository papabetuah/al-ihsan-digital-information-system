# Al Ihsan Native TV Player

Native Android TV wrapper for the existing Al Ihsan GitHub Pages dashboard.

## Why this exists

The Yodeck Play Store App uses a web-player/Chromium engine whose autoplay rules can block audible media without a user gesture. This wrapper uses Android WebView directly and explicitly calls:

`WebSettings.setMediaPlaybackRequiresUserGesture(false)`

The dashboard, prayer scheduler, playlist rotation, 2-second gaps, 30-second pre-azan silence and local MP3 files remain in the existing website repository.

## Runtime URL

`https://papabetuah.github.io/al-ihsan-digital-information-system/?nativePlayer=1`

## Installation

Install the APK once on the Android TV. For the most reliable boot behavior, select **Al Ihsan TV** as the default Home/launcher when Android asks. The app is also registered for BOOT_COMPLETED as a fallback.

## Audio

The app requests media audio focus and keeps the screen awake. The actual playlist playback remains controlled by the website.
