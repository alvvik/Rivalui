use std::time::Duration;
use tauri::{Emitter, Manager};
use tauri_plugin_shell::ShellExt;

async fn fetch_mouse_data(app: &tauri::AppHandle) -> Result<String, String> {
    let resource_path = app
        .path()
        .resource_dir()
        .map(|p| p.join("python/mouse_bridge.py"))
        .unwrap_or_else(|_| std::path::PathBuf::from("src-tauri/python/mouse_bridge.py"));

    let script_path = if resource_path.exists() {
        resource_path
    } else {
        std::path::PathBuf::from("src-tauri/python/mouse_bridge.py")
    };

    let output = app
        .shell()
        .command("python3")
        .args(["-I", script_path.to_str().unwrap()])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

async fn update_python_config(app: &tauri::AppHandle, key: &str, value: &str) {
    let resource_path = app
        .path()
        .resource_dir()
        .map(|p| p.join("python/mouse_bridge.py"))
        .unwrap_or_else(|_| std::path::PathBuf::from("src-tauri/python/mouse_bridge.py"));

    let script_path = if resource_path.exists() {
        resource_path
    } else {
        std::path::PathBuf::from("src-tauri/python/mouse_bridge.py")
    };

    let json_arg = format!("{{\"{}\": \"{}\"}}", key, value);
    let _ = app
        .shell()
        .command("python3")
        .args(["-I", script_path.to_str().unwrap(), "--update-config", &json_arg])
        .output()
        .await;
}

#[tauri::command]
async fn get_mouse_info(app: tauri::AppHandle) -> Result<String, String> {
    fetch_mouse_data(&app).await
}

#[tauri::command]
async fn set_sensitivity(app: tauri::AppHandle, sensitivity: String) -> Result<String, String> {
    let output = app
        .shell()
        .command("rivalcfg")
        .args(["--sensitivity", &sensitivity])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        update_python_config(&app, "current_sensitivity", &sensitivity).await;
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn set_polling_rate(app: tauri::AppHandle, polling_rate: String) -> Result<String, String> {
    let output = app
        .shell()
        .command("rivalcfg")
        .args(["--polling-rate", &polling_rate])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        update_python_config(&app, "current_polling_rate", &polling_rate).await;
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_mouse_info,
            set_sensitivity,
            set_polling_rate
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let mut last_json = String::new();

                loop {
                    tokio::time::sleep(Duration::from_secs(2)).await;

                    if let Ok(json_data) = fetch_mouse_data(&handle).await {
                        if json_data != last_json {
                            last_json = json_data.clone();
                            let _ = handle.emit("mouse-state-changed", json_data);
                        }
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
