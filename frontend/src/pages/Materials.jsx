import React, { useState, useEffect } from 'react';
import { materialsAPI, ordersAPI } from '../api/index.js';

const Materials = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filterMaterial, setFilterMaterial] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    material: '',
    weight: '',
    unit: 'kg',
    cost: '',
    usedDate: new Date().toISOString().split('T')[0],
    supplier: ''
  });

  useEffect(() => {
    loadRecords();
    loadSummary();
    loadOrders();
  }, [filterMaterial]);

  const loadRecords = async () => {
    try {
      const res = await materialsAPI.list({ material: filterMaterial });
      if (res.success) setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await materialsAPI.summary();
      if (res.success) setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.list();
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async () => {
    if (!formData.orderId) {
      alert('请选择关联订单');
      return;
    }
    if (!formData.material.trim()) {
      alert('请填写材料名称');
      return;
    }
    const weight = parseFloat(formData.weight);
    const cost = parseFloat(formData.cost);
    if (isNaN(weight) || weight <= 0) {
      alert('请填写有效的用量');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      alert('请填写有效的成本');
      return;
    }
    try {
      const res = await materialsAPI.create({
        ...formData,
        orderId: parseInt(formData.orderId),
        weight,
        cost
      });
      if (res.success) {
        setShowModal(false);
        loadRecords();
        loadSummary();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确认删除此记录？')) {
      try {
        const res = await materialsAPI.remove(id);
        if (res.success) {
          loadRecords();
          loadSummary();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const totalCost = records.reduce((sum, r) => sum + (isNaN(r.cost) ? 0 : Number(r.cost)), 0);
  const uniqueMaterials = [...new Set(records.map(r => r.material).filter(m => m && m.trim()))];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">⚒️ 用料台账</div>
        <div className="page-subtitle">记录锻造过程中各类材料的使用与消耗</div>
      </div>

      <div className="card">
        <div className="card-title">📊 材料消耗汇总</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {summary.map((s) => (
            <div key={s.material} className="stat-card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '15px', color: '#ffcc66', marginBottom: '8px', fontWeight: 'bold' }}>
                {s.material}
              </div>
              <div style={{ fontSize: '13px', color: '#b8956e', marginBottom: '4px' }}>
                累计用量：{isNaN(s.totalWeight) ? '0.00' : Number(s.totalWeight).toFixed(2)} {s.material === '木炭' ? 'kg' : s.material === '木柄' ? '根' : 'kg'}
              </div>
              <div style={{ fontSize: '13px', color: '#b8956e', marginBottom: '4px' }}>
                使用次数：{s.count} 次
              </div>
              <div style={{ fontSize: '14px', color: '#daa520', fontWeight: 'bold' }}>
                总成本：¥{isNaN(s.totalCost) ? '0.00' : Number(s.totalCost).toFixed(2)}
              </div>
            </div>
          ))}
          <div className="stat-card" style={{ textAlign: 'left', background: 'rgba(218, 165, 32, 0.15)' }}>
            <div style={{ fontSize: '15px', color: '#ffcc66', marginBottom: '8px', fontWeight: 'bold' }}>
              💰 总支出
            </div>
            <div style={{ fontSize: '24px', color: '#ffd700', fontWeight: 'bold' }}>
              ¥{totalCost.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <select
            className="form-select"
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
          >
            <option value="">全部材料</option>
            {uniqueMaterials.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + 新增用料记录
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>记录ID</th>
              <th>关联订单</th>
              <th>材料名称</th>
              <th>用量</th>
              <th>单位</th>
              <th>成本(元)</th>
              <th>使用日期</th>
              <th>供应商</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>订单 #{r.orderId}</td>
                <td>{r.material}</td>
                <td>{isNaN(r.weight) ? r.weight : Number(r.weight).toFixed(2)}</td>
                <td>{r.unit}</td>
                <td style={{ color: '#daa520' }}>¥{isNaN(r.cost) ? '0.00' : Number(r.cost).toFixed(2)}</td>
                <td>{r.usedDate}</td>
                <td>{r.supplier}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(r.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan="9" className="empty-state">暂无用料记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">⚒️ 新增用料记录</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">关联订单</label>
                <select
                  className="form-select"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                >
                  <option value="">请选择订单</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      #{o.id} {o.customerName} - {o.productName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">材料名称</label>
                <input
                  type="text"
                  className="form-input"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  placeholder="如：熟铁、高碳钢、木炭"
                />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">用量</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">单位</label>
                <select
                  className="form-select"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="根">根</option>
                  <option value="个">个</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">成本(元)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">使用日期</label>
                <input
                  type="date"
                  className="form-input"
                  name="usedDate"
                  value={formData.usedDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">供应商</label>
                <input
                  type="text"
                  className="form-input"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  placeholder="供应商名称"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleCreate}>保存记录</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
