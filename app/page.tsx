import DashboardLayout from "./dashboard-layout";

export default function Home() {
  // Sample dashboard data
  const stats = [
    { name: "Total Orders", value: "1,234" },
    { name: "Total Revenue", value: "¥123,456" },
    { name: "Active Fans", value: "567" },
    { name: "Content Items", value: "89" },
  ];

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Recent Orders
          </h3>
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
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      ORD-{1000 + i}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      Customer {i}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      ¥{(Math.random() * 1000).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Popular Content
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0"></div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Content Title {i}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {(Math.random() * 1000).toFixed(0)} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
