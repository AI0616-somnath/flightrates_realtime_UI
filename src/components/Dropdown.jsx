import { useEffect, useState } from 'react';

function Dropdown() {
  const [airportData, setAirportData] = useState([]);
  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        console.log('JWT token not found in session. Please login to fetch data.');
        return;
      }
      const response = await fetch('https://flightrates-api.aggregateintelligence.com/api/v1/references/airports', {
        headers: {
          'Authorization': `Bearer ${token}` // Add JWT token to the Authorization header
        }
      })
      const jsonData = await response.json();
      console.log(jsonData)
      setAirportData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const fetchedToken = sessionStorage.getItem('Authorization');
    if (fetchedToken) {
      fetchData();
    }
  }, [])
  return (
    <div className='d-flex flex-column'>
      <label>
        Select Airports
      </label>
      <select>
        {airportData?.airports?.map((airport) => (<option value={airport._id} key={airport._id}>{airport.airportName}</option>))}
      </select>
    </div>
  )
}
export default Dropdown