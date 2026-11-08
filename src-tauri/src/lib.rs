//! The phone and tablet app. It builds the desktop app's own Rust files (desktop/ submodule), so peer-to-peer
//! collaboration, the server link and spell check are the same code as on the desktop, never a copy.
//! Only what a phone can't do is left out (see `not_on_mobile`).

#[path = "../../desktop/src-tauri/src/collab.rs"]
mod collab;
#[path = "../../desktop/src-tauri/src/collab_commands.rs"]
mod collab_commands;
#[path = "../../desktop/src-tauri/src/server_link.rs"]
mod server_link;
#[path = "../../desktop/src-tauri/src/spell.rs"]
mod spell;
mod not_on_mobile;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .manage(collab_commands::CollabState::default())
    .manage(server_link::ServerLinks::default())
    // Same command names as desktop/src-tauri/src/lib.rs, so the desktop UI works unchanged.
    .invoke_handler(tauri::generate_handler![
      spell::spell_check,
      spell::spell_suggest,
      collab_commands::collab_start,
      collab_commands::collab_addr,
      collab_commands::collab_connect,
      collab_commands::collab_send,
      collab_commands::collab_disconnect,
      collab_commands::collab_stop,
      server_link::server_connect,
      server_link::server_send,
      server_link::server_send_text,
      server_link::server_close,
      not_on_mobile::git_run,
      not_on_mobile::git_version,
      not_on_mobile::graphics_mode_get,
      not_on_mobile::graphics_mode_set,
      not_on_mobile::llm_status,
      not_on_mobile::llm_install,
      not_on_mobile::llm_remove,
      not_on_mobile::llm_check,
      not_on_mobile::llm_options,
      not_on_mobile::llm_ask,
      not_on_mobile::plugin_download,
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running the app");
}
