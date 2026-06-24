#!/bin/zsh
cd "$(dirname "$0")"
npm run local:status
echo
echo "按任意键关闭这个窗口..."
read -k 1
