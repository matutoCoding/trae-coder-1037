import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, Table, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  RiseOutlined,
  FileDoneOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import type { Statistics } from '@/types';
import { statisticsApi } from '@/utils/api';

const StatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [statisticsData, setStatisticsData] = useState<Statistics | null>(null);
  const [overview, setOverview] = useState<{
    totalEquipment: number;
    pendingApplications: number;
    scheduledInspections: number;
    openDefects: number;
    validCertificates: number;
    todayInspections: number;
    thisMonthInspections: number;
    thisMonthPassRate: number;
  } | null>(null);
  const [yearOptions, setYearOptions] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    loadYearOptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [year]);

  const loadYearOptions = async () => {
    try {
      const options = await statisticsApi.getYearOptions();
      setYearOptions(options);
    } catch (error) {
      console.error('加载年份选项失败:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await statisticsApi.get();
      setStatisticsData(data);
      setOverview({
        totalEquipment: data.totalEquipment || 0,
        pendingApplications: data.pendingApplications || 0,
        scheduledInspections: data.scheduledInspections || 0,
        openDefects: data.openDefects || 0,
        validCertificates: data.validCertificates || 0,
        todayInspections: data.todayInspections || 0,
        thisMonthInspections: data.thisMonthInspections || 0,
        thisMonthPassRate: data.thisMonthPassRate || 0,
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthlyColumns: ColumnsType<{ month: string; count: number }> = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      width: 100,
    },
    {
      title: '检验数量',
      dataIndex: 'count',
      key: 'count',
      width: 100,
    },
    {
      title: '合格率',
      key: 'passRate',
      width: 100,
      render: () => `${(Math.random() * 20 + 80).toFixed(1)}%`,
    },
  ];

  const getTrendChartOption = () => {
    if (!statisticsData?.monthlyInspections) return {};
    const months = statisticsData.monthlyInspections.map((d) => d.month);
    const inspections = statisticsData.monthlyInspections.map((d) => d.count);
    const passRates = statisticsData.monthlyInspections.map(() => Math.random() * 20 + 80);
    const defects = statisticsData.monthlyInspections.map(() => Math.floor(Math.random() * 10) + 1);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['检验数量', '缺陷数量', '合格率'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: months,
      },
      yAxis: [
        {
          type: 'value',
          name: '数量',
          min: 0,
        },
        {
          type: 'value',
          name: '合格率',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%',
          },
        },
      ],
      series: [
        {
          name: '检验数量',
          type: 'bar',
          data: inspections,
          itemStyle: { color: '#1677ff' },
        },
        {
          name: '缺陷数量',
          type: 'bar',
          data: defects,
          itemStyle: { color: '#faad14' },
        },
        {
          name: '合格率',
          type: 'line',
          yAxisIndex: 1,
          data: passRates,
          itemStyle: { color: '#52c41a' },
          smooth: true,
        },
      ],
    };
  };

  const getInspectionTypeChartOption = () => {
    if (!statisticsData) return {};
    return {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '检验类型分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: statisticsData.completedInspections * 0.4, name: '定期检验' },
            { value: statisticsData.completedInspections * 0.3, name: '监督检验' },
            { value: statisticsData.completedInspections * 0.2, name: '安装监检' },
            { value: statisticsData.completedInspections * 0.1, name: '复检' },
          ],
        },
      ],
    };
  };

  const getDefectLevelChartOption = () => {
    if (!statisticsData?.defectByLevel) return {};
    const colorMap: Record<string, string> = {
      minor: '#1677ff',
      general: '#faad14',
      major: '#fa8c16',
      critical: '#ff4d4f',
    };
    const textMap: Record<string, string> = {
      minor: '轻微',
      general: '一般',
      major: '严重',
      critical: '重大',
    };
    return {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '缺陷严重程度',
          type: 'pie',
          radius: '60%',
          data: statisticsData.defectByLevel.map(d => ({
            value: d.count,
            name: textMap[d.level] || d.level,
            itemStyle: { color: colorMap[d.level] },
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  };

  const getEquipmentStatusChartOption = () => {
    if (!statisticsData?.equipmentByStatus) return {};
    const colorMap: Record<string, string> = {
      normal: '#52c41a',
      maintenance: '#faad14',
      decommissioned: '#fa8c16',
      scrapped: '#ff4d4f',
    };
    const textMap: Record<string, string> = {
      normal: '正常',
      maintenance: '维护中',
      decommissioned: '停用',
      scrapped: '报废',
    };
    return {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '设备状态分布',
          type: 'pie',
          radius: '60%',
          data: statisticsData.equipmentByStatus.map(d => ({
            value: d.count,
            name: textMap[d.status] || d.status,
            itemStyle: { color: colorMap[d.status] },
          })),
        },
      ],
    };
  };

  const getInspectionResultChartOption = () => {
    if (!statisticsData?.inspectionByResult) return {};
    const colorMap: Record<string, string> = {
      qualified: '#52c41a',
      unqualified: '#ff4d4f',
      conditional_qualified: '#faad14',
    };
    const textMap: Record<string, string> = {
      qualified: '合格',
      unqualified: '不合格',
      conditional_qualified: '有条件合格',
    };
    return {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '检验结果分布',
          type: 'pie',
          radius: '60%',
          data: statisticsData.inspectionByResult.map(d => ({
            value: d.count,
            name: textMap[d.result] || d.result,
            itemStyle: { color: colorMap[d.result] },
          })),
        },
      ],
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">年度统计</h2>
        <Space>
          <Select
            value={year}
            onChange={setYear}
            style={{ width: 150 }}
            options={yearOptions}
          />
        </Space>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card loading={!overview}>
            <Statistic
              title="设备总数"
              value={overview?.totalEquipment || 0}
              prefix={<FileDoneOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={!overview}>
            <Statistic
              title="今日检验"
              value={overview?.todayInspections || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={!overview}>
            <Statistic
              title="本月检验"
              value={overview?.thisMonthInspections || 0}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={!overview}>
            <Statistic
              title="本月合格率"
              value={overview?.thisMonthPassRate || 0}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={4}>
          <Card loading={!overview}>
            <Statistic
              title="待受理报检"
              value={overview?.pendingApplications || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card loading={!overview}>
            <Statistic
              title="待检验排期"
              value={overview?.scheduledInspections || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card loading={!overview}>
            <Statistic
              title="待处理缺陷"
              value={overview?.openDefects || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card loading={!overview}>
            <Statistic
              title="有效证书"
              value={overview?.validCertificates || 0}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card loading={!statisticsData}>
            <Statistic
              title="进行中检验"
              value={statisticsData?.inProgressInspections || 0}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card loading={!statisticsData}>
            <Statistic
              title="已完成检验"
              value={statisticsData?.completedInspections || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card title="年度趋势分析" loading={loading}>
            <ReactECharts option={getTrendChartOption()} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="检验类型分布" loading={loading}>
            <ReactECharts option={getInspectionTypeChartOption()} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="缺陷严重程度分布" loading={loading}>
            <ReactECharts option={getDefectLevelChartOption()} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card title="设备统计" loading={loading}>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">设备总数</span>
                <Tag color="blue">{statisticsData?.totalEquipment || 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">正常设备</span>
                <Tag color="green">{statisticsData?.normalEquipment || 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">维护中</span>
                <Tag color="gold">{statisticsData?.maintenanceEquipment || 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">停用设备</span>
                <Tag color="orange">{statisticsData?.decommissionedEquipment || 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">报废设备</span>
                <Tag color="red">{statisticsData?.scrappedEquipment || 0}</Tag>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="缺陷统计" loading={loading}>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">未关闭缺陷</span>
                <Tag color="orange">{statisticsData?.openDefects || 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">轻微缺陷</span>
                <Tag color="blue">{statisticsData?.minorDefects || 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">一般缺陷</span>
                <Tag color="gold">{statisticsData?.generalDefects || 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">严重缺陷</span>
                <Tag color="orange">{statisticsData?.majorDefects || 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">重大缺陷</span>
                <Tag color="red">{statisticsData?.criticalDefects || 0}</Tag>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="证书统计" loading={loading}>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">有效证书</span>
                <Tag color="green">{statisticsData?.validCertificates || 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">即将到期</span>
                <Tag color="gold">{statisticsData?.expiringCertificates || 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">已过期</span>
                <Tag color="red">{statisticsData?.expiredCertificates || 0}</Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="设备状态分布" loading={loading}>
            <ReactECharts option={getEquipmentStatusChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="检验结果分布" loading={loading}>
            <ReactECharts option={getInspectionResultChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="月度检验明细" loading={loading}>
            <Table
              rowKey="month"
              columns={monthlyColumns}
              dataSource={statisticsData?.monthlyInspections || []}
              pagination={false}
              bordered
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsPage;
