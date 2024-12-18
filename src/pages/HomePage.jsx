import React, { useState, useEffect } from "react";
import supabase from "../config/supabaseConfig";
import { useNavigate } from "react-router-dom";

// Components
import Navbar from "../components/Navbar";
import StoryCard from "../components/StoryCard";

// Icons
import { FaMagic } from "react-icons/fa";

const HomePage = () => {
  const [session, setSession] = useState(null);
  const [stories, setStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newStory, setNewStory] = useState("");
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the session and set it to state
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);
        // console.log("Session fetched:", data.session);
      }
      if (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    // Check if email is in Users table and insert if not
    const checkAndInsertUser = async () => {
      if (session?.user?.email) {
        try {
          const { data: existingUsers, error: fetchError } = await supabase
            .from("Users")
            .select("id")
            .eq("email", session.user.email);

          if (fetchError) {
            console.error("Error fetching users:", fetchError);
            return;
          }

          if (existingUsers.length === 0) {
            // If email is not found, insert into the Users table
            const { error: insertError } = await supabase
              .from("Users")
              .insert({ email: session.user.email });

            if (insertError) {
              console.error("Error inserting user:", insertError);
            } else {
              // console.log("New user added to the Users table.");
            }
          } else {
            // console.log("User already exists in the Users table.");
          }
        } catch (err) {
          console.error("Error during user check and insert:", err);
        }
      }
    };

    const getUserStories = async () => {
      // Fetch all stories for the user

      const { data: id, error: idError } = await supabase
        .from("Users")
        .select("id")
        .eq("email", session.user.email);

      if (idError) {
        console.error("Error fetching user ID:", idError);
        return;
      }

      setUserId(id[0].id);
      // console.log("User ID fetched:", id);
      const { data: stories, error } = await supabase
        .from("Stories")
        .select("*")
        .eq("user_id", id[0].id);

      if (error) {
        console.error("Error fetching stories:", error);
      } else {
        console.log("User stories fetched:", stories.reverse());
        setStories(stories);
      }
    };

    if (session) {
      checkAndInsertUser();
      getUserStories();
    }
  }, [session]);

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.error("Error during sign in:", error);
    } else {
      // console.log("Signed in:", data);
    }
  };

  const handleSubmit = async () => {
    if (newStory.trim() === "") {
      alert("Please write something before submitting.");
      return;
    }

    // const { data: id, error: idError } = await supabase
    //   .from("Users")
    //   .select("id")
    //   .eq("email", session.user.email);

    // if (idError) {
    //   console.error("Error fetching user ID:", idError);
    //   return;
    // }

    const { data, error } = await supabase.from("Stories").insert([
      {
        user_id: userId,
        content: newStory,
      },
    ]);

    if (error) {
      console.error("Error adding new story:", error);
    } else {
      console.log("New story added:", data);
      setNewStory("");
      setShowModal(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-cream justify-center">
      {session ? (
        <>
          {/* Navbar */}
          <Navbar user={session.user.identities[0].identity_data} />

          {/* Add New Story Button */}
          <div className="p-4 text-center">
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-600 transition duration-300"
            >
              + Add New Story
            </button>
          </div>

          {/* Main content */}
          <div
            className={`flex-grow flex items-center justify-center max-w-3xl mx-auto p-4 ${
              showModal ? "blur-md" : ""
            }`}
          >
            {stories.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story.content}
                    date={story.created_at}
                  />
                ))}
              </div>
            ) : (
              <div className="text-gray-700 text-center italic">
                No stories found. Start sharing!
              </div>
            )}
          </div>

          {/* Floating Button */}
          {stories.length > 0 && (
            <button
              onClick={() =>
                navigate("/summarize", {
                  state: {
                    user: session.user.identities[0].identity_data,
                    userId: userId,
                  },
                })
              }
              className="fixed bottom-8 right-8 bg-indigo-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-3xl font-bold hover:bg-indigo-600 transition duration-300 z-50"
            >
              <FaMagic size={24} />
            </button>
          )}

          {/* Add Story Modal */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
              <div className="bg-cream rounded-lg shadow-lg p-6 w-11/12 max-w-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Add Your Story
                </h2>
                <textarea
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Start writing your story here..."
                  value={newStory}
                  onChange={(e) => setNewStory(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-300"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-wider drop-shadow-lg">
            Welcome to <span className="text-indigo-500">StoryTeller</span>
          </h1>
          <p className="text-lg text-gray-700 mb-6 text-center leading-relaxed">
            A place to <span className="font-semibold">share</span> your
            stories, one day at a time.
          </p>
          <button
            onClick={handleSignIn}
            className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-indigo-600 transition duration-300"
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
