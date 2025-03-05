import React from "react";

interface OrderTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const OrderTabs: React.FC<OrderTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "all", label: "全部" },
    { id: "pending", label: "待支付" },
    { id: "completed", label: "已完成" },
    { id: "closed", label: "已关闭" },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OrderTabs;
