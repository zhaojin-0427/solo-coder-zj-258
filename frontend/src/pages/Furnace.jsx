import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { furnaceAPI, curvesAPI, ordersAPI } from '../api/index.js';

const Furnace = () => {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [curves, setCurves] = useState([]);
  const [selectedCurve, setSelectedCurve] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    material: '熟铁',
    hammerCount: 0,
    quenchTiming: 0,
    duration: 180,
    success: true
  });

  useEffect(() => {
    loadRecords();
    loadCurves();
    loadOrders();
  }, []);

  const loadRecords = async () => {
    try {
      const res = await furnaceAPI.list();
      if (res.success) {
        setRecords(res.data);
        if (res.data.length > 0) {
          setSelectedRecord(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadCurves = async () => {
    try {
      const res = await curvesAPI.list();
      if (res.success) setCurves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.list();
      if (res.success) setOrders(res.data.filter(o => o.status === '锻造中' || o.status === '排期中'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCreateRecord = async () => {
    try {
      const res = await furnaceAPI.create(formData);
      if (res.success) {
        setShowModal(false);
        loadRecords();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm('确认删除此炉温记录？')) {
      try {
        const res = await furnaceAPI.remove(id);
        if (res.success) loadRecords();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getChartData = () => {
    if (!selectedRecord) return [];
    const actual = selectedRecord.temperatureData.map(p => ({
      time: p.time,
      实际温度: p.temp
    }));

    if (selectedCurve && selectedCurve.material === selectedRecord.material) {
      return actual.map((p, idx) => {
        const rec = selectedCurve.tempCurve[idx];
        return {
          ...p,
          推荐温度: rec ? rec.temp : null
        };
      });
    }
    return actual;
  };

  const chartData = getChartData();

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🔥 炉温记录</div>
        <div className="page-subtitle">记录每次升炉的温度变化、捶打次数与淬火时机</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div className="card-title" style={{ marginBottom: 0, border: 'none', padding: 0 }}>
              📈 炉温变化曲线
            </div>
            <select
              className="form-select"
              style={{ width: '180px' }}
              value={selectedCurve ? selectedCurve.material : ''}
              onChange={(e) => {
                const material = e.target.value;
                setSelectedCurve(material ? curves.find(c => c.material === material) : null);
              }}
            >
              <option value="">隐藏推荐曲线</option>
              {curves.map(c => (
                <option key={c.material} value={c.material}>{c.material}推荐曲线</option>
              ))}
            </select>
          </div>
          {selectedRecord ? (
            <>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#5c3317" />
                  <XAxis
                    dataKey="time"
                    stroke="#b8956e"
                    label={{ value: '时间 (分钟)', position: 'insideBottom', offset: -5, fill: '#b8956e' }}
                  />
                  <YAxis
                    stroke="#b8956e"
                    label={{ value: '温度 (°C)', angle: -90, position: 'insideLeft', fill: '#b8956e' }}
                    domain={[0, 1200]}
                  />
                  <Tooltip
                    contentStyle={{ background: '#2c1810', border: '1px solid #8b4513', color: '#f5e6d3' }}
                  />
                  <Legend wrapperStyle={{ color: '#d4a574' }} />
                  {selectedRecord.quenchTiming > 0 && (
                    <ReferenceLine
                      x={selectedRecord.quenchTiming}
                      stroke="#ff6600"
                      strokeDasharray="5 5"
                      label={{ value: '淬火', fill: '#ff6600', position: 'top' }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="实际温度"
                    stroke="#ff6600"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  {selectedCurve && (
                    <Line
                      type="monotone"
                      dataKey="推荐温度"
                      stroke="#32cd32"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>

              <div className="temp-curve-info">
                <div className="info-item">
                  <div className="info-item-label">捶打次数</div>
                  <div className="info-item-value">{selectedRecord.hammerCount} 次</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">淬火时机</div>
                  <div className="info-item-value">{selectedRecord.quenchTiming} 分钟</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">锻造时长</div>
                  <div className="info-item-value">{selectedRecord.duration} 分钟</div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">选择一条记录查看炉温曲线</div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title" style={{ marginBottom: 0, border: 'none', padding: 0 }}>
              🧱 推荐火候曲线
            </div>
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={curves.length > 0 ? (selectedCurve ? selectedCurve.material : curves[0].material) : ''}
              onChange={(e) => {
                setSelectedCurve(curves.find(c => c.material === e.target.value) || null);
              }}
            >
              {curves.map(c => (
                <option key={c.material} value={c.material}>{c.material}</option>
              ))}
            </select>
          </div>
          {selectedCurve && (
            <div style={{ marginTop: '15px' }}>
              <div className="temp-curve-info">
                <div className="info-item">
                  <div className="info-item-label">最高温度</div>
                  <div className="info-item-value">{selectedCurve.maxTemp}°C</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">升温速率</div>
                  <div className="info-item-value">{selectedCurve.heatRate}</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">保温时间</div>
                  <div className="info-item-value">{selectedCurve.holdTime}</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">淬火温度</div>
                  <div className="info-item-value">{selectedCurve.quenchTemp}°C</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">淬火介质</div>
                  <div className="info-item-value">{selectedCurve.quenchMedium}</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">捶打次数</div>
                  <div className="info-item-value">{selectedCurve.hammerCount}</div>
                </div>
              </div>
              <div className="notes-box">
                💡 {selectedCurve.notes}
              </div>
              {selectedCurve.historyStats && (
                <div style={{ marginTop: '15px', fontSize: '13px', color: '#b8956e' }}>
                  历史数据：共 {selectedCurve.historyStats.recordCount} 次记录，
                  平均捶打 {selectedCurve.historyStats.avgHammerCount || '-'} 次，
                  平均时长 {selectedCurve.historyStats.avgDuration || '-'} 分钟，
                  成功率 {selectedCurve.historyStats.successRate || 0}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="actions-bar">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + 新增炉温记录
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>记录ID</th>
              <th>关联订单</th>
              <th>材质</th>
              <th>日期</th>
              <th>开始时间</th>
              <th>捶打次数</th>
              <th>淬火时机</th>
              <th>时长(分钟)</th>
              <th>结果</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr
                key={r.id}
                onClick={() => setSelectedRecord(r)}
                style={{
                  cursor: 'pointer',
                  background: selectedRecord?.id === r.id ? 'rgba(218, 165, 32, 0.15)' : ''
                }}
              >
                <td>#{r.id}</td>
                <td>订单 #{r.orderId}</td>
                <td>{r.material}</td>
                <td>{r.date}</td>
                <td>{r.startTime}</td>
                <td>{r.hammerCount}</td>
                <td>{r.quenchTiming} 分钟</td>
                <td>{r.duration}</td>
                <td>
                  {r.success ? (
                    <span className="badge badge-success">成功</span>
                  ) : (
                    <span className="badge badge-fail">失败</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRecord(r.id);
                    }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan="10" className="empty-state">暂无炉温记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">🔥 新增炉温记录</div>
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
                <label className="form-label">锻造材质</label>
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
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">捶打次数</label>
                <input
                  type="number"
                  className="form-input"
                  name="hammerCount"
                  value={formData.hammerCount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">淬火时机(分钟)</label>
                <input
                  type="number"
                  className="form-input"
                  name="quenchTiming"
                  value={formData.quenchTiming}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">锻造时长(分钟)</label>
                <input
                  type="number"
                  className="form-input"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="success"
                  checked={formData.success}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ color: '#d4a574' }}>锻造成功</span>
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleCreateRecord}>保存记录</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Furnace;
