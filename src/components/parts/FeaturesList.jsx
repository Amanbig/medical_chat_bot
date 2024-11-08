"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export default function FeaturesList() {
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    async function fetchColleges() {
      try {
        const response = await axios.get("http://127.0.0.1:5000/college");
        const data = response.data.colleges;
        const formattedColleges = Object.keys(data).map((key) => ({
          title: data[key].name,
          description: data[key].description,
          link: data[key].link,
        }));
        setColleges(formattedColleges);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }

    fetchColleges();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {colleges.map((feature, index) => (
        <motion.div
          key={index}
          className="shadow-lg rounded-lg p-6 transition-transform border-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-500">{feature.description}</p>
          <motion.div
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Button variant="link" onClick={() => window.open(feature.link, "_blank")}>
              Learn More <ArrowRight />
            </Button>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
