import React, { useState, useEffect } from 'react';
import { Box, Container, FormControl, InputLabel, MenuItem, Select, Typography, TextField, Button, Paper } from '@mui/material';
import { socket } from '../App';
import { FileUploadInput } from './FileLoadInput';
import FileListView from './FileListView';
import { counterLogic } from '../AppLogic';
import { useActions, useValues } from 'kea';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

function ApplicationSupport () {
  const [promptWithContext, setPromptWithContext] = useState('');
  const [promptContext, setPromptContext] = useState('');
  const [instructions, setInstructions] = useState('');
  const [promptModel, setPromptModel] = useState("llama3.2:1b");
  const [useCase, setUseCase] = useState('');
  const { jobChatHistory, promptWithContextResponseLoading, promptWithContextResponseError, promptWithContextJobStatus, fileName, contextFiles, selectedFile, uploadFileStatus } = useValues(counterLogic);
  const { addRagJobResponse, addPromptToChatWindow, clearFile, getPromptWithContextResponseFromPostGres, sendPromptWithContext, setFile, setPromptWithContextJobStatus, uploadFile, setUploadFileStatus } = useActions(counterLogic);
  const promptModels = [
    {
      "model": "llama3.2:1b",
    },
    {
      "model": "llama3:latest",
    }
  ];

  const useCases = [
    { "id" : 1,
      "description": "Jobs",
      "instructions": "You are an experienced HR Executive with a great understanding of what hiring managers are looking for in resumes, cover letters and other supporting documents accompanying job applications",
      
    },
    { "id" : 2,
      "description": "Pypi",
      "instructions": "You are an experienced Full Stack Developer great at working with frameworks including Python, flask, Swagger, postgres, marshmallow salalchemy, alembic pypi packages, docker-compose, Jupyter Notebooks, ollama docker images, ElasticSearch docker images and implementing Retreival Augmented Generation with ElasticSearch Indexes as vector databases.",
      
    },
    { "id" : 2,
      "description": "React",
      "instructions": "You are an experienced Full Stack Developer great at working with frameworks including React, konva, kea, axios, Angular, next.js, webpack, cypress, node and other npm packages. You excel in creation of 2d graphs and maps and the application of physics to simulations of traffic systems. You have a great understanding of working with data coming from APIs and maintaining the parity between state on the frontend and persistent data on the backend, and especially how the marshmallow pypi packages validates and serializes the return data from api requests.",
      
    },
    { "id" : 3,
      "description": "Jupyter",
      "instructions": "You are an experienced Data Scientist and Python Developer great at working with docker-compose, Jupyter Notebooks, ollama docker images, ElasticSearch docker images and implementing Retreival Augmented Generation with ElasticSearch Indexes as vector databases.",
      
    },
    { "id" : 3,
      "description": "Data Augmentation",
      "instructions": "You are an experienced Data Scientist who also has a Juris Doctorate degree and has worked with insurance industry regulations, legal documents and contracts specifically related workers comp claims. You are very familiar with the various specialties of doctor or physical therapist required to treat various injuries. You are great at data augmentation techniques including paraphrasing, summarization, and creating embeddings for text data.",
      
    },
        { "id" : 3,
      "description": "Social Media Marketing",
      "instructions": "You are an experienced Social Media campaign manager. You are very familiar with the various personas of consumer found on social media platforms including , LinkedIn, Instagram, Facebook, Twitter and TikTok. You are great at creating catchy slogans and hashtags to promote products and services. You have a great understanding of the latest trends and how to leverage them to create viral content. You excel at conversations with potential customers to understand their needs and how to best position products and services to meet those needs.",
      
    },
  ];

  useEffect(() => {
      const handler = (data: any) => {
        if (data && data.status) {
          switch (data.status) {
            case 'catalogued':
              // getPromptWithContextResponseFromPostGres(data.prompt_task_id);
              console.log(`response requested. ${JSON.stringify(data)}`);
              break;
            case 'queued':
            case 'requested':
              console.log(`response requested. ${JSON.stringify(data)}`);
              break;
            case 'generated':
              setPromptWithContextJobStatus("complete");
              console.log(`response generated. ${JSON.stringify(data)}`);
              addRagJobResponse(data.response, data.prompt_id);
              break;
            case 'failed':
            case 'rejected':
              setPromptWithContextJobStatus(data.status);
              console.error(`Error getting prompt response: ${data.error}`);
              alert(`Error in prompt response: ${data.error}`);
              break;
            default:
              console.log(`Unknown status: ${JSON.stringify(data)}`);
          }
        } else {
          console.error("Invalid data received in event:", data);
        }
      };
      socket.on("prompt_response", handler);
      return () => {
        socket.off("prompt_response", handler);
      };
  }, [promptWithContextJobStatus, getPromptWithContextResponseFromPostGres]);

  const handleUpload = () => {
    if (uploadFileStatus !== null && uploadFileStatus !== 'failed' && uploadFileStatus !== 'complete') {
      console.log('File upload is already running, please wait for it to complete.');
      alert(`File upload running, please wait for completion.${uploadFileStatus}`);
      console.log(`Prompt: ${fileName}`);
      return;
    }
    if (selectedFile) {
      // Implement your file upload logic here (e.g., using FormData and fetch/axios)
      uploadFile(selectedFile);
      console.log(`Uploading file: ${fileName}`);
      // After successful upload, you might want to clear the file:
      clearFile();
      setUploadFileStatus('complete');
    } else {
      console.log('No file to upload.');
    }
  };


  const handleUseCaseChange = (event: any) => {
    if(event == null){
      setInstructions(useCases[0]['instructions'])
      setUseCase(useCases[0]['description'])
    }
    else {
      for (const key in useCases) {
        if (useCases[key]['description'] === event.target.value) {
          setInstructions(useCases[key]['instructions']);
          setUseCase(useCases[key]['description'])
          console.log(`instructions set to: ${useCases[key]['instructions']}`);
        }
      }
    }
  };

  const handlePromptModelChange = (event: any) => {
    setPromptModel(event.target.value);
  };

  const handleSend = () => {
    if (instructions.trim() === '') {
      handleUseCaseChange(null);
      alert('setting instructions');
      return;
    }
    if (promptWithContext.trim() === '') {
      console.log('promptWithContext cannot be empty');
      alert('Please add prompt');
      return;
    }
    if (promptContext.trim() === '' && contextFiles.length === 0) {
      console.log('Additional Context not provided');
      alert('Please add additional Context');
    }
    if (promptModel.trim() === '') return;
    if (promptWithContextJobStatus !== false && promptWithContextJobStatus !== 'complete') {
      console.log('Prompt job is already running, please wait for it to complete.');
      alert(`Prompt job is already running, please wait for it to complete.${promptWithContextJobStatus}`);
      console.log(`Prompt: ${promptWithContext}`);
      return;
    }
    addPromptToChatWindow(promptWithContext); 
    sendPromptWithContext(promptWithContext, promptContext, instructions, promptModel, contextFiles);
    setPromptWithContext('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <Container>
        <React.Fragment>
          <Paper elevation={3} sx={{ p: 2, maxWidth: 1200, height: 800, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Context-Supported Chat
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Select Use Case</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={useCase}
              label="ElasticSearch Vector DBs"
              onChange={handleUseCaseChange}
            >
              {useCases && useCases.map((index: any) => (
                <MenuItem key={index.id} value={index.description}>
                  {index.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Choose Prompt Model</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={promptModel}
              label="Prompt Model"
              onChange={handlePromptModelChange}
            >
              {promptModels && promptModels.map((index: any) => (
                <MenuItem key={index} value={index.model}>
                  {index.model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <React.Fragment>

            <h1>Upload File to add context</h1>
            <FileUploadInput onFileSelect={setFile} />
            {
              contextFiles && contextFiles.length > 0 ? (
                <div>
                  <Typography>Uploaded Files:</Typography>
                  <ul>
                    {contextFiles.map((file: any, index: number) => (
                      <li key={index}>{file.filename}</li>
                    ))}
                  </ul>
                </div>
                ) : (
                <Typography>No files uploaded yet.</Typography>
              )

            }
            {selectedFile && (
              <div>
                <Typography>Selected File: {selectedFile.name}</Typography>
                <Button disabled={uploadFileStatus !== null && uploadFileStatus !== 'failed' && uploadFileStatus !== 'complete'} onClick={handleUpload}>Upload File</Button>
                <Button onClick={clearFile}>Clear Selection</Button>
              </div>
            )}
            {!selectedFile && <p>Please select a file to upload.</p>}
          </React.Fragment>
          <Box sx={{ flex: 1, overflowY: 'auto', mb: 1, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
            {jobChatHistory && jobChatHistory.map((msg: ChatMessage, idx: number) => (
              <Box key={idx} sx={{ textAlign: msg.sender === 'user' ? 'right' : 'left', mb: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    display: 'inline-block',
                    bgcolor: msg.sender === 'user' ? '#1976d2' : '#e0e0e0',
                    color: msg.sender === 'user' ? '#fff' : '#000',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    maxWidth: '80%',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.text}
                </Typography>
              </Box>
            ))}
            {promptWithContextResponseLoading && <Typography>Loading...</Typography>}
            {promptWithContextResponseError && <Typography color="error">{String(promptWithContextResponseError)}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter Job Description"
              value={promptContext}
              onChange={e => setPromptContext(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              placeholder="Describe the Assistance Needed with this job"
              value={promptWithContext}
              onChange={e => setPromptWithContext(e.target.value)}
            />
            <Button variant="contained" onClick={handleSend}>
              Send
            </Button>
          </Box>
          <FileListView/>
        </Paper>
      </React.Fragment>
    </Container>
  );
}

export default ApplicationSupport;