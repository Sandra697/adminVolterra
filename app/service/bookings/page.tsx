import { Suspense } from 'react'; // Import Suspense
import { BookingsList } from "@/components/bookinglist";
import { getAllServiceBookings } from "@/lib/service-actions";

// Define a loading component (or import one) to show as a fallback
function BookingsLoadingFallback() {
  // You can make this more sophisticated, e.g., a skeleton loader
  return <div>Loading service bookings...</div>;
}

// Define the component that fetches and displays the data
// This needs to be separate to be wrapped by Suspense correctly
// because the await happens *before* rendering BookingsList
async function BookingData() {
  const bookings = await getAllServiceBookings();
  return <BookingsList bookings={bookings} />;
}


export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem] font-bold tracking-tight">Service Bookings</h1>
    
      <Suspense fallback={<BookingsLoadingFallback />}>
      
        <BookingData />
      </Suspense>
    </div>
  );
}