// Build minimal form_model (1 text-input + 1 button), encrypt with OUR key, PUT via API
import { AES, pad, mode, enc } from 'crypto-ts';
import NodeRSA from 'node-rsa';
import crypto from 'crypto';
import { readFileSync, writeFileSync } from 'fs';

const FORM_ID     = '69e8f4eba2fc1bcd2035d1c5';
const FORM_TABLE  = 'zdata_patient';
const FORM_NAME   = 'ลงทะเบียนผู้ป่วย';
const REGISTER_ID = '69d12697ddccf82937e75dea';
const JWT         = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZThlODI3YTJmYzFiY2QyMDM1ZDFjNCIsInVzZXJuYW1lIjoiY2NjY2NjIiwic2Vzc2lvbmlkIjoiZjVmMTEzN2YtZDhkOS00ZjcxLTgyNTgtY2VjN2ViNjBhYTc2IiwiaWF0IjoxNzc2ODcxNjY5LCJleHAiOjE4NjMyNzE2Njl9.9SiFb4QTUUwKgjHJpvvi5i6BDZRJE0g1kbe1grKzTTQ';
const API_BASE    = 'https://bkkcs-his-api.systemx-th.com';

// ---------- Build form_model ----------
const model = {
  fields: [
    {
      key: 10001,
      name: 'Tab',
      component: 'tab',
      category: 'container',
      icon: 'tab',
      fieldType: 'None',
      fieldLength: null,
      children: false,
      enable: true,
      tabs: [
        {
          key: 20001,
          name: 'Tab Pane',
          component: 'tab-pane',
          category: 'container',
          icon: 'tab-pane',
          fieldType: 'None',
          fieldLength: null,
          children: true,
          enable: true,
          fields: [
            {
              key: 30001,
              name: 'Text Input',
              component: 'text-input',
              category: 'basic_input',
              icon: 'text-input',
              fieldType: 'String',
              fieldLength: null,
              children: false,
              enable: true,
              formItemFlag: true,
              options: {
                name: 'patient_name',
                label: 'ชื่อผู้ป่วย',
                labelAlign: '',
                type: 'text',
                defaultValue: null,
                placeholder: '',
                columnSpan: 4,
                size: '',
                labelWidth: null,
                labelHidden: false,
                readonly: false,
                disabled: false,
                hidden: false,
                clearable: true,
                showPassword: false,
                required: false,
                requiredHint: '',
                validation: '',
                validationHint: '',
                customClass: '',
                labelIconClass: null,
                labelIconPosition: 'rear',
                labelTooltip: null,
                labelColor: null,
                minLength: null,
                maxLength: null,
                showWordLimit: false,
                prefixIcon: '',
                suffixIcon: '',
                prefixText: '',
                suffixText: '',
                appendButton: false,
                appendButtonDisabled: false,
                buttonIcon: 'el-search',
                onCreated: '',
                onMounted: '',
                onInput: '',
                onChange: '',
                onFocus: '',
                onBlur: '',
                onValidate: '',
                onAppendButtonClick: ''
              },
              id: 'text-input30001'
            },
            {
              key: 30002,
              name: 'Button',
              component: 'button-ui',
              category: 'display_ui',
              icon: 'button-ui',
              fieldType: 'None',
              fieldLength: null,
              children: false,
              enable: true,
              formItemFlag: false,
              options: {
                name: 'btn30002',
                hidden: false,
                disabled: false,
                textAlign: 'left',
                marginBottom: 0,
                buttonGroup: true,
                buttons: [
                  {
                    label: 'บันทึก',
                    type: 'primary',
                    plain: false,
                    circle: false,
                    round: false,
                    disabled: false,
                    loading: false,
                    confirm: false,
                    confirmTitle: '',
                    prefixIcon: '',
                    suffixIcon: '',
                    color: '',
                    onClick: ''
                  }
                ],
                customClass: '',
                onCreated: '',
                onMounted: ''
              },
              id: 'button-ui30002'
            }
          ],
          options: {
            name: 'tab1',
            label: 'ข้อมูลผู้ป่วย',
            hidden: false,
            active: true,
            disabled: false,
            customClass: ''
          },
          id: 'tab-pane-20001'
        }
      ],
      options: {
        name: 'tab10001',
        hidden: false,
        displayType: 'border-card',
        tabPosition: 'top',
        customClass: ''
      },
      id: 'tab10001'
    }
  ],
  formConfig: {
    modelName: 'formData',
    refName: 'sdForm',
    rulesName: 'rules',
    labelWidth: 120,
    labelPosition: 'top',
    size: '',
    labelAlign: 'label-right-align',
    cssCode: '',
    customClass: '',
    functions: '',
    layoutType: 'PC',
    jsonVersion: 3,
    onFormCreated: '',
    onFormMounted: '',
    onParentChange: '',
    onFormDataChange: '',
    onFormUnmounted: ''
  }
};

