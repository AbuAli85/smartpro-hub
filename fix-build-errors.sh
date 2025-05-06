#!/bin/bash
echo "Fixing build errors..."
echo
echo "1. Installing missing dependencies..."
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog
echo
echo "2. Clearing Next.js cache..."
npx next clear
echo
echo "3. Rebuilding the project..."
npm run build
echo
echo "Done! If you still see errors, you may need to install additional dependencies."
