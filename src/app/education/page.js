"use client";

import { Button } from "@/components/ui/button"; // Import Button for actions
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function EducationPage() {
  const courses = [
    {
      title: "Introduction to AI and Machine Learning",
      description: "Learn the fundamentals of AI and machine learning concepts.",
    },
    {
      title: "Advanced Data Analysis Techniques",
      description: "Dive deep into data analysis with advanced tools and techniques.",
    },
    {
      title: "Using GPT Models in Real-World Applications",
      description: "Understand how to implement GPT models in various applications.",
    },
    {
      title: "Understanding Natural Language Processing",
      description: "Explore the world of NLP and its applications.",
    },
    {
      title: "Building Applications with RAG Q&A",
      description: "Get hands-on experience in building applications using RAG Q&A.",
    },
    {
        title: "Building Applications with RAG Q&A",
        description: "Get hands-on experience in building applications using RAG Q&A.",
      },
  ];

  return (
    <div className="flex flex-col justify-center items-center text-center p-10 mt-10">
      <motion.h1 
        className="text-5xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        Education Resources
      </motion.h1>
      <motion.p 
        className="mb-4 text-lg"
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Explore our resources for learning and development.
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
              <p className="text-gray-700 mb-4">{course.description}</p>
              <Button variant="link">Learn More</Button>
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
