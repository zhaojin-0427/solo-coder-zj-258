import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API 请求错误:', error);
    return Promise.reject(error);
  }
);

export const ordersAPI = {
  list: (status) => api.get('/orders', { params: { status } }),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  schedule: (id, scheduledDate) => api.put(`/orders/${id}/schedule`, { scheduledDate }),
  start: (id) => api.put(`/orders/${id}/start`),
  complete: (id) => api.put(`/orders/${id}/complete`),
  remove: (id) => api.delete(`/orders/${id}`)
};

export const furnaceAPI = {
  list: (orderId) => api.get('/furnace', { params: { orderId } }),
  get: (id) => api.get(`/furnace/${id}`),
  create: (data) => api.post('/furnace', data),
  update: (id, data) => api.put(`/furnace/${id}`, data),
  remove: (id) => api.delete(`/furnace/${id}`)
};

export const materialsAPI = {
  list: (params) => api.get('/materials', { params }),
  summary: () => api.get('/materials/summary'),
  get: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  remove: (id) => api.delete(`/materials/${id}`)
};

export const productsAPI = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  deliver: (id) => api.put(`/products/${id}/deliver`),
  remove: (id) => api.delete(`/products/${id}`)
};

export const statsAPI = {
  overview: () => api.get('/stats/overview'),
  productTypeDistribution: () => api.get('/stats/product-type-distribution'),
  furnaceSuccessRate: () => api.get('/stats/furnace-success-rate'),
  forgeCycleDistribution: () => api.get('/stats/forge-cycle-distribution'),
  returningCustomerRate: () => api.get('/stats/returning-customer-rate'),
  monthlyOrders: () => api.get('/stats/monthly-orders')
};

export const curvesAPI = {
  list: () => api.get('/curves'),
  get: (material) => api.get(`/curves/${material}`)
};

export default api;
