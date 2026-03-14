import { useEffect, useState } from "react"

function App() {

  const [data,setData] = useState("")

  useEffect(()=>{
    fetch("http://localhost:5000/api/parking")
    .then(res => res.json())
    .then(data => setData(data.message))
  },[])

  return (
    <>
      <h1>AI Parking Management System</h1>
      <h2>{data}</h2>
    </>
  )
}

export default App