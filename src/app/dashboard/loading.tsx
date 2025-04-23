import React from "react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f1f8f9] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#18515b] animate-pulse">
            Loading Dashboard...
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md h-[400px] animate-pulse"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    <div className="h-3 w-40 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                  <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100">
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
