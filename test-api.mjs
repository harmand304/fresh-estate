import fetch from 'node-fetch';

async function testPersonalized() {
  try {
    console.log('Testing personalized API...');
    
    // First get a token by logging in
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hawkar@example.com',
        password: 'password123'
      })
    });
    
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Login response:', loginRes.status);
    
    if (!cookies) {
      console.log('No cookie received');
      const body = await loginRes.json();
      console.log('Login error:', body);
      return;
    }
    
    // Now test personalized
    const res = await fetch('http://localhost:3001/api/properties/personalized', {
      headers: {
        'Cookie': cookies
      }
    });
    
    console.log('Personalized response status:', res.status);
    const data = await res.json();
    console.log('Personalized response:', JSON.stringify(data, null, 2).slice(0, 500));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPersonalized();