const formModelPlain = { id: FORM_ID, register_id: REGISTER_ID, model };

// ---------- Encrypt with our private key (RSA-sign + AES-256-CBC) ----------
const ourPriv = readFileSync('/home/user/keys/my_private.pem', 'utf8');
const ourRsa  = new NodeRSA(ourPriv);

function encryptBlob(plainObj) {
  const aesKey = crypto.randomBytes(32);
  const iv     = crypto.randomBytes(16);
  const aesKeyHex = aesKey.toString('hex');
  const ivHex     = iv.toString('hex');
  const plaintext = JSON.stringify(plainObj);
  const data = AES.encrypt(
    plaintext,
    enc.Hex.parse(aesKeyHex),
    { iv: enc.Hex.parse(ivHex), mode: mode.CBC, padding: pad.PKCS7 }
  ).toString();
  const key = ourRsa.encryptPrivate(aesKeyHex, 'base64');
  return { key, iv: ivHex, data };
}

const form_model_enc = encryptBlob(formModelPlain);

// ---------- Self-decrypt test (use patched ea logic) ----------
function _d(e, type) {
  if (!e) return '';
  let t = e.replace(/\\n/g, '').replace(/[\s\r\n'"]/g, '')
    .replace(/-----BEGIN.*?-----/g, '').replace(/-----END.*?-----/g, '');
  const l = type === 'public' ? '-----BEGIN PUBLIC KEY-----' : '-----BEGIN RSA PRIVATE KEY-----';
  const r = type === 'public' ? '-----END PUBLIC KEY-----'   : '-----END RSA PRIVATE KEY-----';
  const h = t.match(/.{1,64}/g)?.join('\n') || t;
  return `${l}\n${h}\n${r}`;
}
const ourPub = readFileSync('/home/user/keys/my_public.pem', 'utf8');
try {
  const pubPem = _d(ourPub, 'public');
  const aesHex = new NodeRSA(pubPem).decryptPublic(form_model_enc.key, 'utf8');
  const p = enc.Hex.parse(aesHex), g = enc.Hex.parse(form_model_enc.iv);
  const txt = AES.decrypt(form_model_enc.data, p, { iv: g, mode: mode.CBC, padding: pad.PKCS7 }).toString(enc.Utf8);
  const parsed = JSON.parse(txt);
  if (parsed.id !== FORM_ID) throw new Error('id mismatch');
  if (!parsed.model.fields || parsed.model.fields.length !== 1) throw new Error('fields broken');
  console.log('✅ self-decrypt OK, formId=' + parsed.id);
} catch (e) {
  console.error('❌ self-decrypt failed:', e.message);
  process.exit(1);
}

// ---------- Get current feature_token (preserve as-is) ----------
const current = JSON.parse(readFileSync('/tmp/mongo-probe/getform-patient-latest.json', 'utf8')).data;
const feature_token = current.feature_token;
const version_count = current.version_count || 0;

// ---------- Save payload for inspection ----------
const payload = {
  form_id: FORM_ID,
  form_table: FORM_TABLE,
  form_name: FORM_NAME,
  form_model: form_model_enc,
  feature_token,
  form_approve: true,
  version_count
};
writeFileSync('/tmp/mongo-probe/patient-v1-payload.json', JSON.stringify(payload, null, 2));
console.log('payload saved to /tmp/mongo-probe/patient-v1-payload.json');
console.log('form_model sizes:',
  'key=' + form_model_enc.key.length,
  'iv=' + form_model_enc.iv.length,
  'data=' + form_model_enc.data.length);

// ---------- PUT to API ----------
console.log('PUTting to ' + API_BASE + '/api/build/sdform/create-form ...');
const res = await fetch(API_BASE + '/api/build/sdform/create-form', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + JWT
  },
  body: JSON.stringify(payload)
});
const text = await res.text();
console.log('HTTP', res.status, res.statusText);
console.log('Response:', text);
writeFileSync('/tmp/mongo-probe/patient-v1-response.json', text);
