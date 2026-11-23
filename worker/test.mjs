import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './src/index.mjs';

const markdown = '# Matt Namvarpour\n\n[CV in Markdown](/cv/cv.md)\n';

function withFetch(mock, run) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mock;
  return Promise.resolve()
    .then(run)
    .finally(() => {
      globalThis.fetch = originalFetch;
    });
}

test('serves the Markdown mirror for root requests accepting Markdown', async () => {
  await withFetch(async (input) => {
    assert.equal(String(input), 'https://raw.githubusercontent.com/mnamvarpour/mnamvarpour.github.io/master/index.md');
    return new Response(markdown, { status: 200 });
  }, async () => {
    const response = await worker.fetch(new Request('https://mnamvarpour.com/', {
      headers: { Accept: 'text/markdown' },
    }));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /^text\/markdown\s*;/);
    assert.match(response.headers.get('vary') || '', /(?:^|,\s*)accept(?:,|$)/i);
    assert.equal(await response.text(), markdown);
  });
});

test('passes browser requests through to the existing site origin', async () => {
  const body = '<!doctype html><title>Matt</title>';
  await withFetch(async (input) => {
    assert.ok(input instanceof Request);
    assert.equal(input.url, 'https://mnamvarpour.com/');
    return new Response(body, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }, async () => {
    const response = await worker.fetch(new Request('https://mnamvarpour.com/'));
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(await response.text(), body);
  });
});

test('falls back to the existing site for non-root Markdown requests', async () => {
  await withFetch(async (input) => {
    assert.ok(input instanceof Request);
    assert.equal(new URL(input.url).pathname, '/cv/cv.md');
    return new Response('# CV', { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
  }, async () => {
    const response = await worker.fetch(new Request('https://mnamvarpour.com/cv/cv.md', {
      headers: { Accept: 'text/markdown' },
    }));
    assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
    assert.equal(await response.text(), '# CV');
  });
});

test('returns a gateway error when the Markdown mirror is unavailable', async () => {
  await withFetch(async () => new Response('not found', { status: 404 }), async () => {
    const response = await worker.fetch(new Request('https://mnamvarpour.com/', {
      headers: { Accept: 'text/markdown' },
    }));
    assert.equal(response.status, 502);
    assert.match(await response.text(), /Markdown representation unavailable/);
  });
});

test('does not select Markdown when its Accept quality is zero', async () => {
  await withFetch(async (input) => {
    assert.ok(input instanceof Request);
    return new Response('html', { headers: { 'content-type': 'text/html' } });
  }, async () => {
    const response = await worker.fetch(new Request('https://mnamvarpour.com/', {
      headers: { Accept: 'text/markdown;q=0, text/html;q=1' },
    }));
    assert.equal(response.headers.get('content-type'), 'text/html');
    assert.equal(await response.text(), 'html');
  });
});
