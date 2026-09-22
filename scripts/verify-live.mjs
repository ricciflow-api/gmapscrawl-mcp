import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const url='https://gmapscrawl.com/api/mcp';
const authenticated=process.argv.includes('--authenticated');
const key=process.env.GMSCRAPER_API_KEY?.trim();
if(authenticated)assert.ok(key,'Configure GMSCRAPER_API_KEY');
const headers={'Accept':'application/json, text/event-stream','Content-Type':'application/json'};
if(authenticated)headers['API-KEY']=key;
async function request(method,params,id){
 return fetch(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),headers,body:JSON.stringify({jsonrpc:'2.0',...(id===undefined?{}:{id}),method,params})});
}
const response=await request('initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'gmapscrawl-mcp-check',version:'1.0.0'}},1);
if(!authenticated){assert.equal(response.status,401,'Missing credentials must be rejected');console.log('Live MCP rejects missing credentials (401). No tools called.');process.exit(0);}
assert.equal(response.status,200,'MCP initialization failed');
const initialized=await response.json();
assert.ok(initialized.result?.protocolVersion,'Missing initialized protocol');
headers['MCP-Protocol-Version']=initialized.result.protocolVersion;
const session=response.headers.get('mcp-session-id');if(session)headers['Mcp-Session-Id']=session;
const notification=await request('notifications/initialized',{});
assert.ok(notification.ok,'Initialization notification failed');
const listed=await request('tools/list',{},2);assert.equal(listed.status,200);
const payload=await listed.json();
const expected=JSON.parse(readFileSync(new URL('../tools.json',import.meta.url),'utf8')).tools.map(t=>t.name).sort();
assert.deepEqual(payload.result.tools.map(t=>t.name).sort(),expected);
console.log('Initialized MCP and verified all eight tool names. No tools called.');
