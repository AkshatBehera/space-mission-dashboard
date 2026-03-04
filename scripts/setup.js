#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Space Mission Stats Dashboard...\n');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

// Create fonts directory if it doesn't exist
const fontsDir = path.join('public', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
  console.log('📁 Created fonts directory');
}

console.log('🎯 Setup complete! You can now run:');
console.log('   npm run dev    - Start development server');
console.log('   npm run build  - Build for production');
console.log('   npm run preview - Preview production build\n');

console.log('🌌 Welcome to the Space Mission Stats Dashboard!');
console.log('   Dashboard: Real-time ISS tracking and space data');
console.log('   About: Interactive orbital simulator and space quiz');
console.log('   Contact: Developer information and project details\n');

console.log('🚀 Godspeed!');
