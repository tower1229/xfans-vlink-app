"use client";

import { useState } from "react";
import DashboardLayout from "../dashboard-layout";

export default function Contents() {
  const [activeTab, setActiveTab] = useState("all");

  // Sample content data
  const contentItems = [
    {
      id: 1,
      title: "Premium Video Course",
      type: "video",
      status: "published",
      price: "¥99.00",
      sales: 120,
    },
    {
      id: 2,
      title: "Exclusive E-Book Bundle",
      type: "ebook",
      status: "published",
      price: "¥49.00",
      sales: 85,
    },
    {
      id: 3,
      title: "Monthly Subscription",
      type: "subscription",
      status: "published",
      price: "¥29.99/mo",
      sales: 210,
    },
    {
      id: 4,
      title: "Special Access Webinar",
      type: "webinar",
      status: "draft",
      price: "¥199.00",
      sales: 0,
    },
    {
      id: 5,
      title: "Digital Art Collection",
      type: "digital",
      status: "published",
      price: "¥149.00",
      sales: 42,
    },
    {
      id: 6,
      title: "Upcoming Tutorial Series",
      type: "video",
      status: "draft",
      price: "¥79.00",
      sales: 0,
    },
  ];

  const filteredContent =
    activeTab === "all"
      ? contentItems
      : contentItems.filter((item) => item.status === activeTab);

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
              All Content
            </button>
            <button
              onClick={() => setActiveTab("published")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "published"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setActiveTab("draft")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "draft"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Drafts
            </button>
          </nav>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">
                {activeTab === "all"
                  ? "All Content"
                  : activeTab === "published"
                  ? "Published Content"
                  : "Draft Content"}
              </h3>
              <p className="text-sm text-gray-500">
                {filteredContent.length} items
              </p>
            </div>
            <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              Add New Content
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContent.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {item.type}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.price}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sales}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
