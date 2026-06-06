const Router = require('koa-router');
const { orders, furnaceRecords, products, customers } = require('../data/mock');

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

  ctx.body = {
    success: true,
    data: {
      totalOrders,
      completedOrders,
      forgingOrders,
      pendingOrders,
      totalProducts,
      totalFurnaceRecords,
      furnaceSuccessRate
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

module.exports = router;
