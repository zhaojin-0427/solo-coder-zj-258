import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api/index.js';

const statusBadge = (status) => {
  switch (status) {
    case '待排期':
      return <span className="badge badge-pending">{status}</span>;
    case '排期中':
      return <span className="badge badge-scheduled">{status}</span>;
    case '锻造中':
      return <span className="badge badge-forging">{status}</span>;
    case '已完成':
      return <span className="badge badge-completed">{status}</span>;
    default:
      return <span className="badge">{status}</span>;
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    productType: '农具',
    productName: '',
    purpose: '',
    material: '熟铁',
    sharpness: 3,
    quantity: 1
  });

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.list(filterStatus);
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateOrder = async () => {
    try {
      const res = await ordersAPI.create(formData);
      if (res.success) {
        setShowModal(false);
        setFormData({
          customerName: '',
          productType: '农具',
          productName: '',
          purpose: '',
          material: '熟铁',
          sharpness: 3,
          quantity: 1
        });
        loadOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSchedule = async (id) => {
    try {
      const res = await ordersAPI.schedule(id, scheduledDate);
      if (res.success) {
        setShowScheduleModal(false);
        setSelectedOrder(null);
        setScheduledDate('');
        loadOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartForging = async (id) => {
    try {
      const res = await ordersAPI.start(id);
      if (res.success) loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('确认完成此订单？')) {
      try {
        const res = await ordersAPI.complete(id);
        if (res.success) loadOrders();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确认删除此订单？')) {
      try {
        const res = await ordersAPI.remove(id);
        if (res.success) loadOrders();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📋 订单排程</div>
        <div className="page-subtitle">管理客户定制订单与锻造排期</div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="待排期">待排期</option>
            <option value="排期中">排期中</option>
            <option value="锻造中">锻造中</option>
            <option value="已完成">已完成</option>
          </select>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + 新建订单
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>订单号</th>
              <th>客户</th>
              <th>类型</th>
              <th>产品</th>
              <th>用途</th>
              <th>材质</th>
              <th>锋利度</th>
              <th>数量</th>
              <th>排期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.productType}</td>
                <td>{order.productName}</td>
                <td>{order.purpose}</td>
                <td>{order.material}</td>
                <td>{'★'.repeat(order.sharpness)}</td>
                <td>{order.quantity}</td>
                <td>{order.scheduledDate || '-'}</td>
                <td>{statusBadge(order.status)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {order.status === '待排期' && (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowScheduleModal(true);
                        }}
                      >
                        排期
                      </button>
                    )}
                    {order.status === '排期中' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleStartForging(order.id)}
                      >
                        开工
                      </button>
                    )}
                    {order.status === '锻造中' && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleComplete(order.id)}
                      >
                        完成
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(order.id)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="11" className="empty-state">
                  暂无订单数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">📝 新建定制订单</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">客户姓名</label>
                <input
                  type="text"
                  className="form-input"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="请输入客户姓名"
                />
              </div>
              <div className="form-group">
                <label className="form-label">产品类型</label>
                <select
                  className="form-select"
                  name="productType"
                  value={formData.productType}
                  onChange={handleInputChange}
                >
                  <option value="农具">农具</option>
                  <option value="刀具">刀具</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">产品名称</label>
                <input
                  type="text"
                  className="form-input"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="如：锄头、菜刀"
                />
              </div>
              <div className="form-group">
                <label className="form-label">数量</label>
                <input
                  type="number"
                  className="form-input"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">用途说明</label>
              <textarea
                className="form-textarea"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                rows="2"
                placeholder="详细描述使用场景与要求"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">材质要求</label>
                <select
                  className="form-select"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                >
                  <option value="熟铁">熟铁</option>
                  <option value="高碳钢">高碳钢</option>
                  <option value="不锈钢">不锈钢</option>
                  <option value="生铁">生铁</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">锋利度需求 ({formData.sharpness}★)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  name="sharpness"
                  value={formData.sharpness}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleCreateOrder}>
                创建订单
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">📅 安排锻造排期</div>
            <p style={{ marginBottom: '15px', color: '#d4a574' }}>
              订单 #{selectedOrder.id} - {selectedOrder.customerName} 的 {selectedOrder.productName}
            </p>
            <div className="form-group">
              <label className="form-label">计划开工日期</label>
              <input
                type="date"
                className="form-input"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowScheduleModal(false)}>
                取消
              </button>
              <button
                className="btn btn-primary"
                disabled={!scheduledDate}
                onClick={() => handleSchedule(selectedOrder.id)}
              >
                确认排期
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
