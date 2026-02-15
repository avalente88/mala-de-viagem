export async function loadItinerary() {
    const response = await fetch("/JSON/trips.json"); 
    
    const text = await response.text(); 

    const trips = JSON.parse(text); 
    // 
    return trips;
}

export const trips = await loadItinerary();

export async function loadHotels() {
    const responseHotels = await fetch("/JSON/hotels.json"); 
    
    const textHotels = await responseHotels.text(); 

    const hotels = JSON.parse(textHotels); 
    // 
    return hotels;
}

export const hotels = await loadHotels();








