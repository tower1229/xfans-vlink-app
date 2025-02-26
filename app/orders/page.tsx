"use client";

import { useState } from "react";
import DashboardLayout from "../dashboard-layout";

export default function Orders() {
  const [activeTab, setActiveTab] = useState("all");

  // Sample orders data
  const orders = [
    {
      id: "ORD-1001",
      customer: "Zhang Wei",
      date: "2023-05-15",
      total: "¥299.00",
      status: "completed",
      items: 2,
    },
    {
      id: "ORD-1002",
      customer: "Li Na",
      date: "2023-05-14",
      total: "¥149.50",
      status: "processing",
      items: 1,
    },
    {
      id: "ORD-1003",
      customer: "Wang Fei",
      date: "2023-05-14",
      total: "¥499.00",
      status: "completed",
      items: 3,
    },
    {
      id: "ORD-1004",
      customer: "Chen Jie",
      date: "2023-05-13",
      total: "¥79.99",
      status: "completed",
      items: 1,
    },
    {
      id: "ORD-1005",
      customer: "Liu Yang",
      date: "2023-05-12",
      total: "¥199.00",
      status: "cancelled",
      items: 2,
    },
    {
      id: "ORD-1006",
      customer: "Zhao Min",
      date: "2023-05-11",
      total: "¥349.00",
      status: "processing",
      items: 2,
    },
    {
      id: "ORD-1007",
      customer: "Sun Ling",
      date: "2023-05-10",
      total: "¥129.00",
      status: "completed",
      items: 1,
    },
    {
      id: "ORD-1008",
      customer: "Wu Hao",
      date: "2023-05-09",
      total: "¥599.00",
      status: "refunded",
      items: 4,
    },
  ];

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "all"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "completed"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab("processing")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "processing"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "cancelled"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Cancelled
            </button>
            <button
              onClick={() => setActiveTab("refunded")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "refunded"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Refunded
            </button>
          </nav>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">
                {activeTab === "all"
                  ? "All Orders"
                  : `${
                      activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                    } Orders`}
              </h3>
              <p className="text-sm text-gray-500">
                {filteredOrders.length} orders
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50">
                Export
              </button>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Create Order
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {order.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {order.total}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
