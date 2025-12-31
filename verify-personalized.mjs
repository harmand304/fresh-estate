
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';

async function main() {
  console.log('1. Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hawkar@gmail.com', password: '123456' })
  });
  
  const text = await loginRes.text();
  // Extract token purely from response body for this test
  // (In real app, client uses cookies, but for this simple node script, 
  // we need to see how the server expects auth. 
  // The server uses `req.cookies.token` in `authenticateToken`.
  // Node-fetch doesn't save cookies automatically.
  // We need to parse the set-cookie header.
  
  const cookie = loginRes.headers.get('set-cookie');
  console.log('Login Status:', loginRes.status);
  console.log('Set-Cookie:', cookie);

  if (!cookie) {
    console.error('No cookie received!');
    return;
  }

  console.log('\n2. Fetching Personalized Properties...');
  const personalizedRes = await fetch(`${API_URL}/properties/personalized`, {
    headers: {
      'Cookie': cookie
    }
  });

  const data = await personalizedRes.json();
  console.log('Personalized Response Status:', personalizedRes.status);
  console.log('Structure:', Object.keys(data));
  
  if (data.properties) {
      console.log(`Found ${data.properties.length} properties.`);
      if (data.properties.length > 0) {
          const p = data.properties[0];
          console.log('Sample Property:', {
              id: p.id,
              title: p.title,
              price: p.price,
              purpose: p.purpose,
              type: p.type,
              imageUrl: p.imageUrl ? (p.imageUrl.length > 50 ? p.imageUrl.substring(0,50)+'...' : p.imageUrl) : null
          });
      }
  } else {
      console.log('Full Response:', data);
  }
}

main().catch(console.error);
