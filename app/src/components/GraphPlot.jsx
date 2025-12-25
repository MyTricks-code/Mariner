import {
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useState } from "react";

export default function GraphPlot(props) {
  const [analysisResult, setAnalysisResult] = useState(null)

    const data = props.data.rtts
    .slice(0, props.count)
    .reverse()
    .map((y, i) => ({
        x: i + 1,
        y: y
    }));

    // User-defined bands with overlaps to represent uncertainty
    const RTT_BANDS = [
        { id: 'WEB_ACTIVE',        min: 0,    max: 120,   label: 'Web Active (<120ms)' },
        { id: 'MOBILE_FOREGROUND', min: 250,  max: 450,   label: 'Mobile Foreground (250-450ms)' },
        { id: 'MOBILE_BACKGROUND', min: 450,  max: 700,   label: 'Mobile Background (450-700ms)' },
        { id: 'SCREEN_ON_IDLE',    min: 800,  max: 1300,  label: 'Screen On Idle (800-1300ms)' },
        { id: 'SCREEN_OFF_SLEEP',  min: 1300, max: 4000,  label: 'Screen Off / Sleep (1.3-4s)' },
        { id: 'WEB_INACTIVE',      min: 2500, max: 6000,  label: 'Web Inactive (2.5-6s)' }
    ];

    function classifyRTTs(rtts = []) {
        if (!rtts.length) return null;

        const counts = {}
        const total = rtts.length

        // init
        RTT_BANDS.forEach(b => counts[b.id] = 0)
        // We won't track UNKNOWN in the main probability distribution 
        // to focus on the defined model matches
        let unknownCount = 0;

        for (const rtt of rtts) {
            let matched = false
            for (const band of RTT_BANDS) {
                // Allow multiple matches (overlapping bands)
                if (rtt >= band.min && rtt < band.max) {
                    counts[band.id]++
                    matched = true
                    // Do NOT break here, allow overlap counting
                }
            }
            if (!matched) unknownCount++
        }

        // To calculate probability with overlaps, we sum the total *matches* or divide by original sample size?
        // User asked for "precise probability connection".
        // Dividing by 'total' (sample size) gives "Probability that the device is in State X given the RTTs".
        // Since states overlap, the sum of probabilities > 100%. This is acceptable for fuzzy sets.
        
        const probabilities = []
        let mostProbable = { id: 'UNKNOWN', prob: 0, label: 'Unknown/Unclassified' }

        RTT_BANDS.forEach(band => {
            const count = counts[band.id]
            const prob = (count / total) * 100 // % of packets consistent with this state
            probabilities.push({
                id: band.id,
                label: band.label,
                prob: Number(prob.toFixed(1))
            })

            // Determine winner just by raw score
            if (prob > mostProbable.prob) {
                mostProbable = { id: band.id, prob: prob, label: band.label }
            }
        })

        return {
            mostProbable,
            probabilities,
            sampleSize: total,
            unknownCount
        }
    }

    const seeResults = () => {
        if (!props.data || !props.data.rtts) return;
        const rtts = props.data.rtts.slice(0, props.count).reverse()
        const result = classifyRTTs(rtts)
        console.log("Result: ", result)
        setAnalysisResult(result)
    }

  return (
    <div className="flex flex-col items-center mb-20">
        <div className="w-full h-60 max-w-5xl mx-auto bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                        dataKey="x" 
                        type="number" 
                        domain={['auto', 'auto']} 
                        name="Index" 
                        unit="" 
                        tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <YAxis 
                        dataKey="y" 
                        type="number" 
                        name="RTT" 
                        unit="ms" 
                        domain={['dataMin - 10', 'dataMax + 10']} 
                        tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="RTT" data={data} fill="#6366f1" line={{ stroke: '#6366f1', strokeWidth: 1 }} />
                </ScatterChart>
            </ResponsiveContainer>
        </div>

        <button 
            onClick={seeResults} 
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md flex items-center gap-2"
        >
            <span>Analyze Device State</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        </button>

        {analysisResult && (
            <div className="mt-6 max-w-lg bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto animate-fade-in-up">
                <div className={`p-4 ${analysisResult.mostProbable.id === 'SCREEN_OFF_SLEEP' ? 'bg-gray-100' : 'bg-green-50'} border-b border-gray-100`}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Likely State</h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`text-2xl font-bold ${analysisResult.mostProbable.id === 'SCREEN_OFF_SLEEP' ? 'text-gray-700' : 'text-green-700'}`}>
                            {analysisResult.mostProbable.label}
                        </span>
                        <span className="bg-white px-2 py-1 rounded text-xs font-bold shadow-sm border border-gray-100">
                            {Math.round(analysisResult.mostProbable.prob)}% Match
                        </span>
                    </div>
                </div>
                
                <div className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                            <tr>
                                <th className="px-4 py-2 font-medium">State Compatibility</th>
                                <th className="px-4 py-2 font-medium text-right">% Match</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {analysisResult.probabilities.sort((a,b) => b.prob - a.prob).map((p, idx) => (
                                <tr key={p.id} className={idx === 0 ? "bg-blue-50/30" : ""}>
                                    <td className="px-4 py-2 text-gray-700">{p.label}</td>
                                    <td className="px-4 py-2 text-right font-mono text-gray-600">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(p.prob, 100)}%` }}></div>
                                            </div>
                                            {p.prob}%
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </div>
  );
}
