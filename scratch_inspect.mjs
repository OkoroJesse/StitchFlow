import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env.local', 'utf8');
const lines = envText.split('\n');
let url = '', key = '';
for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function testTiersDirect() {
  // Let's create a session or try signing in
  const email = `testuser_${Date.now()}@testdomain.com`;
  const password = 'Password123!';
  
  const { data: signData, error: signErr } = await supabase.auth.signUp({
    email, password
  });
  
  console.log('SignUp res user id:', signData?.user?.id, 'error:', signErr);
  
  if (signData?.session) {
    const userClient = createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${signData.session.access_token}` } }
    });
    
    const tiersToTest = ['free', 'basic', 'designer', 'designer_pro', 'studio', 'fashion_studio', 'pro', 'starter'];
    for (const t of tiersToTest) {
      console.log(`Testing tier: "${t}"`);
      const { data, error } = await userClient.from('profiles').insert({
        id: signData.user.id,
        business_name: 'Test Business',
        subscription_tier: t
      }).select();
      if (error) {
        console.log(` -> "${t}" FAILED:`, error.message, error.details, error.hint);
      } else {
        console.log(` -> "${t}" SUCCESS!`);
        await userClient.from('profiles').delete().eq('id', signData.user.id);
      }
    }
  } else {
    console.log('No session from signUp (email confirmation might be required).');
  }
}

testTiersDirect();
