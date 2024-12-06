"use client";

import CardSlider from "@/components/parts/CardSlider";
import MainCard from "@/components/parts/MainCard";
import Questions from "@/components/parts/questions";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div>
      <main className="flex flex-col justify-center text-center">
        {/* Main Card with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MainCard />
        </motion.div>

        {/* First slider moves to the left */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardSlider direction="left" />
        </motion.div>

        {/* Second slider moves to the right */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CardSlider direction="right" />
        </motion.div>

        {/* Questions Section */}
        <motion.div
          className="p-4 mt-10 flex justify-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="w-[70%]">
            <Questions />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
