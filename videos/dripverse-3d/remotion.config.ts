/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// This container: use the pre-installed Chromium headless shell, and SwiftShader through ANGLE for WebGL (no GPU here).
Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell");
Config.setChromiumOpenGlRenderer("swangle");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
