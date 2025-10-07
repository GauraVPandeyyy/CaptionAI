import React, { useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Copy,
  Sparkles,
  User,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  X,
  Settings,
} from "lucide-react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
const logo = "./assets/CapGen.png";

const API_URL ="http://localhost:3000";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Caption options state
  const [captionOptions, setCaptionOptions] = useState({
    length: "medium",
    mood: "",
    extraInstructions: "",
    includeHashtags: false,
  });

  const fileInputRef = useRef(null);

  const handleCaptionOptionsChange = (key, value) => {
    setCaptionOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    const maxSizeMB = 5;
    if (file.size / 1024 / 1024 > maxSizeMB) {
      setError(`File size too large. Maximum ${maxSizeMB} MB allowed.`);
      return;
    }

    setError(null);
    setSuccess(null);
    setCaption("");

    const localUrl = URL.createObjectURL(file);
    setImageUrl(localUrl);
    setCurrentFile(file);
  };

  async function handleGenerateCaption() {
    if (!currentFile) return;

    setError(null);
    setSuccess(null);
    setCaption("");
    setCopied(false);

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", currentFile);

      // Append caption options
      formData.append("captionLength", captionOptions.length);
      formData.append("mood", captionOptions.mood);
      formData.append("extraInstructions", captionOptions.extraInstructions);
      formData.append("includeHashtags", captionOptions.includeHashtags);

      const response = await axios.post(`${API_URL}/api/post`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 80000,
      });

      const data = response.data;
      const postData = data.post;

      if (data && postData && postData.caption) {
        setCaption(postData.caption);
        setSuccess("Caption generated successfully!");
      } else {
        throw new Error("No caption returned from server");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to generate caption. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerateCaption() {
    if (!currentFile) return;
    await handleGenerateCaption();
  }

  const handleCopyCaption = async () => {
    if (caption) {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearImage = () => {
    setImageUrl(null);
    setCurrentFile(null);
    setCaption("");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
              {/* <img src='./assets/CapGen.png' className="w-6 h-6 rounded" /> */}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CapGen
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </SignedIn>
          </div>
        </motion.header>

        {/* Main Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Left Panel - Upload & Preview */}
            <div className="lg:col-span-2 p-6 md:p-8 border-r border-gray-200">
              {/* Upload Zone / Image Preview */}
              <div className="mb-6">
                <AnimatePresence mode="wait">
                  {!imageUrl ? (
                    <motion.div
                      key="upload-zone"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        dragOver
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-300 bg-gray-50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <SignedOut>
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">
                              Sign in to generate captions
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                              Create amazing captions for your images
                            </p>
                          </div>
                          <SignInButton mode="modal">
                            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
                              Sign In to Get Started
                            </button>
                          </SignInButton>
                        </div>
                      </SignedOut>

                      <SignedIn>
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="p-4 bg-blue-100 rounded-full">
                            <Upload className="w-8 h-8 text-blue-600" />
                          </div>

                          <div>
                            <p className="font-medium text-gray-700 mb-1">
                              Drop your image here or click to browse
                            </p>
                            <p className="text-sm text-gray-500">
                              JPG, PNG, WEBP • Max 5MB
                            </p>
                          </div>

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) =>
                              handleFileSelect(e.target.files[0])
                            }
                            accept="image/*"
                            className="hidden"
                          />

                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                          >
                            Choose Image
                          </button>
                        </div>
                      </SignedIn>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="image-preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Image Preview
                        </h3>
                        <button
                          onClick={clearImage}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="relative rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt="Upload preview"
                          className="w-full h-64 md:h-80 object-cover"
                        />
                        {loading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                              <p className="text-white font-medium">
                                Generating your caption...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Caption Display */}
              <AnimatePresence>
                {caption && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        Your Caption
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          Ready
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <textarea
                          value={caption}
                          readOnly
                          rows={4}
                          className="w-full p-4 rounded-xl border border-gray-300 resize-none text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleCopyCaption}
                          disabled={!caption || copied}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all"
                        >
                          {copied ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {copied ? "Copied!" : "Copy Caption"}
                        </button>

                        <button
                          onClick={handleRegenerateCaption}
                          disabled={!currentFile || loading}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Panel - Controls */}
            <div className="lg:col-span-1 p-6 md:p-8 bg-gray-50">
              <div className="sticky top-6">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Caption Settings
                  </h3>
                </div>

                <SignedOut>
                  <div className="text-center py-8">
                    <div className="p-3 bg-gray-200 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Sign in to customize your captions
                    </p>
                  </div>
                </SignedOut>

                <SignedIn>
                  <div className="space-y-6">
                    {/* Caption Length */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caption Length
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {["short", "one-liner", "medium", "lengthy"].map(
                          (option) => (
                            <button
                              key={option}
                              onClick={() =>
                                handleCaptionOptionsChange("length", option)
                              }
                              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                captionOptions.length === option
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                              }`}
                            >
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Mood */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mood
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          "Happy",
                          "Calm",
                          "Confident",
                          "Romantic",
                          "Funny",
                          "Inspired",
                        ].map((moodOption) => (
                          <button
                            key={moodOption}
                            onClick={() =>
                              handleCaptionOptionsChange(
                                "mood",
                                moodOption.toLowerCase()
                              )
                            }
                            className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                              captionOptions.mood === moodOption.toLowerCase()
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {moodOption}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Extra Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extra Instructions
                      </label>
                      <textarea
                        value={captionOptions.extraInstructions}
                        onChange={(e) =>
                          handleCaptionOptionsChange(
                            "extraInstructions",
                            e.target.value
                          )
                        }
                        placeholder="Any specific style or tone preferences..."
                        rows={3}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      />
                    </div>

                    {/* Hashtags Toggle */}
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={captionOptions.includeHashtags}
                            onChange={(e) =>
                              handleCaptionOptionsChange(
                                "includeHashtags",
                                e.target.checked
                              )
                            }
                            className="sr-only"
                          />
                          <div
                            className={`w-10 h-6 rounded-full transition-all ${
                              captionOptions.includeHashtags
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                                captionOptions.includeHashtags
                                  ? "left-5"
                                  : "left-1"
                              }`}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Include hashtags
                        </span>
                      </label>
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={handleGenerateCaption}
                      disabled={!imageUrl || loading}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating...
                        </div>
                      ) : (
                        "Generate Caption"
                      )}
                    </button>
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 md:px-8 pb-6"
              >
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <p className="text-green-700 text-sm">{success}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Features Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              AI-Powered
            </div>
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-500" />
              Instant Regeneration
            </div>
            <div className="flex items-center justify-center gap-2">
              <Settings className="w-4 h-4 text-blue-500" />
              Customizable
            </div>
            <div className="flex items-center justify-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              Any Image
            </div>
          </div>
        </motion.div>

        {/* Subfooter */}
        <div className="mt-12 text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Created by{" "}
            <span className="font-medium text-gray-700">Gaurav Pandey</span>
          </p>
          {/* Add social icons here later if needed */}
        </div>
      </div>
    </div>
  );
}
