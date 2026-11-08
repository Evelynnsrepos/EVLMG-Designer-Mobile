//! Desktop commands a phone can't run: Git sync needs the `git` program, the optional local AI helper starts a
//! program on the computer, plugin downloads run outside code (App Store rule 2.5.2), and graphics mode is Linux only.
//! Same names as on the desktop, so the shared UI shows "not installed" or a clear message instead of a crash.

const MSG: &str = "Not available in the mobile app. Use the desktop app for this.";

#[tauri::command]
pub async fn git_run() -> Result<(), String> {
  Err(MSG.into())
}

/// None = "git is not installed": the Git sync screen already explains that.
#[tauri::command]
pub async fn git_version() -> Option<String> {
  None
}

#[tauri::command]
pub fn graphics_mode_get() -> String {
  "auto".into()
}

#[tauri::command]
pub fn graphics_mode_set() -> Result<(), String> {
  Err(MSG.into())
}

/// false = "this model is not downloaded", so no AI feature is ever offered as ready.
#[tauri::command]
pub async fn llm_status() -> Result<bool, String> {
  Ok(false)
}

#[tauri::command]
pub async fn llm_install() -> Result<(), String> {
  Err(MSG.into())
}

#[tauri::command]
pub async fn llm_remove() -> Result<(), String> {
  Ok(())
}

#[tauri::command]
pub async fn llm_check() -> Result<String, String> {
  Err(MSG.into())
}

#[tauri::command]
pub async fn llm_options() -> Result<Vec<String>, String> {
  Err(MSG.into())
}

#[tauri::command]
pub async fn llm_ask() -> Result<String, String> {
  Err(MSG.into())
}

#[tauri::command]
pub async fn plugin_download() -> Result<(), String> {
  Err(MSG.into())
}
