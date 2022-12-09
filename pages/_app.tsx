// Global style
import "../styles/globals.css";
import "@picocss/pico";

import { Toaster } from "react-hot-toast";
import type { AppProps } from "next/app";
import axios from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Toaster />
      <Component {...pageProps} />
    </>
  );
}
