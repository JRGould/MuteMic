# MuteMic

MuteMic is a small menubar app for macos that allows you to mute and unmute your microphone (or whatever you have set as your main input source) using a global hotkey. I had the idea to build this app after looking like a dummy too many times while scrambling to mute or unmute myself in video meetings whete it's a pretty standard courtesy to keep yourself muted when you're not talking.

# Installing / Running
I don't have a pre-built version of MuteMic yet, so you'll need to clone this repo and initiaize the project by running `npm install` or `yarn`

You should then be able to run the app by running `npm start` or `yarn start`

You should see a microphone icon show up in your menubar, clicking on it does nothing useful but this should also register a global hotkey `Cmd+Ctrl+F12` that will toggle your mic's muted state.

# Development / issues

  - In the future I will make the hotkey configurable. 
  - Currently the icons are optimized for Mojave's Dark Mode, but I plan to find a better icon and include dark / light variants

# Bugs? Feature Requests? Suggestions?

Don't email me.