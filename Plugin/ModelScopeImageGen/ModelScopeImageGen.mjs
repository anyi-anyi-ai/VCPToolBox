import fs from 'fs/promises';
import path from 'path';

function getEnv(name, fallback = undefined) {
  const v = process.env[name];
  return (v === undefined || v === '') ? fallback : v;
}

function toNumberMaybe(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeFilenamePart(s) {
  return String(s)
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

async function downloadToFile(url, outputDir, baseName) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`download failed: ${res.status} ${res.statusText} ${text}`.trim());
  }
  const arrayBuffer = await res.arrayBuffer();

  const ext = (() => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('png')) return 'png';
    if (ct.includes('webp')) return 'webp';
    if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
    return 'jpg';
  })();

  await fs.mkdir(outputDir, { recursive: true });
  const filename = `${baseName}.${ext}`;
  const filepath = path.join(outputDir, filename);
  await fs.writeFile(filepath, Buffer.from(arrayBuffer));
  return { filepath, filename };
}

async function submitTask({ baseUrl, headers, payload }) {
  const url = `${baseUrl}v1/images/generations`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'X-ModelScope-Async-Mode': 'true' },
    body: JSON.stringify(payload)
  });

  const bodyText = await res.text();
  let body;
  try { body = bodyText ? JSON.parse(bodyText) : {}; } catch { body = { raw: bodyText }; }

  if (!res.ok) {
    throw new Error(`submit failed: ${res.status} ${res.statusText} ${bodyText}`.trim());
  }

  const taskId = body.task_id;
  if (!taskId) throw new Error(`submit response missing task_id: ${bodyText}`);
  return taskId;
}

async function pollTask({ baseUrl, headers, taskId, pollIntervalMs, timeoutMs }) {
  const start = Date.now();
  const url = `${baseUrl}v1/tasks/${taskId}`;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await fetch(url, {
      headers: { ...headers, 'X-ModelScope-Task-Type': 'image_generation' }
    });

    const bodyText = await res.text();
    let body;
    try { body = bodyText ? JSON.parse(bodyText) : {}; } catch { body = { raw: bodyText }; }

    if (!res.ok) {
      throw new Error(`poll failed: ${res.status} ${res.statusText} ${bodyText}`.trim());
    }

    const status = body.task_status;
    if (status === 'SUCCEED') return body;
    if (status === 'FAILED') {
      const reason = body.message || body.error || bodyText;
      throw new Error(`task failed: ${reason}`.trim());
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error(`task timeout after ${Math.round(timeoutMs / 1000)}s, last_status=${status}`);
    }

    await new Promise(r => setTimeout(r, pollIntervalMs));
  }
}

export default async function ModelScopeImageGen(ctx = {}) {
  // VCPToolBox plugin runner usually passes params in ctx.params; keep it defensive.
  const params = ctx.params || ctx || {};

  const apiKey = getEnv('MODELSCOPE_API_KEY');
  if (!apiKey) {
    throw new Error('MODELSCOPE_API_KEY is not set. Copy Plugin/ModelScopeImageGen/config.env.example to config.env and set token.');
  }

  const baseUrl = 'https://api-inference.modelscope.cn/';
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  const prompt = params.prompt;
  if (!prompt || typeof prompt !== 'string') throw new Error('prompt is required');

  const payload = {
    model: params.model || getEnv('MODELSCOPE_DEFAULT_MODEL', 'Qwen/Qwen-Image'),
    prompt
  };

  if (params.negative_prompt) payload.negative_prompt = params.negative_prompt;
  if (params.size || getEnv('MODELSCOPE_DEFAULT_SIZE')) payload.size = params.size || getEnv('MODELSCOPE_DEFAULT_SIZE');
  const steps = toNumberMaybe(params.steps, toNumberMaybe(getEnv('MODELSCOPE_DEFAULT_STEPS'), undefined));
  if (steps !== undefined) payload.steps = steps;
  const seed = toNumberMaybe(params.seed, undefined);
  if (seed !== undefined) payload.seed = seed;
  const guidance = toNumberMaybe(params.guidance, toNumberMaybe(getEnv('MODELSCOPE_DEFAULT_GUIDANCE'), undefined));
  if (guidance !== undefined) payload.guidance = guidance;

  const pollIntervalSec = toNumberMaybe(params.poll_interval_sec, toNumberMaybe(getEnv('MODELSCOPE_POLL_INTERVAL_SEC'), 5));
  const timeoutSec = toNumberMaybe(params.timeout_sec, toNumberMaybe(getEnv('MODELSCOPE_TIMEOUT_SEC'), 120));

  const taskId = await submitTask({ baseUrl, headers, payload });
  const taskResult = await pollTask({
    baseUrl,
    headers,
    taskId,
    pollIntervalMs: Math.max(1, pollIntervalSec) * 1000,
    timeoutMs: Math.max(5, timeoutSec) * 1000
  });

  const outputImages = taskResult.output_images;
  if (!Array.isArray(outputImages) || outputImages.length === 0) {
    throw new Error(`task SUCCEED but output_images missing: ${JSON.stringify(taskResult)}`);
  }

  const outputDirRel = getEnv('MODELSCOPE_OUTPUT_DIR', 'image/modelscope_gen');
  const outputDirAbs = path.resolve(process.cwd(), outputDirRel);

  const baseName = `modelscope_${Date.now()}_${sanitizeFilenamePart(prompt).slice(0, 24) || 'image'}`;
  const { filepath } = await downloadToFile(outputImages[0], outputDirAbs, baseName);

  // Return markdown that most VCP frontends can render.
  const filepathRel = path.relative(process.cwd(), filepath).replace(/\\/g, '/');

  const meta = {
    task_id: taskId,
    model: payload.model,
    size: payload.size,
    steps: payload.steps,
    seed: payload.seed,
    guidance: payload.guidance
  };

  return [
    `已生成图片：`,
    `\n![](${filepathRel})\n`,
    `\n\n\`\`\`json\n${JSON.stringify(meta, null, 2)}\n\`\`\``
  ].join('');
}
