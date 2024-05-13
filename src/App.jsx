import { useEffect, useState } from 'react';
import { Card, Form, Spinner } from 'react-bootstrap'; // Import React Bootstrap components
import source from './assets/carriers_flightrates.json';
const App = () => {
  //const [token, setToken] = useState(null);
  const [airportData, setAirportData] = useState([]);
  const [cabinClass, setCabinClass] = useState([]);
  const [posValue, setposValue] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [shopId, setShopId] = useState(null);
  const [status, setStatus] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeoutRef, setTimeoutRef] = useState(null);
  const [loginData, setLoginData] = useState({
    handle: '',
    password: '',
  });
  const [formData, setFormData] = useState({
    flyFrom: '',
    flyTo: '',
    cabinClass: '',
    _pos: '',
    _currency: '',
    _carriers: [],
  });
  const [elapsedTime, setElapsedTime] = useState(0);

  const startTimer = () => {
    setElapsedTime((prevTime) => prevTime + 5);
  };
  const loginAndFetchData = async () => {
    try {
      const response = await fetch(
        'https://flightrates-api.aggregateintelligence.com/api/v1/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            handle: loginData.email,
            password: loginData.password,
          }),
        }
      );
      const jsonData = await response.json();
      if (jsonData.token) {
        //setToken(jsonData.token);
        sessionStorage.setItem('Authorization', jsonData.token);
        setLoggedIn(true);
      } else {
        console.error('Token not found in response');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        console.log(
          'JWT token not found in session. Please login to fetch data.'
        );
        return;
      }
      const response = await fetch(
        'https://flightrates-api.aggregateintelligence.com/api/v1/references/airports',
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT token to the Authorization header
          },
        }
      );
      const jsonData = await response.json();
      setAirportData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchCabinClasses = async () => {
    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        console.log(
          'JWT token not found in session. Please login to fetch data.'
        );
        return;
      }
      const response = await fetch(
        'https://flightrates-api.aggregateintelligence.com/api/v1/references/cabinclasses',
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT token to the Authorization header
          },
        }
      );
      const jsonData = await response.json();
      setCabinClass(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchPosData = async () => {
    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        console.log(
          'JWT token not found in session. Please login to fetch data.'
        );
        return;
      }
      const response = await fetch(
        ' https://flightrates-api.aggregateintelligence.com/api/v1/references/poses',
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT token to the Authorization header
          },
        }
      );
      const jsonData = await response.json();
      setposValue(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchCurrency = async () => {
    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        console.log(
          'JWT token not found in session. Please login to fetch data.'
        );
        return;
      }
      const response = await fetch(
        ' https://flightrates-api.aggregateintelligence.com/api/v1/references/currencies',
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT token to the Authorization header
          },
        }
      );
      const jsonData = await response.json();
      setCurrency(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  // fetchPosData();
  // useEffect(() => {
  //   loginAndFetchData();
  // }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchData();
      fetchCabinClasses();
      fetchPosData();
      fetchCurrency();
    }
  }, [loggedIn]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setShowStatus(true);
    setSubmitting(true);
    const dynamicData = {
      _OD: [
        {
          _flyFrom: formData.flyFrom,
          _flyTo: formData.flyTo,
        },
      ],
      _cabinClasses: [formData.cabinClass],
      _pos: formData._pos,
      _source: '64ae65cfd06e77f95bfefd95',
      _carriers: [formData._carriers],
      _currency: formData._currency,
      deliveryMode: ['db'],
    };

    const staticData = {
      isRoundTrip: false,
      los: 1,
      horizons: ['02/03/2024'],
      pax: {
        adults: 1,
        infants: 0,
        children: 0,
      },
      noOfStops: '1',
      duration: {
        hour: 40,
        minute: 30,
      },
      fareType: 'Doctors',
    };
    const finalData = { ...dynamicData, ...staticData };
    const token = sessionStorage.getItem('Authorization');
    if (!token) {
      console.log(
        'JWT token not found in session. Please login to fetch data.'
      );
      return;
    }
    // Post finalData to the API endpoint
    await fetch(
      'https://flightrates-api.aggregateintelligence.com/api/v1/realtime',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalData),
      }
    )
      .then((response) => response.json())
      .then((data) => setShopId(data))
      .catch((error) => console.error('Error fetching data:', error));
  };

  useEffect(() => {
    // Define the checkStatus function inside the useEffect
    const checkStatus = async () => {
      const token = sessionStorage.getItem('Authorization');
      if (shopId !== null) {
        console.log(shopId);
        try {
          // Fetch the status of the shopId
          const response = await fetch(
            `https://flightrates-api.aggregateintelligence.com/api/v1/shop/status/${shopId.shopId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          // Check if the status is not completed
          if (data.status !== 'completed') {
            setStatus(
              `Shop Id: ${shopId.shopId} - Checking for every Five Sec`
            );
            console.log('STATUS IS STILL NOT COMPLETED', data.status);
            // Use a timeout to call the function again in 5 seconds
            startTimer();
            setTimeoutRef(setTimeout(checkStatus, 5000));
          } else {
            // Handle the completed status
            setStatus('completed');
            console.log('STATUS IS COMPLETED', data.status);
            window.alert('Shop status is completed!');
            clearTimeout(timeoutRef); // Handle the completion
          }
        } catch (error) {
          console.error('Error checking shop status:', error);
        }
      }
    };
    // Call checkStatus immediately if shopId is not null
    if (shopId !== null) {
      checkStatus();
    }
    // Cleanup function to clear timeout when shopId changes or the component unmounts
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, [shopId]);
  const cancelSubmission = () => {
    setShowStatus(false);
    setSubmitting(false); // Reset submission process state
    clearTimeout(timeoutRef);
    setStatus('');
    setElapsedTime(0); // Clear the setTimeout() function
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };
  return (
    <div className="d-flex justify-content-center">
      <Card className="m-3">
        <Card.Body>
          <form onSubmit={handleFormSubmit}>
            <div className="d-flex flex-column p-3 m-3">
              {!loggedIn && (
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                  />
                </Form.Group>
              )}

              {!loggedIn && (
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                  />
                </Form.Group>
              )}

              {!loggedIn && (
                <button
                  type="button"
                  onClick={loginAndFetchData}
                  className="btn btn-primary">
                  Login
                </button>
              )}

              {loggedIn && (
                <>
                  <Form.Group className="">
                    <Form.Label className="fw-bold">Fly From</Form.Label>
                    <Form.Select
                      name="flyFrom"
                      onChange={handleChange}
                      value={formData.flyFrom}
                      className="mb-3 custom-select-sm">
                      <option value={null} selected>
                        Select
                      </option>
                      {airportData?.airports?.map((airport) => (
                        <option value={airport._id} key={airport._id}>
                          {airport.airportName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="">
                    <Form.Label className="fw-bold">Fly To</Form.Label>
                    <Form.Select
                      name="flyTo"
                      onChange={handleChange}
                      value={formData.flyTo}
                      className="mb-3 custom-select-sm">
                      <option value={null} selected>
                        Select
                      </option>
                      {airportData?.airports?.map((airport) => (
                        <option value={airport._id} key={airport._id}>
                          {airport.airportName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="">
                    <Form.Label className="fw-bold">Cabin Class</Form.Label>
                    <Form.Select
                      name="cabinClass"
                      onChange={handleChange}
                      value={formData.cabinClass}
                      className="mb-3 custom-select-sm">
                      <option value={null} selected>
                        Select
                      </option>
                      {cabinClass?.cabinclasses?.map((cabin) => (
                        <option value={cabin._id} key={cabin._id}>
                          {cabin.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="">
                    <Form.Label className="fw-bold">Pos Value</Form.Label>
                    <Form.Select
                      name="_pos"
                      onChange={handleChange}
                      value={formData._pos}
                      className="mb-3 custom-select-sm">
                      <option value={null} selected>
                        Select
                      </option>
                      {posValue?.poses?.map((pos) => (
                        <option value={pos._id} key={pos._id}>
                          {pos.countryCode}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="">
                    <Form.Label className="fw-bold">Currency</Form.Label>
                    <Form.Select
                      name="_currency"
                      onChange={handleChange}
                      value={formData._currency}
                      className="mb-3 custom-select-sm">
                      <option value={null} selected>
                        Select
                      </option>
                      {currency?.currencies?.map((cur) => (
                        <option value={cur._id} key={cur._id}>
                          $ {cur.iso}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="">
                    <Form.Label className="fw-bold">Carriers</Form.Label>
                    <Form.Select
                      name="_carriers"
                      onChange={handleChange}
                      value={formData._carriers}
                      className="mb-3 custom-select-sm">
                      <option value={null} selected>
                        Select
                      </option>
                      {source.map((s) => (
                        <option value={s._id.$oid} key={s._id.$oid}>
                          {s.source}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {submitting && <Spinner animation="border" role="status" />}
                  {submitting && <div>Elapsed Time: {elapsedTime} seconds</div>}
                  <div
                    className={`Status: ${showStatus ? 'in-progress' : 'hidden'
                      }`}>
                    {status}
                  </div>
                  {loggedIn && (
                    <div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting} // Disable button during submission
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary mx-2"
                        onClick={cancelSubmission}
                        disabled={!submitting} // Disable button if submission process not started
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {/* <button type="submit" className="btn btn-primary">
                    Submit
                  </button> */}
                </>
              )}
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default App;
