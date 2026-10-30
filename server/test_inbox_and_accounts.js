import http from 'http';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing /api/accounts ---');
  const accountsRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/accounts',
    method: 'GET'
  });
  console.log('Accounts Status:', accountsRes.status, 'Total accounts:', accountsRes.data.length);

  console.log('\n--- Testing /api/inbox/conversations ---');
  const convRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/inbox/conversations',
    method: 'GET'
  });
  console.log('Conversations Status:', convRes.status, 'Total threads:', convRes.data.length);
  const testConv = convRes.data[0];

  console.log('\n--- Testing /api/inbox/simulate-incoming (Autonomous Mode) ---');
  const simResAuto = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/inbox/simulate-incoming',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    conversationId: testConv.id,
    content: 'We are very keen to discuss your Dublin corporate tax advisory services. Can we arrange an introductory call this Friday?',
    auto_respond: true
  });
  console.log('Sim Auto Status:', simResAuto.status);
  console.log('Auto Responded:', simResAuto.data.auto_responded);
  console.log('Auto Qualified:', simResAuto.data.auto_qualified);

  console.log('\n--- Testing /api/qualified-leads ---');
  const qualRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/qualified-leads',
    method: 'GET'
  });
  console.log('Qualified Leads Status:', qualRes.status, 'Total qualified:', qualRes.data?.length);
  if (qualRes.data && qualRes.data[0]) {
    console.log('Has recent messages:', Boolean(qualRes.data[0].recent_messages));
    console.log('Message count in qualified lead:', qualRes.data[0].recent_messages?.length);
  }

  console.log('\n--- Testing /api/inbox/conversations/:id/re-assess ---');
  const reassessRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/inbox/conversations/${testConv.id}/re-assess`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  console.log('Re-assess Status:', reassessRes.status, 'Success/Result:', reassessRes.data.success ? 'Success' : reassessRes.data.error);

  console.log('\nALL TESTS EXECUTED SUCCESSFULLY!');
}

runTests().catch(console.error);
