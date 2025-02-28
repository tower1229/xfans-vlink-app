import { withAPI } from "../../middleware";
import { initDatabaseController } from "../../controllers";

// 初始化数据库
export const GET = withAPI(initDatabaseController);
