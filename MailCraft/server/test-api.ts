async function testCreateOrg() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@acme.com',
        password: 'Owner@123456'
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log('Logged in, got token.');
    
    const createRes = await fetch('http://localhost:5000/api/organizations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        name: 'Test Org'
      })
    });
    
    const createData = await createRes.json();
    console.log('Create org success:', createData);
  } catch (error: any) {
    console.error('Create org failed:', error.message);
  }
}

testCreateOrg();
