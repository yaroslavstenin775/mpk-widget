#!/bin/bash
echo "========================================="
echo "Trwa wysyłanie zmian na GitHuba..."
echo "========================================="

git add .
git commit -m "Szybka aktualizacja rozkładu"
git push

echo ""
echo "========================================="
echo "Gotowe! Zmiany są już na GitHubie."
echo "Po restarcie Raspberry Pi pobierze nową wersję."
echo "========================================="
read -p "Naciśnij Enter, aby zamknąć..."
