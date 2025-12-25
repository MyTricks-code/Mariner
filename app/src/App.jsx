import { useState } from "react"
import axios from "axios"
import Navbar from "./components/Navbar"
import GraphPlot from "./components/GraphPlot"

const App = () => {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [count, setCount] = useState(1)
  const [number, setNumber] = useState("")
  const [agree, setAgree] = useState(false)

  const message = [
    "hello", "there", "how", "is life", "there",
    "looking", "forward", "to", "meet", "you"
  ]

  const payloadMessages = message.slice(0, Math.min(count, 10))

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!number) {
      alert("Phone number required")
      return
    }

    if (count < 1 || count > 10) {
      alert("Count must be between 1 and 10")
      return
    }

    try {
      setLoading(true)
      setResponse(null)

      const url = agree
        ? "http://localhost:8081/send-silent-batch"
        : "http://localhost:8081/send-batch"

      const payload = agree
        ? {
            phone: number,
            count,
            interval_ms: 300,
          }
        : {
            phone: number,
            count,
            interval_ms: 300,
            messages: payloadMessages,
          }

      const { data } = await axios.post(url, payload)
      setResponse(data)
    } catch (err) {
      console.error(err)
      alert("Request failed. Check backend / console.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <div className="w-screen my-8 px-8 flex justify-center">
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 border p-6 rounded max-w-md w-full"
        >
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="p-3 border border-blue-300 rounded"
            placeholder="Phone number (no +)"
          />

          <input
            type="number"
            min={1}
            max={10}
            value={count}
            onChange={(e) => {
              const val = Number(e.target.value)
              setCount(val > 10 ? 10 : val)
            }}
            className="p-3 border border-blue-300 rounded"
            placeholder="Count (max 10)"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree((prev) => !prev)}
            />
            Send Silent Payload
          </label>

          <button
            disabled={loading}
            className="p-3 bg-red-500 text-white rounded cursor-pointer disabled:opacity-50"
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>
      <div className="mx-5">
      {response && <GraphPlot data={response} count={count} />}
      </div>
    </>
  )
}

export default App
