// components/FileUploadInput.jsx
import React from 'react';

interface FileUploadInputProps {
  onFileSelect: (file: File) => void;
}

export function FileUploadInput({ onFileSelect }: FileUploadInputProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}