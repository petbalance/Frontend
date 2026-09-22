import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

async function load(path) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, platform: 'node', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
const { filterProducts, excludeProduct, compareNutrients } = await load('src/lib/comparison.ts');
const { costRows } = await load('src/lib/calc.ts');
const { mg } = await load('src/lib/format.ts');
const products = [
  { product_id: 'food', name: '연어 사료', brand: 'Happy', category: '사료', monthly_price_krw: 30000, serving_basis_g: 100 },
  { product_id: 'snack', name: '연어 간식', category: '간식', monthly_price_krw: 9000, serving_basis_g: 10 },
  { product_id: 'unused', name: '다른 사료', category: '사료', monthly_price_krw: 50000, serving_basis_g: 100 },
];
const selections = [
  { product_id: 'food', active: true, daily_amount_g: 100 },
  { product_id: 'snack', active: true, daily_amount_g: 5 },
  { product_id: 'unused', active: false, daily_amount_g: 100 },
];

test('search combines words, brand and category and supports reset', () => {
  assert.deepEqual(filterProducts(products, ' HAPPY  연어 ', '사료').map(p => p.product_id), ['food']);
  assert.deepEqual(filterProducts(products, '연어', '간식').map(p => p.product_id), ['snack']);
  assert.equal(filterProducts(products, 'undefined', '').length, 0);
  assert.equal(filterProducts(products, '', '').length, 3);
});
test('simulation excludes only the chosen product and does not mutate the actual diet', () => {
  const before = JSON.stringify(selections);
  const after = excludeProduct(selections, 'snack');
  assert.deepEqual(after.map(s => s.active), [true, false, false]);
  assert.equal(JSON.stringify(selections), before);
  assert.equal(costRows(products, selections).reduce((n, r) => n + r.monthly_cost, 0), 34500);
  assert.equal(costRows(products, after).reduce((n, r) => n + r.monthly_cost, 0), 30000);
});
test('missing nutrient rows and incomplete labels never become zero deltas', () => {
  const before = [{ nutrient: '칼슘', total_mg: 100, data_complete: true }, { nutrient: '철', total_mg: 7, data_complete: false }];
  const after = [{ nutrient: '칼슘', total_mg: 40, data_complete: true }, { nutrient: '아연', total_mg: 2, data_complete: true }];
  const rows = compareNutrients(before, after);
  assert.equal(rows.find(r => r.nutrient === '칼슘').delta, -60);
  assert.equal(rows.find(r => r.nutrient === '철').delta, null);
  assert.equal(rows.find(r => r.nutrient === '아연').delta, null);
  assert.equal(mg(-60), '-60');
});
test('invalid serving bases and non-finite values do not produce infinite costs', () => {
  assert.deepEqual(costRows([{ ...products[0], serving_basis_g: 0 }], selections), []);
  assert.deepEqual(costRows([{ ...products[0], monthly_price_krw: Infinity }], selections), []);
  assert.deepEqual(costRows(products, [{ ...selections[0], daily_amount_g: NaN }]), []);
});
