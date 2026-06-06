const Router = require('koa-router');
const { qualityInspections, reworkRecords, products, orders, furnaceRecords, getNextId } = require('../data/mock');

const router = new Router();

router.get('/inspections', async (ctx) => {
  const { productId, orderId, isPassed } = ctx.query;
  let result = [...qualityInspections];
  if (productId) {
    result = result.filter(q => q.productId === parseInt(productId));
  }
  if (orderId) {
    result = result.filter(q => q.orderId === parseInt(orderId));
  }
  if (isPassed !== undefined && isPassed !== '') {
    result = result.filter(q => q.isPassed === (isPassed === 'true'));
  }
  result.sort((a, b) => new Date(b.inspectionDate) - new Date(a.inspectionDate));
  ctx.body = { success: true, data: result };
});

router.get('/inspections/:id', async (ctx) => {
  const inspection = qualityInspections.find(q => q.id === parseInt(ctx.params.id));
  if (inspection) {
    ctx.body = { success: true, data: inspection };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '质检记录不存在' };
  }
});

router.post('/inspections', async (ctx) => {
  const body = ctx.request.body;
  const product = products.find(p => p.id === body.productId);
  const order = product ? orders.find(o => o.id === product.orderId) : null;
  const furnaceRecord = furnaceRecords.find(f => f.orderId === (body.orderId || (product ? product.orderId : null)));

  const newInspection = {
    id: getNextId(qualityInspections),
    productId: body.productId,
    orderId: body.orderId || (product ? product.orderId : null),
    furnaceRecordId: body.furnaceRecordId || (furnaceRecord ? furnaceRecord.id : null),
    productName: body.productName || (product ? product.productName : ''),
    serialNumber: body.serialNumber || (product ? product.serialNumber : ''),
    material: body.material || (product ? product.material : ''),
    appearanceScore: parseInt(body.appearanceScore) || 0,
    sharpnessMeasured: parseInt(body.sharpnessMeasured) || 0,
    hardnessMin: parseInt(body.hardnessMin) || 0,
    hardnessMax: parseInt(body.hardnessMax) || 0,
    isPassed: body.isPassed === true || body.isPassed === 'true',
    defectDescription: body.defectDescription || '',
    reworkSuggestion: body.reworkSuggestion || '',
    inspector: body.inspector || '老铁匠',
    inspectionDate: body.inspectionDate || new Date().toISOString().split('T')[0],
    remarks: body.remarks || ''
  };
  qualityInspections.push(newInspection);

  if (product) {
    if (newInspection.isPassed) {
      product.qualityGrade = newInspection.appearanceScore >= 9 ? '甲级' : (newInspection.appearanceScore >= 7 ? '乙级' : '丙级');
    } else {
      product.qualityGrade = '丙级';
    }
    product.inspector = newInspection.inspector;
    product.passedDate = newInspection.inspectionDate;
    product.sharpness = newInspection.sharpnessMeasured;
  }

  ctx.body = { success: true, data: newInspection, message: '质检记录创建成功' };
});

router.put('/inspections/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = qualityInspections.findIndex(q => q.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '质检记录不存在' };
    return;
  }
  qualityInspections[index] = { ...qualityInspections[index], ...ctx.request.body };
  ctx.body = { success: true, data: qualityInspections[index], message: '质检记录更新成功' };
});

router.delete('/inspections/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = qualityInspections.findIndex(q => q.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '质检记录不存在' };
    return;
  }
  qualityInspections.splice(index, 1);
  ctx.body = { success: true, message: '质检记录已删除' };
});

router.get('/reworks', async (ctx) => {
  const { productId, orderId, status } = ctx.query;
  let result = [...reworkRecords];
  if (productId) {
    result = result.filter(r => r.productId === parseInt(productId));
  }
  if (orderId) {
    result = result.filter(r => r.orderId === parseInt(orderId));
  }
  if (status) {
    result = result.filter(r => r.status === status);
  }
  result.sort((a, b) => {
    const dateA = a.startedDate || '9999-12-31';
    const dateB = b.startedDate || '9999-12-31';
    return new Date(dateB) - new Date(dateA);
  });
  ctx.body = { success: true, data: result };
});

router.get('/reworks/:id', async (ctx) => {
  const rework = reworkRecords.find(r => r.id === parseInt(ctx.params.id));
  if (rework) {
    ctx.body = { success: true, data: rework };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '返工记录不存在' };
  }
});

