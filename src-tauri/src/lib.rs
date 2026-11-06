use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::time::Duration;
use tauri::{Emitter, Manager};

const COLOR_SERVICE_SCRIPT: &str = include_str!("../../arch/rivalui-color-service");
const COLOR_SERVICE_UNIT: &str = r#"[Unit]
Description=RivalUI mouse colour service
After=graphical-session.target

[Service]
Type=simple
ExecStart=/bin/bash %h/.local/bin/rivalui-color-service
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
"#;

fn color_config_path() -> Result<PathBuf, String> {
    let config_dir = std::env::var_os("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("HOME").map(|home| PathBuf::from(home).join(".config")))
        .ok_or_else(|| "Could not determine the user config directory".to_string())?;

    Ok(config_dir.join("rivalui/colors.conf"))
}

fn normalize_color(color: Option<String>) -> Result<Option<String>, String> {
    color
        .map(|value| {
            let normalized = value.trim().trim_start_matches('#').to_ascii_lowercase();
            if normalized.len() != 6
                || !normalized
                    .chars()
                    .all(|character| character.is_ascii_hexdigit())
            {
                return Err(format!("Invalid color: {value}"));
            }
            Ok(normalized)
        })
        .transpose()
}

fn write_color_config(
    top_color: Option<String>,
    middle_color: Option<String>,
    bottom_color: Option<String>,
) -> Result<(), String> {
    let config_path = color_config_path()?;
    let config_dir = config_path
        .parent()
        .ok_or_else(|| "Could not determine the color config directory".to_string())?;
    fs::create_dir_all(config_dir).map_err(|error| error.to_string())?;

    let temporary_path = config_path.with_extension("conf.tmp");
    let contents = format!(
        "TOP_COLOR={}\nMIDDLE_COLOR={}\nBOTTOM_COLOR={}\n",
        top_color.unwrap_or_default(),
        middle_color.unwrap_or_default(),
        bottom_color.unwrap_or_default()
    );
    fs::write(&temporary_path, contents).map_err(|error| error.to_string())?;
    fs::rename(temporary_path, config_path).map_err(|error| error.to_string())
}

fn ensure_color_service() -> Result<(), String> {
    if PathBuf::from("/usr/bin/rivalui-color-service").exists() {
        return Ok(());
    }

    let home = std::env::var_os("HOME")
        .map(PathBuf::from)
        .ok_or_else(|| "Could not determine the user home directory".to_string())?;
    let script_dir = home.join(".local/bin");
    let unit_dir = home.join(".config/systemd/user");
    fs::create_dir_all(&script_dir).map_err(|error| error.to_string())?;
    fs::create_dir_all(&unit_dir).map_err(|error| error.to_string())?;

    let script_path = script_dir.join("rivalui-color-service");
    fs::write(&script_path, COLOR_SERVICE_SCRIPT).map_err(|error| error.to_string())?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&script_path, fs::Permissions::from_mode(0o755))
            .map_err(|error| error.to_string())?;
    }

    fs::write(unit_dir.join("rivalui-color.service"), COLOR_SERVICE_UNIT)
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn start_color_service() -> Result<(), String> {
    ensure_color_service()?;

    let reload = Command::new("systemctl")
        .args(["--user", "daemon-reload"])
        .status()
        .map_err(|error| error.to_string())?;
    if !reload.success() {
        return Err("Could not reload the user systemd manager".to_string());
    }

    let start = Command::new("systemctl")
        .args(["--user", "enable", "--now", "rivalui-color.service"])
        .status()
        .map_err(|error| error.to_string())?;
    if !start.success() {
        return Err("Could not enable rivalui-color.service".to_string());
    }

    Ok(())
}
async fn run_python(app: &tauri::AppHandle) -> Result<String, String> {
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

    let full_args = vec!["-I", script_path.to_str().unwrap()];

    let res = tokio::process::Command::new("/usr/bin/python3")
        .args(full_args.clone())
        .env_remove("PYTHONHOME")
        .env_remove("PYTHONPATH")
        .output()
        .await;

    let output = match res {
        Ok(out) if out.status.success() => out,
        _ => tokio::process::Command::new("python3")
            .args(full_args)
            .env_remove("PYTHONHOME")
            .env_remove("PYTHONPATH")
            .output()
            .await
            .map_err(|e| e.to_string())?,
    };

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn get_mouse_info(app: tauri::AppHandle) -> Result<String, String> {
    run_python(&app).await
}

#[tauri::command]
async fn set_sensitivity(sensitivity: String) -> Result<String, String> {
    let output = Command::new("rivalcfg")
        .args(["-s", &sensitivity])
        .env_remove("PYTHONHOME")
        .env_remove("PYTHONPATH")
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn set_polling_rate(polling_rate: String) -> Result<String, String> {
    let output = tokio::process::Command::new("rivalcfg")
        .args(["-p", &polling_rate])
        .env_remove("PYTHONHOME")
        .env_remove("PYTHONPATH")
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn set_mouse_colors(
    top_color: Option<String>,
    middle_color: Option<String>,
    bottom_color: Option<String>,
) -> Result<String, String> {
    let colors = (
        normalize_color(top_color)?,
        normalize_color(middle_color)?,
        normalize_color(bottom_color)?,
    );
    if colors.0.is_none() && colors.1.is_none() && colors.2.is_none() {
        return Err("Select at least one mouse zone".to_string());
    }

    write_color_config(colors.0, colors.1, colors.2)?;
    start_color_service()?;
    Ok("Color configuration saved".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_mouse_info,
            set_sensitivity,
            set_polling_rate,
            set_mouse_colors
        ])
        .setup(|app| {
            if let Err(error) = start_color_service() {
                eprintln!("Failed to start rivalui-color.service: {error}");
            }

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

                    if let Ok(json_data) = run_python(&handle).await {
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
