import json
import rivalcfg
import re
import time
import subprocess
import sys

def get_info():
    try:
        mouse = rivalcfg.get_first_mouse()
        try:
            mouse.mouse_settings._load()
        except Exception:
            pass

        battery_level = 50
        is_charging = False
        try:
            bat = getattr(mouse, 'battery', None)
            if bat and isinstance(bat, dict):
                battery_level = bat.get('level', 50)
                is_charging = bat.get('is_charging', False)
            else:
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
        except Exception:
            pass

        active_dpi = "1600"
        try:
            s = mouse.mouse_settings.get('sensitivity')
            if s is not None:
                if isinstance(s, (list, tuple)) and len(s) > 0:
                    active_dpi = str(s[0])
                else:
                    active_dpi = str(s)
        except Exception:
            pass

        polling_rate = "1000 Hz"
        try:
            pr = mouse.mouse_settings.get('polling_rate')
            if pr is not None:
                pr_str = str(pr).strip()
                if pr_str:
                    polling_rate = pr_str if pr_str.lower().endswith('hz') else f"{pr_str} Hz"
        except Exception:
            pass

        data = {
            'mouseName': getattr(mouse, 'name', 'SteelSeries Aerox 3 Wireless'),
            'batteryLevel': battery_level,
            'isCharging': is_charging,
            'currentDpi': str(active_dpi),
            'pollingRate': polling_rate,
        }
        print(json.dumps(data))
    except Exception as e:
        print(f"PYTHON_ERROR: {str(e)}", file=sys.stderr)
        data = {
            'mouseName': 'SteelSeries Aerox 3 Wireless',
            'batteryLevel': 50,
            'isCharging': False,
            'currentDpi': '1600',
            'pollingRate': '1000 Hz',
        }
        print(json.dumps(data))

if __name__ == '__main__':
    get_info()
