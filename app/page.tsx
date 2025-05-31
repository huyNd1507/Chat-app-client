"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="max-w-2xl w-full space-y-6">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
            Welcome to Chat App
          </h1>
          <p className="text-lg text-center text-gray-600 dark:text-gray-300">
            Connect with friends and colleagues in real-time
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Start Chatting
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Begin conversations with your contacts instantly
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Stay Connected
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Keep in touch with your network anytime, anywhere
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
