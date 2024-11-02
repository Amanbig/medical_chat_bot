"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FacebookIcon, GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className=" py-10 border-t-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">RAG Q&A</h2>
          <p className="text-sm mb-4">Chatbots can be custom-built to suit various industries and use cases—from customer service and sales to entertainment and education. These help to get answers to questions that are related to particular topic keeping the history.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="#" className="text-gray-400 hover:text-white" aria-label="Twitter">
              <TwitterIcon />
            </a>
            <a href="#" className="text-gray-400 hover:text-white" aria-label="LinkedIn">
              <LinkedinIcon />
            </a>
            <a href="#" className="text-gray-400 hover:text-white" aria-label="GitHub">
              <GithubIcon />
            </a>
          </div>
        </div>

        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6 text-center">
          <div>
            <h3 className="font-semibold text-lg">Product</h3>
            <ul>
              <li><Button variant="link" className="text-gray-400 hover:text-white">Features</Button></li>
              <li><Button variant="link" className="text-gray-400 hover:text-white">Pricing</Button></li>
              <li><Button variant="link" className="text-gray-400 hover:text-white">Updates</Button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Resources</h3>
            <ul>
              <li><Button variant="link" className="text-gray-400 hover:text-white">Documentation</Button></li>
              <li><Button variant="link" className="text-gray-400 hover:text-white">Support</Button></li>
              <li><Button variant="link" className="text-gray-400 hover:text-white">Community</Button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Company</h3>
            <ul>
              <li><Button variant="link" className="text-gray-400 hover:text-white">About Us</Button></li>
              <li><Button variant="link" className="text-gray-400 hover:text-white">Careers</Button></li>
              <li><Button variant="link" className="text-gray-400 hover:text-white">Contact</Button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Legal</h3>
            <ul>
              <li><Button variant="link" className="text-gray-400 hover:text-white">Privacy Policy</Button></li>
              <li><Button variant="link" className="text-gray-400 hover:text-white">Terms of Service</Button></li>
            </ul>
          </div>
        </div> */}
      </div>

      <div className="text-center border-t border-gray-800 pt-6">
        <p className="text-sm">&copy; {new Date().getFullYear()} RAG Q&A. All rights reserved.</p>
      </div>
    </footer>
  );
}
