import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, Tag, Modal, Form, message, DatePicker, TimePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { Schedule, ScheduleStatus } from '@/types';
import { scheduleApi, companyApi, equipmentApi, applicationApi, inspectorApi } from '@/utils/api';
import dayjs from 'dayjs';

const statusMap: Record<ScheduleStatus, { color: string; text: string }> = {
  scheduled: { color: 'blue', text: '已排期' },
  in_progress: { color: 'processing', text: '进行中' },
  completed: { color: 'success', text: '已完成' },
  cancelled: { color: 'error', text: '已取消' },
  postponed: { color: 'warning', text: '已延期' },
};

const SchedulePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Schedule[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Schedule | null>(null);
  const [form] = Form.useForm();
  const [companyOptions, setCompanyOptions] = useState<{ label: string; value: number }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{ label: string; value: number }[]>([]);
  const [applicationOptions, setApplicationOptions] = useState<{ label: string; value: number }[]>([]);
  const [inspectorOptions, setInspectorOptions] = useState<{ label: string; value: number }[]>([]);

  React.useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [companies, equipments, applications, inspectors] = await Promise.all([
        companyApi.getList({ page: 1, pageSize: 100 }),
        equipmentApi.getList({ page: 1, pageSize: 100 }),
        applicationApi.getList({ page: 1, pageSize: 100 }),
        inspectorApi.getList({ page: 1, pageSize: 100 }),
      ]);
      setCompanyOptions(companies.list.map(c => ({ label: c.name, value: c.id })));
      setEquipmentOptions(equipments.list.map(e => ({ label: `${e.equipmentCode} - ${e.equipmentName}`, value: e.id })));
      setApplicationOptions(applications.list.map(a => ({ label: a.applyNo, value: a.id })));
      setInspectorOptions(inspectors.list.map(i => ({ label: i.name, value: i.id })));
    } catch (error) {
      console.error('获取选项列表失败:', error);
    }
  };

  const columns: ColumnsType<Schedule> = [
    {
      title: '排期编号',
      dataIndex: 'scheduleNo',
      key: 'scheduleNo',
      width: 150,
    },
    {
      title: '申请ID',
      dataIndex: 'applyId',
      key: 'applyId',
      width: 100,
    },
    {
      title: '设备ID',
      dataIndex: 'equipmentId',
      key: 'equipmentId',
      width: 100,
    },
    {
      title: '检验类型',
      dataIndex: 'inspectionType',
      key: 'inspectionType',
      width: 120,
    },
    {
      title: '计划日期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 120,
    },
    {
      title: '计划时间',
      dataIndex: 'planStartTime',
      key: 'planStartTime',
      width: 120,
      render: (_, record) => `${record.planStartTime} - ${record.planEndTime}`,
    },
    {
      title: '主检人ID',
      dataIndex: 'mainInspectorId',
      key: 'mainInspectorId',
      width: 100,
    },
    {
      title: '检验地点',
      dataIndex: 'inspectionLocation',
      key: 'inspectionLocation',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ScheduleStatus) => {
        const info = statusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === 'scheduled' && (
            <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleStatusChange(record, 'in_progress')}>
              开始检验
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleStatusChange(record, 'completed')}>
              完成检验
            </Button>
          )}
          {(record.status === 'scheduled' || record.status === 'postponed') && (
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
        params.status = statusFilter as ScheduleStatus;
      }
      const result = await scheduleApi.getList(params);
      setData(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('获取排期列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Schedule) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      planDate: record.planDate ? dayjs(record.planDate) : undefined,
      planStartTime: record.planStartTime ? dayjs(record.planStartTime, 'HH:mm') : undefined,
      planEndTime: record.planEndTime ? dayjs(record.planEndTime, 'HH:mm') : undefined,
      actualDate: record.actualDate ? dayjs(record.actualDate) : undefined,
      actualStartTime: record.actualStartTime ? dayjs(record.actualStartTime, 'HH:mm') : undefined,
      actualEndTime: record.actualEndTime ? dayjs(record.actualEndTime, 'HH:mm') : undefined,
    });
    setModalVisible(true);
  };

  const handleView = (record: Schedule) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleStatusChange = async (record: Schedule, status: string) => {
    const confirmText = status === 'in_progress' ? '开始检验' : '完成检验';
    Modal.confirm({
      title: `确认${confirmText}`,
      content: `确定要${confirmText}吗？`,
      onOk: async () => {
        try {
          await scheduleApi.update(record.id!, { status: status as ScheduleStatus });
          message.success(`${confirmText}成功`);
          handleSearch();
        } catch (error) {
          console.error('状态更新失败:', error);
        }
      },
    });
  };

  const handleDelete = (record: Schedule) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除排期「${record.scheduleNo}」吗？`,
      onOk: async () => {
        try {
          await scheduleApi.delete(record.id);
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
        planDate: values.planDate ? (values.planDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        planStartTime: values.planStartTime ? (values.planStartTime as dayjs.Dayjs).format('HH:mm') : undefined,
        planEndTime: values.planEndTime ? (values.planEndTime as dayjs.Dayjs).format('HH:mm') : undefined,
        actualDate: values.actualDate ? (values.actualDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        actualStartTime: values.actualStartTime ? (values.actualStartTime as dayjs.Dayjs).format('HH:mm') : undefined,
        actualEndTime: values.actualEndTime ? (values.actualEndTime as dayjs.Dayjs).format('HH:mm') : undefined,
        inspectorIds: values.inspectorIds ? values.inspectorIds.join(',') : undefined,
      };
      if (currentRecord) {
        await scheduleApi.update(currentRecord.id!, submitData);
        message.success('更新成功');
      } else {
        await scheduleApi.create(submitData as Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>);
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
        <h2 className="text-xl font-bold">检验排期</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增排期
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg mb-4">
        <Space wrap>
          <Input
            placeholder="搜索排期编号/地点"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="选择状态"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
            options={[
              { value: 'scheduled', label: '已排期' },
              { value: 'in_progress', label: '进行中' },
              { value: 'completed', label: '已完成' },
              { value: 'cancelled', label: '已取消' },
              { value: 'postponed', label: '已延期' },
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
        title={currentRecord ? '编辑排期' : '新增排期'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="applyId" label="申请ID">
              <Select placeholder="请选择申请" options={applicationOptions} />
            </Form.Item>
            <Form.Item name="companyId" label="单位ID" rules={[{ required: true, message: '请选择单位' }]}>
              <Select placeholder="请选择单位" options={companyOptions} />
            </Form.Item>
            <Form.Item name="equipmentId" label="设备ID" rules={[{ required: true, message: '请选择设备' }]}>
              <Select placeholder="请选择设备" options={equipmentOptions} />
            </Form.Item>
            <Form.Item name="inspectionType" label="检验类型" rules={[{ required: true, message: '请输入检验类型' }]}>
              <Input placeholder="请输入检验类型" />
            </Form.Item>
            <Form.Item name="planDate" label="计划日期" rules={[{ required: true, message: '请选择计划日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="planStartTime" label="计划开始时间" rules={[{ required: true, message: '请选择计划开始时间' }]}>
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
            <Form.Item name="planEndTime" label="计划结束时间" rules={[{ required: true, message: '请选择计划结束时间' }]}>
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
            <Form.Item name="mainInspectorId" label="主检人ID" rules={[{ required: true, message: '请选择主检人' }]}>
              <Select placeholder="请选择主检人" options={inspectorOptions} />
            </Form.Item>
            <Form.Item name="inspectorIds" label="检验人员ID">
              <Select mode="multiple" placeholder="请选择检验人员" options={inspectorOptions} />
            </Form.Item>
            <Form.Item name="inspectionLocation" label="检验地点" rules={[{ required: true, message: '请输入检验地点' }]}>
              <Input placeholder="请输入检验地点" />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Select placeholder="请选择状态">
                <Select.Option value="scheduled">已排期</Select.Option>
                <Select.Option value="in_progress">进行中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
                <Select.Option value="cancelled">已取消</Select.Option>
                <Select.Option value="postponed">已延期</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="actualDate" label="实际日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="actualStartTime" label="实际开始时间">
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
            <Form.Item name="actualEndTime" label="实际结束时间">
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
            <Form.Item name="preparationItems" label="准备事项" className="col-span-2">
              <Input.TextArea rows={2} placeholder="请输入准备事项" />
            </Form.Item>
            <Form.Item name="cancelReason" label="取消原因" className="col-span-2">
              <Input.TextArea rows={2} placeholder="请输入取消原因" />
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

      <Modal title="排期详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={800}>
        {currentRecord && (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500">排期编号：</label>
                <span>{currentRecord.scheduleNo}</span>
              </div>
              <div>
                <label className="text-gray-500">申请ID：</label>
                <span>{currentRecord.applyId}</span>
              </div>
              <div>
                <label className="text-gray-500">单位ID：</label>
                <span>{currentRecord.companyId}</span>
              </div>
              <div>
                <label className="text-gray-500">设备ID：</label>
                <span>{currentRecord.equipmentId}</span>
              </div>
              <div>
                <label className="text-gray-500">检验类型：</label>
                <span>{currentRecord.inspectionType}</span>
              </div>
              <div>
                <label className="text-gray-500">状态：</label>
                <Tag color={statusMap[currentRecord.status].color}>{statusMap[currentRecord.status].text}</Tag>
              </div>
              <div>
                <label className="text-gray-500">计划日期：</label>
                <span>{currentRecord.planDate}</span>
              </div>
              <div>
                <label className="text-gray-500">计划时间：</label>
                <span>{currentRecord.planStartTime} - {currentRecord.planEndTime}</span>
              </div>
              {currentRecord.actualDate && (
                <>
                  <div>
                    <label className="text-gray-500">实际日期：</label>
                    <span>{currentRecord.actualDate}</span>
                  </div>
                  <div>
                    <label className="text-gray-500">实际时间：</label>
                    <span>{currentRecord.actualStartTime} - {currentRecord.actualEndTime}</span>
                  </div>
                </>
              )}
              <div>
                <label className="text-gray-500">主检人ID：</label>
                <span>{currentRecord.mainInspectorId}</span>
              </div>
              <div>
                <label className="text-gray-500">检验人员ID：</label>
                <span>{currentRecord.inspectorIds || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">检验地点：</label>
                <span>{currentRecord.inspectionLocation}</span>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">准备事项：</label>
                <span>{currentRecord.preparationItems || '-'}</span>
              </div>
              {currentRecord.cancelReason && (
                <div className="col-span-2">
                  <label className="text-gray-500">取消原因：</label>
                  <span>{currentRecord.cancelReason}</span>
                </div>
              )}
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

export default SchedulePage;
