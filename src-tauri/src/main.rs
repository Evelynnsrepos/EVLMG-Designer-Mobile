// Runs the mobile build in a window on a computer, for quick checks without a phone (`npm run tauri dev`).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  evlmg_mobile_lib::run();
}