router.post('/reworks', async (ctx) => {
  const body = ctx.request.body;
  if (!body.productId) {
    ctx.status = 400;
    ctx.body = { success: false, message: '请选择需要返工的产品' };
    return;
  }
  if (!body.reworkReason || !body.reworkReason.toString().trim()) {
    ctx.status = 400;
    ctx.body = { success: false, message: '请填写返工原因' };
    return;
  }
  const product = products.find(p => p.id === body.productId);
  const inspection = body.qualityInspectionId ? qualityInspections.find(q => q.id === body.qualityInspectionId) : null;

  const newRework = {
    id: getNextId(reworkRecords),
    productId: body.productId,
    orderId: body.orderId || (product ? product.orderId : null),
    furnaceRecordId: body.furnaceRecordId || null,
    productName: body.productName || (product ? product.productName : ''),
    serialNumber: body.serialNumber || (product ? product.serialNumber : ''),
    material: body.material || (product ? product.material : ''),
    qualityInspectionId: body.qualityInspectionId || null,
    reworkReason: body.reworkReason || (inspection ? inspection.defectDescription : ''),
    reworkSuggestion: body.reworkSuggestion || (inspection ? inspection.reworkSuggestion : ''),
    status: body.status || '待返工',
    reworkType: body.reworkType || '',
    startedDate: body.status === '返工中' ? (body.startedDate || new Date().toISOString().split('T')[0]) : null,
    completedDate: body.status === '已完成' ? (body.completedDate || new Date().toISOString().split('T')[0]) : null,
    reworkCount: parseInt(body.reworkCount) || 0,
    operator: body.operator || '',
    cost: parseFloat(body.cost) || 0,
    notes: body.notes || ''
  };
  reworkRecords.push(newRework);
  ctx.body = { success: true, data: newRework, message: '返工记录创建成功' };
});

router.put('/reworks/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = reworkRecords.findIndex(r => r.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '返工记录不存在' };
    return;
  }
  const updateData = { ...ctx.request.body };
  const oldStatus = reworkRecords[index].status;
  const newStatus = updateData.status;

  if (newStatus === '返工中' && oldStatus !== '返工中' && !reworkRecords[index].startedDate) {
    updateData.startedDate = new Date().toISOString().split('T')[0];
    updateData.reworkCount = (reworkRecords[index].reworkCount || 0) + 1;
  }
  if (newStatus === '已完成' && oldStatus !== '已完成') {
    if (!reworkRecords[index].completedDate) {
      updateData.completedDate = new Date().toISOString().split('T')[0];
    }
    if (!reworkRecords[index].startedDate && !updateData.startedDate) {
      updateData.startedDate = reworkRecords[index].startedDate || new Date().toISOString().split('T')[0];
    }
    if ((reworkRecords[index].reworkCount || 0) === 0 && !updateData.reworkCount) {
      updateData.reworkCount = 1;
    }
  }
  reworkRecords[index] = { ...reworkRecords[index], ...updateData };
  ctx.body = { success: true, data: reworkRecords[index], message: '返工记录更新成功' };
});

router.put('/reworks/:id/start', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = reworkRecords.findIndex(r => r.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '返工记录不存在' };
    return;
  }
  reworkRecords[index].status = '返工中';
  reworkRecords[index].startedDate = new Date().toISOString().split('T')[0];
  reworkRecords[index].reworkCount = (reworkRecords[index].reworkCount || 0) + 1;
  reworkRecords[index].operator = ctx.request.body.operator || reworkRecords[index].operator || '老铁匠';
  ctx.body = { success: true, data: reworkRecords[index], message: '已开始返工' };
});

router.put('/reworks/:id/complete', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = reworkRecords.findIndex(r => r.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '返工记录不存在' };
    return;
  }
  reworkRecords[index].status = '已完成';
  reworkRecords[index].completedDate = new Date().toISOString().split('T')[0];
  reworkRecords[index].notes = ctx.request.body.notes || reworkRecords[index].notes;
  ctx.body = { success: true, data: reworkRecords[index], message: '返工已完成' };
});

router.delete('/reworks/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = reworkRecords.findIndex(r => r.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '返工记录不存在' };
    return;
  }
  reworkRecords.splice(index, 1);
  ctx.body = { success: true, message: '返工记录已删除' };
});

module.exports = router;
