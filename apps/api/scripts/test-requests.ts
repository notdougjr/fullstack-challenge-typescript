#!/usr/bin/env ts-node
/**
 * Simple script to test backend requests
 * 
 * Usage: pnpm ts-node scripts/test-requests.ts
 * 
 * Or add to package.json: "test:requests": "ts-node scripts/test-requests.ts"
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
  data?: any;
}

const results: TestResult[] = [];
let authToken: string = '';

async function test(name: string, fn: () => Promise<any>): Promise<void> {
  try {
    const result = await fn();
    results.push({
      name,
      status: 'PASS',
      message: 'OK',
      data: result,
    });
    console.log(`✅ ${name}`);
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';
    results.push({
      name,
      status: 'FAIL',
      message: errorMessage,
      data: error.data,
    });
    console.log(`❌ ${name}: ${errorMessage}`);
  }
}

async function makeRequest(
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {},
): Promise<any> {
  const url = `${BASE_URL}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  // Read body as text first to avoid "Body has already been read" error
  const text = await response.text();
  let data: any;
  
  // Try to parse as JSON, if it fails, return the text
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const error: any = new Error(
      (typeof data === 'object' && data?.message) || data || `HTTP ${response.status}`,
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function runTests() {
  console.log(`\n🧪 Testing requests at ${BASE_URL}\n`);

  // Test 1: Health check
  await test('GET / - Health check', async () => {
    const data = await makeRequest('GET', '/');
    if (data !== 'Hello World!') {
      throw new Error('Unexpected response');
    }
    return data;
  });

  // Test 2: Register
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123456!';

  await test('POST /auth/register - Create user', async () => {
    const data = await makeRequest('POST', '/auth/register', {
      email: testEmail,
      password: testPassword,
      username: 'Test User',
    });
    if (data?.accessToken) {
      authToken = data.accessToken;
      console.log(`   Token obtained: ${authToken.substring(0, 20)}...`);
    } else {
      console.log('   ⚠️  Token not found in response:', data);
    }
    return data;
  });

  // Test 3: Login
  await test('POST /auth/login - Login', async () => {
    const data = await makeRequest('POST', '/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    if (data?.accessToken) {
      authToken = data.accessToken;
      console.log(`   Token obtained: ${authToken.substring(0, 20)}...`);
    } else {
      console.log('   ⚠️  Token not found in response:', data);
    }
    return data;
  });

  // Test 4: Get current user (protected)
  await test('GET /user/me - Current user', async () => {
    if (!authToken) {
      throw new Error('Authentication token not available. Check if register/login worked.');
    }
    return await makeRequest('GET', '/user/me', undefined, {
      Authorization: `Bearer ${authToken}`,
    });
  });

  // Test 5: Get all users (protected)
  await test('GET /user - List users', async () => {
    if (!authToken) {
      throw new Error('Authentication token not available');
    }
    return await makeRequest('GET', '/user', undefined, {
      Authorization: `Bearer ${authToken}`,
    });
  });

  // Test 6: Update user (protected)
  await test('PATCH /user/me - Update user', async () => {
    if (!authToken) {
      throw new Error('Authentication token not available');
    }
    return await makeRequest(
      'PATCH',
      '/user/me',
      {
        username: 'Updated Username',
      },
      {
        Authorization: `Bearer ${authToken}`,
      },
    );
  });

  // Test 7: Invalid login
  await test('POST /auth/login - Invalid login (should fail)', async () => {
    try {
      await makeRequest('POST', '/auth/login', {
        email: testEmail,
        password: 'wrong-password',
      });
      throw new Error('Should have failed');
    } catch (error: any) {
      if (error.status === 401) {
        return { status: 401, message: 'Unauthorized' };
      }
      throw error;
    }
  });

  // Summary
  console.log('\n📊 Test Summary:\n');
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (result.status === 'FAIL') {
      console.log(`   Error: ${result.message}`);
    }
  });

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${results.length}\n`);
}

// Run tests
runTests().catch((error) => {
  console.error('Error running tests:', error);
  process.exit(1);
});

