#!/usr/bin/env node
/**
 * Quick SQL fixes for Supabase
 * Run: node scripts/migrate-db.js
 * 
 * This script provides the SQL commands you need to run manually in Supabase.
 * Paste these into: Dashboard → SQL Editor
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../supabase/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

console.log('\n📋 SUPABASE MIGRATION GUIDE\n');
console.log('=' .repeat(60));
console.log('\n1. Go to: https://app.supabase.com');
console.log('2. Select your project');
console.log('3. Navigate to: SQL Editor');
console.log('4. Paste the SQL below and click "Run"\n');
console.log('=' .repeat(60));
console.log('\n');
console.log(schema);
console.log('\n' + '=' .repeat(60));
console.log('\n✅ After running the SQL, refresh your browser and test the form!\n');

