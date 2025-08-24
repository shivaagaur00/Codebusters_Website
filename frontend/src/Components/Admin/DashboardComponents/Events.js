import React, { useState, useEffect, useRef } from "react";
import { useUserContext } from "./../../../context";
import { updateEvents } from "../../../APIs/admin";
import LoadingAnimation from "./../../User/LoadingAnimation";
import { Edit, Delete, Save, Add, Cancel, CloudUpload, Image, Event,Error, CalendarToday,CheckCircle, Description, Link } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import axios from "axios";
function Events() {
  const { club, setClub, user } = useUserContext();
  const [eventDetails, setEventDetails] = useState({
    eventName: "",
    startDate: "",
    endDate: "",
    description: "",
    eventImages: Array(10).fill(""),
    registrationLink: "",
  });
  const [events, setEvents] = useState(club?.events || []);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRefs = useRef([]);

  useEffect(() => {
    if (club && club.events) {
      setEvents(club.events);
    }
  }, [club]);

  if (!club || !club.events) {
    return <LoadingAnimation />;
  }

  const handleCloudinaryUpload = async (file, index) => {
    try {
      setIsUploading(true);
      setUploadError("");
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("upload_preset", "ml_default");
      
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dthriaot4/image/upload",
        cloudinaryFormData
      );
      
      const updatedImages = [...eventDetails.eventImages];
      updatedImages[index] = response.data.secure_url;
      setEventDetails(prev => ({
        ...prev,
        eventImages: updatedImages
      }));
    } catch (err) {
      setUploadError("Failed to upload image");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      handleCloudinaryUpload(file, index);
    }
  };

  const addEvent = () => {
    const {
      eventName,
      startDate,
      endDate,
      description,
      eventImages,
      registrationLink,
    } = eventDetails;
    const filledImages = eventImages.filter((link) => link);

    if (
      !eventName ||
      !startDate ||
      !endDate ||
      !description ||
      filledImages.length < 4 ||
      !registrationLink
    ) {
      alert(
        "Please fill out all fields and provide at least 4 images and registration link."
      );
      return;
    }

    const newEvent = {
      ...eventDetails,
      id: Date.now(),
    };

    const updatedEvents = editingEvent
      ? events.map((event) => (event.id === editingEvent.id ? newEvent : event))
      : [...events, newEvent];

    setEvents(updatedEvents);
    setClub({
      ...club,
      events: updatedEvents,
    });

    setEventDetails({
      eventName: "",
      startDate: "",
      endDate: "",
      description: "",
      eventImages: Array(10).fill(""),
      registrationLink: "",
    });
    setEditingEvent(null);
  };

  const editEvent = (event) => {
    setEditingEvent(event);
    setEventDetails({
      eventName: event.eventName,
      startDate: event.startDate,
      endDate: event.endDate,
      description: event.description,
      eventImages: [...event.eventImages],
      registrationLink: event.registrationLink,
    });
  };

  const deleteEvent = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const updatedEvents = events.filter((event) => event.id !== id);
      setEvents(updatedEvents);
      setClub({
        ...club,
        events: updatedEvents,
      });
    }
  };

  const update = async () => {
    try {
      const res = await updateEvents({
        name: user.name,
        password: user.password,
        events: events,
      });
      alert(res.message || "Events updated successfully!");
    } catch (error) {
      console.error("Failed to update events:", error);
      alert("Failed to update events.");
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-[calc(100vh-100px)] bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Event className="text-white mr-3" fontSize="large" />
          <h2 className="text-3xl font-bold text-white">
            {editingEvent ? "Edit Event" : "Event Management"}
          </h2>
        </div>

        {/* Event Form */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            {editingEvent ? (
              <>
                <Edit className="mr-2" />
                Edit Event Details
              </>
            ) : (
              <>
                <Add className="mr-2" />
                Create New Event
              </>
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2 flex items-center">
                <Event className="mr-2" fontSize="small" />
                Event Name
              </label>
              <input
                type="text"
                placeholder="Event Name"
                value={eventDetails.eventName}
                onChange={(e) =>
                  setEventDetails((prev) => ({
                    ...prev,
                    eventName: e.target.value,
                  }))
                }
                className="p-3 border border-gray-600 bg-gray-700 text-white rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 flex items-center">
                <CalendarToday className="mr-2" fontSize="small" />
                Start Date
              </label>
              <input
                type="date"
                value={eventDetails.startDate}
                onChange={(e) =>
                  setEventDetails((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="p-3 border border-gray-600 bg-gray-700 text-white rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 flex items-center">
                <CalendarToday className="mr-2" fontSize="small" />
                End Date
              </label>
              <input
                type="date"
                value={eventDetails.endDate}
                onChange={(e) =>
                  setEventDetails((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="p-3 border border-gray-600 bg-gray-700 text-white rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 flex items-center">
                <Link className="mr-2" fontSize="small" />
                Registration Link
              </label>
              <input
                type="text"
                placeholder="Registration Link"
                value={eventDetails.registrationLink}
                onChange={(e) =>
                  setEventDetails((prev) => ({
                    ...prev,
                    registrationLink: e.target.value,
                  }))
                }
                className="p-3 border border-gray-600 bg-gray-700 text-white rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-300 mb-2 flex items-center">
                <Description className="mr-2" fontSize="small" />
                Description
              </label>
              <textarea
                placeholder="Event Description"
                value={eventDetails.description}
                onChange={(e) =>
                  setEventDetails((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="p-3 border border-gray-600 bg-gray-700 text-white rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows="4"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-300 mb-2 flex items-center">
                <Image className="mr-2" fontSize="small" />
                Event Images (Minimum 4 required)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {eventDetails.eventImages.map((imageLink, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={el => fileInputRefs.current[index] = el}
                        onChange={(e) => handleImageChange(e, index)}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRefs.current[index].click()}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200 flex items-center"
                      >
                        <CloudUpload className="mr-2" />
                        Image {index + 1}
                      </button>
                      {isUploading && <CircularProgress size={20} />}
                      {imageLink && !isUploading && (
                        <CheckCircle className="text-green-500" fontSize="small" />
                      )}
                    </div>
                    {imageLink && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={imageLink}
                          alt={`Preview ${index + 1}`}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <input
                          type="text"
                          value={imageLink}
                          onChange={(e) => {
                            const updatedImages = [...eventDetails.eventImages];
                            updatedImages[index] = e.target.value;
                            setEventDetails(prev => ({
                              ...prev,
                              eventImages: updatedImages
                            }));
                          }}
                          className="flex-1 p-2 border border-gray-600 bg-gray-700 text-white rounded text-xs"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {uploadError && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <Error className="mr-1" fontSize="small" />
                  {uploadError}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={addEvent}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center justify-center"
            >
              <Save className="mr-2" />
              {editingEvent ? "Save Changes" : "Add Event"}
            </button>
            {editingEvent && (
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventDetails({
                    eventName: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                    eventImages: Array(10).fill(""),
                    registrationLink: "",
                  });
                }}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200 flex items-center justify-center"
              >
                <Cancel className="mr-2" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Event List */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Event className="mr-2" />
            Event List
          </h3>

          {events.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No events created yet</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {event.eventName}
                      </h4>
                      <p className="text-gray-300 text-sm mt-1">
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-300 mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editEvent(event)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete"
                      >
                        <Delete fontSize="small" />
                      </button>
                    </div>
                  </div>
                  
                  {event.eventImages.filter(img => img).length > 0 && (
                    <div className="mt-3 flex space-x-2 overflow-x-auto pb-2">
                      {event.eventImages.filter(img => img).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Event ${idx + 1}`}
                          className="h-16 w-16 rounded object-cover flex-shrink-0"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

            <button
              onClick={update}
              className="mt-6 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 flex items-center justify-center"
            >
              <Save className="mr-2" />
              Update All Events
            </button>
        </div>
      </div>
    </div>
  );
}

export default Events;