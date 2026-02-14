export async function loadItinerary() {
    const response = await fetch("/JSON/trips.json"); 
    
    const text = await response.text(); 

    const trips = JSON.parse(text); 
    // 
    return trips;
}

export const trips = await loadItinerary();








