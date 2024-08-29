import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DataProvider() {
  const [data, setData] = useState([]); // Initialize data state as an empty array
  const [error, setError] = useState(null); // Initialize error state
  const [loading, setLoading] = useState(true); // Initialize loading state

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:3001/data'); 
        setData(response.data); 
      } catch (error) {
        setError('Error fetching data'); 
        console.error('Error fetching data:', error); 
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>; 
  if (error) return <p>{error}</p>; 

  return (
    <div>
      <h1>Data from PostgreSQL:</h1>
      <ul>
        {data.length > 0 ? (
          data.map((item, index) => (
            <li key={index}>{item.name}</li> 
          ))
        ) : (
          <p>No data available.</p> 
        )}
      </ul>
    </div>
  );
}

export default DataProvider;
