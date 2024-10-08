"use client";

import * as React from "react";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { Card, CardHeader, CardFooter, CardTitle } from "../ui/card"; // Import necessary Card components

export default function CardSlider({ direction = "left" }) { // Add 'direction' prop
  const controls = useAnimation();
  
  // Duplicate the card list to ensure continuous flow
  const cards = [
    { id: 1, title: "Card 1", description: "Answering FAQs" },
    { id: 2, title: "Card 2", description: "Providing weather updates"},
    { id: 3, title: "Card 3", description: "Sharing news or latest articles"},
    { id: 4, title: "Card 4", description: "Giving product information" },
    { id: 5, title: "Card 5", description: "Helping with note-taking" },
  ];
  const duplicatedCards = [...cards, ...cards]; // Duplicate for seamless scrolling

  useEffect(() => {
    const isLeft = direction === "left"; // Check the direction
    controls.start({
      x: isLeft ? [0, -1000] : [-1000, 0], // Move left or right based on 'direction'
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 10, // Adjust speed here
          ease: "linear",
        },
      },
    });
  }, [controls, direction]);

  return (
    <div className="overflow-hidden w-full p-4">
      <motion.div
        className="flex space-x-4"
        animate={controls}
      >
        {duplicatedCards.map((card, index) => (
          <motion.div
            key={index} // Use index to handle duplicates
            className="min-w-[300px] rounded-lg bg-gray-600 shadow-lg p-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{card.description}</CardTitle>
              </CardHeader>
              {/* <CardFooter>
                <p className="text-gray-600 mt-2">{card.description}</p>
              </CardFooter> */}
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
