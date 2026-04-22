import { AES, pad, mode, enc } from 'crypto-ts';
import NodeRSA from 'node-rsa';
import { readFileSync } from 'fs';

function _d(e, type) {
  if (!e) return "";
  let t = e.replace(/\\n/g, "").replace(/[\s\r\n'"]/g, "").replace(/-----BEGIN.*?-----/g, "").replace(/-----END.*?-----/g, "");
  const l = type === "public" ? "-----BEGIN PUBLIC KEY-----" : "-----BEGIN RSA PRIVATE KEY-----";
  const r = type === "public" ? "-----END PUBLIC KEY-----" : "-----END RSA PRIVATE KEY-----";
  const h = t.match(/.{1,64}/g)?.join("\n") || t;
  return `${l}\n${h}\n${r}`;
}
const xd = (e, i) => { try { return new NodeRSA(i).decryptPublic(e, "utf8"); } catch { return ""; } };

const INITCRAFT_PUB = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCJUKaPfUKzZtBiKOsKYYGCZCFr
EJEOZ+q/iJBak+bXAN9HVvlL/9u+rNy+HlEtWJAffA2MIXkXV8lzAqeMFmjjee/N
FDOtUsg8r6dqxCMULJpEnZ2ou370CL+XDlxn3oKorwM7LPTe2qr1DTvwVvLJx2hl
tjverk8X5A9+IBcvMQIDAQAB
-----END PUBLIC KEY-----`;

async function decrypt(e) {
  if (!e) return {};
  const { key: t, iv: l, data: r } = e;
  const s = _d(INITCRAFT_PUB, "public");
  const u = xd(t, s);
  if (!u) return null;
  const p = enc.Hex.parse(u), g = enc.Hex.parse(l);
  const P = AES.decrypt(r, p, { iv: g, mode: mode.CBC, padding: pad.PKCS7 }).toString(enc.Utf8);
  return JSON.parse(P);
}

const d = JSON.parse(readFileSync('/tmp/mongo-probe/getform-patient-latest.json', 'utf8'));
const fm = await decrypt(d.data.form_model);
console.log('=== form_model (decrypted) ===');
console.log(JSON.stringify(fm, null, 2));
console.log('\n=== feature_token (decrypted) ===');
const ft = await decrypt(d.data.feature_token);
console.log(JSON.stringify(ft, null, 2));
