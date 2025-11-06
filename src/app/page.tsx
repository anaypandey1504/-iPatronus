import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-lg w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">Doctor–Patient Consultation</h1>
        <p className="text-gray-600">Select a dashboard to get started</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/patient"
            className="block w-full rounded-lg bg-blue-600 text-white py-3 font-medium hover:bg-blue-700"
          >
            Patient Dashboard
          </Link>
          <Link
            href="/doctor"
            className="block w-full rounded-lg bg-green-600 text-white py-3 font-medium hover:bg-green-700"
          >
            Doctor Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
