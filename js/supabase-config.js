/**
 * Supabase Configuration
 */
const SUPABASE_URL = 'https://usdsxjzyiqocspqhehhb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZHN4anp5aXFvY3NwcWhlaGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NDEyOTYsImV4cCI6MjA5MzQxNzI5Nn0.vhdnk8xmpaWCf90vG6D3Js6BRfaHJMtfj-O9oUKK7fw';

// CDN의 window.supabase 모듈에서 createClient로 클라이언트 생성
var db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('✅ Supabase 연결 완료');
