"use client"

import { motion } from "framer-motion"; // Import motion from framer-motion
import PricingCards from "@/components/parts/PricingCards"; // Adjust the import path as needed

export default function PricingPage() {
  return (
    <div className="flex flex-col justify-center items-center text-center p-10 mt-10">
      {/* Animated Heading */}
      <motion.h1
        className="text-5xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Pricing Plans
      </motion.h1>

      {/* Animated Paragraph */}
      <motion.p
        className="mb-4 text-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Choose the best plan for your needs.
      </motion.p>

      {/* Animated Pricing Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <PricingCards /> {/* This will render the pricing cards */}
      </motion.div>
    </div>
  );
}
