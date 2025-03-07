import React from "react";
import { OrderStatus, OrderStatusMap } from "@/_utils/orderUtils";

interface OrderTabsProps {
  activeTab: 0 | 1 | 2 | 3 | 4 | "all";
  setActiveTab: (tab: 0 | 1 | 2 | 3 | 4 | "all") => void;
}

type Tab = { id: 0 | 1 | 2 | 3 | 4 | "all"; label: string };

const OrderTabs: React.FC<OrderTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs: Tab[] = [
    { id: "all", label: "全部" },
    ...Object.entries(OrderStatusMap).map(([status, label]) => ({
      id: Number(status) as 0 | 1 | 2 | 3 | 4,
      label,
    })),
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {tabs.map((tab) => (
          <button
            key={String(tab.id)}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-6 text-sm font-medium ${activeTab === tab.id
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
