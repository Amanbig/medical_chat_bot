"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Scalable Solutions",
    description: "Our solutions can grow with your business, adapting to increasing demands.",
  },
  {
    title: "24/7 Support",
    description: "Get assistance anytime with our dedicated support team.",
  },
  {
    title: "Custom Integrations",
    description: "Integrate seamlessly with your existing systems and tools.",
  },
  {
    title: "Advanced Security",
    description: "Robust security measures to protect your data and ensure compliance.",
  },
  {
    title: "Data Analytics",
    description: "Gain insights into your operations with advanced analytics tools.",
  },
  {
    title: "Data Analytics",
    description: "Gain insights into your operations with advanced analytics tools.",
  },
];

export default function FeaturesList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          className=" shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105 border-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-500">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
