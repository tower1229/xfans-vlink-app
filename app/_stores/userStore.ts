"use client";

import { makeAutoObservable, runInAction } from "mobx";
import { fetchUserInfo } from "@/_actions/authActions";
import { User } from "@/_types/user";
class UserStore {
  user: User | null = null;
  loading: boolean = false;
  initialized: boolean = false;
  error: string | null = null;
  // 添加一个标志来跟踪初始化请求是否正在进行
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true });

    // 如果在客户端环境，尝试从 localStorage 恢复用户状态
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser);
        } catch (e) {
          console.error("Failed to parse saved user data", e);
        }
      }
    }
  }

  // 初始化用户信息
  async initUser() {
    // 如果已经初始化过，则不再重复获取
    if (this.initialized) return;

    // 如果已经有一个初始化请求在进行中，直接返回该 Promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // 创建新的初始化请求
    this.loading = true;
    this.error = null;

    // 保存初始化 Promise 以便去重
    this.initializationPromise = (async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          runInAction(() => {
            this.loading = false;
            this.initialized = true;
          });
          return;
        }

        console.log("Fetching user info from API...");
        const { data } = await fetchUserInfo();

        runInAction(() => {
          this.user = data;
          // 保存用户信息到 localStorage
          localStorage.setItem("user", JSON.stringify(data));
          this.initialized = true;
        });
      } catch (error) {
        runInAction(() => {
          this.error = error instanceof Error ? error.message : "Unknown error";
          this.initialized = true;
        });
      } finally {
        runInAction(() => {
          this.loading = false;
          // 请求完成后，清除 Promise 引用
          this.initializationPromise = null;
        });
      }
    })();

    return this.initializationPromise;
  }

  // 设置用户信息
  setUser(user: User | null) {
    this.user = user;
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    this.initialized = true;
  }

  // 更新用户信息
  updateUser(userData: Partial<User>) {
    if (this.user) {
      this.user = { ...this.user, ...userData };
      localStorage.setItem("user", JSON.stringify(this.user));
    }
  }

  // 清除用户信息
  clearUser() {
    this.user = null;
    localStorage.removeItem("user");
  }

  // 登出
  logout() {
    this.clearUser();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    this.initialized = false;
  }
}

// 创建单例实例
const userStore = new UserStore();

export default userStore;
