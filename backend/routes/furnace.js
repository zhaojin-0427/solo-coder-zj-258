const Router = require('koa-router');
const { furnaceRecords, getNextId, generateTempCurve } = require('../data/mock');

const router = new Router();

router.get('/', async (ctx) => {
  const { orderId } = ctx.query;
  let result = [...furnaceRecords];
  if (orderId) {
    result = result.filter(r => r.orderId === parseInt(orderId));
  }
  result.sort((a, b) => new Date(b.date) - new Date(a.date));
  ctx.body = { success: true, data: result };
});

router.get('/:id', async (ctx) => {
  const record = furnaceRecords.find(r => r.id === parseInt(ctx.params.id));
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
    id: getNextId(furnaceRecords),
    orderId: body.orderId,
    material: body.material,
    date: body.date || new Date().toISOString().split('T')[0],
    startTime: body.startTime || new Date().toTimeString().slice(0, 5),
    temperatureData: body.temperatureData || generateTempCurve(body.material),
    hammerCount: body.hammerCount || 0,
    quenchTiming: body.quenchTiming || 0,
    success: body.success !== undefined ? body.success : true,
    duration: body.duration || 180
  };
  furnaceRecords.push(newRecord);
  ctx.body = { success: true, data: newRecord, message: '炉温记录创建成功' };
});

router.put('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = furnaceRecords.findIndex(r => r.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '记录不存在' };
    return;
  }
  furnaceRecords[index] = { ...furnaceRecords[index], ...ctx.request.body };
  ctx.body = { success: true, data: furnaceRecords[index], message: '记录更新成功' };
});

router.delete('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = furnaceRecords.findIndex(r => r.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '记录不存在' };
    return;
  }
  furnaceRecords.splice(index, 1);
  ctx.body = { success: true, message: '记录已删除' };
});

module.exports = router;
