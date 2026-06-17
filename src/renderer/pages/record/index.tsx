import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, Tag, Modal, Form, message, DatePicker, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { HydroTest, ValveTest, TestResult, SealingPerformance } from '@/types';
import { hydrotestApi, valvetestApi, equipmentApi, scheduleApi, inspectorApi } from '@/utils/api';
import dayjs from 'dayjs';

const resultMap: Record<TestResult, { color: string; text: string }> = {
  qualified: { color: 'green', text: '合格' },
  unqualified: { color: 'red', text: '不合格' },
  pending: { color: 'orange', text: '待判定' },
};

const sealingMap: Record<SealingPerformance, { color: string; text: string }> = {
  qualified: { color: 'green', text: '合格' },
  unqualified: { color: 'red', text: '不合格' },
};

const RecordPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hydrotest');
  const [hydroLoading, setHydroLoading] = useState(false);
  const [valveLoading, setValveLoading] = useState(false);
  const [hydroData, setHydroData] = useState<HydroTest[]>([]);
  const [valveData, setValveData] = useState<ValveTest[]>([]);
  const [hydroTotal, setHydroTotal] = useState(0);
  const [valveTotal, setValveTotal] = useState(0);
  const [hydroPagination, setHydroPagination] = useState({ current: 1, pageSize: 10 });
  const [valvePagination, setValvePagination] = useState({ current: 1, pageSize: 10 });
  const [hydroSearchText, setHydroSearchText] = useState('');
  const [valveSearchText, setValveSearchText] = useState('');
  const [hydroResultFilter, setHydroResultFilter] = useState<string>('');
  const [valveResultFilter, setValveResultFilter] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentHydroRecord, setCurrentHydroRecord] = useState<HydroTest | null>(null);
  const [currentValveRecord, setCurrentValveRecord] = useState<ValveTest | null>(null);
  const [form] = Form.useForm();
  const [equipmentOptions, setEquipmentOptions] = useState<{ label: string; value: number; name: string }[]>([]);
  const [scheduleOptions, setScheduleOptions] = useState<{ label: string; value: number }[]>([]);
  const [inspectorOptions, setInspectorOptions] = useState<{ label: string; value: number }[]>([]);

  React.useEffect(() => {
    fetchOptions();
  }, []);

  React.useEffect(() => {
    if (activeTab === 'hydrotest') {
      fetchHydroList();
    } else {
      fetchValveList();
    }
  }, [activeTab, hydroPagination.current, hydroPagination.pageSize, valvePagination.current, valvePagination.pageSize]);

  const fetchOptions = async () => {
    try {
      const [equipments, schedules, inspectors] = await Promise.all([
        equipmentApi.getList({ page: 1, pageSize: 100 }),
        scheduleApi.getList({ page: 1, pageSize: 100 }),
        inspectorApi.getList({ page: 1, pageSize: 100 }),
      ]);
      setEquipmentOptions(equipments.list.map(e => ({ label: `${e.equipmentCode} - ${e.equipmentName}`, value: e.id, name: e.equipmentName })));
      setScheduleOptions(schedules.list.map(s => ({ label: s.scheduleNo, value: s.id })));
      setInspectorOptions(inspectors.list.map(i => ({ label: i.name, value: i.id })));
    } catch (error) {
      console.error('获取选项列表失败:', error);
    }
  };

  const getEquipmentName = (equipmentId: number) => {
    const eq = equipmentOptions.find(e => e.value === equipmentId);
    return eq ? eq.name : '-';
  };

  const fetchHydroList = async () => {
    setHydroLoading(true);
    try {
      const params: any = {
        page: hydroPagination.current,
        pageSize: hydroPagination.pageSize,
      };
      if (hydroSearchText) {
        params.keyword = hydroSearchText;
      }
      if (hydroResultFilter) {
        params.testResult = hydroResultFilter as TestResult;
      }
      const result = await hydrotestApi.getList(params);
      setHydroData(result.list);
      setHydroTotal(result.total);
    } catch (error) {
      console.error('获取水压试验记录失败:', error);
    } finally {
      setHydroLoading(false);
    }
  };

  const fetchValveList = async () => {
    setValveLoading(true);
    try {
      const params: any = {
        page: valvePagination.current,
        pageSize: valvePagination.pageSize,
      };
      if (valveSearchText) {
        params.keyword = valveSearchText;
      }
      if (valveResultFilter) {
        params.testResult = valveResultFilter as TestResult;
      }
      const result = await valvetestApi.getList(params);
      setValveData(result.list);
      setValveTotal(result.total);
    } catch (error) {
      console.error('获取安全阀校验记录失败:', error);
    } finally {
      setValveLoading(false);
    }
  };

  const hydroColumns: ColumnsType<HydroTest> = [
    {
      title: '试验编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (_, record) => `HT-${record.id}`,
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentId',
      key: 'equipmentId',
      width: 150,
      render: (equipmentId: number) => getEquipmentName(equipmentId),
    },
    {
      title: '试验日期',
      dataIndex: 'testDate',
      key: 'testDate',
      width: 120,
    },
    {
      title: '试验压力(MPa)',
      dataIndex: 'testPressure',
      key: 'testPressure',
      width: 130,
    },
    {
      title: '保压时间(min)',
      dataIndex: 'pressureHoldingTime',
      key: 'pressureHoldingTime',
      width: 130,
    },
    {
      title: '试验结果',
      dataIndex: 'testResult',
      key: 'testResult',
      width: 100,
      render: (result: TestResult) => {
        const info = resultMap[result];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewHydro(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditHydro(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteHydro(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const valveColumns: ColumnsType<ValveTest> = [
    {
      title: '阀门编号',
      dataIndex: 'valveNo',
      key: 'valveNo',
      width: 120,
    },
    {
      title: '阀门名称',
      dataIndex: 'valveName',
      key: 'valveName',
      width: 150,
    },
    {
      title: '型号',
      dataIndex: 'valveModel',
      key: 'valveModel',
      width: 150,
    },
    {
      title: '整定压力(MPa)',
      dataIndex: 'setPressure',
      key: 'setPressure',
      width: 130,
    },
    {
      title: '试验日期',
      dataIndex: 'testDate',
      key: 'testDate',
      width: 120,
    },
    {
      title: '密封性能',
      dataIndex: 'sealingPerformance',
      key: 'sealingPerformance',
      width: 100,
      render: (result: SealingPerformance) => {
        const info = sealingMap[result];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '试验结果',
      dataIndex: 'testResult',
      key: 'testResult',
      width: 100,
      render: (result: TestResult) => {
        const info = resultMap[result];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewValve(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditValve(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteValve(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddHydro = () => {
    setCurrentHydroRecord(null);
    setCurrentValveRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleAddValve = () => {
    setCurrentValveRecord(null);
    setCurrentHydroRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditHydro = (record: HydroTest) => {
    setCurrentHydroRecord(record);
    setCurrentValveRecord(null);
    form.setFieldsValue({
      ...record,
      testDate: record.testDate ? dayjs(record.testDate) : undefined,
    });
    setModalVisible(true);
  };

  const handleEditValve = (record: ValveTest) => {
    setCurrentValveRecord(record);
    setCurrentHydroRecord(null);
    form.setFieldsValue({
      ...record,
      testDate: record.testDate ? dayjs(record.testDate) : undefined,
      nextTestDate: record.nextTestDate ? dayjs(record.nextTestDate) : undefined,
    });
    setModalVisible(true);
  };

  const handleViewHydro = (record: HydroTest) => {
    setCurrentHydroRecord(record);
    setCurrentValveRecord(null);
    setDetailVisible(true);
  };

  const handleViewValve = (record: ValveTest) => {
    setCurrentValveRecord(record);
    setCurrentHydroRecord(null);
    setDetailVisible(true);
  };

  const handleDeleteHydro = (record: HydroTest) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除水压试验记录吗？`,
      onOk: async () => {
        try {
          await hydrotestApi.delete(record.id);
          message.success('删除成功');
          fetchHydroList();
        } catch (error) {
          console.error('删除失败:', error);
        }
      },
    });
  };

  const handleDeleteValve = (record: ValveTest) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除安全阀校验记录「${record.valveNo}」吗？`,
      onOk: async () => {
        try {
          await valvetestApi.delete(record.id);
          message.success('删除成功');
          fetchValveList();
        } catch (error) {
          console.error('删除失败:', error);
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        testDate: values.testDate ? (values.testDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        nextTestDate: values.nextTestDate ? (values.nextTestDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
      };

      if (activeTab === 'hydrotest') {
        if (currentHydroRecord) {
          await hydrotestApi.update(currentHydroRecord.id!, submitData);
          message.success('更新成功');
        } else {
          await hydrotestApi.create(submitData as Omit<HydroTest, 'id' | 'createdAt' | 'updatedAt'>);
          message.success('创建成功');
        }
        setModalVisible(false);
        fetchHydroList();
      } else {
        if (currentValveRecord) {
          await valvetestApi.update(currentValveRecord.id!, submitData);
          message.success('更新成功');
        } else {
          await valvetestApi.create(submitData as Omit<ValveTest, 'id' | 'createdAt' | 'updatedAt'>);
          message.success('创建成功');
        }
        setModalVisible(false);
        fetchValveList();
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const hydroItems = [
    { label: '水压试验记录', key: 'hydrotest' },
    { label: '安全阀校验', key: 'valvetest' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">检验记录</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={activeTab === 'hydrotest' ? handleAddHydro : handleAddValve}>
          新增{activeTab === 'hydrotest' ? '水压试验' : '安全阀校验'}
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={hydroItems}
        className="mb-4"
      />

      {activeTab === 'hydrotest' ? (
        <>
          <div className="bg-white p-4 rounded-lg mb-4">
            <Space wrap>
              <Input
                placeholder="搜索"
                value={hydroSearchText}
                onChange={(e) => setHydroSearchText(e.target.value)}
                style={{ width: 200 }}
                prefix={<SearchOutlined />}
                onPressEnter={fetchHydroList}
              />
              <Select
                placeholder="选择试验结果"
                value={hydroResultFilter || undefined}
                onChange={setHydroResultFilter}
                style={{ width: 150 }}
                allowClear
                options={[
                  { value: 'qualified', label: '合格' },
                  { value: 'unqualified', label: '不合格' },
                  { value: 'pending', label: '待判定' },
                ]}
              />
              <Button type="primary" onClick={fetchHydroList}>
                查询
              </Button>
            </Space>
          </div>

          <Table
            rowKey="id"
            columns={hydroColumns}
            dataSource={hydroData}
            loading={hydroLoading}
            pagination={{
              current: hydroPagination.current,
              pageSize: hydroPagination.pageSize,
              total: hydroTotal,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => setHydroPagination({ current: page, pageSize }),
            }}
            scroll={{ x: 1200 }}
          />
        </>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg mb-4">
            <Space wrap>
              <Input
                placeholder="搜索阀门编号/名称"
                value={valveSearchText}
                onChange={(e) => setValveSearchText(e.target.value)}
                style={{ width: 200 }}
                prefix={<SearchOutlined />}
                onPressEnter={fetchValveList}
              />
              <Select
                placeholder="选择试验结果"
                value={valveResultFilter || undefined}
                onChange={setValveResultFilter}
                style={{ width: 150 }}
                allowClear
                options={[
                  { value: 'qualified', label: '合格' },
                  { value: 'unqualified', label: '不合格' },
                  { value: 'pending', label: '待判定' },
                ]}
              />
              <Button type="primary" onClick={fetchValveList}>
                查询
              </Button>
            </Space>
          </div>

          <Table
            rowKey="id"
            columns={valveColumns}
            dataSource={valveData}
            loading={valveLoading}
            pagination={{
              current: valvePagination.current,
              pageSize: valvePagination.pageSize,
              total: valveTotal,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => setValvePagination({ current: page, pageSize }),
            }}
            scroll={{ x: 1300 }}
          />
        </>
      )}

      <Modal
        title={currentHydroRecord || currentValveRecord ? '编辑记录' : '新增记录'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {activeTab === 'hydrotest' ? (
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="scheduleId" label="排期ID">
                <Select placeholder="请选择排期" options={scheduleOptions} />
              </Form.Item>
              <Form.Item name="equipmentId" label="设备ID" rules={[{ required: true, message: '请选择设备' }]}>
                <Select placeholder="请选择设备" options={equipmentOptions.map(e => ({ label: e.label, value: e.value }))} />
              </Form.Item>
              <Form.Item name="testMethod" label="试验方法" rules={[{ required: true, message: '请输入试验方法' }]}>
                <Input placeholder="请输入试验方法" />
              </Form.Item>
              <Form.Item name="testMedium" label="试验介质" rules={[{ required: true, message: '请输入试验介质' }]}>
                <Input placeholder="请输入试验介质" />
              </Form.Item>
              <Form.Item name="mediumTemperature" label="介质温度(℃)" rules={[{ required: true, message: '请输入介质温度' }]}>
                <Input type="number" placeholder="请输入介质温度" />
              </Form.Item>
              <Form.Item name="testPressure" label="试验压力(MPa)" rules={[{ required: true, message: '请输入试验压力' }]}>
                <Input type="number" step="0.01" placeholder="请输入试验压力" />
              </Form.Item>
              <Form.Item name="pressureHoldingTime" label="保压时间(min)" rules={[{ required: true, message: '请输入保压时间' }]}>
                <Input type="number" placeholder="请输入保压时间" />
              </Form.Item>
              <Form.Item name="pressureDrop" label="压力降(MPa)">
                <Input type="number" step="0.01" placeholder="请输入压力降" />
              </Form.Item>
              <Form.Item name="testDate" label="试验日期" rules={[{ required: true, message: '请选择试验日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="testerId" label="试验人员ID" rules={[{ required: true, message: '请选择试验人员' }]}>
                <Select placeholder="请选择试验人员" options={inspectorOptions} />
              </Form.Item>
              <Form.Item name="testEnvironment" label="试验环境" rules={[{ required: true, message: '请输入试验环境' }]}>
                <Input placeholder="请输入试验环境" />
              </Form.Item>
              <Form.Item name="testResult" label="试验结果" rules={[{ required: true, message: '请选择试验结果' }]}>
                <Select placeholder="请选择试验结果">
                  <Select.Option value="qualified">合格</Select.Option>
                  <Select.Option value="unqualified">不合格</Select.Option>
                  <Select.Option value="pending">待判定</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="witness" label="见证人">
                <Input placeholder="请输入见证人" />
              </Form.Item>
              <Form.Item name="inspectionSituation" label="检验情况" className="col-span-2">
                <Input.TextArea rows={2} placeholder="请输入检验情况" />
              </Form.Item>
              <Form.Item name="leakageSituation" label="泄漏情况" className="col-span-2">
                <Input.TextArea rows={2} placeholder="请输入泄漏情况" />
              </Form.Item>
              <Form.Item name="deformationSituation" label="变形情况" className="col-span-2">
                <Input.TextArea rows={2} placeholder="请输入变形情况" />
              </Form.Item>
              <Form.Item name="remark" label="备注" className="col-span-2">
                <Input.TextArea rows={2} placeholder="请输入备注" />
              </Form.Item>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="scheduleId" label="排期ID">
                <Select placeholder="请选择排期" options={scheduleOptions} />
              </Form.Item>
              <Form.Item name="equipmentId" label="设备ID" rules={[{ required: true, message: '请选择设备' }]}>
                <Select placeholder="请选择设备" options={equipmentOptions.map(e => ({ label: e.label, value: e.value }))} />
              </Form.Item>
              <Form.Item name="valveNo" label="阀门编号" rules={[{ required: true, message: '请输入阀门编号' }]}>
                <Input placeholder="请输入阀门编号" />
              </Form.Item>
              <Form.Item name="valveName" label="阀门名称" rules={[{ required: true, message: '请输入阀门名称' }]}>
                <Input placeholder="请输入阀门名称" />
              </Form.Item>
              <Form.Item name="valveModel" label="阀门型号" rules={[{ required: true, message: '请输入阀门型号' }]}>
                <Input placeholder="请输入阀门型号" />
              </Form.Item>
              <Form.Item name="specification" label="规格" rules={[{ required: true, message: '请输入规格' }]}>
                <Input placeholder="请输入规格" />
              </Form.Item>
              <Form.Item name="manufacturer" label="制造单位">
                <Input placeholder="请输入制造单位" />
              </Form.Item>
              <Form.Item name="factoryDate" label="出厂日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="testDate" label="试验日期" rules={[{ required: true, message: '请选择试验日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="testerId" label="试验人员ID" rules={[{ required: true, message: '请选择试验人员' }]}>
                <Select placeholder="请选择试验人员" options={inspectorOptions} />
              </Form.Item>
              <Form.Item name="setPressure" label="整定压力(MPa)" rules={[{ required: true, message: '请输入整定压力' }]}>
                <Input type="number" step="0.01" placeholder="请输入整定压力" />
              </Form.Item>
              <Form.Item name="testPressure" label="试验压力(MPa)" rules={[{ required: true, message: '请输入试验压力' }]}>
                <Input type="number" step="0.01" placeholder="请输入试验压力" />
              </Form.Item>
              <Form.Item name="seatPressure" label="密封压力(MPa)" rules={[{ required: true, message: '请输入密封压力' }]}>
                <Input type="number" step="0.01" placeholder="请输入密封压力" />
              </Form.Item>
              <Form.Item name="backPressure" label="背压(MPa)">
                <Input type="number" step="0.01" placeholder="请输入背压" />
              </Form.Item>
              <Form.Item name="testMedium" label="试验介质" rules={[{ required: true, message: '请输入试验介质' }]}>
                <Input placeholder="请输入试验介质" />
              </Form.Item>
              <Form.Item name="dischargeCapacity" label="排放能力">
                <Input type="number" placeholder="请输入排放能力" />
              </Form.Item>
              <Form.Item name="sealingPerformance" label="密封性能" rules={[{ required: true, message: '请选择密封性能' }]}>
                <Select placeholder="请选择密封性能">
                  <Select.Option value="qualified">合格</Select.Option>
                  <Select.Option value="unqualified">不合格</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="openingPressureDeviation" label="开启压力偏差(%)">
                <Input type="number" step="0.1" placeholder="请输入开启压力偏差" />
              </Form.Item>
              <Form.Item name="testResult" label="试验结果" rules={[{ required: true, message: '请选择试验结果' }]}>
                <Select placeholder="请选择试验结果">
                  <Select.Option value="qualified">合格</Select.Option>
                  <Select.Option value="unqualified">不合格</Select.Option>
                  <Select.Option value="pending">待判定</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="nextTestDate" label="下次校验日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="adjustmentMethod" label="调整方法" className="col-span-2">
                <Input.TextArea rows={2} placeholder="请输入调整方法" />
              </Form.Item>
              <Form.Item name="remark" label="备注" className="col-span-2">
                <Input.TextArea rows={2} placeholder="请输入备注" />
              </Form.Item>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal title="记录详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={800}>
        {currentHydroRecord && (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500">试验编号：</label>
                <span>HT-{currentHydroRecord.id}</span>
              </div>
              <div>
                <label className="text-gray-500">设备ID：</label>
                <span>{currentHydroRecord.equipmentId}</span>
              </div>
              <div>
                <label className="text-gray-500">设备名称：</label>
                <span>{getEquipmentName(currentHydroRecord.equipmentId)}</span>
              </div>
              <div>
                <label className="text-gray-500">排期ID：</label>
                <span>{currentHydroRecord.scheduleId || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">试验方法：</label>
                <span>{currentHydroRecord.testMethod}</span>
              </div>
              <div>
                <label className="text-gray-500">试验介质：</label>
                <span>{currentHydroRecord.testMedium}</span>
              </div>
              <div>
                <label className="text-gray-500">介质温度：</label>
                <span>{currentHydroRecord.mediumTemperature} ℃</span>
              </div>
              <div>
                <label className="text-gray-500">试验压力：</label>
                <span>{currentHydroRecord.testPressure} MPa</span>
              </div>
              <div>
                <label className="text-gray-500">保压时间：</label>
                <span>{currentHydroRecord.pressureHoldingTime} min</span>
              </div>
              <div>
                <label className="text-gray-500">压力降：</label>
                <span>{currentHydroRecord.pressureDrop || '-'} MPa</span>
              </div>
              <div>
                <label className="text-gray-500">试验日期：</label>
                <span>{currentHydroRecord.testDate}</span>
              </div>
              <div>
                <label className="text-gray-500">试验人员ID：</label>
                <span>{currentHydroRecord.testerId}</span>
              </div>
              <div>
                <label className="text-gray-500">试验环境：</label>
                <span>{currentHydroRecord.testEnvironment}</span>
              </div>
              <div>
                <label className="text-gray-500">见证人：</label>
                <span>{currentHydroRecord.witness || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">试验结果：</label>
                <Tag color={resultMap[currentHydroRecord.testResult].color}>
                  {resultMap[currentHydroRecord.testResult].text}
                </Tag>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">检验情况：</label>
                <p>{currentHydroRecord.inspectionSituation || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">泄漏情况：</label>
                <p>{currentHydroRecord.leakageSituation || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">变形情况：</label>
                <p>{currentHydroRecord.deformationSituation || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">备注：</label>
                <p>{currentHydroRecord.remark || '-'}</p>
              </div>
            </div>
          </div>
        )}
        {currentValveRecord && (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500">阀门编号：</label>
                <span>{currentValveRecord.valveNo}</span>
              </div>
              <div>
                <label className="text-gray-500">阀门名称：</label>
                <span>{currentValveRecord.valveName}</span>
              </div>
              <div>
                <label className="text-gray-500">阀门型号：</label>
                <span>{currentValveRecord.valveModel}</span>
              </div>
              <div>
                <label className="text-gray-500">规格：</label>
                <span>{currentValveRecord.specification}</span>
              </div>
              <div>
                <label className="text-gray-500">制造单位：</label>
                <span>{currentValveRecord.manufacturer || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">出厂日期：</label>
                <span>{currentValveRecord.factoryDate || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">试验日期：</label>
                <span>{currentValveRecord.testDate}</span>
              </div>
              <div>
                <label className="text-gray-500">试验人员ID：</label>
                <span>{currentValveRecord.testerId}</span>
              </div>
              <div>
                <label className="text-gray-500">整定压力：</label>
                <span>{currentValveRecord.setPressure} MPa</span>
              </div>
              <div>
                <label className="text-gray-500">试验压力：</label>
                <span>{currentValveRecord.testPressure} MPa</span>
              </div>
              <div>
                <label className="text-gray-500">密封压力：</label>
                <span>{currentValveRecord.seatPressure} MPa</span>
              </div>
              <div>
                <label className="text-gray-500">背压：</label>
                <span>{currentValveRecord.backPressure || '-'} MPa</span>
              </div>
              <div>
                <label className="text-gray-500">试验介质：</label>
                <span>{currentValveRecord.testMedium}</span>
              </div>
              <div>
                <label className="text-gray-500">排放能力：</label>
                <span>{currentValveRecord.dischargeCapacity || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">密封性能：</label>
                <Tag color={sealingMap[currentValveRecord.sealingPerformance].color}>
                  {sealingMap[currentValveRecord.sealingPerformance].text}
                </Tag>
              </div>
              <div>
                <label className="text-gray-500">开启压力偏差：</label>
                <span>{currentValveRecord.openingPressureDeviation || '-'}%</span>
              </div>
              <div>
                <label className="text-gray-500">试验结果：</label>
                <Tag color={resultMap[currentValveRecord.testResult].color}>
                  {resultMap[currentValveRecord.testResult].text}
                </Tag>
              </div>
              <div>
                <label className="text-gray-500">下次校验日期：</label>
                <span>{currentValveRecord.nextTestDate || '-'}</span>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">调整方法：</label>
                <p>{currentValveRecord.adjustmentMethod || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">备注：</label>
                <p>{currentValveRecord.remark || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecordPage;
