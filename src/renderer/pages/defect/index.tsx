import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Tag, Modal, Form, message, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ToolOutlined, CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';
import type { Defect, DefectLevel, DefectStatus, Equipment, Schedule, Inspector } from '@/types';
import { defectApi, equipmentApi, scheduleApi, inspectorApi } from '@/utils/api';
import dayjs from 'dayjs';

const levelMap: Record<DefectLevel, { color: string; text: string }> = {
  minor: { color: 'blue', text: '轻微' },
  general: { color: 'gold', text: '一般' },
  major: { color: 'orange', text: '严重' },
  critical: { color: 'red', text: '重大' },
};

const statusMap: Record<DefectStatus, { color: string; text: string }> = {
  pending: { color: 'orange', text: '待处理' },
  processing: { color: 'processing', text: '处理中' },
  repaired: { color: 'blue', text: '已修复' },
  rechecking: { color: 'cyan', text: '复查中' },
  closed: { color: 'green', text: '已关闭' },
};

const DefectPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Defect[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [repairVisible, setRepairVisible] = useState(false);
  const [verifyVisible, setVerifyVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Defect | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [scheduleList, setScheduleList] = useState<Schedule[]>([]);
  const [inspectorList, setInspectorList] = useState<Inspector[]>([]);
  const [form] = Form.useForm();
  const [repairForm] = Form.useForm();
  const [verifyForm] = Form.useForm();

  const getEquipmentName = (id: number) => {
    const eq = equipmentList.find(e => e.id === id);
    return eq ? eq.equipmentName : '-';
  };

  const getInspectorName = (id: number) => {
    const ins = inspectorList.find(i => i.id === id);
    return ins ? ins.name : '-';
  };

  const columns: ColumnsType<Defect> = [
    {
      title: '缺陷编号',
      dataIndex: 'defectNo',
      key: 'defectNo',
      width: 150,
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentId',
      key: 'equipmentId',
      width: 150,
      render: (id: number) => getEquipmentName(id),
    },
    {
      title: '缺陷类型',
      dataIndex: 'defectType',
      key: 'defectType',
      width: 120,
    },
    {
      title: '缺陷位置',
      dataIndex: 'defectLocation',
      key: 'defectLocation',
      width: 150,
    },
    {
      title: '缺陷描述',
      dataIndex: 'defectDescription',
      key: 'defectDescription',
      width: 200,
      ellipsis: true,
    },
    {
      title: '严重程度',
      dataIndex: 'defectLevel',
      key: 'defectLevel',
      width: 100,
      render: (level: DefectLevel) => {
        const info = levelMap[level];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '发现日期',
      dataIndex: 'discoveryDate',
      key: 'discoveryDate',
      width: 120,
    },
    {
      title: '处理建议',
      dataIndex: 'treatmentSuggestion',
      key: 'treatmentSuggestion',
      width: 150,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: DefectStatus) => {
        const info = statusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <Button type="link" size="small" icon={<ToolOutlined />} onClick={() => handleRepair(record)}>
              修复
            </Button>
          )}
          {record.status === 'repaired' && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleVerify(record)}>
              复查
            </Button>
          )}
          {(record.status === 'rechecking' || record.status === 'closed') && (
            <Button type="link" size="small" icon={<CloseOutlined />} onClick={() => handleClose(record)}>
              关闭
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'processing') && (
            <>
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                编辑
              </Button>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
                删除
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const loadOptions = async () => {
    try {
      const [eqRes, schRes, insRes] = await Promise.all([
        equipmentApi.getList({ page: 1, pageSize: 100 }),
        scheduleApi.getList({ page: 1, pageSize: 100 }),
        inspectorApi.getList({ page: 1, pageSize: 100 }),
      ]);
      setEquipmentList(eqRes.list);
      setScheduleList(schRes.list);
      setInspectorList(insRes.list || []);
    } catch (error) {
      console.error('加载选项失败:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await defectApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchText || undefined,
        defectLevel: levelFilter as DefectLevel || undefined,
        status: statusFilter as DefectStatus || undefined,
        equipmentId: equipmentFilter ? parseInt(equipmentFilter) : undefined,
        defectType: typeFilter || undefined,
      });
      setData(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('获取缺陷列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'pending',
      defectLevel: 'general',
      discoveryDate: dayjs(),
    });
    setModalVisible(true);
  };

  const handleEdit = (record: Defect) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      discoveryDate: record.discoveryDate ? dayjs(record.discoveryDate) : undefined,
      treatmentDate: record.treatmentDate ? dayjs(record.treatmentDate) : undefined,
      recheckDate: record.recheckDate ? dayjs(record.recheckDate) : undefined,
    });
    setModalVisible(true);
  };

  const handleView = (record: Defect) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleRepair = (record: Defect) => {
    setCurrentRecord(record);
    repairForm.resetFields();
    repairForm.setFieldsValue({
      treatmentDate: dayjs(),
    });
    setRepairVisible(true);
  };

  const handleVerify = (record: Defect) => {
    setCurrentRecord(record);
    verifyForm.resetFields();
    verifyForm.setFieldsValue({
      recheckDate: dayjs(),
    });
    setVerifyVisible(true);
  };

  const handleClose = (record: Defect) => {
    Modal.confirm({
      title: '确认关闭',
      content: `确定要关闭缺陷「${record.defectNo}」吗？`,
      onOk: async () => {
        try {
          await defectApi.update(record.id!, { status: 'closed' as DefectStatus });
          message.success('关闭成功');
          handleSearch();
        } catch (error) {
          console.error('关闭失败:', error);
        }
      },
    });
  };

  const handleDelete = (record: Defect) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除缺陷「${record.defectNo}」吗？`,
      onOk: async () => {
        try {
          await defectApi.delete(record.id);
          message.success('删除成功');
          handleSearch();
        } catch (error) {
          console.error('删除失败:', error);
        }
      },
    });
  };

  const handleSubmit = async (values: Partial<Defect>) => {
    try {
      const submitData = {
        ...values,
        discoveryDate: values.discoveryDate ? (values.discoveryDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        treatmentDate: values.treatmentDate ? (values.treatmentDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        recheckDate: values.recheckDate ? (values.recheckDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
      };
      if (currentRecord) {
        await defectApi.update(currentRecord.id!, submitData);
        message.success('更新成功');
      } else {
        await defectApi.create(submitData as Omit<Defect, 'id' | 'createdAt' | 'updatedAt'>);
        message.success('创建成功');
      }
      setModalVisible(false);
      handleSearch();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleRepairSubmit = async (values: { treatmentSuggestion: string; treatmentDate: dayjs.Dayjs; treatmentResult: string; handlerId: number }) => {
    if (!currentRecord) return;
    try {
      await defectApi.update(currentRecord.id!, {
        treatmentSuggestion: values.treatmentSuggestion,
        treatmentDate: values.treatmentDate.format('YYYY-MM-DD'),
        treatmentResult: values.treatmentResult,
        status: 'repaired' as DefectStatus,
      });
      message.success('修复信息已保存');
      setRepairVisible(false);
      handleSearch();
    } catch (error) {
      console.error('保存修复信息失败:', error);
    }
  };

  const handleVerifySubmit = async (values: { recheckResult: string; recheckDate: dayjs.Dayjs }) => {
    if (!currentRecord) return;
    try {
      await defectApi.update(currentRecord.id!, {
        recheckResult: values.recheckResult,
        recheckDate: values.recheckDate.format('YYYY-MM-DD'),
        status: 'rechecking' as DefectStatus,
      });
      message.success('复查信息已保存');
      setVerifyVisible(false);
      handleSearch();
    } catch (error) {
      console.error('保存复查信息失败:', error);
    }
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [pagination.current, pagination.pageSize]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">缺陷处理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增缺陷
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg mb-4">
        <Space wrap>
          <Input
            placeholder="搜索关键词"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="选择设备"
            value={equipmentFilter || undefined}
            onChange={setEquipmentFilter}
            style={{ width: 200 }}
            allowClear
            options={equipmentList.map(e => ({ value: String(e.id), label: e.equipmentName }))}
          />
          <Select
            placeholder="选择缺陷类型"
            value={typeFilter || undefined}
            onChange={setTypeFilter}
            style={{ width: 130 }}
            allowClear
            options={[
              { value: 'corrosion', label: '腐蚀' },
              { value: 'weld_defect', label: '焊缝缺陷' },
              { value: 'leakage', label: '泄漏' },
              { value: 'deformation', label: '变形' },
              { value: 'crack', label: '裂纹' },
              { value: 'other', label: '其他' },
            ]}
          />
          <Select
            placeholder="选择严重程度"
            value={levelFilter || undefined}
            onChange={setLevelFilter}
            style={{ width: 130 }}
            allowClear
            options={[
              { value: 'minor', label: '轻微' },
              { value: 'general', label: '一般' },
              { value: 'major', label: '严重' },
              { value: 'critical', label: '重大' },
            ]}
          />
          <Select
            placeholder="选择状态"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            style={{ width: 130 }}
            allowClear
            options={[
              { value: 'pending', label: '待处理' },
              { value: 'processing', label: '处理中' },
              { value: 'repaired', label: '已修复' },
              { value: 'rechecking', label: '复查中' },
              { value: 'closed', label: '已关闭' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handleTableChange,
        }}
        scroll={{ x: 1500 }}
      />

      <Modal
        title={currentRecord ? '编辑缺陷' : '新增缺陷'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="scheduleId" label="排期ID">
              <Select placeholder="请选择排期">
                {scheduleList.map(s => (
                  <Select.Option key={s.id} value={s.id}>{s.scheduleNo}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="equipmentId" label="设备" rules={[{ required: true, message: '请选择设备' }]}>
              <Select placeholder="请选择设备">
                {equipmentList.map(e => (
                  <Select.Option key={e.id} value={e.id}>{e.equipmentName}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="defectNo" label="缺陷编号" rules={[{ required: true, message: '请输入缺陷编号' }]}>
              <Input placeholder="请输入缺陷编号" />
            </Form.Item>
            <Form.Item name="defectType" label="缺陷类型" rules={[{ required: true, message: '请输入缺陷类型' }]}>
              <Input placeholder="请输入缺陷类型" />
            </Form.Item>
            <Form.Item name="defectLevel" label="严重程度" rules={[{ required: true, message: '请选择严重程度' }]}>
              <Select placeholder="请选择严重程度">
                <Select.Option value="minor">轻微</Select.Option>
                <Select.Option value="general">一般</Select.Option>
                <Select.Option value="major">严重</Select.Option>
                <Select.Option value="critical">重大</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="defectLocation" label="缺陷位置" rules={[{ required: true, message: '请输入缺陷位置' }]}>
              <Input placeholder="请输入缺陷位置" />
            </Form.Item>
            <Form.Item name="discoveryMethod" label="发现方式">
              <Input placeholder="请输入发现方式" />
            </Form.Item>
            <Form.Item name="discoveryDate" label="发现日期" rules={[{ required: true, message: '请选择发现日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="defectSize" label="缺陷尺寸">
              <Input placeholder="请输入缺陷尺寸" />
            </Form.Item>
            <Form.Item name="defectArea" label="缺陷面积">
              <Input type="number" placeholder="请输入缺陷面积" />
            </Form.Item>
            <Form.Item name="defectDepth" label="缺陷深度">
              <Input type="number" placeholder="请输入缺陷深度" />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Select placeholder="请选择状态">
                <Select.Option value="pending">待处理</Select.Option>
                <Select.Option value="processing">处理中</Select.Option>
                <Select.Option value="repaired">已修复</Select.Option>
                <Select.Option value="rechecking">复查中</Select.Option>
                <Select.Option value="closed">已关闭</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="causeAnalysis" label="原因分析" className="col-span-2">
              <Input.TextArea rows={2} placeholder="请输入原因分析" />
            </Form.Item>
            <Form.Item name="defectDescription" label="缺陷描述" className="col-span-2">
              <Input.TextArea rows={3} placeholder="请输入缺陷描述" />
            </Form.Item>
            <Form.Item name="treatmentSuggestion" label="处理建议" className="col-span-2">
              <Input.TextArea rows={2} placeholder="请输入处理建议" />
            </Form.Item>
            <Form.Item name="handlerId" label="处理人">
              <Select placeholder="请选择处理人">
                {inspectorList.map(i => (
                  <Select.Option key={i.id} value={i.id}>{i.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="treatmentDate" label="处理日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="treatmentResult" label="处理结果" className="col-span-2">
              <Input.TextArea rows={2} placeholder="请输入处理结果" />
            </Form.Item>
            <Form.Item name="recheckResult" label="复查结果" className="col-span-2">
              <Input.TextArea rows={2} placeholder="请输入复查结果" />
            </Form.Item>
            <Form.Item name="recheckDate" label="复查日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="remark" label="备注" className="col-span-2">
              <Input.TextArea rows={2} placeholder="请输入备注" />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal title="缺陷详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={800}>
        {currentRecord && (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500">缺陷编号：</label>
                <span>{currentRecord.defectNo}</span>
              </div>
              <div>
                <label className="text-gray-500">设备名称：</label>
                <span>{getEquipmentName(currentRecord.equipmentId)}</span>
              </div>
              <div>
                <label className="text-gray-500">缺陷类型：</label>
                <span>{currentRecord.defectType}</span>
              </div>
              <div>
                <label className="text-gray-500">缺陷位置：</label>
                <span>{currentRecord.defectLocation}</span>
              </div>
              <div>
                <label className="text-gray-500">严重程度：</label>
                <Tag color={levelMap[currentRecord.defectLevel].color}>{levelMap[currentRecord.defectLevel].text}</Tag>
              </div>
              <div>
                <label className="text-gray-500">状态：</label>
                <Tag color={statusMap[currentRecord.status].color}>{statusMap[currentRecord.status].text}</Tag>
              </div>
              <div>
                <label className="text-gray-500">发现方式：</label>
                <span>{currentRecord.discoveryMethod || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">发现日期：</label>
                <span>{currentRecord.discoveryDate}</span>
              </div>
              <div>
                <label className="text-gray-500">缺陷尺寸：</label>
                <span>{currentRecord.defectSize || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">缺陷面积：</label>
                <span>{currentRecord.defectArea || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">缺陷深度：</label>
                <span>{currentRecord.defectDepth || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">处理人：</label>
                <span>{currentRecord.handlerId ? getInspectorName(currentRecord.handlerId) : '-'}</span>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">原因分析：</label>
                <p>{currentRecord.causeAnalysis || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">缺陷描述：</label>
                <p>{currentRecord.defectDescription}</p>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">处理建议：</label>
                <p>{currentRecord.treatmentSuggestion}</p>
              </div>
              {currentRecord.treatmentResult && (
                <>
                  <div>
                    <label className="text-gray-500">处理日期：</label>
                    <span>{currentRecord.treatmentDate || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-500">处理结果：</label>
                    <p>{currentRecord.treatmentResult}</p>
                  </div>
                </>
              )}
              {currentRecord.recheckResult && (
                <>
                  <div>
                    <label className="text-gray-500">复查日期：</label>
                    <span>{currentRecord.recheckDate || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-500">复查结果：</label>
                    <p>{currentRecord.recheckResult}</p>
                  </div>
                </>
              )}
              <div className="col-span-2">
                <label className="text-gray-500">备注：</label>
                <p>{currentRecord.remark || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="缺陷修复"
        open={repairVisible}
        onCancel={() => setRepairVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={repairForm} layout="vertical" onFinish={handleRepairSubmit}>
          <Form.Item name="handlerId" label="处理人" rules={[{ required: true, message: '请选择处理人' }]}>
            <Select placeholder="请选择处理人">
              {inspectorList.map(i => (
                <Select.Option key={i.id} value={i.id}>{i.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="treatmentSuggestion" label="修复措施" rules={[{ required: true, message: '请输入修复措施' }]}>
            <Input.TextArea rows={3} placeholder="请输入修复措施" />
          </Form.Item>
          <Form.Item name="treatmentDate" label="修复日期" rules={[{ required: true, message: '请选择修复日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="treatmentResult" label="修复结果" rules={[{ required: true, message: '请输入修复结果' }]}>
            <Input.TextArea rows={3} placeholder="请输入修复结果" />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setRepairVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="缺陷复查"
        open={verifyVisible}
        onCancel={() => setVerifyVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={verifyForm} layout="vertical" onFinish={handleVerifySubmit}>
          <Form.Item name="recheckDate" label="复查日期" rules={[{ required: true, message: '请选择复查日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="recheckResult" label="复查结果" rules={[{ required: true, message: '请输入复查结果' }]}>
            <Input.TextArea rows={4} placeholder="请输入复查结果" />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setVerifyVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DefectPage;
