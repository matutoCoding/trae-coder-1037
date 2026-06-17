import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, Tag, Modal, Form, message, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { Equipment, EquipmentStatus } from '@/types';
import { equipmentApi, companyApi } from '@/utils/api';
import dayjs from 'dayjs';

const statusMap: Record<EquipmentStatus, { color: string; text: string }> = {
  normal: { color: 'green', text: '正常' },
  maintenance: { color: 'orange', text: '维护中' },
  decommissioned: { color: 'gold', text: '停用' },
  scrapped: { color: 'red', text: '报废' },
};

const EquipmentPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Equipment[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Equipment | null>(null);
  const [form] = Form.useForm();
  const [companyOptions, setCompanyOptions] = useState<{ label: string; value: number }[]>([]);

  React.useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const result = await companyApi.getList({ page: 1, pageSize: 100 });
      setCompanyOptions(result.list.map(c => ({ label: c.name, value: c.id })));
    } catch (error) {
      console.error('获取单位列表失败:', error);
    }
  };

  const columns: ColumnsType<Equipment> = [
    {
      title: '设备代码',
      dataIndex: 'equipmentCode',
      key: 'equipmentCode',
      width: 150,
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 150,
    },
    {
      title: '设备类型',
      dataIndex: 'equipmentType',
      key: 'equipmentType',
      width: 120,
    },
    {
      title: '型号规格',
      dataIndex: 'modelSpecification',
      key: 'modelSpecification',
      width: 150,
    },
    {
      title: '单位ID',
      dataIndex: 'companyId',
      key: 'companyId',
      width: 100,
    },
    {
      title: '安装地点',
      dataIndex: 'installationLocation',
      key: 'installationLocation',
      width: 150,
    },
    {
      title: '设计压力(MPa)',
      dataIndex: 'designPressure',
      key: 'designPressure',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'equipmentStatus',
      key: 'equipmentStatus',
      width: 100,
      render: (status: EquipmentStatus) => {
        const info = statusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '下次检验日期',
      dataIndex: 'nextInspectionDate',
      key: 'nextInspectionDate',
      width: 130,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      if (searchText) {
        params.keyword = searchText;
      }
      if (statusFilter) {
        params.equipmentStatus = statusFilter as EquipmentStatus;
      }
      if (companyFilter) {
        params.companyId = parseInt(companyFilter);
      }
      const result = await equipmentApi.getList(params);
      setData(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('获取设备列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Equipment) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      manufactureDate: record.manufactureDate ? dayjs(record.manufactureDate) : undefined,
      commissioningDate: record.commissioningDate ? dayjs(record.commissioningDate) : undefined,
      nextInspectionDate: record.nextInspectionDate ? dayjs(record.nextInspectionDate) : undefined,
      lastInspectionDate: record.lastInspectionDate ? dayjs(record.lastInspectionDate) : undefined,
    });
    setModalVisible(true);
  };

  const handleView = (record: Equipment) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleDelete = (record: Equipment) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除设备「${record.equipmentName}」吗？`,
      onOk: async () => {
        try {
          await equipmentApi.delete(record.id);
          message.success('删除成功');
          handleSearch();
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
        manufactureDate: values.manufactureDate ? (values.manufactureDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        commissioningDate: values.commissioningDate ? (values.commissioningDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        nextInspectionDate: values.nextInspectionDate ? (values.nextInspectionDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        lastInspectionDate: values.lastInspectionDate ? (values.lastInspectionDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
      };
      if (currentRecord) {
        await equipmentApi.update(currentRecord.id!, submitData);
        message.success('更新成功');
      } else {
        await equipmentApi.create(submitData as Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>);
        message.success('创建成功');
      }
      setModalVisible(false);
      handleSearch();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  React.useEffect(() => {
    handleSearch();
  }, [pagination.current, pagination.pageSize]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">设备台账</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增设备
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg mb-4">
        <Space wrap>
          <Input
            placeholder="搜索设备代码/名称"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="选择单位"
            value={companyFilter || undefined}
            onChange={setCompanyFilter}
            style={{ width: 200 }}
            allowClear
            options={companyOptions}
          />
          <Select
            placeholder="选择状态"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
            options={[
              { value: 'normal', label: '正常' },
              { value: 'maintenance', label: '维护中' },
              { value: 'decommissioned', label: '停用' },
              { value: 'scrapped', label: '报废' },
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
        scroll={{ x: 1400 }}
      />

      <Modal
        title={currentRecord ? '编辑设备' : '新增设备'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="companyId" label="单位ID" rules={[{ required: true, message: '请选择单位' }]}>
              <Select placeholder="请选择单位" options={companyOptions} />
            </Form.Item>
            <Form.Item name="equipmentCode" label="设备代码" rules={[{ required: true, message: '请输入设备代码' }]}>
              <Input placeholder="请输入设备代码" />
            </Form.Item>
            <Form.Item name="equipmentName" label="设备名称" rules={[{ required: true, message: '请输入设备名称' }]}>
              <Input placeholder="请输入设备名称" />
            </Form.Item>
            <Form.Item name="equipmentType" label="设备类型" rules={[{ required: true, message: '请选择设备类型' }]}>
              <Select placeholder="请选择设备类型">
                <Select.Option value="steam">蒸汽锅炉</Select.Option>
                <Select.Option value="hot_water">热水锅炉</Select.Option>
                <Select.Option value="organic">有机热载体锅炉</Select.Option>
                <Select.Option value="power">电站锅炉</Select.Option>
                <Select.Option value="pressure_vessel">压力容器</Select.Option>
                <Select.Option value="pressure_pipe">压力管道</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="modelSpecification" label="型号规格">
              <Input placeholder="请输入型号规格" />
            </Form.Item>
            <Form.Item name="designPressure" label="设计压力(MPa)" rules={[{ required: true, message: '请输入设计压力' }]}>
              <Input type="number" step="0.01" placeholder="请输入设计压力" />
            </Form.Item>
            <Form.Item name="designTemperature" label="设计温度(℃)" rules={[{ required: true, message: '请输入设计温度' }]}>
              <Input type="number" placeholder="请输入设计温度" />
            </Form.Item>
            <Form.Item name="workingPressure" label="工作压力(MPa)" rules={[{ required: true, message: '请输入工作压力' }]}>
              <Input type="number" step="0.01" placeholder="请输入工作压力" />
            </Form.Item>
            <Form.Item name="workingTemperature" label="工作温度(℃)" rules={[{ required: true, message: '请输入工作温度' }]}>
              <Input type="number" placeholder="请输入工作温度" />
            </Form.Item>
            <Form.Item name="volume" label="容积(m³)">
              <Input type="number" step="0.01" placeholder="请输入容积" />
            </Form.Item>
            <Form.Item name="diameter" label="直径(mm)">
              <Input type="number" placeholder="请输入直径" />
            </Form.Item>
            <Form.Item name="wallThickness" label="壁厚(mm)">
              <Input type="number" step="0.1" placeholder="请输入壁厚" />
            </Form.Item>
            <Form.Item name="material" label="材质">
              <Input placeholder="请输入材质" />
            </Form.Item>
            <Form.Item name="manufactureDate" label="制造日期" rules={[{ required: true, message: '请选择制造日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="commissioningDate" label="投用日期" rules={[{ required: true, message: '请选择投用日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="installationLocation" label="安装地点" rules={[{ required: true, message: '请输入安装地点' }]}>
              <Input placeholder="请输入安装地点" />
            </Form.Item>
            <Form.Item name="useRegistrationCode" label="使用登记证号" rules={[{ required: true, message: '请输入使用登记证号' }]}>
              <Input placeholder="请输入使用登记证号" />
            </Form.Item>
            <Form.Item name="equipmentStatus" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Select placeholder="请选择状态">
                <Select.Option value="normal">正常</Select.Option>
                <Select.Option value="maintenance">维护中</Select.Option>
                <Select.Option value="decommissioned">停用</Select.Option>
                <Select.Option value="scrapped">报废</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="lastInspectionDate" label="上次检验日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="nextInspectionDate" label="下次检验日期" rules={[{ required: true, message: '请选择下次检验日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="remark" label="备注" className="col-span-2">
              <Input.TextArea rows={3} placeholder="请输入备注" />
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

      <Modal title="设备详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={800}>
        {currentRecord && (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500">设备代码：</label>
                <span>{currentRecord.equipmentCode}</span>
              </div>
              <div>
                <label className="text-gray-500">设备名称：</label>
                <span>{currentRecord.equipmentName}</span>
              </div>
              <div>
                <label className="text-gray-500">设备类型：</label>
                <span>{currentRecord.equipmentType}</span>
              </div>
              <div>
                <label className="text-gray-500">型号规格：</label>
                <span>{currentRecord.modelSpecification}</span>
              </div>
              <div>
                <label className="text-gray-500">单位ID：</label>
                <span>{currentRecord.companyId}</span>
              </div>
              <div>
                <label className="text-gray-500">安装地点：</label>
                <span>{currentRecord.installationLocation}</span>
              </div>
              <div>
                <label className="text-gray-500">设计压力：</label>
                <span>{currentRecord.designPressure} MPa</span>
              </div>
              <div>
                <label className="text-gray-500">设计温度：</label>
                <span>{currentRecord.designTemperature} ℃</span>
              </div>
              <div>
                <label className="text-gray-500">工作压力：</label>
                <span>{currentRecord.workingPressure} MPa</span>
              </div>
              <div>
                <label className="text-gray-500">工作温度：</label>
                <span>{currentRecord.workingTemperature} ℃</span>
              </div>
              <div>
                <label className="text-gray-500">容积：</label>
                <span>{currentRecord.volume || '-'} m³</span>
              </div>
              <div>
                <label className="text-gray-500">直径：</label>
                <span>{currentRecord.diameter || '-'} mm</span>
              </div>
              <div>
                <label className="text-gray-500">壁厚：</label>
                <span>{currentRecord.wallThickness || '-'} mm</span>
              </div>
              <div>
                <label className="text-gray-500">材质：</label>
                <span>{currentRecord.material || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">制造日期：</label>
                <span>{currentRecord.manufactureDate}</span>
              </div>
              <div>
                <label className="text-gray-500">投用日期：</label>
                <span>{currentRecord.commissioningDate}</span>
              </div>
              <div>
                <label className="text-gray-500">使用登记证号：</label>
                <span>{currentRecord.useRegistrationCode}</span>
              </div>
              <div>
                <label className="text-gray-500">状态：</label>
                <Tag color={statusMap[currentRecord.equipmentStatus].color}>{statusMap[currentRecord.equipmentStatus].text}</Tag>
              </div>
              <div>
                <label className="text-gray-500">上次检验日期：</label>
                <span>{currentRecord.lastInspectionDate || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">下次检验日期：</label>
                <span>{currentRecord.nextInspectionDate}</span>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">备注：</label>
                <span>{currentRecord.remark || '-'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EquipmentPage;
