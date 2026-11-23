const MARKDOWN_SOURCE = 'https://raw.githubusercontent.com/mnamvarpour/mnamvarpour.github.io/master/index.md';
const MARKDOWN_UNAVAILABLE = 'Markdown representation unavailable';

function acceptsMarkdown(acceptHeader = '') {
  return acceptHeader.split(',').some((mediaRange) => {
    const [mediaType, ...parameters] = mediaRange.split(';');
    if (mediaType.trim().toLowerCase() !== 'text/markdown') return false;

    const quality = parameters
      .map((parameter) => parameter.trim().match(/^q\s*=\s*(.+)$/i)?.[1])
      .find((value) => value !== undefined);

    if (quality === undefined) return true;
    const qualityValue = Number(quality);
    return Number.isFinite(qualityValue) && qualityValue > 0 && qualityValue <= 1;
  });
}

function addVaryAccept(headers) {
  const values = (headers.get('Vary') || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (!values.some((value) => value.toLowerCase() === 'accept' || value === '*')) {
    values.push('Accept');
  }
  headers.set('Vary', values.join(', '));
}

async function serveMarkdown() {
  let source;
  try {
    source = await fetch(MARKDOWN_SOURCE);
  } catch {
    return new Response(MARKDOWN_UNAVAILABLE, { status: 502 });
  }

  if (!source.ok) {
    return new Response(MARKDOWN_UNAVAILABLE, { status: 502 });
  }

  const headers = new Headers({
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
    'Vary': 'Accept',
  });
  return new Response(source.body, { status: 200, headers });
}

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const isHomepage = pathname === '/' || pathname === '/index.html';

    if (isHomepage && acceptsMarkdown(request.headers.get('Accept') || '')) {
      return serveMarkdown();
    }

    const originResponse = await fetch(request);
    const headers = new Headers(originResponse.headers);
    addVaryAccept(headers);
    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers,
    });
  },
};
