import test from 'node:test';
import assert from 'node:assert/strict';
import {changelog,currentVersion,shouldShowUpdate} from '../src/changelog.js';

test('release notes are newest first, uniquely versioned and dated once released',()=>{
  const versions=changelog.map(e=>Number(e.version));
  assert.deepEqual(versions,[...versions].sort((a,b)=>b-a));
  assert.equal(new Set(versions).size,versions.length);
  for(const entry of changelog){
    assert.match(entry.version,/^\d+\.\d{2}$/);
    if(entry.released)assert.match(entry.date,/^\d{4}-\d{2}-\d{2}$/);
    assert.ok(entry.highlights.length&&entry.highlights.every(([title,text])=>title&&text));
  }
  assert.equal(currentVersion(),'1.25');
  assert.equal(shouldShowUpdate(null,false),false,'first visit: no update note');
  assert.equal(shouldShowUpdate('1.01',true),true);
  assert.equal(shouldShowUpdate('1.02',true),true);
  assert.equal(shouldShowUpdate('1.03',true),true);
  assert.equal(shouldShowUpdate('1.04',true),true);
  assert.equal(shouldShowUpdate('1.05',true),true);
  assert.equal(shouldShowUpdate('1.06',true),true);
  assert.equal(shouldShowUpdate('1.07',true),true);
  assert.equal(shouldShowUpdate('1.08',true),true);
  assert.equal(shouldShowUpdate('1.09',true),true);
  assert.equal(shouldShowUpdate('1.10',true),true);
  assert.equal(shouldShowUpdate('1.11',true),true);
  assert.equal(shouldShowUpdate('1.12',true),true);
  assert.equal(shouldShowUpdate('1.13',true),true);
  assert.equal(shouldShowUpdate('1.14',true),true);
  assert.equal(shouldShowUpdate('1.15',true),true);
  assert.equal(shouldShowUpdate('1.16',true),true);
  assert.equal(shouldShowUpdate('1.17',true),true);
  assert.equal(shouldShowUpdate('1.18',true),true);
  assert.equal(shouldShowUpdate('1.19',true),true);
  assert.equal(shouldShowUpdate('1.20',true),true);
  assert.equal(shouldShowUpdate('1.21',true),true);
  assert.equal(shouldShowUpdate('1.22',true),true);
  assert.equal(shouldShowUpdate('1.23',true),true);
  assert.equal(shouldShowUpdate('1.24',true),true);
  assert.equal(shouldShowUpdate('1.25',true),false);
  assert.equal(shouldShowUpdate(null,true),true,'returning from before notes existed');
  assert.equal(shouldShowUpdate('1.25',true,'u1|Mon 10:00','u1|Mon 10:00'),false,'same sign-in: shown already');
  assert.equal(shouldShowUpdate('1.25',true,'u1|Tue 09:00','u1|Mon 10:00'),true,'a new sign-in shows it once more');
  assert.equal(shouldShowUpdate('1.25',false,'u1|Tue 09:00',null),false,'brand-new people get the tour instead');
});
