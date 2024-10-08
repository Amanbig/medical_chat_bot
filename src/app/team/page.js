"use client";

import { Button } from "@/components/ui/button";
import TeamMemberCard from "@/components/parts/TeamMemberCard"; // Create this component to display team members
import { motion } from "framer-motion";

export default function TeamPage() {
  return (
    <div>
      <main className="flex flex-col justify-center text-center">
        {/* Hero section */}
        <motion.div
          className="pt-20 pb-20 m-3 flex flex-col text-center justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-2 text-5xl">
            <div>Meet the Team Behind RAG Q&A</div>
          </div>
          <div className="p-2 gap-2">
            <Button variant="link">Join us and learn more about the team {'>'}</Button>
          </div>
        </motion.div>

        {/* Team Member Section */}
        <motion.div
          className="flex justify-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 p-10">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }} // Scale effect on hover
            >
              <TeamMemberCard
                name="Amanpreet Singh"
                role="Frontend & Backend"
                bio="Alice has over 10 years of experience in AI and is passionate about bringing AI solutions to businesses."
                image="/team/team_member1.jpg"  // Ensure images are placed in the public/team directory
              />
            </motion.div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }} // Scale effect on hover
            >
              <TeamMemberCard
                name="Ujjwal Chopra"
                role="Backend"
                bio="Bob leads the technical team and ensures RAG Q&A stays ahead with cutting-edge technology."
                image="/team/team_member2.png"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="pt-20 pb-20 m-3 flex flex-col text-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="p-2 text-5xl">
            <div>Want to join our team?</div>
          </div>
          <div className="p-2 gap-2">
            <Button variant="default">See Open Positions</Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
