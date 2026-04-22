// Verify the pushed form by decrypting its form_model with our key + the patched ea fallback logic
import { AES, pad, mode, enc } from 'crypto-ts';
import NodeRSA from 'node-rsa';
import { readFileSync } from 'fs';

function _d(e, type) {
  if (!e) return '';
  let t = e.replace(/\\n/g, '').replace(/[\s\r\n'"]/g, '')
    .replace(/-----BEGIN.*?-----/g, '').replace(/-----END.*?-----/g, '');
  const l = type === 'public' ? '-----BEGIN PUBLIC KEY-----' : '-----BEGIN RSA PRIVATE KEY-----';
  const r = type === 'public' ? '-----END PUBLIC KEY-----'   : '-----END RSA PRIVATE KEY-----';
  const h = t.match(/.{1,64}/g)?.join('\n') || t;
  return `${l}\n${h}\n${r}`;
}
const xd = (e, pemPub) => { try { return new NodeRSA(pemPub).decryptPublic(e, 'utf8'); } catch { return ''; } };

const INITCRAFT_PUB = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCJUKaPfUKzZtBiKOsKYYGCZCFr
EJEOZ+q/iJBak+bXAN9HVvlL/9u+rNy+HlEtWJAffA2MIXkXV8lzAqeMFmjjee/N
FDOtUsg8r6dqxCMULJpEnZ2ou370CL+XDlxn3oKorwM7LPTe2qr1DTvwVvLJx2hl
tjverk8X5A9+IBcvMQIDAQAB
-----END PUBLIC KEY-----`;
const OUR_PUB = readFileSync('/home/user/keys/my_public.pem','utf8');

// Mimic the patched ea function (multi-key fallback)
async function ea(blob) {
  if (!blob) return {};
  const { key: t, iv: l, data: r } = blob;
  const KEYS = [INITCRAFT_PUB, OUR_PUB];
  for (const candidate of KEYS) {
    try {
      const pem = _d(candidate, 'public');
      const aesHex = xd(t, pem);
      if (!aesHex) continue;
      const p = enc.Hex.parse(aesHex), g = enc.Hex.parse(l);
      const txt = AES.decrypt(r, p, { iv: g, mode: mode.CBC, padding: pad.PKCS7 }).toString(enc.Utf8);
      const parsed = JSON.parse(txt);
      if (parsed) {
        const which = candidate === INITCRAFT_PUB ? 'initcraft' : 'ours';
        return { parsed, which };
      }
    } catch (_) {}
  }
  return null;
}

const res = JSON.parse(readFileSync('/tmp/mongo-probe/getform-patient-verify.json','utf8'));
const d = res.data;
console.log('form_name:', d.form_name);
console.log('form_table:', d.form_table);

const fm = await ea(d.form_model);
if (!fm) { console.error('❌ form_model could not be decrypted'); process.exit(1); }
console.log('form_model decrypted with:', fm.which, 'key');
console.log('id:', fm.parsed.id);
console.log('register_id:', fm.parsed.register_id);
console.log('model.formConfig present:', !!fm.parsed.model?.formConfig);
console.log('fields top-level:', fm.parsed.model?.fields?.length);
if (fm.parsed.model?.fields?.[0]) {
  const tab = fm.parsed.model.fields[0];
  console.log('  [0] component:', tab.component, 'tabs:', tab.tabs?.length);
  const pane = tab.tabs?.[0];
  console.log('  pane label:', pane?.options?.label, 'inner fields:', pane?.fields?.length);
  for (const f of (pane?.fields || [])) {
    console.log('    -', f.component, 'name=' + (f.options?.name || '?'), 'label=' + (f.options?.label || ''));
  }
}

const ft = await ea(d.feature_token);
console.log('feature_token decrypted with:', ft?.which || 'FAIL');
if (ft) console.log('  feature:', ft.parsed.feature, 'form_id:', ft.parsed.form_id);
