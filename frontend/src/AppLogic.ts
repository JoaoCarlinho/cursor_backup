    // PromptStateLogic.js
    import { kea } from 'kea';
    import axios from 'axios';
    
    export const counterLogic = kea({
      actions: {
        increment: true,
        decrement: true,
        fetchData: true,
        requestTickerInfo: ((stock_ticker: string) => ({ stock_ticker })) as any,
        requestTickerInfoSuccess: (data) => ({ data }),
        requestTickerInfoFailure: (error) => ({ error }),
        fetchIndexList: true,
        fetchIndexListSuccess: (data) => ({ data }),
        fetchIndexListFailure: (error) => ({ error }),
        fetchDataSuccess: (data) => ({ data }),
        fetchDataFailure: (error) => ({ error }),
        addRagPrompt: (text, prompt_id) => ({ text, prompt_id }),
        addRagResponse: (text, prompt_id) => ({ text, prompt_id }),
        addRagJobResponse: (text, prompt_id) => ({ text, prompt_id }),
        addPromptToChatWindow: (text, prompt_id) => ({ text, prompt_id }),
        resetChat: true,
        createIndex: (index_name, dimensions) => ({ index_name, dimensions }) as any,
        createIndexSuccess: (data) => ({ data }),
        createIndexFailure: (indexError) => ({ indexError }),
        fetchIndexMeta: ((index_name: string) => ({ index_name })) as any,
        fetchIndexMetaSuccess: (data) => ({ data }),
        fetchIndexMetaFailure: (indexMetaError) => ({ indexMetaError }),
        fetchPromptList: true,
        fetchPromptListSuccess: (data) => ({ data }),
        fetchPromptListFailure: (error) => ({ error }),
        addIndexData: (run_chunk, use_case, model_api, index_name, load_path, max_tokens) => ({run_chunk, use_case, model_api, index_name, load_path, max_tokens}),
        addIndexRequestSuccess: (data) => ({ data }),
        addIndexDataRequestFailure: (addindexDataJobError) => ({ addindexDataJobError }),
        addIndexDataSuccess: (data) => ({ data }),
        addIndexDataFailure: (addindexDataJobError) => ({ addindexDataJobError }),
        fetchindexDocumentCount: ((index_name: string) => ({ index_name })) as any,
        fetchindexDocumentCountSuccess: (data) => ({ data }),
        fetchindexDocumentCountFailure: (indexDocumentCountError) => ({ indexDocumentCountError }),
        getPromptWithContextResponseFromPostGres: ((prompt_task_id: string) => ({ prompt_task_id })) as any,
        getPromptWithContextResponseFromPostGresSuccess: (data) => ({ data }),
        getJobsromptResponseFromPostGresFailure: (error) => ({ error }),
        getRAGPromptResponseFromPostGres: ((prompt_task_id: string) => ({ prompt_task_id })) as any,
        getRAGPromptResponseFromPostGresSuccess: (data) => ({ data }),
        getRAGPromptResponseFromPostGresFailure: (error) => ({ error }),
        sendRAGPrompt: (prompt, instructions, prompt_model, vector_search_index_name, embeddings_api, use_case) => ({prompt, instructions, prompt_model, vector_search_index_name, embeddings_api, use_case}),
        sendRAGPromptSuccess: (data: any) => ({ data }),
        sendRAGPromptFailure: (error: any) => ({ error }),
        sendPromptWithContext: (prompt, additional_context, instructions, prompt_model, files) => ({prompt, additional_context, instructions, prompt_model, files}),
        sendPromptWithContextSuccess: (data: any) => ({ data }),
        sendPromptWithContextFailure: (error: any) => ({ error }),
        setIndexData: (indexData) => ({ indexData }),
        setDisplayDemo: (displayDemo) => ({ displayDemo }),
        setRAGPromptJobStatus: (promptJobStatus) => ({ promptJobStatus }),
        setPromptWithContextJobStatus: (promptWithContextJobStatus) => ({ promptWithContextJobStatus }),
        setPromptView: (promptView) => ({ promptView }),
        setIndexViewerView: (indexViewerView) => ({ indexViewerView }),
        setIndexViewing: (indexViewing) => ({ indexViewing }),
        setFile: (file) => ({ file }), // Action to set the selected file
        setFiles: (files) => ({ files }), // Action to set the list of files
        clearFile: true, // Action to clear the selected file
        clearFiles: true, // Action to clear the list of files
        setUploadFileStatus: (uploadFileStatus) => ({ uploadFileStatus }),
        uploadFile: true,
        uploadFileSuccess: (filename) => ({ filename }),
        uploadFileFailure: (error) => ({ error }),
        fetchFileList: true,
        fetchFileListSuccess: (data) => ({ data }),
        fetchFileListFailure: (error) => ({ error }),
        toggleIndexChat: (recommenderView) => ({ recommenderView }),
        reset: true,
      } as const,
      reducers: ({ actions }) => ({
        promptWithContextResponseLoading: [
          false,
          {
            getPromptWithContextResponseFromPostGres: () => true,
            getPromptWithContextResponseFromPostGresSuccess: () => false,
            getPromptWithContextResponseFromPostGresFailure: () => false,
          }
        ],
        promptWithContextResponseError: [
          null,
          {
            getPromptWithContextResponseFromPostGresFailure: (_, { error }) => error,
            getPromptWithContextResponseFromPostGres: () => null,
            getPromptWithContextResponseFromPostGresSuccess: () => null,
          }
        ],
        promptResponseLoading: [
          false,
          {
            getRAGPromptResponseFromPostGres: () => true,
            getRAGPromptResponseFromPostGresSuccess: () => false,
            getRAGPromptResponseFromPostGresFailure: () => false,
          }
        ],
        promptResponseError: [
          null,
          {
            getPromptResponseFailure: (_, { error }) => error,
            getRAGPromptResponseFromPostGres: () => null,
            getRAGPromptResponseFromPostGresSuccess: () => null,
          }
        ],
        fileList: [
          [] as any[],
          {
            fetchFileListSuccess: (_, { data }) => data,
            fetchFileListFailure: () => [],
          }
        ],
        fileListLoading: [
          false,
          {
            fetchFileList: () => true,
            fetchFileListSuccess: () => false,
            fetchFileListFailure: () => false,
          }
        ],
        fileListError: [
          null as string | null,
          {
            fetchFileListFailure: (_, { error }) => error,
            fetchFileList: () => null,
            fetchFileListSuccess: () => null,
          }
        ],
        displayDemo: [
          '',
          {
            setDisplayDemo: (_, { displayDemo }) => displayDemo,
            reset: () => '',
          }
        ],
        flaskAvailabilityData: [
          "requested",
          {
            fetchData: () => "awaiting_response",
            fetchDataSuccess: (_, { data }) => data,
            fetchDataFailure: () => "response_failed",
          },
        ],
        promptJobStatus: [
          false,
          {
            sendRAGPrompt: () => "queued",
            sendRAGPromptSuccess: () => "catalogued",
            addIndexDataFailure: () => "index_create_failed",
            setRAGPromptJobStatus: (_, { promptJobStatus }) => promptJobStatus,
            getRAGPromptResponseFromPostGres: () => "retreiving",
            getRAGPromptResponseFromPostGresSuccess: () => "complete",
            getRAGPromptResponseFromPostGresFailure: () => "failed",
          },
        ],
        promptWithContextJobStatus: [
          false,
          {
            sendPromptWithContext: () => "queued",
            sendPromptWithContextSuccess: () => "catalogued",
            sendPromptWithContextFailure: () => "error",
            setPromptWithContextJobStatus: (_, { promptWithContextJobStatus }) => promptWithContextJobStatus,
            getPromptWithContextResponseFromPostGres: () => "retreiving",
            getPromptWithContextResponseFromPostGresSuccess: () => "complete",
            getPromptWithContextResponseFromPostGresFailure: () => "failed",
          },
        ],
        loading: [
          false,
          {
            fetchData: () => true,
            fetchDataSuccess: () => 'complete',
            fetchDataFailure: () => 'failed',
          },
        ],
        error: [
          null,
          {
            fetchDataFailure: (_, { error }) => error,
            fetchData: () => null,
          },
        ],
        selectedFile: [
          null, // Initial state for selectedFile
          {
            setFile: (_, { file }) => file, // Update selectedFile on setFile action
            clearFile: () => null, // Clear selectedFile on clearFile action
          },
        ],
        contextFiles: [
          [] as { filename: string; key: string }[],
          {
            setFiles: (_, { files }) => files, // Update contextFiles on setFiles action
            clearFiles: () => [], // Clear contextFiles on clearFiles action
          }
        ],
        uploadFileStatus: [
          null,
          {
            uploadFile: () => "requested",
            // set to 'complete' on successful upload to match UI expectations
            uploadFileSuccess: () => "uploaded",
            uploadFileFailure: () => "failed",
            setUploadFileStatus: (_, { uploadFileStatus }) => uploadFileStatus,
          }
        ]
      }),
      listeners: ({ actions, values }) => ({
        [actions.fetchData]: async () => {
            const response = await axios.get('http://localhost:5005')
            .then((response) => {
              actions.fetchDataSuccess(response.data);
            })
            .catch((error) => {
              actions.fetchDataFailure(error);
            })
        },
        [actions.sendPromptWithContext]: async ({ prompt, additional_context, instructions, prompt_model, files }) => {
          await axios.post('http://localhost:5005/get-context-aided-support', {
            prompt,
            additional_context,
            instructions,
            prompt_model,
            files
          })
            .then((response) => {
              actions.sendPromptWithContextSuccess(response.data);
            })
            .catch((error) => {
              actions.sendPromptWithContextFailure(error);
            });
        },
        [actions.getRAGPromptResponseFromPostGres]: async ({ prompt_task_id }, breakpoint, logic) => {
          try {
            console.log("Fetching prompt response from Postgres for prompt_id:", prompt_task_id);
            const response = await axios.get('http://localhost:5005/get-prompt-response', {
              params: { prompt_task_id }
            });
            actions.getRAGPromptResponseFromPostGresSuccess(response.data);
          } catch (error) {
            actions.getRAGPromptResponseFromPostGresFailure(error);
          }
        },
        [actions.fetchFileList]: async (_, breakpoint, logic) => {
          try {
            const response = await axios.get('http://localhost:5005/files');
            console.log(`file info received ${JSON.stringify(response.data)}`)
            actions.fetchFileListSuccess(response.data);
          } catch (error) {
            actions.fetchFileListFailure(error);
          }
        },
        [actions.uploadFile]: async () => {
          try {
            const formData = new FormData();
            if (!values.selectedFile) {
              actions.uploadFileFailure('No file selected.');
              return;
            }
            formData.append('file', values.selectedFile);
              const response = await axios.post('http://localhost:5005/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
              console.log(`upload file  response ${JSON.stringify(response.data)}`)
              actions.uploadFileSuccess(response.data.filename);
              // values.contextFiles is the current array of files in state; append the new file and pass the full array
              actions.setFiles([...values.contextFiles, { filename: response.data.filename, key: response.data.strorage_location }]);
          } catch (error) {
            actions.uploadFileFailure(error);
          }
        },
      }),
      selectors: {
        fileName: [
          (s) => [s.selectedFile], 
          (selectedFile: { name: any; }) => (selectedFile ? selectedFile.name : 'No file selected'),
        ],
      }
    });