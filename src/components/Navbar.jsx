import React, { useState } from "react";
import supabase from "../config/supabaseConfig";

const Navbar = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      window.location.reload(); // Reload to reset session or redirect
    }
  };

  return (
    <nav className="bg-cream shadow-lg py-4 px-6 flex justify-between items-center relative">
      {/* Left side: Application Name */}
      <div className="text-2xl font-bold text-indigo-500 tracking-wider">
        StoryTeller
      </div>

      {/* Right side: User Info */}
      {user ? (
        <div className="flex items-center space-x-4 relative">
          <span className="text-gray-900 font-medium">{user.name}</span>
          <div
            className="relative cursor-pointer"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <img
              src={user.picture || "https://via.placeholder.com/40"} // Fallback image
              alt="Profile"
              className="w-10 h-10 rounded-full shadow-md"
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-md rounded-lg">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-gray-700 italic">Loading user...</div>
      )}
    </nav>
  );
};

export default Navbar;
