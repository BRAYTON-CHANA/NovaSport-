import React, { useState } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import Datepicker from '../components/Datepicker';
import DashboardCard01 from '../partials/dashboard/DashboardCard01';
import DashboardCard02 from '../partials/dashboard/DashboardCard02';
import DashboardCard03 from '../partials/dashboard/DashboardCard03';

function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [date, setDate] = useState({ from: null, to: null });

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Dashboard Financiero</h1>
              </div>
              
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <Datepicker date={date} onSelect={setDate} />
              </div>
            </div>

            {/* --- NUEVO LAYOUT DEL GRID -- */}
            <div className="grid grid-cols-12 gap-6">
              {/* Card 01 ahora ocupa todo el ancho */}
              <DashboardCard01 dateRange={date} />
              
              {/* Card 02 y 03 se sientan debajo */}
              <DashboardCard02 dateRange={date} />
              <DashboardCard03 dateRange={date} />
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}

export default Dashboard;
