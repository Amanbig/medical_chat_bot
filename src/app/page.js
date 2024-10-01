import CardSlider from "@/components/parts/CardSlider";
import MainCard from "@/components/parts/MainCard";
import Questions from "@/components/parts/questions";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <main className="flex flex-col justify-center text-center">
        {/* <Button>Get Started</Button> */}
        <MainCard />
        {/* First slider moves to the left */}
        <CardSlider direction="left" />
        {/* Second slider moves to the right */}
        <CardSlider direction="right" />
        

        <MainCard />

        <MainCard />

        <div className="p-4 flex justify-center text-center">
            <div className="w-[60%]">
                <Questions/>
            </div>
      </div>
      </main>
    </div>
  );
}
