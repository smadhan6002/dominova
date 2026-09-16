// Use the Supabase JS library from CDN
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://ztcaqmisfvcamlvvtaoj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y2FxbWlzZnZjYW1sdnZ0YW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1Njg3ODIsImV4cCI6MjEwNTE0NDc4Mn0.-9cCx86ez9bDpBxARWcLVhP0r6Wzk4mbe_JPwfsSAtE'; 

// Initialize the Supabase client
window.supabaseClient = null;
try {
  if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.warn('Supabase is not initialized. Using local storage for mock authentication.');
  }
} catch (e) {
  console.error('Supabase initialization failed. Check your URL and Key.', e);
}
// Helper function to check auth session
async function requireAuth() {
  if (!window.supabaseClient) return null;
  const { data: { session }, error } = await window.supabaseClient.auth.getSession();
  if (error || !session) {
    window.location.href = 'admin-login.html';
  }
  return session;
}

// Helper to logout
async function logout() {
  if (window.supabaseClient) {
    await window.supabaseClient.auth.signOut();
  }
  window.location.href = 'admin-login.html';
}
