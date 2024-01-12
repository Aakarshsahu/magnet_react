import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const FileUploadComponent = () => {
  const [files, setFiles] = useState([]);

  const onDrop = async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    try {
      await axios.post('http://localhost:3000/upload', formData);
      // Fetch updated file list from the server and update state
      const response = await axios.get('http://localhost:3000/files');
      console.log(response)
      setFiles(response.data);
    }
    catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleDownload = async (fileId) => {
    try {
      // Make a request to get the pre-signed URL from the server
      const response = await axios.get(`http://localhost:3000/files/${fileId}/download`);
      const downloadUrl = response.data.downloadUrl;

      // Create a temporary link and trigger a download
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Extract the filename from the URL
      const urlParts = downloadUrl.split('/');
      const filename = urlParts[urlParts.length - 1];

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      // Make a request to delete the file
      await axios.delete(`http://localhost:3000/files/${fileId}`);

      // Fetch updated file list from the server and update state
      const response = await axios.get('http://localhost:3000/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleShowFile = (imageUrl) => {

    const fullUrl = `https://kranti2023.s3.ap-south-1.amazonaws.com/${imageUrl}`;
    window.open(fullUrl, '_blank');
  };


  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:3000/files');
        setFiles(response.data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div>
      <div {...getRootProps()} style={dropzoneStyle}>
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select files</p>
      </div>
      {files.map((file) => (
        <div key={file._id} style={fileContainerStyle}>
          <p>File Name : {file.filename}</p>
          <p>File Size: {file.size} bytes</p>
          <button onClick={() => handleDownload(file._id)} style={downloadButtonStyle}>Download</button>
          <button onClick={() => handleDelete(file._id)} style={deleteButtonStyle}>Delete</button>
          <button onClick={() => handleShowFile(file.imageUrl)} style={showButtonStyle}>Show File</button>
        </div>
      ))}
    </div>
  );
};

const dropzoneStyle = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
};

const fileContainerStyle = {
  border: '1px solid #eeeeee',
  borderRadius: '4px',
  margin: '10px 0',
  padding: '10px',
};

const downloadButtonStyle = {
  backgroundColor: '#8BC34A', // Light Green
  marginRight: '10px', // Adjust the gap between buttons
  padding: '5px 10px', // Adjust the padding for a cleaner look
  border: 'none',
  borderRadius: '4px',
  color: '#ffffff',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  backgroundColor: '#FF5733', // Red
  padding: '5px 10px', // Adjust the padding for a cleaner look
  border: 'none',
  borderRadius: '4px',
  color: '#ffffff',
  cursor: 'pointer',
};

const showButtonStyle = {
  backgroundColor: '#2196F3', // Blue
  padding: '5px 10px',
  border: 'none',
  borderRadius: '4px',
  color: '#ffffff',
  cursor: 'pointer',
  marginLeft: '10px', // Adjust the spacing from other buttons
};


export default FileUploadComponent;
