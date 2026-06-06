const Router = require('koa-router');
const { orders, customers, getNextId } = require('../data/mock');

const router = new Router();

router.get('/', async (ctx) => {
  const { status } = ctx.query;
  let result = [...orders];
  if (status) {
    result = result.filter(o => o.status === status);
  }
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  ctx.body = { success: true, data: result };
});

router.get('/:id', async (ctx) => {
  const order = orders.find(o => o.id === parseInt(ctx.params.id));
  if (order) {
    const customer = customers.find(c => c.id === order.customerId);
    ctx.body = { success: true, data: { ...order, customer } };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '订单不存在' };
  }
});

router.post('/', async (ctx) => {
  const body = ctx.request.body;
  const newOrder = {
    id: getNextId(orders),
    customerId: body.customerId,
    customerName: body.customerName,
    productType: body.productType,
    productName: body.productName,
    purpose: body.purpose,
    material: body.material,
    sharpness: body.sharpness,
    quantity: body.quantity || 1,
    status: '待排期',
    createdAt: new Date().toISOString().split('T')[0]
  };
  orders.push(newOrder);
  ctx.body = { success: true, data: newOrder, message: '订单创建成功' };
});

router.put('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '订单不存在' };
    return;
  }
  orders[index] = { ...orders[index], ...ctx.request.body };
  ctx.body = { success: true, data: orders[index], message: '订单更新成功' };
});

router.put('/:id/schedule', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '订单不存在' };
    return;
  }
  const { scheduledDate } = ctx.request.body;
  orders[index].scheduledDate = scheduledDate;
  orders[index].status = '排期中';
  ctx.body = { success: true, data: orders[index], message: '排期成功' };
});

router.put('/:id/start', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '订单不存在' };
    return;
  }
  orders[index].status = '锻造中';
  ctx.body = { success: true, data: orders[index], message: '已开始锻造' };
});

router.put('/:id/complete', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '订单不存在' };
    return;
  }
  const today = new Date().toISOString().split('T')[0];
  orders[index].status = '已完成';
  orders[index].completedAt = today;
  if (orders[index].scheduledDate) {
    const start = new Date(orders[index].scheduledDate);
    const end = new Date(today);
    orders[index].forgeDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }
  ctx.body = { success: true, data: orders[index], message: '订单已完成' };
});

router.delete('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '订单不存在' };
    return;
  }
  orders.splice(index, 1);
  ctx.body = { success: true, message: '订单已删除' };
});

module.exports = router;
