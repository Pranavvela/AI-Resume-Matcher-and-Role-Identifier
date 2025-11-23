import { useState } from "react";
import axios from "axios";

// -------------------------------------------
// Type for the API response
// -------------------------------------------
type AnalyzeResult = {
  skills: string[];
  best_role: string;
  match_percentage: number;
};

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const response = await axios.post<AnalyzeResult>(
        "http://localhost:5000/analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(response.data);
    } catch {
      alert("Failed to analyze resume.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center px-6 py-16 gap-12">

      {/* TITLE */}
      <div className="w-full flex justify-center text-center mb-10">
  <h1 className="**text-70xl** font-extrabold text-blue-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.6)] tracking-wider">
    AI Resume Matcher
  </h1>
</div>


      {/* UPLOAD SECTION */}
      <div className="w-full max-w-2xl bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700 flex flex-col items-center gap-6">

        <h2 className="text-3xl font-semibold">Upload Resume (PDF)</h2>

        {/* File Picker Button */}
        <label className="cursor-pointer w-80">
          <div className="w-full text-center py-3 rounded-full bg-blue-600 hover:bg-blue-700 
                          shadow-lg hover:shadow-blue-500/40 transition font-semibold text-lg">
            {file ? file.name : "Choose PDF Resume"}
          </div>

          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      {/* ANALYZE BUTTON (Separate Oval Button) */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-80 py-3 text-xl rounded-full bg-green-600 hover:bg-green-700 
                   shadow-lg hover:shadow-green-400/40 disabled:bg-gray-600 transition"
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {/* RESULTS */}
      {result && (
        <div className="w-full max-w-2xl bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700">

          <h2 className="text-3xl font-semibold mb-2">
            Best Role: <span className="text-green-400">{result.best_role}</span>
          </h2>

          <p className="mb-4 text-2xl">
            Match Percentage:
            <span className="font-bold text-blue-400"> {result.match_percentage}%</span>
          </p>

          <h3 className="text-xl font-semibold mb-3">Extracted Skills</h3>

          <div className="flex flex-wrap gap-3">
            {result.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-1 bg-gray-700 rounded-full text-sm shadow-md"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
