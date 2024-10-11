"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from 'react-toastify';
import { Loader } from "lucide-react";
import { useSession } from "../SessionContext";

export default function FileUploadDialog({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isOpen, setIsOpen] = useState(true); // Open dialog by default
  const [isUpload, setIsUpload] = useState(false);
  const {session,setSession} = useSession()

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Set the selected file
  };

  const handleUpload = async () => {
    if (!file) return; // Check if a file is selected

    setIsUpload(true);

    const formData = new FormData();
    formData.append("file", file); // Prepare the form data for upload

    if (session) {
      formData.append("session_id", session); // Send the session ID if available
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json(); // Parsing the JSON response

      if (!response.ok) {
        throw new Error(data.message || "Upload failed"); // Handle response errors
      }
      setSession(data['session_id'])
      toast.success("File uploaded successfully!"); // Notify user of success
      setFile(null); // Clear the file input
      onUploadSuccess(); // Call the success callback
      setIsOpen(false); // Close the dialog after successful upload
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`); // Notify user of failure
    }
    setIsUpload(false);
    setIsOpen(false);
  };

  return (
    !session?
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" style={{ display: 'none' }}>Upload PDF</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload PDF</DialogTitle>
          <DialogDescription>
            Upload your PDF files here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 items-center gap-4">
            <Input type="file" accept=".pdf" onChange={handleFileChange} />
          </div>
        </div>
        <DialogFooter>
          {
            !isUpload?
            <Button type="button" onClick={handleUpload}>Upload</Button>
            :
            <div className='flex justify-center text-center'>
              <Loader className='animate-spin w-8 h-8'/>
            </div>
          }
          <Button type="button" onClick={() => { setFile(null); setIsOpen(false); }}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>:null
  );
}
