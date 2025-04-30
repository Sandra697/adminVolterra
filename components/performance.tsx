import { useState, useEffect, JSX } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

// Type definitions
interface CarListing {
  id?: string;
  status: string;
  sellingPrice?: number;
}

interface Service {
  name: string;
}

interface ServiceBooking {
  id?: string;
  service: Service;
}

interface BusinessData {
  sellListings: CarListing[];
  serviceBookings: ServiceBooking[];
}

interface CarChartData {
  name: string;
  value: number;
}

interface ServiceChartData {
  name: string;
  bookings: number;
}

interface SummaryStats {
  totalCars: number;
  soldCars: number;
  totalBookings: number;
  revenue: number;
}

interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  name: string;
  value: number;
}

const BusinessPerformanceDashboard = (): JSX.Element => {
  const [carData, setCarData] = useState<CarChartData[] | null>(null);
  const [serviceData, setServiceData] = useState<ServiceChartData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalCars: 0,
    soldCars: 0,
    totalBookings: 0,
    revenue: 0,
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Fetch car and service booking data
        const response = await fetch('/api/business-performance');
        
        if (!response.ok) {
          throw new Error('Failed to fetch business data');
        }
        
        const data: BusinessData = await response.json();
        
        // Process car data for pie chart
        const carStatusData: CarChartData[] = [
          { name: 'Sold', value: data.sellListings.filter(listing => listing.status === 'SOLD').length },
          { name: 'Unsold', value: data.sellListings.filter(listing => listing.status !== 'SOLD').length }
        ];
        
        // Process service bookings data
        const serviceGroups: Record<string, number> = {};
        data.serviceBookings.forEach(booking => {
          const serviceName = booking.service.name;
          if (!serviceGroups[serviceName]) {
            serviceGroups[serviceName] = 0;
          }
          serviceGroups[serviceName]++;
        });
        
        const serviceChartData: ServiceChartData[] = Object.keys(serviceGroups).map(name => ({
          name,
          bookings: serviceGroups[name]
        }));
        
        // Calculate summary statistics
        const totalCars = data.sellListings.length;
        const soldCars = data.sellListings.filter(listing => listing.status === 'SOLD').length;
        const totalBookings = data.serviceBookings.length;
        
        // Estimate revenue (assuming we have price data)
        let estimatedRevenue = 0;
        data.sellListings.forEach(listing => {
          if (listing.status === 'SOLD') {
            estimatedRevenue += listing.sellingPrice || 0;
          }
        });
        
        setSummaryStats({
          totalCars,
          soldCars,
          totalBookings,
          revenue: estimatedRevenue
        });
        
        setCarData(carStatusData);
        setServiceData(serviceChartData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching business data:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
    value
  }: CustomizedLabelProps): JSX.Element => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={COLORS[index % COLORS.length]} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-lg shadow">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading business data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Failed to load data</h3>
          <p className="mt-2 text-red-700">{error}</p>
          <p className="mt-1 text-[0.75rem] text-red-600">Please check your API connection or try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg text-xs font-medium text-gray shadow">
      <div className="p-4 border-b">
        <h1 className="text-lg font-semibold">Business Performance Dashboard</h1>
        <p className="text-[0.75rem] text-gray-500 mt-1">Overview of vehicle sales and service bookings</p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div className="bg-amber-50 p-4 rounded-lg">
          <p className="text-[0.75rem] text-gray-500">Total Listings</p>
          <p className="text-2xl font-bold">{summaryStats.totalCars}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-[0.75rem] text-gray-500">Cars Sold</p>
          <p className="text-2xl font-bold">{summaryStats.soldCars}</p>
          <p className="text-[0.75rem] text-gray-500">
            {summaryStats.totalCars > 0 ? 
              `(${(summaryStats.soldCars / summaryStats.totalCars * 100).toFixed(1)}%)` : 
              '(0%)'}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-[0.75rem] text-gray-500">Service Bookings</p>
          <p className="text-2xl font-bold">{summaryStats.totalBookings}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-[0.75rem] text-gray-500">Sales Revenue</p>
          <p className="text-2xl font-bold">Kes: {summaryStats.revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* Car sales pie chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-md font-medium mb-4">Car Sales Status</h2>
          <div className="h-64">
            {carData && carData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {carData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Number of cars']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No car data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Service bookings chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-md font-medium mb-4">Service Bookings Distribution</h2>
          <div className="h-64">
            {serviceData && serviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serviceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" fill="#8884d8" name="Number of Bookings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No service data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPerformanceDashboard;