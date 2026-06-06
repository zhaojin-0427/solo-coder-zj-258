const Koa = require('koa');
const Router = require('koa-router');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');

const orderRoutes = require('./routes/orders');
const furnaceRoutes = require('./routes/furnace');
const materialRoutes = require('./routes/materials');
const productRoutes = require('./routes/products');
const statsRoutes = require('./routes/stats');
const curveRoutes = require('./routes/curves');

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(koaBody({ multipart: true }));

router.use('/api/orders', orderRoutes.routes(), orderRoutes.allowedMethods());
router.use('/api/furnace', furnaceRoutes.routes(), furnaceRoutes.allowedMethods());
router.use('/api/materials', materialRoutes.routes(), materialRoutes.allowedMethods());
router.use('/api/products', productRoutes.routes(), productRoutes.allowedMethods());
router.use('/api/stats', statsRoutes.routes(), statsRoutes.allowedMethods());
router.use('/api/curves', curveRoutes.routes(), curveRoutes.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 9101;
app.listen(PORT, () => {
  console.log(`铁匠铺后端服务已启动: http://localhost:${PORT}`);
});
