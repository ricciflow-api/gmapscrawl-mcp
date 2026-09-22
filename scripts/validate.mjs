import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const server=JSON.parse(readFileSync('server.json','utf8'));
const {tools}=JSON.parse(readFileSync('tools.json','utf8'));
assert.equal(server.remotes[0].url,'https://gmapscrawl.com/api/mcp');
assert.equal(server.remotes[0].type,'streamable-http');
assert.equal(tools.length,8);
assert.equal(new Set(tools.map(t=>t.name)).size,8);
for(const tool of tools){
 if(!tool.annotations.readOnlyHint) assert.ok(tool.inputSchema.required.includes('client_request_id'),tool.name);
 assert.equal(tool.inputSchema.additionalProperties,false);
}
assert.ok(tools.find(t=>t.name==='cancel_scrape_job').annotations.destructiveHint);
console.log('Validated hosted-server metadata and eight tool input contracts.');
