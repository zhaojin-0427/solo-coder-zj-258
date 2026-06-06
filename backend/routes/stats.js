const Router = require('koa-router');
const { orders, furnaceRecords, products, customers, qualityInspections, reworkRecords } = require('../data/mock');

const router = new Router();

router.get('/overview', async (ctx) => {
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === '已完成').length;
  const forgingOrders = orders.filter(o => o.status === '锻造中').length;
  const pendingOrders = orders.filter(o => o.status === '待排期' || o.status === '排期中').length;
  const totalProducts = products.length;
  const totalFurnaceRecords = furnaceRecords.length;
  const successFurnace = furnaceRecords.filter(r => r.success).length;
  const furnaceSuccessRate = totalFurnaceRecords > 0 ? Math.round(successFurnace / totalFurnaceRecords * 100) : 0;
  const totalInspections = qualityInspections.length;
  const passedInspections = qualityInspections.filter(q => q.isPassed).length;
  const qualityPassRate = totalInspections > 0 ? Math.round(passedInspections / totalInspections * 100) : 0;
  const totalReworks = reworkRecords.length;
  const pendingReworks = reworkRecords.filter(r => r.status === '待返工').length;
  const inProgressReworks = reworkRecords.filter(r => r.status === '返工中').length;

  ctx.body = {
    success: true,
    data: {
      totalOrders,
      completedOrders,
      forgingOrders,
      pendingOrders,
      totalProducts,
      totalFurnaceRecords,
      furnaceSuccessRate,
      totalInspections,
      passedInspections,
      qualityPassRate,
      totalReworks,
      pendingReworks,
      inProgressReworks
    }
  };
});

router.get('/product-type-distribution', async (ctx) => {
  const distribution = {};
  orders.forEach(o => {
    const key = o.productName;
    if (!distribution[key]) {
      distribution[key] = { name: key, value: 0, type: o.productType };
    }
    distribution[key].value += o.quantity;
  });
  ctx.body = { success: true, data: Object.values(distribution) };
});

router.get('/furnace-success-rate', async (ctx) => {
  const byMaterial = {};
  furnaceRecords.forEach(r => {
    if (!byMaterial[r.material]) {
      byMaterial[r.material] = { material: r.material, total: 0, success: 0 };
    }
    byMaterial[r.material].total += 1;
    if (r.success) byMaterial[r.material].success += 1;
  });
  const data = Object.values(byMaterial).map(item => ({
    ...item,
    rate: Math.round(item.success / item.total * 100)
  }));
  ctx.body = { success: true, data };
});

router.get('/forge-cycle-distribution', async (ctx) => {
  const completed = orders.filter(o => o.forgeDays);
  const distribution = [
    { range: '1-2天', count: 0 },
    { range: '3-4天', count: 0 },
    { range: '5-6天', count: 0 },
    { range: '7天以上', count: 0 }
  ];
  completed.forEach(o => {
    if (o.forgeDays <= 2) distribution[0].count++;
    else if (o.forgeDays <= 4) distribution[1].count++;
    else if (o.forgeDays <= 6) distribution[2].count++;
    else distribution[3].count++;
  });
  ctx.body = { success: true, data: distribution };
});

router.get('/returning-customer-rate', async (ctx) => {
  const total = customers.length;
  const returning = customers.filter(c => c.isReturning).length;
  const newCustomers = total - returning;
  ctx.body = {
    success: true,
    data: {
      totalCustomers: total,
      returningCustomers: returning,
      newCustomers,
      returningRate: Math.round(returning / total * 100),
      details: customers.map(c => ({
        name: c.name,
        orderCount: c.orderCount,
        isReturning: c.isReturning
      }))
    }
  };
});

router.get('/monthly-orders', async (ctx) => {
  const monthly = {};
  orders.forEach(o => {
    const month = o.createdAt.substring(0, 7);
    if (!monthly[month]) {
      monthly[month] = { month, count: 0 };
    }
    monthly[month].count += 1;
  });
  const data = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  ctx.body = { success: true, data };
});

router.get('/quality-pass-rate', async (ctx) => {
  const total = qualityInspections.length;
  const passed = qualityInspections.filter(q => q.isPassed).length;
  const failed = total - passed;

  const byMaterial = {};
  qualityInspections.forEach(q => {
    const m = q.material;
    if (!byMaterial[m]) {
      byMaterial[m] = { material: m, total: 0, passed: 0 };
    }
    byMaterial[m].total += 1;
    if (q.isPassed) byMaterial[m].passed += 1;
  });
  const materialRates = Object.values(byMaterial).map(item => ({
    ...item,
    rate: Math.round(item.passed / item.total * 100)
  }));

  ctx.body = {
    success: true,
    data: {
      total,
      passed,
      failed,
      passRate: total > 0 ? Math.round(passed / total * 100) : 0,
      byMaterial: materialRates
    }
  };
});

router.get('/rework-reason-distribution', async (ctx) => {
  const reasonMap = {};
  reworkRecords.forEach(r => {
    const reasons = r.reworkReason.split(/[\/、,，]/).map(s => s.trim()).filter(s => s);
    reasons.forEach(reason => {
      if (!reasonMap[reason]) {
        reasonMap[reason] = { name: reason, value: 0 };
      }
      reasonMap[reason].value += 1;
    });
  });
  const data = Object.values(reasonMap).sort((a, b) => b.value - a.value);
  ctx.body = { success: true, data };
});

router.get('/material-rework-rate', async (ctx) => {
  const materialStats = {};
  products.forEach(p => {
    if (!materialStats[p.material]) {
      materialStats[p.material] = { material: p.material, total: 0, reworked: 0 };
    }
    materialStats[p.material].total += 1;
  });
  const reworkedProductIds = new Set(reworkRecords.map(r => r.productId));
  reworkRecords.forEach(r => {
    if (materialStats[r.material]) {
      if (!materialStats[r.material]._counted) {
        materialStats[r.material]._counted = new Set();
      }
      if (!materialStats[r.material]._counted.has(r.productId)) {
        materialStats[r.material]._counted.add(r.productId);
        materialStats[r.material].reworked += 1;
      }
    }
  });
  const data = Object.values(materialStats).map(item => {
    const { _counted, ...rest } = item;
    return {
      ...rest,
      reworkRate: item.total > 0 ? Math.round(item.reworked / item.total * 100) : 0
    };
  });
  ctx.body = { success: true, data };
});

router.get('/average-rework-count', async (ctx) => {
  const completedReworks = reworkRecords.filter(r => r.status === '已完成');
  const totalReworkCount = completedReworks.reduce((sum, r) => sum + (r.reworkCount || 0), 0);
  const reworkedProductCount = new Set(completedReworks.map(r => r.productId)).size;
  const avg = reworkedProductCount > 0 ? (totalReworkCount / reworkedProductCount).toFixed(2) : 0;

  const byType = {};
  reworkRecords.forEach(r => {
    const type = r.reworkType || '未分类';
    if (!byType[type]) {
      byType[type] = { type, count: 0, totalReworks: 0 };
    }
    byType[type].count += 1;
    byType[type].totalReworks += r.reworkCount || 0;
  });
  const typeData = Object.values(byType).map(item => ({
    ...item,
    avg: item.count > 0 ? (item.totalReworks / item.count).toFixed(2) : 0
  }));

  ctx.body = {
    success: true,
    data: {
      averageReworkCount: parseFloat(avg),
      totalReworkedProducts: reworkedProductCount,
      totalReworkOperations: totalReworkCount,
      byType: typeData
    }
  };
});

module.exports = router;
