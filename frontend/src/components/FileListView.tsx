import React, { FC, useEffect, useMemo, useState } from 'react';
import { useActions, useValues } from 'kea';
import { counterLogic } from '../AppLogic';
import { Button, Container, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography, CircularProgress, TableFooter } from '@mui/material';

interface File {
  id: number;
  filename: string;
  storage_location: string;
  file_size: number;
  upload_date: string;
  file_extension: string
  doc_type: string;
}

const FileListView: FC = () => {
  const { fileList, fileListLoading, fileListError } = useValues(counterLogic);
  const { fetchFileList } = useActions(counterLogic);
  const [page, setPage] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [cantDescend, setCantDescend] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchFileList();
  }, [fetchFileList, ]);

  useEffect(() => {
    handleChangePage();
  }, [fileList, page, ]);

  const descend = () => {
    const newPage = page - 1;
    setPage(newPage);
  }

  const ascend = () => {
    const newPage = page + 1;
    setPage(newPage);
  }
  
  const handleChangePage = () => {
    if (page > 0) {
      console.log(`can descend on page ${page}`)
      setCantDescend(false); // Disable if at the last page
    } else {
      console.log(`can't descend on page ${page}`)
      setCantDescend(true); // Enable if not at the last page
    }
    if (page < fileList.length / rowsPerPage - 1) {
      console.log(`can ascend on page ${page}`)
      setIsDisabled(false); // Enable if input has content
    } else {
      console.log(`can't ascend on page ${page}`)
      console.log(`fileList ${fileList.length} items`)
      console.log(`rowsPerPage ${rowsPerPage}`)
      console.log(`${fileList.length} / ${rowsPerPage} = ${fileList.length / rowsPerPage}`)
      setIsDisabled(true); // Disable if input is empty
    }
  };

  const handleChangeRowsPerPage = (event: { target: { value: string; }; }) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function getFirstXChars(inputString: string, x: number ): string {
    return inputString.slice(0, x);
  }

  const visibleRows = useMemo(
    () =>
      typeof(fileList) == "object" ? fileList.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ) : [],
    [page, rowsPerPage, fileList],
  );

  return (
    <Container >
      <Typography variant="h6" sx={{ m: 2 }}>Uploaded Files</Typography>
      {fileListLoading ? (
        <CircularProgress sx={{ m: 2 }} />
      ) : fileListError ? (
        <Typography color="error" sx={{ m: 2 }}>{fileListError}</Typography>
      ) : fileList !== undefined ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>S3 Location</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>File Extension</TableCell>
              <TableCell>Document Type</TableCell>
              {/* <TableCell>Job ID</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((file: File) => (
              <TableRow key={file.id}>
                <TableCell style={{ width: 50 }}>{file.id}</TableCell>
                <TableCell style={{ width: 50 }}>{getFirstXChars(file.filename, 5)}</TableCell>
                <TableCell style={{ width: 50 }}>{getFirstXChars(file.storage_location, 5)}</TableCell>
                <TableCell style={{ width: 50 }}>{file.file_size}</TableCell>
                <TableCell style={{ width: 50 }}>{file.upload_date}</TableCell>
                <TableCell style={{ width: 50 }}>{file.file_extension}</TableCell>
                {file.doc_type ? (<TableCell style={{ width: 50 }}>{file.doc_type}</TableCell>) :  (<TableCell style={{ width: 50 }}>Doc type unavailable</TableCell>)}
                {/* <TableCell>{file.job_id}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
          <TableRow>
            <TableFooter >
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={fileList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ overflow: 'auto'}}
              />
              <Button disabled={cantDescend} variant="outlined" sx={{ m: 2 }} onClick={descend}>Descend</Button>
              <Button disabled={isDisabled} variant="outlined" sx={{ m: 2 }} onClick={ascend}>Load More</Button>
            </TableFooter>
          </TableRow>
        </Table>
    ) : (
        <React.Fragment>
            <Typography color="error" sx={{ m: 2 }}>fileList goes here</Typography>
        </React.Fragment>
      )}
    </Container>
  );
};

export default FileListView;