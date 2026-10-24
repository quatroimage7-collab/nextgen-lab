// No network: exercise submission states with a minimal DOM and stubbed transport.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../assets/contact.js'),'utf8');
function setup({enabled=true,formId='abcdefgh',code=200,body={ok:true},fail=false,offline=false,pending=false}={}){
 const ids={},els={};let calls=0,request,resolve,timeout;
 const node=()=>({value:'',textContent:'',dataset:{},attrs:{},disabled:false,hidden:false,handlers:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,v){this.handlers[k]=v},focus(){this.focused=true}});
 for(const id of ['contact-form','contact-fields','contact-submit','contact-status','contact-retry',...['name','email','message','consent'].map(x=>'error-'+x)])ids[id]=node();
 for(const name of ['name','email','message','consent','topic','_gotcha'])els[name]=Object.assign(node(),{name,maxLength:name==='message'?5000:name==='email'?254:100,checked:true,checkValidity(){return name==='consent'?this.checked:name==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value):!!this.value}});
 Object.assign(els.name,{value:'Test'});els.email.value='test@example.invalid';els.message.value='Test inquiry';els.topic.value='その他';
 const form=ids['contact-form'];form.elements={namedItem:n=>els[n]};form.reset=()=>Object.values(els).forEach(e=>{e.value='';e.checked=false});
 const context={window:{LAB_CONTACT_CONFIG:{enabled,formId}},document:{getElementById:n=>ids[n],documentElement:{lang:'ja'}},navigator:{onLine:!offline},MutationObserver:class{observe(){}},AbortController,FormData:class extends Map{constructor(){super(Object.entries(els).filter(([k,v])=>k!=='consent'||v.checked).map(([k,v])=>[k,v.value]))}},setTimeout:fn=>{timeout=fn;return 1},clearTimeout:()=>{},fetch:async(url,options)=>{calls++;request={url,options};if(pending)await new Promise(r=>resolve=r);if(fail)throw Error('network');return {ok:code===200,status:code,json:async()=>body}}};
 vm.runInNewContext(source,context);
 return {ids,els,context,send:()=>form.handlers.submit({preventDefault(){}}),calls:()=>calls,request:()=>request,release:()=>resolve(),timeout:()=>timeout()};
}
test('unconfigured and placeholder never transmit',async()=>{for(const config of [{enabled:false},{formId:''},{formId:'YOUR_FORM_ID'},{formId:'https://evil.example'}]){const x=setup(config);await x.send();assert.equal(x.calls(),0);assert.equal(x.ids['contact-submit'].disabled,true)}});
test('required, blank, email and length validation',async()=>{for(const [key,value] of [['name','   '],['email','bad'],['message',''],['message','x'.repeat(5001)]]){const x=setup();x.els[key].value=value;await x.send();assert.equal(x.calls(),0);assert.equal(x.els[key].attrs['aria-invalid'],'true')}});
test('consent required',async()=>{const x=setup();x.els.consent.checked=false;await x.send();assert.equal(x.calls(),0)});
test('honeypot and invalid category reject',async()=>{for(const key of ['_gotcha','topic']){const x=setup();x.els[key].value='bot';await x.send();assert.equal(x.calls(),0)}});
test('offline does not send',async()=>{const x=setup({offline:true});await x.send();assert.equal(x.calls(),0);assert.match(x.ids['contact-status'].textContent,/接続/)});
test('success posts to exact endpoint and clears data, locks duplicate',async()=>{const x=setup();await x.send();assert.equal(x.request().url,'https://formspree.io/f/abcdefgh');assert.equal(x.request().options.method,'POST');assert.equal(x.request().options.body.get('email'),'test@example.invalid');assert.equal(x.request().options.credentials,'omit');assert.equal(x.ids['contact-status'].textContent,'お問い合わせを送信しました');assert.equal(x.els.message.value,'');await x.send();assert.equal(x.calls(),1)});
test('double click while pending sends once',async()=>{const x=setup({pending:true});const p=x.send();await x.send();assert.equal(x.calls(),1);assert.equal(x.ids['contact-submit'].disabled,true);x.release();await p});
for(const code of [400,413,422,429,401,403,404,405,410,500])test('HTTP '+code+' never claims success and retains input',async()=>{const x=setup({code});await x.send();assert.notEqual(x.ids['contact-status'].textContent,'お問い合わせを送信しました');assert.equal(x.els.message.value,'Test inquiry');assert.equal(x.ids['contact-submit'].disabled,[401,403,404,405,410,500].includes(code))});
test('unconfirmed result locks until explicit acknowledgment',async()=>{for(const options of [{fail:true},{body:{}},{body:null}]){const x=setup(options);await x.send();await x.send();assert.equal(x.calls(),1);assert.equal(x.ids['contact-retry'].hidden,false);x.ids['contact-retry'].handlers.click();assert.equal(x.ids['contact-submit'].disabled,false)}});
test('20-second timeout aborts request signal',async()=>{const x=setup({pending:true,fail:true});const p=x.send();x.timeout();assert.equal(x.request().options.signal.aborted,true);x.release();await p;assert.equal(x.ids['contact-retry'].hidden,false)});
