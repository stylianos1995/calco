import React from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { Button } from "../Button";
import { useApp } from "../../context/AppContext";

export const Header = () => {
  const { state, dispatch } = useApp();

  const toggleDarkMode = () => {
    dispatch({ type: "TOGGLE_DARK_MODE" });
  };

  return (
    <div className="text-center mb-8">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="secondary"
          size="sm"
          icon={
            state.darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )
          }
          onClick={toggleDarkMode}
        >
          {state.darkMode ? "Light Mode" : "Dark Mode"}
        </Button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Calco
        </h1>
        <div className="w-24" /> {/* Spacer for alignment */}
      </div>
      <p
        className={`mt-2 ${state.darkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        Manage your restaurant orders efficiently
      </p>
    </div>
  );
};
