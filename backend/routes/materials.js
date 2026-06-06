const Router = require('koa-router');
const { materialRecords, getNextId } = require('../data/mock');

const router = new Router();

router.get('/', async (ctx) => {
  const { orderId, material } = ctx.query;
  let result = [...materialRecords];
  if (orderId) {
    result = result.filter(r => r.orderId === parseInt(orderId));
  }
  if (material) {
    result = result.filter(r => r.material.includes(material));
  }
  result.sort((a, b) => new Date(b.usedDate) - new Date(a.usedDate));
  ctx.body = { success: true, data: result };
});

router.get('/summary', async (ctx) => {
  const summary = {};
  materialRecords.forEach(r => {
    if (!r.material) return;
    if (!summary[r.material]) {
      summary[r.material] = { material: r.material, totalWeight: 0, totalCost: 0, count: 0 };
    }
    summary[r.material].totalWeight += isNaN(r.weight) ? 0 : Number(r.weight);
    summary[r.material].totalCost += isNaN(r.cost) ? 0 : Number(r.cost);
    summary[r.material].count += 1;
  });
  ctx.body = { success: true, data: Object.values(summary) };
});

router.get('/:id', async (ctx) => {
  const record = materialRecords.find(r => r.id === parseInt(ctx.params.id));
  if (record) {
    ctx.body = { success: true, data: record };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '记录不存在' };
  }
});

router.post('/', async (ctx) => {
  const body = ctx.request.body;
  const newRecord = {
    id: getNextId(materialRecords),
    orderId: body.orderId,
    material: body.material,
    weight: body.weight,
    unit: body.unit || 'kg',
    cost: body.cost,
    usedDate: body.usedDate || new Date().toISOString().split('T')[0],
    supplier: body.supplier
  };
  materialRecords.push(newRecord);
  ctx.body = { success: true, data: newRecord, message: '用料记录创建成功' };
});

router.put('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = materialRecords.findIndex(r => r.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '记录不存在' };
    return;
  }
  materialRecords[index] = { ...materialRecords[index], ...ctx.request.body };
  ctx.body = { success: true, data: materialRecords[index], message: '记录更新成功' };
});

router.delete('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = materialRecords.findIndex(r => r.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '记录不存在' };
    return;
  }
  materialRecords.splice(index, 1);
  ctx.body = { success: true, message: '记录已删除' };
});

module.exports = router;
