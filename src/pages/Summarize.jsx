import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Groq from "groq-sdk";
import supabase from "../config/supabaseConfig";

// Components
import Navbar from "../components/Navbar";

const Summarize = () => {
  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_KEY,
    dangerouslyAllowBrowser: true,
  });
  const { state } = useLocation(); // State carries user info
  const [timeFrame, setTimeFrame] = useState(""); // Selected time frame
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState(null);

  const userId = state?.userId; // Get user ID from state

  // Function to fetch stories within a specific time frame
  const fetchStories = async (days) => {
    setLoading(true);
    setError(null);
    setSummary("");

    try {
      const currentDate = new Date();
      const pastDate = new Date();
      pastDate.setDate(currentDate.getDate() - days); // Calculate past date

      // Fetch stories from Supabase based on created_at column
      const { data, error } = await supabase
        .from("Stories") // Table name in Supabase
        .select("content")
        .eq("user_id", userId) // Match stories of this user
        .gte("created_at", pastDate.toISOString()) // Filter stories in the time frame
        .lte("created_at", currentDate.toISOString()); // Up to current date

      if (error) throw error;

      if (!data || data.length === 0) {
        setError("No stories found in the selected time frame.");
        setLoading(false);
        return;
      }

      // Combine all stories into one prompt
      const combinedStories = data.map((story) => story.content).join("\n\n");

      // Summarize the combined stories using Groq AI
      await summarizeStories(combinedStories);
    } catch (err) {
      console.error("Error fetching stories:", err.message);
      setError("Failed to fetch stories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to summarize stories using Groq AI
  const summarizeStories = async (storiesText) => {
    try {
      const prompt = `combine all the stories and Summarize it as a single story:\n\n"${storiesText}"`;

      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama3-8b-8192", // Adjust based on your Groq model
        temperature: 0.7,
      });

      const generatedSummary =
        response.choices[0]?.message?.content || "No summary generated.";
      setSummary(generatedSummary);
    } catch (error) {
      console.error("Error summarizing stories:", error.message);
      setError("Failed to generate summary. Please try again.");
    }
  };

  return (
    <>
      <Navbar user={state?.user} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Summarize Your Stories
        </h1>

        {/* Time Frame Selection */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Select Time Frame:
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setTimeFrame("1 Day");
                fetchStories(1);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              1 Day
            </button>
            <button
              onClick={() => {
                setTimeFrame("1 Week");
                fetchStories(7);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              1 Week
            </button>
            <button
              onClick={() => {
                setTimeFrame("1 Month");
                fetchStories(30);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              1 Month
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <p className="text-blue-600 font-semibold">
            Fetching and summarizing your stories...
          </p>
        )}

        {/* Error Message */}
        {error && <p className="text-red-600 font-semibold">{error}</p>}

        {/* Display Summary */}
        {summary && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Summary ({timeFrame}):
            </h2>
            <p className="text-gray-700">{summary}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Summarize;
