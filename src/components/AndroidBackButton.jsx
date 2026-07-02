import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";

export default function AndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const setupListener = async () => {
      await CapacitorApp.addListener("backButton", () => {

        // Home page
        if (location.pathname === "/") {
          CapacitorApp.exitApp();
          return;
        }

        // Previous page
        navigate(-1);
      });
    };

    setupListener();

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [navigate, location]);

  return null;
}