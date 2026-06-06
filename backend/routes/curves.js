const Router = require('koa-router');
const { recommendedCurves, furnaceRecords } = require('../data/mock');

const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = { success: true, data: Object.values(recommendedCurves) };
});

router.get('/:material', async (ctx) => {
  const material = ctx.params.material;
  const curve = recommendedCurves[material];
  if (curve) {
    const historyRecords = furnaceRecords.filter(r => r.material === material);
    const avgHammerCount = historyRecords.length > 0
      ? Math.round(historyRecords.reduce((sum, r) => sum + r.hammerCount, 0) / historyRecords.length)
      : null;
    const avgDuration = historyRecords.length > 0
      ? Math.round(historyRecords.reduce((sum, r) => sum + r.duration, 0) / historyRecords.length)
      : null;
    const successRate = historyRecords.length > 0
      ? Math.round(historyRecords.filter(r => r.success).length / historyRecords.length * 100)
      : null;

    ctx.body = {
      success: true,
      data: {
        ...curve,
        historyStats: {
          recordCount: historyRecords.length,
          avgHammerCount,
          avgDuration,
          successRate
        }
      }
    };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '未找到该材质的推荐火候曲线' };
  }
});

module.exports = router;
