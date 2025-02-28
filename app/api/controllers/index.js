// 导出产品控制器
export {
  getAllProductsController,
  getProductByIdController,
  createProductController,
  updateProductController,
  deleteProductController,
} from "./productController";

// 导出订单控制器
export {
  createOrderController,
  getOrderByIdController,
  updateOrderStatusController,
  getUserOrdersController,
} from "./orderController";

// 导出数据库控制器
export { initDatabaseController } from "./dbController";
