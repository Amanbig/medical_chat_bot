"use client";

import CardSlider from "@/components/parts/CardSlider";
import MainCard from "@/components/parts/MainCard";
import PricingCards from "@/components/parts/PricingCards";
import Questions from "@/components/parts/questions";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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

        {/* Section for Writing with RAG Q&A */}
        <motion.div
          className='pt-20 pb-20 m-3 flex flex-col text-center justify-center'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className='p-2 text-3xl xl:text-5xl'>
            <div>Writes, brainstorms, news,</div>
            <div>and explores ideas with you</div>
          </div>
          <div className='p-2 gap-2'>
            <Button variant="link">Learn more about writing with JAC Bot {'>'}</Button>
          </div>
          <motion.div
            className="p-4 flex justify-center text-center rounded-3xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }} // Scale effect on hover
          >
            <Image src="/image.png" className="xl:w-[60%] xl:h-[50%] rounded-xl" width={500} height={300} alt="sample" priority />
          </motion.div>
        </motion.div>

        {/* Section for Productivity Insights */}
        <motion.div
          className='pt-20 pb-20 m-3 flex flex-col text-center justify-center'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className='p-2 text-3xl xl:text-5xl'>
            <div>Summarize meetings. Find new</div>
            <div>insights. Increase productivity.</div>
          </div>
          <motion.div
            className="p-4 flex justify-center text-center rounded-3xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }} // Scale effect on hover
          >
            <Image src="/image2.png" className="xl:w-[60%] xl:h-[50%] rounded-xl" width={500} height={300} alt="sample" priority />
          </motion.div>
        </motion.div>

        {/* Pricing Cards with Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <PricingCards />
        </motion.div>

        {/* Questions Section */}
        <motion.div
          className="p-4 flex justify-center text-center"
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
