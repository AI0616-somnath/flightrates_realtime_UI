import { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'

const Login = () => {
  const [formData, setFormData] = useState({ handle: "", password: "" })
  const history = useHistory();
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const response = await fetch('https://flightrates-api.aggregateintelligence.com/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const jsonData = await response.json();
      if (jsonData.token) {
        sessionStorage.setItem('Authorization', jsonData.token);
        history.push('/dashboard');
      } else {
        console.error('Token not found in response');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  }

  return (
    <Container className="d-flex justify-content-center"> {/* Added container with utility classes */}
      <Form className="login-form" onSubmit={(e) => handleSubmit(e)}> {/* Added a class for custom styling */}
        <Form.Group> {/* Removed 'className' and replaced with 'Form.Group' */}
          <Form.Label>User name</Form.Label> {/* Changed 'label' to 'Form.Label' */}
          <Form.Control type='text' name='handle' value={formData.handle} onChange={(e) => handleChange(e)} /> {/* Changed 'input' to 'Form.Control' */}
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control type='password' name='password' value={formData.password} onChange={(e) => handleChange(e)} />
        </Form.Group>
        <Button variant="primary" type='submit'>Submit</Button> {/* Changed 'button' to 'Button' */}
      </Form>
    </Container>

  )
}

export default Login;