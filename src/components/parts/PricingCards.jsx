"use client"

import React from 'react'
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowTopRightIcon } from '@radix-ui/react-icons'

function PricingCards() {
    return (
        <div className='pt-20 pb-20 m-3 flex flex-col text-center justify-center'>
            <div className='p-2 text-5xl'>
                <div>Get started with MedBot today</div>
            </div>
            <div className='p-2 gap-2'>
                <Button variant="link">Learn more about MedBot {'>'}</Button>
            </div>
            <div className='flex justify-center text-center p-2'>
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-2 justify-center'>
                {/* Free Tier Pricing Card */}
                <Card className="w-full max-w-md mx-auto m-4 bg-gray-950">
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <ul className="text-left space-y-2">
                            <li><Check className="inline-block mr-2 h-4 w-4" /> Access to GPT-4o mini</li>
                            <li><Check className="inline-block mr-2 h-4 w-4" /> Limited access to GPT-4o</li>
                            <li><Check className="inline-block mr-2 h-4 w-4" /> Limited access to advanced data analysis</li>
                            <li><Check className="inline-block mr-2 h-4 w-4" /> File uploads, vision, and image generation</li>
                            <li><Check className="inline-block mr-2 h-4 w-4" /> Use custom GPTs</li>
                        </ul>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center">
                        <p className="text-2xl font-bold">$0</p>
                        <p className="text-sm text-muted-foreground">/ month</p>
                        <Button variant="default" className="mt-4 rounded-full">Get Started <ArrowTopRightIcon/></Button>
                    </CardFooter>
                </Card>

                {/* Plus Tier Pricing Card */}
                <Card className="w-full max-w-md mx-auto m-4 bg-gray-950">
                    <CardHeader>
                        <CardTitle>Plus</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <ul className="text-left space-y-2">
                            <li><Check className="inline-block mr-2 h-4 w-4" /> Early access to new features</li>
                            <li><Check className="inline-block mr-2 h-4 w-4" /> Access to GPT-4, GPT-4o, GPT-4o mini</li>
                            <li><Check className="inline-block mr-2 h-4 w-4" /> Up to 5x more messages for GPT-4o</li>
                            <li><Check className="inline-block mr-2 h-4 w-4" /> Access to advanced data analysis, file uploads, vision, and web browsing</li>
                            <li><Check className="inline-block mr-2 h-4 w-4" /> Access to Advanced Voice Mode</li>
                            <li><Check className="inline-block mr-2 h-4 w-4" /> DALL·E image generation</li>
                            <li><Check className="inline-block mr-2 h-4 w-4" /> Create and use custom GPTs</li>
                        </ul>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center">
                        <p className="text-2xl font-bold">$20</p>
                        <p className="text-sm text-muted-foreground">/ month</p>
                        <div className='flex flex-row gap-3'>
                            <Button variant="default" className="mt-4 rounded-full">Get Started <ArrowTopRightIcon/></Button>
                            <Button variant="link" className="mt-4">Limits Apply {'>'}</Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            </div>
        </div>
    )
}

export default PricingCards
