import os
import json
import rivalcfg
import re
import time
import subprocess
import sys

os.environ['HOME'] = os.path.expanduser('~')
os.environ['XDG_CONFIG_HOME'] = os.path.join(os.environ['HOME'], '.config')

CONFIG_DIR = os.path.join(os.environ['XDG_CONFIG_HOME'], 'rivalcfg')
CONFIG_FILE = os.path.join(CONFIG_DIR, 'config.json')

def load_config_file():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('default', {})
        except Exception as e:
            print(f"Error reading config file: {e}", file=sys.stderr)
    return {}

def save_config_file(new_settings):
    try:
        os.makedirs(CONFIG_DIR, exist_ok=True)
        full_config = {}
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    full_config = json.load(f)
            except Exception:
                pass

        if 'default' not in full_config:
            full_config['default'] = {}

        full_config['default'].update(new_settings)

        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(full_config, f, indent=4)
    except Exception as e:
        print(f"Error saving config file: {e}", file=sys.stderr)

def get_info():
    try:
        mouse = rivalcfg.get_first_mouse()
        try:
            mouse.mouse_settings._load()
        except Exception:
            pass

        battery_level = 50
        for attempt in range(3):
            try:
                res = subprocess.run(['rivalcfg', '--battery-level'], capture_output=True, text=True, timeout=3)
                if res.returncode == 0 and "Unable to get" not in res.stdout:
                    match = re.search(r'(\d+)\s*%', res.stdout)
                    if match:
                        battery_level = int(match.group(1))
                        break
            except Exception:
                pass
            time.sleep(0.5)

        file_config = load_config_file()

        active_dpi = None
        try:
            s = mouse.mouse_settings.get('sensitivity')
            if s is not None:
                if isinstance(s, (list, tuple)) and len(s) > 0:
                    active_dpi = str(s[0])
                else:
                    active_dpi = str(s)
        except Exception:
            pass

        if not active_dpi:
            active_dpi = file_config.get('current_sensitivity', "1600")
        else:
            if file_config.get('current_sensitivity') != str(active_dpi):
                file_config['current_sensitivity'] = str(active_dpi)
                save_config_file(file_config)

        polling_rate = "1000 Hz"
        try:
            pr = mouse.mouse_settings.get('polling_rate')
            if pr is not None:
                pr_str = str(pr).strip()
                if pr_str:
                    polling_rate = pr_str if pr_str.lower().endswith('hz') else f"{pr_str} Hz"
        except Exception:
            pass

        if not polling_rate:
            active_polling = file_config.get('current_polling_rate', "1000 Hz")
            polling_rate = str(active_polling) if str(active_polling).lower().endswith('hz') else f"{active_polling} Hz"

        data = {
            'mouseName': getattr(mouse, 'name', 'SteelSeries Aerox 3 Wireless'),
            'batteryLevel': battery_level,
            'currentDpi': str(active_dpi),
            'pollingRate': polling_rate,
            'config': file_config
        }
        print(json.dumps(data))
    except Exception as e:
        print(f"PYTHON_ERROR: {str(e)}", file=sys.stderr)
        file_config = load_config_file()
        data = {
            'mouseName': 'SteelSeries Aerox 3 Wireless',
            'batteryLevel': 50,
            'currentDpi': str(file_config.get('current_sensitivity', '1600')),
            'pollingRate': '1000 Hz',
            'config': file_config
        }
        print(json.dumps(data))

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == '--update-config':
        try:
            new_data = json.loads(sys.argv[2])
            save_config_file(new_data)
            print(json.dumps({"status": "success"}))
        except Exception as e:
            print(json.dumps({"status": "error", "message": str(e)}))
    else:
        get_info()
