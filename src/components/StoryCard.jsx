import React, { useState } from "react";

const StoryCard = ({ story, date }) => {
  const [showModal, setShowModal] = useState(false);

  // Parse and format the date to "Date, Day, Year"
  const formatDate = (dateString) => {
    const parsedDate = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return parsedDate.toLocaleDateString(undefined, options);
  };

  return (
    <>
      {/* Story Card */}
      <div
        className="bg-cream p-4 rounded-lg shadow-md max-w-md mx-auto mb-4 cursor-pointer hover:shadow-lg transition duration-300"
        onClick={() => setShowModal(true)}
      >
        {/* Date */}
        <div className="text-gray-600 text-sm font-medium mb-2">
          {formatDate(date)}
        </div>

        {/* Story Preview */}
        <div className="text-gray-900 text-base leading-relaxed">
          {story.length > 200 ? `${story.substring(0, 200)}...` : story}
        </div>
      </div>

      {/* Modal for Full Story */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-4 relative">
            {/* Modal Background */}
            <div className="absolute inset-0 bg-cream opacity-90 rounded-lg"></div>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl font-bold z-10"
            >
              &times;
            </button>

            {/* Modal Content */}
            <div className="relative z-10">
              {/* Date */}
              <div className="text-gray-600 text-sm font-medium mb-4">
                {formatDate(date)}
              </div>

              {/* Full Story */}
              <div className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
                {story}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoryCard;
