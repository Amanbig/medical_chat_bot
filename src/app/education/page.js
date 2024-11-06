"use client";

import { Button } from "@/components/ui/button"; // Import Button for actions
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import axios from "axios";
import { useEffect, useState } from "react";

export default function EducationPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await axios.get("http://127.0.0.1:5000/education");
        const data = response.data.educations; // Assuming `educations` is the key in the JSON response
        const formattedCourses = Object.keys(data).map(key => ({
          title: data[key].name,
          description: data[key].description,
          link: data[key].link,
        }));
        setCourses(formattedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }

    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center text-center p-10 mt-10">
      <motion.h1 
        className="text-5xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        Courses offered
      </motion.h1>
      <motion.p 
        className="mb-4 text-lg"
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Explore our different engineering courses.
      </motion.p>
      
      <h2 className="text-3xl font-semibold mt-6">Courses Available</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {courses.map((course, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }} // Scale effect on hover
          >
            <Card className="p-6 border border-gray-300 rounded-lg shadow-md transition-shadow duration-300 ease-in-out">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-400 mb-4">{course.description}</p>
              <Button variant="link" onClick={() => window.open(course.link, "_blank")}>Learn More</Button>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="max-w-3xl mt-10">
        <h2 className="text-3xl font-semibold">Join Our Community</h2>
        <p className="mt-4">Connect with others interested in AI and education through our forums and discussions.</p>
        <Button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Join Now
        </Button>
      </div>
    </div>
  );
}
