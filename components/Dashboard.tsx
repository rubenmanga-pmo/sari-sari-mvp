'use client';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Today&apos;s Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="text-3xl font-bold text-green-600">₱2,450</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Credit</p>
            <p className="text-3xl font-bold text-orange-600">₱18,200</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="font-semibold mb-3">Low Stock Alerts</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl text-red-600">
            <span>Coke 500ml</span>
            <span className="font-medium">5 left</span>
          </div>
        </div>
      </div>
    </div>
  );
}
