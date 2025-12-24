import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    Suburb: '',
    SellerG: '',
    Type: 'h',      
    Method: 'S',    
    Rooms: '',
    Distance: '',
    Bathroom: '',
    Car: '',
    Landsize: '',
    BuildingArea: '',
    Regionname: 'Northern Metropolitan', 
    CouncilArea: ''
  })

  const [price, setPrice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // 3. LOGIC: Submit the form to the backend
  const handleSubmit = async (e) => {
    e.preventDefault() 
    setLoading(true)
    setError(null)
    setPrice(null)

  const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

    try {
      // Create the object to send (Convert Strings to Numbers)
      const payload = {
        ...formData,
        Rooms: Number(formData.Rooms),
        Distance: Number(formData.Distance),
        Bathroom: Number(formData.Bathroom),
        Car: Number(formData.Car),
        Landsize: Number(formData.Landsize),
        BuildingArea: Number(formData.BuildingArea),
      }

      console.log("Sending this to backend:", payload) 

      // Send via Axios
      const response = await axios.post(`${API_BACKEND_URL}/predict`, payload)
      
      // Save the result
      setPrice(response.data.predicted_price)

    } catch (err) {
      console.error("Error:", err)
      setError("Failed to connect to backend. Is it running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>🏡 Melbourne House Price</h1>
      <p className="subtitle">Enter property details to estimate value</p>
      
      <form onSubmit={handleSubmit}>
        
        <div className="grid-row">
          <div className="form-group">
            <label>Suburb</label>
            <input name="Suburb" value={formData.Suburb} onChange={handleChange} placeholder="e.g. Abbotsford" required />
          </div>

          <div className="form-group">
            <label>Seller (Agency)</label>
            <input name="SellerG" value={formData.SellerG} onChange={handleChange} placeholder="e.g. Biggin" required />
          </div>
        </div>

        <div className="grid-row">
            <div className="form-group">
                <label>Type</label>
                <select name="Type" value={formData.Type} onChange={handleChange}>
                    <option value="h">House (h)</option>
                    <option value="u">Unit (u)</option>
                    <option value="t">Townhouse (t)</option>
                </select>
            </div>

            <div className="form-group">
                <label>Method</label>
                <select name="Method" value={formData.Method} onChange={handleChange}>
                    <option value="S">Sold (S)</option>
                    <option value="SP">Sold Prior (SP)</option>
                    <option value="PI">Passed In (PI)</option>
                    <option value="VB">Vendor Bid (VB)</option>
                </select>
            </div>
        </div>

        <div className="grid-row three-col">
            <div className="form-group"><label>Rooms</label><input type="number" name="Rooms" value={formData.Rooms} onChange={handleChange} placeholder="3" required /></div>
            <div className="form-group"><label>Bathrooms</label><input type="number" name="Bathroom" value={formData.Bathroom} onChange={handleChange} placeholder="1" required /></div>
            <div className="form-group"><label>Car Spots</label><input type="number" name="Car" value={formData.Car} onChange={handleChange} placeholder="1" required /></div>
        </div>

        <div className="grid-row three-col">
            <div className="form-group"><label>Landsize (sqm)</label><input type="number" name="Landsize" value={formData.Landsize} onChange={handleChange} placeholder="200" required /></div>
            <div className="form-group"><label>Building Area</label><input type="number" name="BuildingArea" value={formData.BuildingArea} onChange={handleChange} placeholder="120" required /></div>
            <div className="form-group"><label>Distance (km)</label><input type="number" name="Distance" value={formData.Distance} onChange={handleChange} placeholder="2.5" required /></div>
        </div>

        <div className="grid-row">
          <div className="form-group">
            <label>Region</label>
            <select name="Regionname" value={formData.Regionname} onChange={handleChange}>
              <option value="Northern Metropolitan">Northern Metropolitan</option>
              <option value="Southern Metropolitan">Southern Metropolitan</option>
              <option value="Eastern Metropolitan">Eastern Metropolitan</option>
              <option value="Western Metropolitan">Western Metropolitan</option>
            </select>
          </div>

          <div className="form-group">
            <label>Council Area</label>
            <input name="CouncilArea" value={formData.CouncilArea} onChange={handleChange} placeholder="e.g. Yarra City Council" required />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Predict Price"}
        </button>
      </form>

      {price && (
        <div className="result-box">
            <h3>Estimated Price</h3>
            <div className="price">
              ${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
        </div>
      )}

      {error && <p style={{color: 'red', textAlign: 'center', marginTop: '1rem'}}>{error}</p>}
    </div>
  )
}

export default App