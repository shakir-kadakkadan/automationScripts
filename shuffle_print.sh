#!/bin/bash

# Read random lines from files, skip some, show file transitions

SOURCE_DIR="/Users/shakir/PROJECTS/SHAKIR_PROJECTS/bcnew_0/common/src/desktopMain/kotlin/me/emstell/ui_main"

# Handle Ctrl+C properly
trap 'echo -e "\n\033[0mStopped."; exit 0' INT TERM

# Colors
PURPLE='\033[0;35m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
ORANGE='\033[38;5;208m'
GRAY='\033[0;90m'
WHITE_BG='\033[47;30m'
RESET='\033[0m'

# Syntax highlight a line (Kotlin-style)
highlight() {
    line="$1"

    # Skip empty lines
    [ -z "$(echo "$line" | tr -d ' ')" ] && return 1

    # Comments (gray)
    case "$line" in
        *"//"*|*"*"*)
            echo -e "${GRAY}${line}${RESET}"
            return
            ;;
    esac

    # Apply highlighting
    echo "$line" | sed \
        -e "s/\b\(fun\|val\|var\|class\|object\|interface\|enum\|sealed\|data\|suspend\|override\|private\|public\|internal\|protected\|open\|abstract\|companion\|inline\|infix\|operator\|lateinit\|const\)\b/$(printf '\033[0;35m')&$(printf '\033[0m')/g" \
        -e "s/\b\(if\|else\|when\|for\|while\|do\|return\|break\|continue\|try\|catch\|finally\|throw\|is\|as\|in\|!in\)\b/$(printf '\033[0;35m')&$(printf '\033[0m')/g" \
        -e "s/\b\(import\|package\)\b/$(printf '\033[0;35m')&$(printf '\033[0m')/g" \
        -e "s/\b\(true\|false\|null\)\b/$(printf '\033[38;5;208m')&$(printf '\033[0m')/g" \
        -e "s/\b\(Int\|String\|Boolean\|Float\|Double\|Long\|Unit\|Any\|Nothing\|List\|Map\|Set\|Array\)\b/$(printf '\033[0;36m')&$(printf '\033[0m')/g" \
        -e "s/\b\([0-9]\+\(\.[0-9]\+\)\?[fFL]\?\)\b/$(printf '\033[38;5;208m')&$(printf '\033[0m')/g" \
        -e "s/\"[^\"]*\"/$(printf '\033[0;32m')&$(printf '\033[0m')/g" \
        -e "s/@\([A-Za-z_][A-Za-z0-9_]*\)/$(printf '\033[0;33m')&$(printf '\033[0m')/g"
}

# Get all kt files into a temp file
FILES_LIST=$(mktemp)
find "$SOURCE_DIR" -maxdepth 1 -type f -name "*.kt" > "$FILES_LIST"
FILE_COUNT=$(wc -l < "$FILES_LIST" | tr -d ' ')

# Continuously print random lines from random files
while true; do
    # Pick a random file
    line_num=$(( (RANDOM % FILE_COUNT) + 1 ))
    file=$(sed -n "${line_num}p" "$FILES_LIST")
    filename=$(basename "$file")

    # Show file header
    echo -e "\n${WHITE_BG} ▶ ${filename} ${RESET}\n"
    sleep 0.15

    # Read file, shuffle, pick 5-15 random lines
    num_lines=$(( (RANDOM % 11) + 5 ))
    shuf "$file" | head -n "$num_lines" | while IFS= read -r line; do
        # 70% chance to show the line (skip some randomly)
        if [ $(( RANDOM % 10 )) -lt 7 ]; then
            highlight "$line"
            sleep 0.025
        fi
    done

    sleep 0.25
done

# Cleanup
rm -f "$FILES_LIST"
