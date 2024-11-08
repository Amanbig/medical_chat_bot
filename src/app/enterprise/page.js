"use client";

import { motion } from "framer-motion";
import FeaturesList from "@/components/parts/FeaturesList"; // A hypothetical component for listing features
import { Button } from "@/components/ui/button";

export default function EnterprisePage() {
  return (
    <div className="flex flex-col justify-center items-center text-center p-10 mt-10">
      {/* Animated Heading */}
      <motion.h1
        className="text-5xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Participating Institutes
      </motion.h1>

      {/* Animated Description */}
      <motion.p
        className="mb-4 text-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Discover different Institutes that are related with JAC Councelling.
      </motion.p>

      {/* Animated Features List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <FeaturesList /> {/* Component to render enterprise features */}
      </motion.div>

      {/* Call to Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-6"
      >
        <Button variant="default" className="rounded-full">Get Started</Button>
      </motion.div>
    </div>
  );
}
