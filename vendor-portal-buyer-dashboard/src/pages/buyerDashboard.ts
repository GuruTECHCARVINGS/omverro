import React from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import KpiDonut from '../components/tiles/KpiDonut';
import StatCard from '../components/tiles/StatCard';
import SpendByCategory from '../components/tiles/SpendByCategory';
import PerformanceTrends from '../components/tiles/PerformanceTrends';
import VendorScorecard from '../components/tiles/VendorScorecard';
import DataTable from '../components/tiles/DataTable';
import ActivityFeed from '../components/tiles/ActivityFeed';
import Announcements from '../components/tiles/Announcements';
import AlertsPanel from '../components/tiles/AlertsPanel';
import TasksPanel from '../components/tiles/TasksPanel';
import QuickActions from '../components/tiles/QuickActions';
import { useEffect, useState } from 'react';
import { fetchData } from '../utils/api';

const BuyerDashboard = () => {
  const [data, setData] = useState({
    purchaseOrders: [],
    pendingApprovals: [],
    spendByCategory: [],
    performanceTrends: [],
    vendorScorecard: [],
    announcements: [],
    alerts: [],
    tasks: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const purchaseOrders = await fetchData('/data/purchaseOrders.json');
      const pendingApprovals = await fetchData('/data/pendingApprovals.json');
      const spendByCategory = await fetchData('/data/spendByCategory.json');
      const performanceTrends = await fetchData('/data/spendTrend.json');
      const vendorScorecard = await fetchData('/data/scorecard.json');
      const announcements = await fetchData('/data/announcements.json');
      const alerts = await fetchData('/data/alerts.json');
      const tasks = await fetchData('/data/tasks.json');

      setData({
        purchaseOrders,
        pendingApprovals,
        spendByCategory,
        performanceTrends,
        vendorScorecard,
        announcements,
        alerts,
        tasks,
      });
    };

    loadData();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total Spend" value={`Rs ${data.purchaseOrders.reduce((acc, order) => acc + order.amount, 0)}`} />
          <StatCard title="Pending Approvals" value={data.pendingApprovals.length} />
          <StatCard title="Open Inquiries" value={data.inquiries.length} />
          <StatCard title="Total Vendors" value={data.vendors.length} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <KpiDonut data={data.purchaseOrders} />
          <SpendByCategory data={data.spendByCategory} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PerformanceTrends data={data.performanceTrends} />
          <VendorScorecard data={data.vendorScorecard} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DataTable data={data.purchaseOrders} />
          <ActivityFeed data={data.activityFeed} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Announcements data={data.announcements} />
          <AlertsPanel data={data.alerts} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TasksPanel data={data.tasks} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;