/* eslint-disable require-jsdoc */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/v2");
  }, []);

  return <></>;
}
