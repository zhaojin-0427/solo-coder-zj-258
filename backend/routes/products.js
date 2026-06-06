const Router = require('koa-router');
const { products, getNextId } = require('../data/mock');

const router = new Router();

router.get('/', async (ctx) => {
  const { orderId, qualityGrade } = ctx.query;
  let result = [...products];
  if (orderId) {
    result = result.filter(p => p.orderId === parseInt(orderId));
  }
  if (qualityGrade) {
    result = result.filter(p => p.qualityGrade === qualityGrade);
  }
  result.sort((a, b) => new Date(b.passedDate) - new Date(a.passedDate));
  ctx.body = { success: true, data: result };
});

router.get('/:id', async (ctx) => {
  const product = products.find(p => p.id === parseInt(ctx.params.id));
  if (product) {
    ctx.body = { success: true, data: product };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '成品不存在' };
  }
});

router.post('/', async (ctx) => {
  const body = ctx.request.body;
  const newProduct = {
    id: getNextId(products),
    orderId: body.orderId,
    productName: body.productName,
    serialNumber: 'BS' + Date.now().toString().slice(-10),
    material: body.material,
    sharpness: body.sharpness,
    weight: body.weight,
    qualityGrade: body.qualityGrade || '甲级',
    inspector: body.inspector || '老铁匠',
    passedDate: body.passedDate || new Date().toISOString().split('T')[0],
    delivered: body.delivered || false,
    deliveredDate: body.delivered ? (body.deliveredDate || new Date().toISOString().split('T')[0]) : null,
    customerSatisfaction: body.customerSatisfaction || null
  };
  products.push(newProduct);
  ctx.body = { success: true, data: newProduct, message: '成品档案创建成功' };
});

router.put('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '成品不存在' };
    return;
  }
  products[index] = { ...products[index], ...ctx.request.body };
  ctx.body = { success: true, data: products[index], message: '成品档案更新成功' };
});

router.put('/:id/deliver', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '成品不存在' };
    return;
  }
  products[index].delivered = true;
  products[index].deliveredDate = new Date().toISOString().split('T')[0];
  ctx.body = { success: true, data: products[index], message: '已标记交付' };
});

router.delete('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '成品不存在' };
    return;
  }
  products.splice(index, 1);
  ctx.body = { success: true, message: '成品档案已删除' };
});

module.exports = router;
