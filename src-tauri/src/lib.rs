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
      #[cfg(target_os = "android")]
      android_tls().map_err(|e| format!("Could not set up secure connections: {e}"))?;
      if cfg!(debug_assertions) {
        app.handle().plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running the app");
}

/// On Android the system certificate check (used by the server link and by peer-to-peer relays) calls into Java,
/// so it must get the app's context once before the first secure connection, or that connection crashes.
/// The Java half is added to the Android build by scripts/android-setup.sh.
#[cfg(target_os = "android")]
fn android_tls() -> Result<(), jni::errors::Error> {
  let ctx = ndk_context::android_context();
  let vm = unsafe { jni::JavaVM::from_raw(ctx.vm().cast()) };
  vm.attach_current_thread(|env| {
    let context = unsafe { jni::objects::JObject::from_raw(env, ctx.context().cast()) };
    rustls_platform_verifier::android::init_with_env(env, context)
  })
}
