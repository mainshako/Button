const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

async function withServer(run) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('legacy payment endpoints can never report payment success', async () => {
  await withServer(async baseUrl => {
    const create = await fetch(`${baseUrl}/create-payment`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ amount: 10, forceSuccess: true, paid: true }),
    });
    assert.equal(create.status, 503);
    const createBody = await create.json();
    assert.equal(createBody.code, 'PAYMENT_PROVIDER_DISABLED');
    assert.equal(createBody.paid, false);

    const verify = await fetch(`${baseUrl}/verify-payment?id=fake-success`);
    assert.equal(verify.status, 503);
    const verifyBody = await verify.json();
    assert.equal(verifyBody.code, 'PAYMENT_PROVIDER_DISABLED');
    assert.equal(verifyBody.valid, false);
    assert.equal(verifyBody.paid, false);
  });
});
