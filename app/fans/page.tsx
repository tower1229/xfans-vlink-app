"use client";

import { useState } from "react";
import DashboardLayout from "../dashboard-layout";

export default function Fans() {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample fans data
  const fansData = [
    {
      id: 1,
      name: "Zhang Wei",
      email: "zhang.wei@example.com",
      joinDate: "2023-01-15",
      totalSpent: "¥1,299.00",
      status: "active",
      tier: "premium",
    },
    {
      id: 2,
      name: "Li Na",
      email: "li.na@example.com",
      joinDate: "2023-02-20",
      totalSpent: "¥849.50",
      status: "active",
      tier: "standard",
    },
    {
      id: 3,
      name: "Wang Fei",
      email: "wang.fei@example.com",
      joinDate: "2023-01-05",
      totalSpent: "¥2,499.00",
      status: "active",
      tier: "premium",
    },
    {
      id: 4,
      name: "Chen Jie",
      email: "chen.jie@example.com",
      joinDate: "2023-03-10",
      totalSpent: "¥379.99",
      status: "inactive",
      tier: "standard",
    },
    {
      id: 5,
      name: "Liu Yang",
      email: "liu.yang@example.com",
      joinDate: "2023-02-01",
      totalSpent: "¥1,199.00",
      status: "active",
      tier: "premium",
    },
    {
      id: 6,
      name: "Zhao Min",
      email: "zhao.min@example.com",
      joinDate: "2023-03-25",
      totalSpent: "¥549.00",
      status: "active",
      tier: "standard",
    },
    {
      id: 7,
      name: "Sun Ling",
      email: "sun.ling@example.com",
      joinDate: "2023-01-30",
      totalSpent: "¥729.00",
      status: "inactive",
      tier: "standard",
    },
    {
      id: 8,
      name: "Wu Hao",
      email: "wu.hao@example.com",
      joinDate: "2023-02-15",
      totalSpent: "¥1,899.00",
      status: "active",
      tier: "premium",
    },
  ];

  const filteredFans = searchTerm
    ? fansData.filter(
        (fan) =>
          fan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fan.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : fansData;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "standard":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium text-gray-800">
                Fans Management
              </h3>
              <p className="text-sm text-gray-500">
                {filteredFans.length} fans total
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search fans..."
                  className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchTerm("")}
                  >
                    ✕
                  </button>
                )}
              </div>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Add New Fan
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFans.map((fan) => (
                <tr key={fan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {fan.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {fan.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fan.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fan.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fan.totalSpent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(
                        fan.status
                      )}`}
                    >
                      {fan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getTierBadge(
                        fan.tier
                      )}`}
                    >
                      {fan.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredFans.length}</span>{" "}
              of <span className="font-medium">{fansData.length}</span> fans
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
