# ASR - Android Screen Recording Processor

A bash script that automates processing screen recordings from an Android device for Instagram Reels.

## What It Does

1. **Pulls recordings** from your Android device via ADB (only new/changed files)
2. **Crops** the bottom navigation bar (130px for Samsung devices)
3. **Speeds up** the first part of the video to fit a 19-second target duration
4. **Adds padding** to achieve 9:16 aspect ratio (1080x1920)

## Requirements

- `adb` (Android Debug Bridge)
- `ffmpeg` with libx264 encoder
- `bc` (basic calculator)
- Android device connected via USB with debugging enabled

## Directory Structure

```
~/Downloads/asr/
├── Screen recordings/    # Raw recordings pulled from device
└── processed/            # Output reels ready for upload
```

## Usage

```bash
./asr.sh
```

The script will:
- Pull any new screen recordings from `/sdcard/DCIM/Screen recordings/`
- Skip files that already exist locally with the same size
- Process each video: crop, speed up (17s) + normal ending (2s), pad to 9:16
- Save processed files with `_reel.mp4` suffix
- Skip videos that have already been processed

## Configuration

Edit these variables at the top of the script:

| Variable | Default | Description |
|----------|---------|-------------|
| `INPUT_DIR` | `~/Downloads/asr` | Where recordings are pulled to |
| `OUTPUT_DIR` | `~/Downloads/asr/processed` | Where processed reels go |
| `ANDROID_SCREEN_RECORDINGS` | `/sdcard/DCIM/Screen recordings` | Path on Android device |
| `CROP_BOTTOM` | `130` | Pixels to crop from bottom (nav bar) |
| `TARGET_DURATION` | `19` | Target reel duration in seconds |

## Output Format

- Resolution: 1080x1920 (9:16 portrait)
- Codec: H.264 (libx264)
- Frame rate: 30 fps
- Quality: CRF 18 (high quality)
- Audio: Removed
