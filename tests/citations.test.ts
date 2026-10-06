// Run: npx tsx tests/citations.test.ts
import { validateCitations } from '../src/lib/ai'
import assert from 'node:assert/strict'

const sources = [{ ref: '2:153', text: '…' }, { ref: '103:3', text: '…' }]

let r = validateCitations('Patience is paired with prayer [2:153] and mutual counsel [103:3].', sources)
assert.deepEqual(r.valid, ['2:153', '103:3']); assert.equal(r.invalid.length, 0)

r = validateCitations('Allah is with the patient [2:153] and also [3:200] says…', sources)
assert.deepEqual(r.valid, ['2:153']); assert.deepEqual(r.invalid, ['3:200'])
assert.ok(!r.cleaned.includes('[3:200]'), 'invented citation must be stripped')

r = validateCitations('Patience is a virtue in every religion.', sources)
assert.equal(r.valid.length, 0, 'uncited answer must be rejectable')

r = validateCitations("I don't have enough reliable sources to answer this confidently.", sources)
assert.ok(r.declined)
console.log('citation validation: all 4 cases passed')
