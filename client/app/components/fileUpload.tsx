'use client';
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useUser } from "@clerk/nextjs"; // Import Clerk hook

const FileUploadComponent: React.FC  = () => {

    const { user } = useUser(); // Get Clerk user

    const handleFileUpload = () => {
        const el = document.createElement('input');
        el.setAttribute('type', 'file');
        el.setAttribute('accept', 'application/pdf'); // Specify accepted file types
        el.addEventListener('change', async (event) => {  
            if(el.files && el.files.length > 0) {
                const file = el.files[0];
                console.log('File selected:', file);
                // You can now handle the file upload here, e.g., send it to a server
                if(file) {
                    const formData = new FormData();
                    formData.append('pdf', file);

                    if (user?.id) {
                        formData.append('userId', user.id); // Add user ID to form data
                    }

                    await fetch('http://localhost:8000/upload/pdf', {
                        method: 'POST',
                        body: formData
                    })

                }
            }
        });
        el.click();
    }

    return (
        <div className='bg-slate-900 text-white shadow-2xl flex justify-center items-center p-4 rounded-lg border-white border-2 mt-90'>
            <div className='flex items-center justify-center flex-col'>
            <Upload onClick={handleFileUpload}/>
            </div>
        </div>
    )
}

export default FileUploadComponent;