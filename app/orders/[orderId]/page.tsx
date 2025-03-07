"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/(core)/dashboard-layout";
import { getOrderById } from "@/_actions/orderActions";
import { Order, OrderStatus, OrderStatusMap } from "@/_types/order";

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // 获取订单详情
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error("获取订单详情失败:", err);
        setError(err instanceof Error ? err.message : "未知错误");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  // 获取状态样式类名
  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return "badge badge-success";
      case OrderStatus.PENDING:
        return "badge badge-warning";
      case OrderStatus.EXPIRED:
        return "badge badge-error";
      default:
        return "badge";
    }
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // 翻译状态
  const translateStatus = (status: OrderStatus) => {
    return OrderStatusMap[status];
  };

  return (
    <DashboardLayout>
      <div className="card bg-base-100">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title">订单详情</h2>
            <button
              onClick={() => router.back()}
              className="btn btn-ghost btn-sm"
            >
              返回订单列表
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-bold">获取订单失败</h3>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          ) : order ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* 订单基本信息 */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">订单信息</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm opacity-70">订单编号</div>
                      <div className="font-medium">{order.id}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-70">订单状态</div>
                      <div className={getStatusClass(order.status)}>
                        {translateStatus(order.status)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm opacity-70">创建时间</div>
                      <div className="font-medium">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm opacity-70">订单金额</div>
                      <div className="font-medium">
                        {order.amount.toString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 内容信息 */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">内容信息</h3>
                  <div className="space-y-4">
                    {order.post && (
                      <>
                        <div>
                          <div className="text-sm opacity-70">内容标题</div>
                          <div className="font-medium">{order.post.title}</div>
                        </div>
                        <div>
                          <div className="text-sm opacity-70">内容价格</div>
                          <div className="font-medium">
                            {order.post.price.toString()}
                          </div>
                        </div>
                      </>
                    )}
                    {order.user && (
                      <div>
                        <div className="text-sm opacity-70">用户信息</div>
                        <div className="font-medium">
                          {order.user.username} ({order.user.walletAddress})
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
