// Lets the phone app import the web app's profile and sentence code (../src/data/profiles, ../src/lib/profileCompose),
// so the phone offers exactly the same quick phrases, intents and sentences as the web app.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.watchFolders = [...(config.watchFolders ?? []), path.resolve(__dirname, '../src')];
module.exports = config;
